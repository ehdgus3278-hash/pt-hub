-- ==============================================================
-- 08_seed_kema.sql — KEMA 학회(국제운동과학기술학회) 추가
-- 출처: https://www.kema-academy.com/training/noticeList (2026-05-07 공지)
-- 실행 순서: 01 → ... → 07 → 08
--
-- 설계:
--  • Introduction Course: 단일 온라인 강좌(접수기간 명시) → apply 채움(D-day).
--  • Professional Course: 13개 모듈을 '개별 일정'으로 등록(각자 교육 주말에 표시).
--    - 전체 과정을 한 번 신청(접수 6/1~8/23, 150만원)하는 구조라 모듈은 apply=NULL
--      (접수기간을 넣으면 앵커 모델상 13개가 마감일 하루에 몰리므로). 접수정보는 설명에 유지.
-- ==============================================================

INSERT INTO public.organizations
  (id, name, short_name, category, color, homepage_url, schedule_url, verified, crawler_status, sort_order)
VALUES
  ('kema', 'KEMA 학회 (국제운동과학기술학회)', 'KEMA', '운동분석·근골격계', '#4f8a5b',
   'https://www.kema-academy.com/', 'https://www.kema-academy.com/training/noticeList',
   true, 'manual', 90)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, short_name = EXCLUDED.short_name, category = EXCLUDED.category,
  color = EXCLUDED.color, homepage_url = EXCLUDED.homepage_url, schedule_url = EXCLUDED.schedule_url,
  verified = EXCLUDED.verified, crawler_status = EXCLUDED.crawler_status, sort_order = EXCLUDED.sort_order;

INSERT INTO public.events
  (org_id,title,type,start_date,end_date,start_time,location,region,is_online,credit,fee,status,description,url,verified,last_checked,source,external_id,apply_start,apply_end,edu_start,edu_end)
