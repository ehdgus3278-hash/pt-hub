"""대한심장호흡물리치료학회 파서 - kacrpt.org 교육일정"""
from __future__ import annotations
import re
from datetime import date
from bs4 import BeautifulSoup
from ..util import Event, today_str, infer_region, is_online
from ..browser import browser_context, safe_goto


URL = 'https://www.kacrpt.org/program/schedule'


def fetch(headless: bool = True, start_id: int = 300) -> list[Event]:
    events: list[Event] = []
    with browser_context(headless=headless) as ctx:
        page = ctx.new_page()
        if not safe_goto(page, URL):
            print("  [error] kacrpt.org 접근 실패")
            return events

        html = page.content()
        soup = BeautifulSoup(html, 'lxml')

        # 교육일정 테이블
        tables = soup.find_all('table')
        for table in tables:
            for tr in table.find_all('tr'):
                cells = [td.get_text(' ', strip=True) for td in tr.find_all('td')]
                if len(cells) < 3:
                    continue

                # 일정 키워드
                row_text = ' '.join(cells)
                if not any(k in row_text for k in ['연수', '초급', '중급', '고급', '전문심화', '특별']):
                    continue

                # 날짜 추출
                date_str = next((c for c in cells if re.search(r'\d{4}', c)), '')
                m = re.search(r'(\d{4})[\.\-/](\d{1,2})[\.\-/](\d{1,2})\s*[~\-]\s*(\d{1,2})', date_str)
                if not m:
                    continue
                y, mo, d1, d2 = map(int, m.groups())
                try:
                    start_d = date(y, mo, d1)
                    end_d = date(y, mo, d2)
                except ValueError:
                    continue

                course = cells[0] if cells else ''
                location = next((c for c in cells if any(k in c for k in ['병원', '대학교', '센터', '온라인'])), '')

                events.append(Event(
                    id=start_id + len(events),
                    org='kacrpt',
                    title=course or '심장호흡 연수교육',
                    type='ce',
                    start=start_d.isoformat(),
                    end=end_d.isoformat(),
                    time='09:00',
                    location=location or '학회 안내',
                    region=infer_region(location),
                    online=is_online(location),
                    fee='학회 안내',
                    status='예정',
                    desc=f'대한심장호흡물리치료학회 교육일정에서 추출.',
                    verified=True,
                    lastChecked=today_str(),
                    url=URL,
                ))

    print(f"  [kacrpt] {len(events)}건 수집")
    return events
