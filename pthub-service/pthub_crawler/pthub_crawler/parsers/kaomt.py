"""
대한정형도수물리치료학회 (KAOMT) 파서 - kaomt.or.kr
사이트는 봇 차단이 있지만 Playwright 실제 브라우저로 통과 가능.

엑셀 형태로 강의일정이 게시됨 → 행/열 그리드를 파싱.
"""
from __future__ import annotations
import re
from datetime import date, timedelta
from bs4 import BeautifulSoup
from ..util import Event, today_str, infer_region
from ..browser import browser_context, safe_goto


URL = 'http://www.kaomt.or.kr/edu/?page_num=0102'

# 엑셀의 컬럼 인덱스와 동일한 지역 매핑
REGION_HEADERS = [
    '서울', '인천', '경기', '고양', '충북', '대전', '충남',
    '광주', '전북', '전남', '강원', '순천', '울산',
    '대구', '포항', '경북', '부산', '경남', '진주', '제주',
    '대전대', '경남대', '삼육대A', '삼육대B', '삼육대C'
]

REGION_GROUP = {
    '서울': '서울', '인천': '인천', '경기': '경기', '고양': '경기',
    '충북': '충북', '대전': '대전', '충남': '충남', '대전대': '대전',
    '광주': '광주', '전북': '전북', '전남': '전남', '순천': '전남',
    '강원': '강원', '울산': '울산', '대구': '대구', '포항': '경북',
    '경북': '경북', '부산': '부산', '경남': '경남', '진주': '경남',
    '경남대': '경남', '제주': '제주',
    '삼육대A': '서울', '삼육대B': '서울', '삼육대C': '서울'
}

# 사지(extremity) 코스만 등록 — BUE/IUE/BLE/ILE
COURSE_PATTERN = re.compile(r'^(BUE|IUE|BLE|ILE)([가-힣]+)')


def fetch(headless: bool = True, start_id: int = 600, allowed_courses: set = None) -> list[Event]:
    """
    KAOMT 강의일정표 파싱.
    allowed_courses: None 이면 BUE/IUE/BLE/ILE만, 또는 명시적 set 전달.
    """
    if allowed_courses is None:
        allowed_courses = {'BUE', 'IUE', 'BLE', 'ILE'}

    events: list[Event] = []
    with browser_context(headless=headless) as ctx:
        page = ctx.new_page()
        # 메인 페이지 먼저 방문 (쿠키 받기)
        safe_goto(page, 'http://www.kaomt.or.kr/')
        page.wait_for_timeout(1000)

        if not safe_goto(page, URL):
            print("  [error] kaomt.or.kr 접근 실패")
            return events

        # JS 렌더링 대기
        page.wait_for_timeout(2000)
        html = page.content()
        soup = BeautifulSoup(html, 'lxml')

        # 학회 사이트가 표 형식이면 표 파싱, 텍스트 그리드면 텍스트 파싱
        events_from_table = parse_table_grid(soup, start_id, allowed_courses)
        if events_from_table:
            events.extend(events_from_table)

    print(f"  [kaomt] {len(events)}건 수집")
    return events


def parse_table_grid(soup: BeautifulSoup, start_id: int, allowed: set) -> list[Event]:
    """학회 사이트의 표 그리드 파싱"""
    events: list[Event] = []
    year = date.today().year

    # 표 찾기 — 학회마다 구조 다름. 우선 모든 table 시도
    for table in soup.find_all('table'):
        rows = table.find_all('tr')
        if len(rows) < 5:
            continue

        # 헤더 행에서 지역 컬럼 찾기
        header_row = None
        region_cols = {}  # col_idx → region
        for i, tr in enumerate(rows[:5]):
            cells = [td.get_text(strip=True) for td in tr.find_all(['td', 'th'])]
            matches = sum(1 for c in cells if c in REGION_HEADERS)
            if matches >= 3:
                header_row = i
                for j, c in enumerate(cells):
                    if c in REGION_HEADERS:
                        region_cols[j] = c
                break

        if header_row is None:
            continue

        # 데이터 행 — 월/토요일 컬럼 + 지역별 강의 추출
        current_month = None
        for tr in rows[header_row + 1:]:
            cells = tr.find_all(['td', 'th'])
            if not cells:
                continue

            # 첫 컬럼이 월
            first = cells[0].get_text(strip=True)
            if first.isdigit() and 1 <= int(first) <= 12:
                current_month = int(first)

            # 토요일 일자 (보통 컬럼 1 또는 2)
            sat_day = None
            for c in cells[:3]:
                t = c.get_text(strip=True)
                if t.isdigit() and 1 <= int(t) <= 31:
                    sat_day = int(t)
                    break

            if sat_day is None or current_month is None:
                continue

            try:
                sat_d = date(year, current_month, sat_day)
            except ValueError:
                continue
            sun_d = sat_d + timedelta(days=1)

            # 지역별 강의 추출
            for col_idx, region_name in region_cols.items():
                if col_idx >= len(cells):
                    continue
                text = cells[col_idx].get_text(strip=True)
                m = COURSE_PATTERN.match(text)
                if not m:
                    continue
                course = m.group(1)
                if course not in allowed:
                    continue
                instructor = re.sub(r'[.\d]+$', '', m.group(2)).strip()

                events.append(Event(
                    id=start_id + len(events),
                    org='kaompt',
                    title=f'{course} {instructor} ({region_name})',
                    type='workshop',
                    start=sat_d.isoformat(),
                    end=sun_d.isoformat(),
                    time='09:00',
                    location=region_name,
                    region=REGION_GROUP.get(region_name, region_name),
                    fee='학회 안내',
                    status='예정',
                    desc=f'{course} · {instructor} 강사 · {region_name}',
                    verified=True,
                    lastChecked=today_str(),
                    url=URL,
                ))

    return events
