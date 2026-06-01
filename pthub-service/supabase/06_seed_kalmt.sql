-- ==============================================================
-- 06_seed_kalmt.sql — 대한림프도수치료학회(KALMT) 추가
-- 출처: https://kalmt.co.kr/  "2026년 하반기 교육일정표" (2026-06 확인)
-- 실행 순서: 01 → 02 → 03 → 04 → 05 → 06
--
-- 참고: 학회 일정표에 '접수기간'이 명시돼 있지 않아 apply_start/apply_end = NULL.
--       (가짜 접수마감일을 만들지 않음 — 상태는 교육일 기준으로 뷰가 계산)
--       다중 주말 과정은 edu_start(첫 주말)~edu_end(마지막 주말)로 전체기간 표현.
-- ==============================================================

-- 1) 학회 등록 (재실행 시 갱신)
INSERT INTO public.organizations
  (id, name, short_name, category, color, homepage_url, schedule_url, verified, crawler_status, sort_order)
VALUES
  ('kalmt', '대한림프도수치료학회', 'KALMT', '림프·도수치료', '#3b6ea5',
   'https://kalmt.co.kr/', 'https://kalmt.co.kr/', true, 'manual', 70)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, short_name = EXCLUDED.short_name, category = EXCLUDED.category,
  color = EXCLUDED.color, homepage_url = EXCLUDED.homepage_url, schedule_url = EXCLUDED.schedule_url,
  verified = EXCLUDED.verified, crawler_status = EXCLUDED.crawler_status, sort_order = EXCLUDED.sort_order;

-- 2) 2026 하반기 일정 (17건)
INSERT INTO public.events
  (org_id,title,type,start_date,end_date,start_time,location,region,is_online,credit,fee,status,description,url,verified,last_checked,source,external_id,apply_start,apply_end,edu_start,edu_end)
