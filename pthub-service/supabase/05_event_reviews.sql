-- ==============================================================
-- 교육 후기 게시판
-- 실행 순서: 01 → 02 → 03 → 04 → 05_event_reviews.sql
--
-- 설계:
--   • 익명 즉시 작성 (로그인 없음, 닉네임만)
--   • 별점 1~5 + 후기 본문
--   • 익명은 INSERT/SELECT 가능, 수정·삭제는 service_role(어드민)만
--   • hidden 플래그로 어드민이 부적절 후기를 숨김 처리
-- ==============================================================

CREATE TABLE IF NOT EXISTS public.event_reviews (
    id          bigserial PRIMARY KEY,
    event_id    bigint REFERENCES public.events(id) ON DELETE CASCADE,
    org_id      text   REFERENCES public.organizations(id) ON DELETE SET NULL,
    nickname    text   NOT NULL DEFAULT '익명',
    rating      int    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    body        text   NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
    hidden      boolean NOT NULL DEFAULT false,   -- 어드민이 숨김 처리
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_reviews_event_idx ON public.event_reviews (event_id);
CREATE INDEX IF NOT EXISTS event_reviews_created_idx ON public.event_reviews (created_at DESC);

-- updated_at 자동 갱신
DROP TRIGGER IF EXISTS trg_event_reviews_updated ON public.event_reviews;
CREATE TRIGGER trg_event_reviews_updated
    BEFORE UPDATE ON public.event_reviews
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.event_reviews ENABLE ROW LEVEL SECURITY;

-- 누구나 '숨김 아닌' 후기 읽기 가능
DROP POLICY IF EXISTS "reviews public read" ON public.event_reviews;
CREATE POLICY "reviews public read"
    ON public.event_reviews
    FOR SELECT
    TO anon
    USING (hidden = false);

-- 누구나 작성 가능 (별점·본문 제약은 컬럼 CHECK 로 강제)
DROP POLICY IF EXISTS "reviews anon insert" ON public.event_reviews;
CREATE POLICY "reviews anon insert"
    ON public.event_reviews
    FOR INSERT
    TO anon
    WITH CHECK (hidden = false);

-- UPDATE/DELETE 정책 없음 → 익명은 수정·삭제 불가.
-- 어드민(수정·삭제·숨김 해제)은 service_role 키(RLS 우회)로만 수행.

-- 일정별 평균 별점 뷰 (목록·상세에서 사용)
CREATE OR REPLACE VIEW public.event_review_stats AS
SELECT
    event_id,
    count(*)            AS review_count,
    round(avg(rating), 1) AS avg_rating
FROM public.event_reviews
WHERE hidden = false
GROUP BY event_id;

DO $$
BEGIN
    RAISE NOTICE '✓ event_reviews 테이블 + event_review_stats 뷰 생성 완료';
END $$;
