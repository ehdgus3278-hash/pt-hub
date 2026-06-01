-- ==============================================================
-- 방문자 집계 테이블 (비공개)
-- 실행 순서: 01_schema.sql → 02 → 03 → 04_page_views.sql
--
-- 설계 원칙:
--   • 익명(anon) 역할은 INSERT 만 가능 → 방문 기록은 누구나 남길 수 있음
--   • SELECT 정책을 두지 않음 → 익명은 집계를 절대 조회할 수 없음 (비공개)
--   • 관리자(/admin)는 service_role 키로 RLS 를 우회해 집계 조회
--   • 개인정보(원본 IP) 미저장 — visitor 는 IP+UA+날짜 해시(매일 회전)
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.page_views (
    id          bigserial PRIMARY KEY,
    path        text NOT NULL DEFAULT '/',
    referrer    text,
    ua          text,
    visitor     text,                       -- 일자별 회전 해시 (순방문 추정용, 개인 식별 불가)
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS page_views_created_idx ON public.page_views (created_at);
CREATE INDEX IF NOT EXISTS page_views_visitor_idx ON public.page_views (visitor);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- 익명 사용자: INSERT 만 허용 (방문 기록 적재)
DROP POLICY IF EXISTS "page_views anon insert" ON public.page_views;
CREATE POLICY "page_views anon insert"
    ON public.page_views
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- SELECT/UPDATE/DELETE 정책 없음 → 익명은 조회·수정·삭제 불가.
-- 관리자 집계는 service_role 키(RLS 우회)로만 접근.

-- 검증
DO $$
BEGIN
    RAISE NOTICE '✓ page_views 테이블 생성 완료 (익명 INSERT 전용, 집계는 비공개)';
END $$;
