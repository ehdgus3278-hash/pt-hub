-- ==============================================================
-- PT-Hub Supabase 스키마
-- 실행 위치: Supabase Dashboard → SQL Editor → New Query → 붙여넣기 → Run
-- ==============================================================

-- 안전을 위해 기존 객체 정리 (최초 설치 시에는 무시됨)
DROP TABLE IF EXISTS public.verification_logs CASCADE;
DROP TABLE IF EXISTS public.event_reports CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;
DROP TYPE IF EXISTS event_type CASCADE;
DROP TYPE IF EXISTS event_status CASCADE;

-- ==============================================================
-- 타입 정의
-- ==============================================================
CREATE TYPE event_type AS ENUM ('conference', 'ce', 'seminar', 'workshop');
CREATE TYPE event_status AS ENUM (
    '예정', '접수중', '마감', '모집중', '모집 공고',
    '수강생 발표', '교육 종료', '취소됨', '안내'
);

-- ==============================================================
-- 학회 테이블
-- ==============================================================
CREATE TABLE public.organizations (
    id text PRIMARY KEY,                    -- 'kbobath', 'kacrpt' 등
    name text NOT NULL,                     -- '한국보바스협회 (성인)'
    short_name text NOT NULL,               -- 'KBA'
    category text,                          -- '신경계·보바스'
    color text NOT NULL DEFAULT '#888888',  -- UI 색상 (#0f5e58)
    homepage_url text,                      -- 학회 메인
    schedule_url text,                      -- 일정 페이지
    verified boolean DEFAULT true,          -- 검증 완료 여부
    crawler_status text DEFAULT 'pending',  -- 'active'|'pending'|'blocked'|'manual'
    sort_order int DEFAULT 100,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ==============================================================
-- 일정 테이블 (메인)
-- ==============================================================
CREATE TABLE public.events (
    id bigserial PRIMARY KEY,
    org_id text NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

    title text NOT NULL,
    type event_type NOT NULL DEFAULT 'workshop',
    start_date date NOT NULL,
    end_date date NOT NULL,
    start_time text DEFAULT '09:00',

    -- 접수기간 / 교육기간 (접수마감일 앵커 모델)
    apply_start date,   -- 접수 시작
    apply_end   date,   -- 접수 마감 (캘린더 앵커 · D-day 기준)
    edu_start   date,   -- 교육 시작
    edu_end     date,   -- 교육 종료 (다중세션 전체기간)

    location text DEFAULT '학회 안내',
    region text DEFAULT '미정',
    is_online boolean DEFAULT false,

    credit int DEFAULT 0,                   -- 보수교육 평점
    fee text DEFAULT '학회 안내',
    status event_status DEFAULT '예정',
    description text DEFAULT '',
    url text NOT NULL,                      -- 학회 공지글/일정 URL (필수)

    -- 검증 메타데이터
    verified boolean DEFAULT true,
    last_checked date DEFAULT current_date,
    source text DEFAULT 'manual',           -- 'crawler' | 'manual' | 'user_submitted'

    -- 외부 식별자 (크롤러용)
    external_id text,                       -- 학회 공지글 번호 등
    -- 동일 일정 중복 방지: org + external_id + start_date 조합
    UNIQUE (org_id, external_id, start_date),

    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    -- 데이터 무결성 체크
    CHECK (end_date >= start_date)
    -- 주의: 14일 제한 없음. 다중세션 과정(예: 6월~8월)은 edu_start~edu_end 로 전체기간 표현.
);

-- 자주 조회되는 컬럼 인덱스
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_org_id ON public.events(org_id);
CREATE INDEX idx_events_region ON public.events(region);
CREATE INDEX idx_events_verified ON public.events(verified) WHERE verified = true;

-- ==============================================================
-- 사용자 신고 테이블 (오류 제보)
-- ==============================================================
CREATE TABLE public.event_reports (
    id bigserial PRIMARY KEY,
    event_id bigint REFERENCES public.events(id) ON DELETE SET NULL,
    reason text NOT NULL,                   -- 'cancelled'|'wrong_date'|'broken_link'|'other'
    detail text,                            -- 자유 서술
    reporter_email text,                    -- 선택
    resolved boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_reports_unresolved ON public.event_reports(resolved) WHERE resolved = false;

-- ==============================================================
-- 검증 로그 테이블 (크롤러 실행 기록)
-- ==============================================================
CREATE TABLE public.verification_logs (
    id bigserial PRIMARY KEY,
    run_at timestamptz DEFAULT now(),
    org_id text REFERENCES public.organizations(id) ON DELETE CASCADE,
    status text NOT NULL,                   -- 'success' | 'partial' | 'failed' | 'blocked'
    events_found int DEFAULT 0,
    events_added int DEFAULT 0,
    events_updated int DEFAULT 0,
    events_removed int DEFAULT 0,
    error_message text,
    duration_ms int
);

CREATE INDEX idx_logs_run_at ON public.verification_logs(run_at DESC);

-- ==============================================================
-- updated_at 자동 갱신 트리거
-- ==============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_events_updated
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================
-- Row Level Security (RLS) — 공개 읽기, 쓰기는 service_role 만
-- ==============================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능
CREATE POLICY "public_read_organizations" ON public.organizations
    FOR SELECT USING (true);

CREATE POLICY "public_read_events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "public_read_logs" ON public.verification_logs
    FOR SELECT USING (true);

-- 신고는 누구나 생성, 읽기는 인증된 운영자만
CREATE POLICY "public_insert_reports" ON public.event_reports
    FOR INSERT WITH CHECK (true);

-- 쓰기는 service_role 만 (GitHub Actions 에서 사용)
-- service_role 키는 모든 RLS를 우회하므로 별도 정책 불필요

-- ==============================================================
-- 캘린더 조회용 뷰 (UI에서 사용하기 편하게)
-- ==============================================================
-- 접수마감일 앵커 모델:
--   - start_date/end_date 를 "앵커 날짜"로 노출 (캘린더 위치)
--     · 접수중/접수예정 → 접수마감일 (지금 행동해야 하는 날)
--     · 접수 마감했지만 교육 미시작 → 교육 시작일
--     · 교육 진행중 → 교육 종료일
--   - status 는 current_date 기준 동적 계산 (저장값은 '취소됨' 판정에만 사용)
--   - d_day: 접수마감까지 남은 일수 (음수 = 마감)
CREATE OR REPLACE VIEW public.events_with_org AS
SELECT
    e.id,
    e.org_id,
    o.name AS org_name,
    o.short_name AS org_short,
    o.color AS org_color,
    e.title,
    e.type,
    (CASE
       WHEN e.apply_end IS NOT NULL AND e.apply_end >= current_date THEN e.apply_end
       WHEN COALESCE(e.edu_start, e.start_date) >= current_date     THEN COALESCE(e.edu_start, e.start_date)
       ELSE COALESCE(e.edu_end, e.end_date)
     END) AS start_date,
    (CASE
       WHEN e.apply_end IS NOT NULL AND e.apply_end >= current_date THEN e.apply_end
       WHEN COALESCE(e.edu_start, e.start_date) >= current_date     THEN COALESCE(e.edu_start, e.start_date)
       ELSE COALESCE(e.edu_end, e.end_date)
     END) AS end_date,
    e.start_time,
    e.location,
    e.region,
    e.is_online,
    e.credit,
    e.fee,
    (CASE
       WHEN e.status = '취소됨' THEN '취소됨'
       WHEN e.apply_start IS NOT NULL AND current_date < e.apply_start THEN '접수예정'
       WHEN e.apply_end IS NOT NULL AND current_date <= e.apply_end THEN '접수중'
       WHEN COALESCE(e.edu_end, e.end_date) < current_date THEN '교육 종료'
       WHEN COALESCE(e.edu_start, e.start_date) > current_date AND e.apply_end IS NOT NULL THEN '마감'
       WHEN COALESCE(e.edu_start, e.start_date) > current_date THEN '예정'
       ELSE '교육중'
     END)::text AS status,
    e.description,
    e.url,
    e.verified,
    e.last_checked,
    e.source,
    e.apply_start,
    e.apply_end,
    e.edu_start,
    e.edu_end,
    (e.apply_end - current_date) AS d_day
FROM public.events e
LEFT JOIN public.organizations o ON e.org_id = o.id
ORDER BY 8;  -- start_date(앵커) 기준

-- ==============================================================
-- 완료 안내
-- ==============================================================
DO $$
BEGIN
    RAISE NOTICE '✓ PT-Hub 스키마 생성 완료';
    RAISE NOTICE '  - organizations 테이블';
    RAISE NOTICE '  - events 테이블 (접수기간/교육기간 + 동적 status 뷰)';
    RAISE NOTICE '  - event_reports 테이블';
    RAISE NOTICE '  - verification_logs 테이블';
    RAISE NOTICE '  - events_with_org 뷰';
    RAISE NOTICE '다음 단계: 02_seed_organizations.sql 실행';
END $$;
