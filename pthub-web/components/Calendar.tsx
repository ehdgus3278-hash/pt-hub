'use client';

import { useMemo } from 'react';
import type { PthubEvent } from '@/lib/types';

interface Props {
  month: Date;
  events: PthubEvent[];
  onDayClick: (date: Date, events: PthubEvent[]) => void;
}

interface Cell {
  date: Date;
  muted: boolean;
  events: PthubEvent[];
}

export default function Calendar({ month, events, onDayClick }: Props) {
  const cells = useMemo<Cell[]>(() => {
    const year = month.getFullYear();
    const m = month.getMonth();
    const first = new Date(year, m, 1);
    const last = new Date(year, m + 1, 0);
    const startDay = first.getDay();
    const daysInMonth = last.getDate();
    const prevLast = new Date(year, m, 0).getDate();

    const arr: Cell[] = [];

    // 이전 달 채우기
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, m - 1, prevLast - i);
      arr.push({ date: d, muted: true, events: filterEventsForDate(events, d) });
    }
    // 이번 달
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, m, d);
      arr.push({ date: dt, muted: false, events: filterEventsForDate(events, dt) });
    }
    // 다음 달 채우기 (총 42칸)
    while (arr.length < 42) {
      const last = arr[arr.length - 1].date;
      const next = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
      arr.push({ date: next, muted: true, events: filterEventsForDate(events, next) });
    }
    return arr;
  }, [month, events]);

  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <div className="bg-bg-card border border-line rounded-2xl overflow-hidden shadow-soft w-full max-w-full max-md:rounded-xl">
      <div className="grid grid-cols-7 bg-bg border-b border-line">
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <div
            key={d}
            className={`text-center py-2.5 text-[11px] font-bold tracking-[.12em] uppercase max-md:py-1.5 max-md:text-[10px] max-md:tracking-wide ${
              i === 0 ? 'text-rose' : 'text-ink-mute'
            }`}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] max-md:auto-rows-[minmax(64px,auto)]">
        {cells.map((c, i) => {
          const isToday = c.date.getTime() === today.getTime();
          const isSun = c.date.getDay() === 0;
          const shown = c.events.slice(0, 3);
          const overflow = c.events.length - 3;

          return (
            <div
              key={i}
              onClick={() => { if (c.events.length > 0) onDayClick(c.date, c.events); }}
              className={`border-r border-b border-line-soft px-1.5 pt-1.5 pb-2 relative transition-colors min-h-[120px] min-w-0 overflow-hidden max-md:min-h-[64px] max-md:px-0.5 max-md:pt-1 max-md:pb-1 ${
                c.events.length > 0 ? 'cursor-pointer hover:bg-bg' : ''
              } ${c.muted ? 'bg-black/5' : ''} ${(i + 1) % 7 === 0 ? '!border-r-0' : ''}`}
              style={{ background: !c.muted ? undefined : 'rgba(0,0,0,.015)' }}
            >
              <span
                className={`text-[12.5px] font-semibold tabular-nums max-md:text-[10.5px] ${
                  isToday
                    ? 'inline-flex items-center justify-center w-[22px] h-[22px] rounded-full text-bg-card font-bold max-md:w-[18px] max-md:h-[18px] max-md:text-[9.5px]'
                    : ''
                } ${c.muted ? 'text-ink-mute' : isSun ? 'text-rose' : 'text-ink'}`}
                style={isToday ? { background: 'var(--ink)' } : undefined}
              >
                {c.date.getDate()}
              </span>

              <div className="mt-1 flex flex-col gap-0.5 max-md:gap-px max-md:mt-0.5">
                {shown.map(e => (
                  <div
                    key={e.id}
                    className="text-[10.5px] py-0.5 px-1.5 rounded text-white font-medium leading-tight overflow-hidden text-ellipsis whitespace-nowrap pointer-events-none max-md:text-[8.5px] max-md:py-px max-md:px-1 max-md:rounded-sm"
                    style={{ background: e.org_color }}
                    title={e.title}
                  >
                    {e.title}
                  </div>
                ))}
                {overflow > 0 && (
                  <div className="text-[10px] text-ink-mute px-1 font-medium max-md:text-[8.5px]">
                    +{overflow}건
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function filterEventsForDate(events: PthubEvent[], d: Date): PthubEvent[] {
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return events.filter(e => {
    const s = new Date(e.start_date);
    s.setHours(0, 0, 0, 0);
    const en = new Date(e.end_date);
    en.setHours(0, 0, 0, 0);
    return target >= s && target <= en;
  });
}