VALUES
  ('kema','KEMA Introduction Course (온라인, 하반기)','workshop','2026-07-13','2026-08-02','09:00','온라인','온라인',true,0,'15만원','예정','온라인 6시간 수강(3주내 이수). 강사 권오윤 교수(연세대). 대상: 물리치료사·물리치료학과 재학생. 접수 2026-06-01~07-26.','https://www.kema-academy.com/training/noticeDetail?idx=121',true,'2026-06-01','manual','kema_intro_h2',NULL,NULL,'2026-07-13','2026-08-02'),
  ('kema','Professional Course — Cervicothorax I (서울)','workshop','2026-08-29','2026-08-30','14:30','KEMA 서울캠퍼스 (광진구)','서울',false,0,'150만원 (전체 과정)','예정','KEMA Professional Course 1/13. 토 14:30~22:30 / 일 09:30~17:30. 전체 과정 접수 6/1~8/23, 150만원.','https://www.kema-academy.com/training/noticeDetail?idx=122',true,'2026-06-01','manual','kema_pro_m01',NULL,NULL,'2026-08-29','2026-08-30'),
  ('kema','Professional Course — Cervical spine II (서울)','workshop','2026-09-05','2026-09-06','14:30','KEMA 서울캠퍼스 (광진구)','서울',false,0,'150만원 (전체 과정)','예정','KEMA Professional Course 2/13. 토 14:30~22:30 / 일 09:30~17:30. 전체 과정 접수 6/1~8/23.','https://www.kema-academy.com/training/noticeDetail?idx=122',true,'2026-06-01','manual','kema_pro_m02',NULL,NULL,'2026-09-05','2026-09-06'),
  ('kema','Professional Course — Thoracic spine II (서울)','workshop','2026-09-12','2026-09-13','14:30','KEMA 서울캠퍼스 (광진구)','서울',false,0,'150만원 (전체 과정)','예정','KEMA Professional Course 3/13. 토 14:30~22:30 / 일 09:30~17:30. 전체 과정 접수 6/1~8/23.','https://www.kema-academy.com/training/noticeDetail?idx=122',true,'2026-06-01','manual','kema_pro_m03',NULL,NULL,'2026-09-12','2026-09-13'),
  ('kema','Professional Course — Shoulder I (서울)','workshop','2026-09-19','2026-09-20','14:30','KEMA 서울캠퍼스 (광진구)','서울',false,0,'150만원 (전체 과정)','예정','KEMA Professional Course 4/13. 토 14:30~22:30 / 일 09:30~17:30. 전체 과정 접수 6/1~8/23.','https://www.kema-academy.com/training/noticeDetail?idx=122',true,'2026-06-01','manual','kema_pro_m04',NULL,NULL,'2026-09-19','2026-09-20'),
  ('kema','Professional Course — Shoulder II (서울)','workshop','2026-10-03','2026-10-04','14:30','KEMA 서울캠퍼스 (광진구)','서울',false,0,'150만원 (전체 과정)','예정','KEMA Professional Course 5/13. 토 14:30~22:30 / 일 09:30~17:30. 전체 과정 접수 6/1~8/23.','https://www.kema-academy.com/training/noticeDetail?idx=122',true,'2026-06-01','manual','kema_pro_m05',NULL,NULL,'2026-10-03','2026-10-04'),
  ('kema','Professional Course — Lumbopelvis I (서울)','workshop','2026-10-10','2026-10-11','14:30','KEMA 서울캠퍼스 (광진구)','서울',false,0,'150만원 (전체 과정)','예정','KEMA Professional Course 6/13. 토 14:30~22:30 / 일 09:30~17:30. 전체 과정 접수 6/1~8/23.','https://www.kema-academy.com/training/noticeDetail?idx=122',true,'2026-06-01','manual','kema_pro_m06',NULL,NULL,'2026-10-10','2026-10-11'),
  ('kema','Professional Course — Pelvis II (서울)','workshop','2026-10-17','2026-10-18','14:30','KEMA 서울캠퍼스 (광진구)','서울',false,0,'150만원 (전체 과정)','예정','KEMA Professional Course 7/13. 토 14:30~22:30 / 일 09:30~17:30. 전체 과정 접수 6/1~8/23.','https://www.kema-academy.com/training/noticeDetail?idx=122',true,'2026-06-01','manual','kema_pro_m07',NULL,NULL,'2026-10-17','2026-10-18'),
  ('kema','Professional Course — Lumbar II (서울)','workshop','2026-10-31','2026-11-01','14:30','KEMA 서울캠퍼스 (광진구)','서울',false,0,'150만원 (전체 과정)','예정','KEMA Professional Course 8/13. 토 14:30~22:30 / 일 09:30~17:30. 전체 과정 접수 6/1~8/23.','https://www.kema-academy.com/training/noticeDetail?idx=122',true,'2026-06-01','manual','kema_pro_m08',NULL,NULL,'2026-10-31','2026-11-01'),
  ('kema','Professional Course — Hip (서울)','workshop','2026-11-07','2026-11-08','14:30','KEMA 서울캠퍼스 (광진구)','서울',false,0,'150만원 (전체 과정)','예정','KEMA Professional Course 9/13. 토 14:30~22:30 / 일 09:30~17:30. 전체 과정 접수 6/1~8/23.','https://www.kema-academy.com/training/noticeDetail?idx=122',true,'2026-06-01','manual','kema_pro_m09',NULL,NULL,'2026-11-07','2026-11-08'),
  ('kema','Professional Course — Knee (서울)','workshop','2026-11-14','2026-11-15','14:30','KEMA 서울캠퍼스 (광진구)','서울',false,0,'150만원 (전체 과정)','예정','KEMA Professional Course 10/13. 토 14:30~22:30 / 일 09:30~17:30. 전체 과정 접수 6/1~8/23.','https://www.kema-academy.com/training/noticeDetail?idx=122',true,'2026-06-01','manual','kema_pro_m10',NULL,NULL,'2026-11-14','2026-11-15'),
  ('kema','Professional Course — Extremity 1 (서울)','workshop','2026-11-28','2026-11-29','14:30','KEMA 서울캠퍼스 (광진구)','서울',false,0,'150만원 (전체 과정)','예정','KEMA Professional Course 11/13. 토 14:30~22:30 / 일 09:30~17:30. 전체 과정 접수 6/1~8/23.','https://www.kema-academy.com/training/noticeDetail?idx=122',true,'2026-06-01','manual','kema_pro_m11',NULL,NULL,'2026-11-28','2026-11-29'),
  ('kema','Professional Course — Upper II (서울)','workshop','2026-12-05','2026-12-06','14:30','KEMA 서울캠퍼스 (광진구)','서울',false,0,'150만원 (전체 과정)','예정','KEMA Professional Course 12/13. 토 14:30~22:30 / 일 09:30~17:30. 전체 과정 접수 6/1~8/23.','https://www.kema-academy.com/training/noticeDetail?idx=122',true,'2026-06-01','manual','kema_pro_m12',NULL,NULL,'2026-12-05','2026-12-06'),
  ('kema','Professional Course — Foot & Ankle II (서울)','workshop','2026-12-12','2026-12-13','14:30','KEMA 서울캠퍼스 (광진구)','서울',false,0,'150만원 (전체 과정)','예정','KEMA Professional Course 13/13. 토 14:30~22:30 / 일 09:30~17:30. 전체 과정 접수 6/1~8/23.','https://www.kema-academy.com/training/noticeDetail?idx=122',true,'2026-06-01','manual','kema_pro_m13',NULL,NULL,'2026-12-12','2026-12-13')
ON CONFLICT (org_id, external_id, start_date) DO UPDATE SET
  title=EXCLUDED.title, type=EXCLUDED.type, end_date=EXCLUDED.end_date, start_time=EXCLUDED.start_time,
  location=EXCLUDED.location, region=EXCLUDED.region, is_online=EXCLUDED.is_online, fee=EXCLUDED.fee,
  description=EXCLUDED.description, apply_start=EXCLUDED.apply_start, apply_end=EXCLUDED.apply_end,
  edu_start=EXCLUDED.edu_start, edu_end=EXCLUDED.edu_end, last_checked=EXCLUDED.last_checked;

-- 이전 통합 1건(설명에 13개 모듈 나열) 제거 → 개별 모듈로 대체
DELETE FROM public.events WHERE org_id='kema' AND external_id='kema_pro_h2_seoul';

DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.events WHERE org_id = 'kema';
  RAISE NOTICE '✓ KEMA 학회 + 일정 % 건 (Introduction 1 + Professional 모듈 13)', n;
END $$;
