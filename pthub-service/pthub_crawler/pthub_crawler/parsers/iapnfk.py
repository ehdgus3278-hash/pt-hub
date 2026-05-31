"""국제PNF한국학회 파서 - iapnfk.org 교육일정

사이트 구조 (검증 2026-05): 단일 HTML 테이블, 행 = 한 공지.
  열: # | 제목 | 예약일(접수기간) | 교육일시(교육기간+시간) | 접수상태
→ 목록만으로 접수기간·교육기간·상태가 모두 확보되는 '구조화 테이블형'.
  · 예약일  → applyStart/applyEnd
  · 교육일시 → eduStart/eduEnd (start/end 에도 동일 적재)
  · 접수상태 → status (단, 런타임 표시는 DB 뷰가 날짜로 재계산)
주말 분할(개강/종강) 하지 않음 — 한 공지 = 한 행.
"""
from __future__ import annotations
import re
from datetime import date, timedelta
from bs4 import BeautifulSoup
from ..util import (
    Event, today_str, infer_region,
    first_two_iso_dates, first_time,
)
from ..browser import browser_context, safe_goto


URL = 'https://iapnfk.org/education/schedule_list.php'

# 종료된 지 오래된 일정 컷오프 (이 일수 이전 종료분은 버림)
PAST_GRACE_DAYS = 1

STATUS_MAP = [
    ('취소', '취소됨'),
    ('교육 종료', '교육 종료'),
    ('종료', '교육 종료'),
    ('교육중', '교육중'),
    ('접수가능', '접수중'),
    ('접수', '접수중'),
    ('모집', '모집중'),
]


def _detail_id(href: str) -> str:
    """행 링크에서 안정적 id 추출 (?id=NN 또는 끝의 숫자)."""
    m = re.search(r'(?:id|idx|no|seq)=(\d+)', href)
    if m:
        return m.group(1)
    m = re.search(r'(\d{2,})', href or '')
    return m.group(1) if m else ''


def fetch(headless: bool = True, start_id: int = 500) -> list[Event]:
    events: list[Event] = []
    today = date.today()

    with browser_context(headless=headless) as ctx:
        page = ctx.new_page()
        if not safe_goto(page, URL):
            print("  [error] iapnfk.org 접근 실패")
            return events
        try:
            page.wait_for_load_state('networkidle', timeout=8000)
        except Exception:
            pass

        soup = BeautifulSoup(page.content(), 'lxml')

        seen: set[str] = set()
        for tr in soup.find_all('tr'):
            tds = tr.find_all('td')
            cells = [td.get_text(' ', strip=True) for td in tds]
            if len(cells) < 4:
                continue
            if cells[0] in ('', '#', '번호'):
                # 헤더 행
                if not any(re.search(r'\d{4}-\d{2}-\d{2}', c) for c in cells):
                    continue

            row_text = ' '.join(cells)
            if not re.search(r'\d{4}-\d{1,2}-\d{1,2}', row_text):
                continue

            # 날짜 범위를 담은 셀 2개 식별: 첫째=예약일(접수), 둘째=교육일시(교육)
            date_cells = [c for c in cells if re.search(r'\d{4}-\d{1,2}-\d{1,2}', c)]
            if len(date_cells) < 2:
                continue
            apply_cell, edu_cell = date_cells[0], date_cells[1]

            apply_s, apply_e = first_two_iso_dates(apply_cell)
            edu_s, edu_e = first_two_iso_dates(edu_cell)
            if not edu_s or not edu_e:
                continue
            if edu_e < edu_s:
                edu_s, edu_e = edu_e, edu_s

            # 오래 지난 일정 컷
            if edu_e < today - timedelta(days=PAST_GRACE_DAYS):
                continue

            # 제목·링크
            a = tr.find('a')
            href = a.get('href', '') if a else ''
            title = (a.get_text(' ', strip=True) if a else cells[1]).strip()
            if not title:
                continue
            if href.startswith('/'):
                href = 'https://iapnfk.org' + href
            elif href and not href.startswith('http'):
                href = 'https://iapnfk.org/education/' + href
            else:
                href = href or URL

            ext = _detail_id(href) or f"{edu_s.isoformat()}_{abs(hash(title)) % 100000}"
            ext_id = f"iapnfk_{ext}"
            if ext_id in seen:
                continue
            seen.add(ext_id)

            # 상태 (raw; DB 뷰가 날짜로 재계산하므로 '취소됨' 판정용 의미가 큼)
            status = '예정'
            for kw, st in STATUS_MAP:
                if kw in cells[-1] or kw in row_text:
                    status = st
                    break

            tm = first_time(edu_cell) or '09:00'
            region = infer_region(title)

            apply_desc = (f"접수 {apply_s}~{apply_e}, " if apply_s and apply_e else "")
            events.append(Event(
                id=start_id + len(events) * 2,
                org='iapnfk',
                title=title,
                type='workshop',
                start=edu_s.isoformat(),
                end=edu_e.isoformat(),
                time=tm,
                location='학회 공지 참조',
                region=region,
                fee='학회 안내',
                status=status,
                desc=f'IPNFA 국제/기본 코스. {apply_desc}교육 {edu_s}~{edu_e}.',
                verified=True,
                lastChecked=today_str(),
                url=href,
                applyStart=apply_s.isoformat() if apply_s else None,
                applyEnd=apply_e.isoformat() if apply_e else None,
                eduStart=edu_s.isoformat(),
                eduEnd=edu_e.isoformat(),
                externalId=ext_id,
            ))

    print(f"  [iapnfk] {len(events)}건 수집")
    return events
