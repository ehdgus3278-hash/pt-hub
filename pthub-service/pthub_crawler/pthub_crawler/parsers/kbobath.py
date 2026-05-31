"""한국보바스협회 (성인) 파서 - kbobath.com 공지사항"""
from __future__ import annotations
import re
from datetime import date
from bs4 import BeautifulSoup
from ..util import Event, today_str, infer_region, parse_date_range, parse_kor_date
from ..browser import browser_context, safe_goto


BASE_URL = 'https://www.kbobath.com'
LIST_URL = f'{BASE_URL}/program/announcement'


def fetch(headless: bool = True, start_id: int = 100) -> list[Event]:
    """공지사항 목록 → 일정 공지글만 필터링"""
    events: list[Event] = []
    with browser_context(headless=headless) as ctx:
        page = ctx.new_page()
        if not safe_goto(page, LIST_URL):
            print("  [error] kbobath.com 접근 실패")
            return events

        # 여러 페이지 순회 (1~3 정도)
        for page_no in range(1, 4):
            url = f'{LIST_URL}?page={page_no}'
            if not safe_goto(page, url):
                break
            html = page.content()
            soup = BeautifulSoup(html, 'lxml')
            rows = soup.select('table tr')
            count_before = len(events)

            for tr in rows:
                a = tr.find('a', href=re.compile(r'/program/announcement/\d+'))
                if not a:
                    continue
                title = a.get_text(strip=True)
                href = a.get('href', '')
                if href.startswith('/'):
                    href = BASE_URL + href

                # 일정 관련 키워드만 (공지/안내성 제외)
                if not any(k in title for k in ['강좌', '코스', '학술대회', '세미나', '특강', '소개강좌', '심화', '기본']):
                    continue
                if any(skip in title for skip in ['전체 교육일정', '환불 규정', '세금계산서', '인사', '안내문']):
                    continue

                # 날짜 패턴 추출
                start, end, course_type = parse_kbobath_title(title)
                if not start:
                    continue

                status = '마감' if ('마감' in title or '발표' in title) else '접수중'
                if '발표' in title:
                    status = '수강생 발표'

                location, region = guess_location(title)
                event_id = start_id + len(events)

                events.append(Event(
                    id=event_id,
                    org='kbobath',
                    title=title,
                    type=course_type,
                    start=start.isoformat(),
                    end=end.isoformat(),
                    time='09:00',
                    location=location,
                    region=region,
                    fee='학회 공지 참조',
                    status=status,
                    desc=f'한국보바스협회 공지글에서 추출. 공지: {title}',
                    verified=True,
                    lastChecked=today_str(),
                    url=href,
                ))

            if len(events) == count_before:
                # 새 일정 0건이면 더 이상 진행 안함
                break

    print(f"  [kbobath] {len(events)}건 수집")
    return events


def parse_kbobath_title(title: str) -> tuple[date | None, date | None, str]:
    """
    공지글 제목에서 일정·종류 추출.
    예: '2026년 7월 11-12일 보바스기념병원 소개강좌 수강생 모집(마감)'
    """
    course_type = 'workshop'
    if '소개강좌' in title or '특강' in title or '인체동작' in title:
        course_type = 'seminar'
    if '학술대회' in title:
        course_type = 'conference'

    # 1) "2026년 7월 11-12일" 패턴
    m = re.search(r'(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*[-~]\s*(\d{1,2})\s*일', title)
    if m:
        y, mo, d1, d2 = map(int, m.groups())
        try:
            return date(y, mo, d1), date(y, mo, d2), course_type
        except ValueError:
            pass

    # 2) "2026 7월 11-12일" (년 표기 없음)
    m = re.search(r'(\d{4})\s*(\d{1,2})\s*월\s*(\d{1,2})\s*[-~]\s*(\d{1,2})\s*일', title)
    if m:
        y, mo, d1, d2 = map(int, m.groups())
        try:
            return date(y, mo, d1), date(y, mo, d2), course_type
        except ValueError:
            pass

    # 3) "2026년 6월" 만 있는 경우 (월 단위) → 등록 안함
    return None, None, course_type


def guess_location(title: str) -> tuple[str, str]:
    """공지 제목에서 장소·지역 추정"""
    # 괄호 안 장소 추출
    m = re.search(r'\((하남|부산|서울|인천|대전|광주|울산|충남|전북|경기|강원|대구|충북|전남|경북|경남|제주)\)', title)
    if m:
        return m.group(1), m.group(1)

    # 시도회 이름 추출
    sido = re.search(r'(서울시회|경기도회|인천시회|대전.?충청도회|충청도회|광주.?전남도회|전북도회|강원도회|부산시회|울산시회|충남도회|대구.?경북도회|경남도회|제주도회)', title)
    if sido:
        region = infer_region(sido.group(1))
        return sido.group(1), region

    # 병원·기관
    for kw in ['보바스기념병원', '다빈치병원', '베데스다병원', '안강병원', '대전재활병원', '예수병원',
              '동아대학교 대신병원', '광주365재활병원', '연세병원', '복음 재활병원', '천안 재활병원']:
        if kw in title:
            return kw, infer_region(kw)

    return '학회 공지 참조', '미정'
