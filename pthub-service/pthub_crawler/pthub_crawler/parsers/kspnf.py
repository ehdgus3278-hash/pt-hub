"""대한PNF학회 파서 - kspnf.org 교육일정"""
from __future__ import annotations
import re
from datetime import date, timedelta
from bs4 import BeautifulSoup
from ..util import Event, today_str, infer_region, to_weekend_pair, parse_date_range
from ..browser import browser_context, safe_goto


URL = 'https://kspnf.org/page/schedule.php?tb=schedule'


def fetch(headless: bool = True, start_id: int = 400) -> list[Event]:
    """
    KSPNF 일정은 '04.25~05.10' 식으로 코스 전체 기간이 표시됨.
    실제는 주말 모듈 운영 → 개강/종강 주말로 분리해서 등록.
    """
    events: list[Event] = []
    with browser_context(headless=headless) as ctx:
        page = ctx.new_page()
        if not safe_goto(page, URL):
            print("  [error] kspnf.org 접근 실패")
            return events

        # JS 렌더링 대기
        try:
            page.wait_for_selector('text=Basic', timeout=8000)
        except Exception:
            pass

        # 12개월 순회 (어드밴스/국내/국제 코스 탭 무관, 메인 일정만)
        html = page.content()
        soup = BeautifulSoup(html, 'lxml')

        # 일정 항목 추출 - 학회 사이트 구조: 좌측 날짜 + 우측 코스명
        # 예: "04.25 ~ 05.10  인천시회 2026년 3차 Basic Course"
        text = soup.get_text('\n', strip=True)
        pattern = re.compile(r'(\d{1,2})\.(\d{1,2})\s*~\s*(\d{1,2})\.(\d{1,2})\s+([^\n]{5,80}(?:Course|코스|베이직|어드밴스)[^\n]*)')

        year = date.today().year
        seen = set()
        for m in pattern.finditer(text):
            mo1, d1, mo2, d2, title = m.groups()
            try:
                start_d = date(year, int(mo1), int(d1))
                end_d = date(year, int(mo2), int(d2))
                if end_d < start_d:
                    end_d = date(year + 1, int(mo2), int(d2))
            except ValueError:
                continue

            key = (start_d, end_d, title.strip())
            if key in seen:
                continue
            seen.add(key)

            title = title.strip()
            location = extract_location_kspnf(title)
            region = infer_region(location or title)

            # 긴 기간 → 시작 주말 + 종료 주말 2건
            (sat1, sun1), pair2 = to_weekend_pair(start_d, end_d)
            events.append(Event(
                id=start_id + len(events) * 10,
                org='kspnf',
                title=f"{title} (개강)",
                type='workshop',
                start=sat1.isoformat(),
                end=sun1.isoformat(),
                time='09:00',
                location=location or '학회 안내',
                region=region,
                fee='학회 안내',
                status='접수중',
                desc=f'KPNFA 코스. 첫 주말 모듈. 전체 기간: {start_d}~{end_d}.',
                verified=True,
                lastChecked=today_str(),
                url=URL,
            ))
            if pair2:
                sat2, sun2 = pair2
                events.append(Event(
                    id=start_id + len(events) * 10,
                    org='kspnf',
                    title=f"{title} (종강)",
                    type='workshop',
                    start=sat2.isoformat(),
                    end=sun2.isoformat(),
                    time='09:00',
                    location=location or '학회 안내',
                    region=region,
                    fee='학회 안내',
                    status='접수중',
                    desc=f'KPNFA 코스. 마지막 주말 모듈. 전체 기간: {start_d}~{end_d}.',
                    verified=True,
                    lastChecked=today_str(),
                    url=URL,
                ))

    print(f"  [kspnf] {len(events)}건 수집")
    return events


def extract_location_kspnf(title: str) -> str:
    m = re.search(r'(인천시회|대구시회|서울.?경기[남북]?부회|강원도회|대전.?충남도회|광주시회|부산시회|울산시회|제주시회|충북시회|전북시회|전남시회|경남시회|경북시회)', title)
    if m:
        return m.group(1)
    return ''
