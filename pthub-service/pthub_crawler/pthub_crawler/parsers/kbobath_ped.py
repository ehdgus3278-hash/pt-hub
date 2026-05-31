"""한국보바스협회 (소아) 파서 - kbobath.co.kr 교육일정"""
from __future__ import annotations
import re
from datetime import date
from bs4 import BeautifulSoup
from ..util import Event, today_str, infer_region
from ..browser import browser_context, safe_goto


LIST_URL = 'https://www.kbobath.co.kr/commu/eduschedule/index.jsp'


def fetch(headless: bool = True, start_id: int = 200) -> list[Event]:
    events: list[Event] = []
    with browser_context(headless=headless) as ctx:
        page = ctx.new_page()
        if not safe_goto(page, LIST_URL):
            print("  [error] kbobath.co.kr 접근 실패")
            return events

        html = page.content()
        soup = BeautifulSoup(html, 'lxml')

        # 게시판 목록 — 학회 사이트 구조에 따라 조정 필요
        rows = soup.select('table.bd_list tr, table tbody tr, .list-row')
        for tr in rows:
            text = tr.get_text(' ', strip=True)
            if not text or len(text) < 10:
                continue

            # 일정 키워드만
            if not any(k in text for k in ['강좌', '코스', '소개', '기본', '심화', '특별']):
                continue
            if '공지' in text and '일정' not in text:
                continue

            # 날짜 추출 — "2026-05-30" 또는 "2026년 5월" 등
            m = re.search(r'(\d{4})[년\-\.\s]+(\d{1,2})[월\-\.\s]+(\d{1,2})[일]?', text)
            if not m:
                # 월 단위는 등록 안함 (도배 방지)
                continue
            y, mo, d = map(int, m.groups())
            try:
                start_d = date(y, mo, d)
            except ValueError:
                continue

            # 종료일 (있으면)
            m2 = re.search(rf'{mo}\s*월\s*\d+\s*[-~]\s*(\d+)\s*일', text)
            end_d = date(y, mo, int(m2.group(1))) if m2 else start_d

            # 링크
            a = tr.find('a')
            href = a.get('href', '') if a else ''
            if href.startswith('/'):
                href = 'https://www.kbobath.co.kr' + href

            title = a.get_text(strip=True) if a else text[:80]
            course_type = 'workshop' if ('기본강좌' in title or '심화' in title) else 'seminar'

            events.append(Event(
                id=start_id + len(events),
                org='kbobath-ped',
                title=title,
                type=course_type,
                start=start_d.isoformat(),
                end=end_d.isoformat(),
                time='09:00',
                location='학회 공지 참조',
                region=infer_region(title),
                fee='학회 공지 참조',
                status='접수중',
                desc=f'한국보바스협회(소아) 공지 추출: {title[:80]}',
                verified=True,
                lastChecked=today_str(),
                url=href or LIST_URL,
            ))

    print(f"  [kbobath-ped] {len(events)}건 수집")
    return events
