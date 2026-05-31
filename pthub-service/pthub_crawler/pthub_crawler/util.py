"""공통 유틸리티"""
from __future__ import annotations
import re
from dataclasses import dataclass, asdict, field
from datetime import date, datetime, timedelta
from typing import Optional


@dataclass
class Event:
    """학회 일정 표준 스키마 (접수마감일 앵커 모델)

    start/end 는 '교육기간'(edu)과 동일하게 채운다. DB 뷰가 앵커/상태를 계산.
    접수기간을 모르면 applyStart/applyEnd = None (가짜 '접수중' 금지).
    """
    id: int
    org: str
    title: str
    type: str  # 'conference' | 'ce' | 'seminar' | 'workshop'
    start: str  # YYYY-MM-DD (= eduStart)
    end: str    # YYYY-MM-DD (= eduEnd)
    time: str = '09:00'
    location: str = ''
    region: str = '미정'
    online: bool = False
    credit: int = 0
    fee: str = '학회 안내'
    status: str = '예정'
    desc: str = ''
    verified: bool = True
    lastChecked: str = ''
    url: str = ''
    # 접수마감일 앵커 모델 필드
    applyStart: Optional[str] = None   # 접수 시작 YYYY-MM-DD
    applyEnd: Optional[str] = None     # 접수 마감 YYYY-MM-DD
    eduStart: Optional[str] = None     # 교육 시작 YYYY-MM-DD
    eduEnd: Optional[str] = None       # 교육 종료 YYYY-MM-DD
    # 출처의 안정적 식별자 (재실행 시 같은 행을 갱신; 없으면 업로더가 id로 대체)
    externalId: str = ''

    def to_dict(self) -> dict:
        return asdict(self)


def today_str() -> str:
    return date.today().isoformat()


def find_next_saturday(d: date) -> date:
    """주어진 날짜 이후의 첫 토요일"""
    while d.weekday() != 5:
        d += timedelta(days=1)
    return d


def find_prev_sunday(d: date) -> date:
    """주어진 날짜 이전의 마지막 일요일"""
    while d.weekday() != 6:
        d -= timedelta(days=1)
    return d


def to_weekend_pair(start: date, end: date) -> tuple[tuple[date, date], Optional[tuple[date, date]]]:
    """
    긴 기간(예: 04-25 ~ 05-10)을 첫 주말·마지막 주말 쌍으로 변환.
    같은 주말이면 두번째는 None.
    """
    sat1 = find_next_saturday(start)
    sun1 = sat1 + timedelta(days=1)
    sun2 = find_prev_sunday(end)
    sat2 = sun2 - timedelta(days=1)

    if sat1 == sat2:
        return ((sat1, sun1), None)
    return ((sat1, sun1), (sat2, sun2))


KOR_DATE_PATTERNS = [
    # 2026-05-23, 2026.05.23, 2026/05/23
    re.compile(r'(\d{4})[-./](\d{1,2})[-./](\d{1,2})'),
    # 2026년 5월 23일
    re.compile(r'(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일'),
    # 05.23, 5/23 (연도 추정 필요)
    re.compile(r'(\d{1,2})[-./](\d{1,2})'),
]


def parse_kor_date(s: str, default_year: int = None) -> Optional[date]:
    """한국식 날짜 문자열 → date. 실패 시 None."""
    s = s.strip()
    for i, pat in enumerate(KOR_DATE_PATTERNS):
        m = pat.search(s)
        if not m:
            continue
        groups = m.groups()
        try:
            if len(groups) == 3:
                y, mo, d = map(int, groups)
            elif len(groups) == 2 and default_year:
                y = default_year
                mo, d = map(int, groups)
            else:
                continue
            return date(y, mo, d)
        except ValueError:
            continue
    return None


def first_two_iso_dates(s: str) -> tuple[Optional[date], Optional[date]]:
    """문자열에서 앞쪽 두 개의 YYYY-MM-DD 를 추출 (범위 셀용).
    예: '2025-11-20 00:00:00 ~ 2026-02-26 00:00:00' → (2025-11-20, 2026-02-26)
    하나만 있으면 (d, d), 없으면 (None, None)."""
    ds = re.findall(r'(\d{4})-(\d{1,2})-(\d{1,2})', s)
    out: list[date] = []
    for y, mo, d in ds:
        try:
            out.append(date(int(y), int(mo), int(d)))
        except ValueError:
            continue
        if len(out) == 2:
            break
    if not out:
        return None, None
    if len(out) == 1:
        return out[0], out[0]
    return out[0], out[1]


def first_time(s: str) -> Optional[str]:
    """문자열에서 의미있는 HH:MM 추출 (00:00 은 미상 처리 → None)."""
    for hh, mm in re.findall(r'(\d{1,2}):(\d{2})', s):
        if not (hh == '0' or hh == '00') or mm != '00':
            return f"{int(hh):02d}:{mm}"
    return None


def parse_date_range(s: str, default_year: int = None) -> tuple[Optional[date], Optional[date]]:
    """'2026-05-23 ~ 2026-08-09' 같은 범위 파싱"""
    # ~ 또는 ∼ 또는 –(en-dash) 로 구분 — '-'는 날짜 안에 쓰이므로 제외
    parts = re.split(r'\s*[~∼–]\s*', s, maxsplit=1)
    if len(parts) == 2:
        d1 = parse_kor_date(parts[0], default_year)
        d2 = parse_kor_date(parts[1], default_year)
        if d1 and d2:
            return d1, d2
    # 범위가 아닌 단일 날짜
    d1 = parse_kor_date(s, default_year)
    if d1:
        return d1, d1
    return None, None


REGION_KEYWORDS = {
    '서울': ['서울', '강남', '강북', '여의도', '광화문', '안강', '복음', '베데스다'],
    '인천': ['인천', '휴앤유', '인천세종'],
    '경기': ['경기', '분당', '성남', '수원', '하남', '고양', '용인', '안양', '판교',
            '보바스기념', '다빈치병원', '부천', '부천세종'],
    '강원': ['강원', '원주', '춘천', '속초'],
    '대전': ['대전', '대전대'],
    '충북': ['충북', '청주'],
    '충남': ['충남', '천안', '아산', '선문'],
    '광주': ['광주'],
    '전북': ['전북', '예수병원', '전주'],
    '전남': ['전남', '순천', '여수'],
    '대구': ['대구'],
    '경북': ['경북', '포항', '안동'],
    '부산': ['부산', '동아대학교', '신라대학교', '부산대학교'],
    '울산': ['울산', '연세병원'],
    '경남': ['경남', '진주', '경남대'],
    '제주': ['제주'],
    '온라인': ['온라인', 'webinar', 'zoom', '비대면'],
}


def infer_region(location: str) -> str:
    """장소 문자열에서 지역 추정"""
    if not location:
        return '미정'
    low = location.lower()
    for region, kws in REGION_KEYWORDS.items():
        for kw in kws:
            if kw.lower() in low:
                return region
    return '미정'


def is_online(location: str) -> bool:
    if not location:
        return False
    low = location.lower()
    return any(kw in low for kw in ['온라인', 'webinar', 'zoom', '비대면', 'online'])