VALUES
  ('kalmt','림프도수치료 중급과정 36기(J)','workshop','2026-06-06','2026-06-14','09:00','전주 예수병원','전북',false,0,'학회 안내','예정','중급과정 36기. 주말(토·일) 4일. 교육 6/6,7,13,14.','https://kalmt.co.kr/',true,'2026-06-01','manual','kalmt_j36j',NULL,NULL,'2026-06-06','2026-06-14'),
  ('kalmt','림프도수치료 기본과정 132기','workshop','2026-06-20','2026-06-28','09:00','동탄 학회 교육센터','경기',false,0,'학회 안내','예정','기본과정 132기. 주말(토·일) 4일. 교육 6/20,21,27,28.','https://kalmt.co.kr/',true,'2026-06-01','manual','kalmt_b132',NULL,NULL,'2026-06-20','2026-06-28'),
  ('kalmt','림프도수치료 기본과정 133기(J)','workshop','2026-06-20','2026-06-28','09:00','부산 예성한방병원','부산',false,0,'학회 안내','예정','기본과정 133기. 주말(토·일) 4일. 교육 6/20,21,27,28.','https://kalmt.co.kr/',true,'2026-06-01','manual','kalmt_b133j',NULL,NULL,'2026-06-20','2026-06-28'),
  ('kalmt','림프도수치료 기본과정 134기','workshop','2026-07-04','2026-07-12','09:00','청주 서로손병원','충북',false,0,'학회 안내','예정','기본과정 134기. 주말(토·일) 4일. 교육 7/4,5,11,12.','https://kalmt.co.kr/',true,'2026-06-01','manual','kalmt_b134',NULL,NULL,'2026-07-04','2026-07-12'),
  ('kalmt','림프도수치료 보수교육 (대구)','ce','2026-07-17','2026-07-17','09:00','대구','대구',false,0,'학회 안내','예정','대구 보수교육.','https://kalmt.co.kr/',true,'2026-06-01','manual','kalmt_ce_daegu',NULL,NULL,'2026-07-17','2026-07-17'),
  ('kalmt','림프도수치료 중급과정 37기','workshop','2026-07-18','2026-07-26','09:00','청주 서로손병원','충북',false,0,'학회 안내','예정','중급과정 37기. 주말(토·일) 4일. 교육 7/18,19,25,26.','https://kalmt.co.kr/',true,'2026-06-01','manual','kalmt_j37',NULL,NULL,'2026-07-18','2026-07-26'),
  ('kalmt','림프도수치료 기본과정 135기','workshop','2026-08-01','2026-08-09','09:00','부천 휴앤유병원','경기',false,0,'학회 안내','예정','기본과정 135기. 주말(토·일) 4일. 교육 8/1,2,8,9.','https://kalmt.co.kr/',true,'2026-06-01','manual','kalmt_b135',NULL,NULL,'2026-08-01','2026-08-09'),
  ('kalmt','림프도수치료 기본과정 136기(J)','workshop','2026-08-01','2026-08-09','09:00','창원','경남',false,0,'학회 안내','예정','기본과정 136기. 주말(토·일) 4일. 교육 8/1,2,8,9.','https://kalmt.co.kr/',true,'2026-06-01','manual','kalmt_b136j',NULL,NULL,'2026-08-01','2026-08-09'),
  ('kalmt','림프도수치료 고급과정 4기','workshop','2026-08-15','2026-08-30','09:00','동탄 학회 교육센터','경기',false,0,'학회 안내','예정','고급과정 4기. 주말(토·일) 6일. 교육 8/15,16,22,23,29,30.','https://kalmt.co.kr/',true,'2026-06-01','manual','kalmt_a4',NULL,NULL,'2026-08-15','2026-08-30'),
  ('kalmt','림프도수치료 기본과정 137기','workshop','2026-09-05','2026-09-13','09:00','하남 보바스병원','경기',false,0,'학회 안내','예정','기본과정 137기. 주말(토·일) 4일. 교육 9/5,6,12,13.','https://kalmt.co.kr/',true,'2026-06-01','manual','kalmt_b137',NULL,NULL,'2026-09-05','2026-09-13'),
  ('kalmt','림프도수치료 중급과정 38기(J)','workshop','2026-09-12','2026-09-20','09:00','부산 예성한방병원','부산',false,0,'학회 안내','예정','중급과정 38기. 주말(토·일) 4일. 교육 9/12,13,19,20.','https://kalmt.co.kr/',true,'2026-06-01','manual','kalmt_j38j',NULL,NULL,'2026-09-12','2026-09-20'),
  ('kalmt','림프도수치료 보수교육 (경기)','ce','2026-10-09','2026-10-09','09:00','경기도','경기',false,0,'학회 안내','예정','경기도 보수교육.','https://kalmt.co.kr/',true,'2026-06-01','manual','kalmt_ce_gg',NULL,NULL,'2026-10-09','2026-10-09'),
  ('kalmt','림프도수치료 기본과정 138기','workshop','2026-10-17','2026-10-25','09:00','군산 모세병원','전북',false,0,'학회 안내','예정','기본과정 138기. 주말(토·일) 4일. 교육 10/17,18,24,25.','https://kalmt.co.kr/',true,'2026-06-01','manual','kalmt_b138',NULL,NULL,'2026-10-17','2026-10-25'),
  ('kalmt','림프도수치료 기본과정 139기','workshop','2026-10-31','2026-11-08','09:00','동탄 학회 교육센터','경기',false,0,'학회 안내','예정','기본과정 139기. 주말(토·일) 4일. 교육 10/31,11/1,7,8.','https://kalmt.co.kr/',true,'2026-06-01','manual','kalmt_b139',NULL,NULL,'2026-10-31','2026-11-08'),
  ('kalmt','림프도수치료 기본과정 140기','workshop','2026-11-28','2026-12-06','09:00','동탄 학회 교육센터','경기',false,0,'학회 안내','예정','기본과정 140기. 주말(토·일) 4일. 교육 11/28,29,12/5,6.','https://kalmt.co.kr/',true,'2026-06-01','manual','kalmt_b140',NULL,NULL,'2026-11-28','2026-12-06'),
  ('kalmt','림프도수치료 중급과정 39기','workshop','2026-12-12','2026-12-20','09:00','동탄 학회 교육센터','경기',false,0,'학회 안내','예정','중급과정 39기. 주말(토·일) 4일. 교육 12/12,13,19,20.','https://kalmt.co.kr/',true,'2026-06-01','manual','kalmt_j39',NULL,NULL,'2026-12-12','2026-12-20'),
  ('kalmt','림프도수치료 중급과정 40기(J)','workshop','2026-12-12','2026-12-20','09:00','부산 예성한방병원','부산',false,0,'학회 안내','예정','중급과정 40기. 주말(토·일) 4일. 교육 12/12,13,19,20.','https://kalmt.co.kr/',true,'2026-06-01','manual','kalmt_j40j',NULL,NULL,'2026-12-12','2026-12-20')
ON CONFLICT (org_id, external_id, start_date) DO UPDATE SET
  title=EXCLUDED.title, type=EXCLUDED.type, end_date=EXCLUDED.end_date, location=EXCLUDED.location,
  region=EXCLUDED.region, description=EXCLUDED.description, edu_start=EXCLUDED.edu_start, edu_end=EXCLUDED.edu_end,
  last_checked=EXCLUDED.last_checked;

-- 검증
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.events WHERE org_id = 'kalmt';
  RAISE NOTICE '✓ KALMT 학회 + 일정 % 건 등록 완료', n;
END $$;
