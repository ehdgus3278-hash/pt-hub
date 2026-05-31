'use client';

import { useMemo } from 'react';
import type { PthubEvent } from '@/lib/types';
import { statusBg, ddayLabel, dateRange } from '@/lib/format';

interface Props {
  month: Date;
  events: PthubEvent[];
  onEventClick: (event: PthubEvent) => void;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const WEEKDAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const TYPE_LABEL: Record<string, string> = {
  conference: '학술대회', ce: '보수교육', seminar: '세미나', workshop: '워크숍'
};

export default function EventList({ month, events, onEventClick }: Props) {
  const filtered = useMemo(() => {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);
    return events
      .filter(e => {
        const s = new Date(e.start_date);
        const en = new Date(e.end_date);
        en.setHours(23, 59, 59, 999);
        return s <= monthEnd && en >= monthStart;
      })
      .slice()
      .sort((a, b) => a.start_date.localeCompare(b.start_date));
  }, [events, month]);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 px-5 text-ink-mute">
        <div className="text-[15px] mb-1.5">
          {month.getFullYear()}년 {month.getMonth() + 1}월에 예정된 일정이 없습니다.
        </div>
        <div className="text-[13px]">월을 이동하거나 필터를 조정해 보세요.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {filtered.map(e => {
        const d = new Date(e.start_date);
        const dday = ddayLabel(e);
        return (
          <div
            key={e.id}
            onClick={() => onEventClick(e)}
            className="bg-bg-card border border-line rounded-2xl p-5 px-5.5 grid grid-cols-[76px_1fr_auto] gap-5.5 items-start cursor-pointer transition-all relative overflow-hidden hover:border-ink-soft hover:-translate-y-px hover:shadow-soft max-md:grid-cols-[60px_1fr] max-md:p-4 max-md:gap-3.5 max-md:rounded-xl"
            style={{ paddingLeft: '22px' }}
          >
            {/* 학회 색상 띠 */}
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: e.org_color }} />

            <div className="text-center pr-4 border-r border-line max-md:pr-3">
              <div className="text-[11px] uppercase tracking-[.12em] text-ink-mute font-semibold">
                {MONTHS[d.getMonth()]}
              </div>
              <div className="serif font-bold text-[32px] leading-none my-1 tracking-tight max-md:text-[26px]">
                {d.getDate()}
              </div>
              <div className="text-[11px] text-ink-mute">{WEEKDAYS[d.getDay()]}</div>
            </div>

            <div className="min-w-0">
              <div className="flex gap-1.5 items-center mb-1.5 flex-wrap">
                <span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider text-white"
                      style={{ background: e.org_color }}>
                  {TYPE_LABEL[e.type] || e.type}
                </span>
                {e.status && (
                  <span
                    className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded text-white"
                    style={{ background: statusBg(e.status) }}
                  >
                    {e.status}
                  </span>
                )}
                {dday && (
                  <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded text-white"
                        style={{ background: 'var(--rose, #d6455d)' }}>
                    {dday}
                  </span>
                )}
                {e.is_online && (
                  <span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}>
                    온라인
                  </span>
                )}
                {e.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border"
                        style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    검증
                  </span>
                )}
                <span className="text-[11.5px] text-ink-mute font-medium">{e.org_name}</span>
              </div>

              <div className="serif font-bold text-lg leading-tight tracking-tight text-ink my-2 max-md:text-[15.5px]">
                {e.title}
              </div>

              <div className="flex gap-3.5 flex-wrap text-[12.5px] text-ink-soft max-md:gap-2.5 max-md:text-[11.5px]">
                {e.apply_end && (
                  <span className="inline-flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-mute">
                      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                    </svg>
                    접수마감 {e.apply_end}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-mute">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  교육 {dateRange(e.edu_start || e.start_date, e.edu_end || e.end_date)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-mute">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {e.location}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 max-md:hidden">
              <span className="w-9 h-9 rounded-full bg-bg border border-line inline-flex items-center justify-center text-ink-soft transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
