-- ==============================================================
-- 08_seed_kema.sql — KEMA 학회(국제운동과학기술학회) 추가
-- 출처: https://www.kema-academy.com/training/noticeList (2026-05-07 공지)
-- 실행 순서: 01 → ... → 07 → 08
--
-- 특이점: 두 강좌 모두 '신청기간'이 명시돼 있어 apply_start/apply_end 채움
--         → 접수마감 D-day 정상 작동.
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
  ('kema','KEMA Professional Course (서울, 하반기)','workshop','2026-08-29','2026-12-13','14:30','KEMA 서울캠퍼스 (광진구)','서울',false,0,'150만원','예정','13개 모듈 주말(토 14:30~22:30 / 일 09:30~17:30): Cervicothorax I(8/29-30), Cervical II(9/5-6), Thoracic II(9/12-13), Shoulder I(9/19-20), Shoulder II(10/3-4), Lumbopelvis I(10/10-11), Pelvis II(10/17-18), Lumbar II(10/31-11/1), Hip(11/7-8), Knee(11/14-15), Extremity 1(11/28-29), Upper II(12/5-6), Foot&Ankle II(12/12-13). Introduction Course 이수자 대상. 접수 2026-06-01~08-23.','https://www.kema-academy.com/training/noticeDetail?idx=122',true,'2026-06-01','manual','kema_pro_h2_seoul','2026-06-01','2026-08-23','2026-08-29','2026-12-13')
ON CONFLICT (org_id, external_id, start_date) DO UPDATE SET
  title=EXCLUDED.title, type=EXCLUDED.type, end_date=EXCLUDED.end_date, start_time=EXCLUDED.start_time,
  location=EXCLUDED.location, region=EXCLUDED.region, is_online=EXCLUDED.is_online, fee=EXCLUDED.fee,
  description=EXCLUDED.description, apply_start=EXCLUDED.apply_start, apply_end=EXCLUDED.apply_end,
  edu_start=EXCLUDED.edu_start, edu_end=EXCLUDED.edu_end, last_checked=EXCLUDED.last_checked;

DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.events WHERE org_id = 'kema';
  RAISE NOTICE '✓ KEMA 학회 + 일정 % 건 등록 완료', n;
END $$;
