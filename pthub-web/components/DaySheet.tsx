'use client';

import { useEffect } from 'react';
import type { PthubEvent } from '@/lib/types';
import { statusBg, ddayLabel } from '@/lib/format';

interface Props {
  date: Date;
  events: PthubEvent[];
  onEventClick: (event: PthubEvent) => void;
  onClose: () => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const TYPE_LABEL: Record<string, string> = {
  conference: '학술대회', ce: '보수교육', seminar: '세미나', workshop: '워크숍',
};

// 캘린더에서 날짜를 탭했을 때 그날의 전체 일정을 보여주는 시트(모바일 친화).
export default function DaySheet({ date, events, onEventClick, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  const title = `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6 max-md:p-0 max-md:items-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-bg-card rounded-2xl max-w-[480px] w-full max-h-[80vh] overflow-y-auto p-6 px-7 relative shadow-2xl max-md:p-5 max-md:max-h-[78vh] max-md:rounded-t-2xl max-md:rounded-b-none">
        <div className="flex items-center justify-between mb-4 sticky top-0">
          <h2 className="serif font-bold text-xl tracking-tight">
            {title} <span className="text-ink-mute font-normal text-sm">{events.length}건</span>
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg inline-flex items-center justify-center text-ink-soft hover:bg-ink hover:text-bg-card shrink-0"
            aria-label="닫기"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {events.length === 0 ? (
          <p className="text-center text-ink-mute text-sm py-8">이 날은 예정된 일정이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {events.map(e => {
              const dday = ddayLabel(e);
              return (
                <button
                  key={e.id}
                  onClick={() => onEventClick(e)}
                  className="text-left bg-bg border border-line rounded-xl p-3 px-3.5 hover:border-ink-soft transition-all relative overflow-hidden"
                  style={{ paddingLeft: '16px' }}
                >
                  <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: e.org_color }} />
                  <div className="flex gap-1.5 items-center mb-1 flex-wrap">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider text-white"
                          style={{ background: e.org_color }}>
                      {TYPE_LABEL[e.type] || e.type}
                    </span>
                    {e.status && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-white"
                            style={{ background: statusBg(e.status) }}>
                        {e.status}
                      </span>
                    )}
                    {dday && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                            style={{ background: 'var(--rose, #d6455d)' }}>
                        {dday}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-[14px] leading-snug text-ink">{e.title}</div>
                  <div className="text-[12px] text-ink-mute mt-0.5">
                    {e.org_name}{e.location ? ` · ${e.location}` : ''}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
