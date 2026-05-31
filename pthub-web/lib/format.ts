import type { PthubEvent } from './types';

// 상태 뱃지 배경색 (CSS 변수/색상)
export function statusBg(status: string): string {
  switch (status) {
    case '접수중':
    case '모집중':
      return 'var(--accent)';        // 지금 신청 가능 — 강조
    case '접수예정':
      return 'var(--gold)';          // 곧 열림
    case '마감':
    case '교육 종료':
    case '취소됨':
      return '#999';                 // 종료/마감 — 흐리게
    case '교육중':
    case '예정':
    default:
      return 'var(--gold)';
  }
}

// "지금 신청 가능" 여부 (강조 대상)
export function isOpen(status: string): boolean {
  return status === '접수중' || status === '모집중';
}

// 마감 임박 등 D-day 라벨. 접수중일 때만 의미 있음.
export function ddayLabel(e: Pick<PthubEvent, 'status' | 'd_day'>): string | null {
  if (!isOpen(e.status) || e.d_day == null) return null;
  if (e.d_day <= 0) return '오늘 마감';
  if (e.d_day === 1) return '내일 마감';
  return `D-${e.d_day}`;
}

// 마감 임박(7일 이내) 여부
export function isUrgent(e: Pick<PthubEvent, 'status' | 'd_day'>): boolean {
  return isOpen(e.status) && e.d_day != null && e.d_day >= 0 && e.d_day <= 7;
}

// 날짜 범위 표기 (동일하면 단일)
export function dateRange(start?: string | null, end?: string | null): string {
  if (!start) return '';
  if (!end || end === start) return start;
  return `${start} ~ ${end}`;
}
