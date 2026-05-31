-- ==============================================================
-- 학회 시드 데이터 (6개)
-- 실행 순서: 01_schema.sql → 02_seed_organizations.sql → 03_seed_events.sql
-- ==============================================================

INSERT INTO public.organizations (id, name, short_name, category, color, homepage_url, schedule_url, verified, crawler_status, sort_order) VALUES
('kbobath',     '한국보바스협회 (성인)',         'KBA',     '신경계·보바스', '#0f5e58', 'https://www.kbobath.com',     'https://www.kbobath.com/program/announcement',        true, 'active',  10),
('kbobath-ped', '한국보바스협회 (소아)',         'KBA-Ped', '소아·보바스',   '#4a8e88', 'https://www.kbobath.co.kr',   'https://www.kbobath.co.kr/commu/eduschedule/index.jsp', true, 'active',  20),
('kacrpt',      '대한심장호흡물리치료학회',       'KACRPT',  '심호흡',       '#b08a3e', 'https://www.kacrpt.org',      'https://www.kacrpt.org/program/schedule',             true, 'active',  30),
('kspnf',       '대한PNF학회',                  'KSPNF',   'PNF·신경근촉진', '#6b4a8f', 'https://kspnf.org',           'https://kspnf.org/page/schedule.php?tb=schedule',     true, 'active',  40),
('iapnfk',      '국제PNF한국학회',               'IAPNFK',  'PNF·IPNFA',    '#8e6dab', 'https://iapnfk.org',          'https://iapnfk.org/education/schedule_list.php',      true, 'active',  50),
('kaomt',       '대한정형도수물리치료학회',       'KAOMT',   '정형도수·OMPT', '#c4604f', 'http://www.kaomt.or.kr',      'http://www.kaomt.or.kr/edu/?page_num=0102',           true, 'active',  60)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    short_name = EXCLUDED.short_name,
    category = EXCLUDED.category,
    color = EXCLUDED.color,
    homepage_url = EXCLUDED.homepage_url,
    schedule_url = EXCLUDED.schedule_url,
    updated_at = now();

-- 검증
DO $$
DECLARE
    cnt int;
BEGIN
    SELECT count(*) INTO cnt FROM public.organizations;
    RAISE NOTICE '✓ 학회 % 곳 등록 완료', cnt;
END $$;
