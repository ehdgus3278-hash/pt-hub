-- ==============================================================
-- 07_seed_iata.sql — 국제수중치료협회(IATA-Korea) 추가
-- 출처: http://www.iatakorea.org/bbs/list.php?b_id=8&ffid=03-02
--       "2026년 전반기 수중치료 강좌계획" (게시판 글, 2026-05-27 최종수정 확인)
-- 실행 순서: 01 → ... → 06 → 07
--
-- 참고: 접수기간 미명시 → apply NULL (교육일정만). 과거분 제외, 미래/진행분만.
--       일정·장소는 학회 사정에 따라 변경될 수 있음(원 게시판 안내).
-- ==============================================================

INSERT INTO public.organizations
  (id, name, short_name, category, color, homepage_url, schedule_url, verified, crawler_status, sort_order)
VALUES
  ('iata', '국제수중치료협회', 'IATA', '수중치료', '#1f9bb5',
   'http://www.iatakorea.org/', 'http://www.iatakorea.org/bbs/list.php?b_id=8&ffid=03-02',
   true, 'manual', 80)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, short_name = EXCLUDED.short_name, category = EXCLUDED.category,
  color = EXCLUDED.color, homepage_url = EXCLUDED.homepage_url, schedule_url = EXCLUDED.schedule_url,
  verified = EXCLUDED.verified, crawler_status = EXCLUDED.crawler_status, sort_order = EXCLUDED.sort_order;

INSERT INTO public.events
  (org_id,title,type,start_date,end_date,start_time,location,region,is_online,credit,fee,status,description,url,verified,last_checked,source,external_id,apply_start,apply_end,edu_start,edu_end)
VALUES
  ('iata','수중치료 소개강좌 (6/21 용인)','workshop','2026-06-21','2026-06-21','09:00','용인','경기',false,0,'20만원','예정','Level 1 Introductory Course. 강사 염준우·임현주·오석. 이수 8시간. 대상: 물리치료사·관련 전공자.','http://www.iatakorea.org/bbs/list.php?b_id=8&ffid=03-02',true,'2026-06-01','manual','iata_intro_0621',NULL,NULL,'2026-06-21','2026-06-21'),
  ('iata','수중치료 소개강좌 (7/19 인천)','workshop','2026-07-19','2026-07-19','09:00','인천','인천',false,0,'20만원','예정','Level 1 Introductory Course. 강사 염준우·임현주·오석. 이수 8시간.','http://www.iatakorea.org/bbs/list.php?b_id=8&ffid=03-02',true,'2026-06-01','manual','iata_intro_0719',NULL,NULL,'2026-07-19','2026-07-19'),
  ('iata','Halliwick 10-Point 코스 2차 (인천)','workshop','2026-08-01','2026-08-02','09:00','인천','인천',false,0,'45만원','예정','Level 2A-Part1 Halliwick 10-Point-Programme. 강사 염준우·임현주. 이수 16시간. 대상: 소개강좌/AMR 이수자.','http://www.iatakorea.org/bbs/list.php?b_id=8&ffid=03-02',true,'2026-06-01','manual','iata_halliwick2',NULL,NULL,'2026-08-01','2026-08-02'),
  ('iata','WST (Water Specific Therapy) 코스 (인천)','workshop','2026-08-13','2026-08-17','09:00','인천','인천',false,0,'140만원','예정','Level 2A-Part2 WST. 강사 Johan Lambeck. 이수 54시간. 대상: 할리윅 텐포인트 이수자.','http://www.iatakorea.org/bbs/list.php?b_id=8&ffid=03-02',true,'2026-06-01','manual','iata_wst',NULL,NULL,'2026-08-13','2026-08-17'),
  ('iata','Package 코스 2차 — Halliwick+WST (인천)','workshop','2026-08-01','2026-08-17','09:00','인천','인천',false,0,'160만원','예정','Level 2A Package(Halliwick 8/1-2 + WST 8/13-17 동시 접수). 패키지 신청자 할리윅 우선권.','http://www.iatakorea.org/bbs/list.php?b_id=8&ffid=03-02',true,'2026-06-01','manual','iata_package2',NULL,NULL,'2026-08-01','2026-08-17')
ON CONFLICT (org_id, external_id, start_date) DO UPDATE SET
  title=EXCLUDED.title, type=EXCLUDED.type, end_date=EXCLUDED.end_date, location=EXCLUDED.location,
  region=EXCLUDED.region, fee=EXCLUDED.fee, description=EXCLUDED.description,
  edu_start=EXCLUDED.edu_start, edu_end=EXCLUDED.edu_end, last_checked=EXCLUDED.last_checked;

DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.events WHERE org_id = 'iata';
  RAISE NOTICE '✓ IATA 학회 + 일정 % 건 등록 완료', n;
END $$;
