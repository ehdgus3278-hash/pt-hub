'use client';

import { useState, useEffect } from 'react';
import type { PthubEvent } from '@/lib/types';
import { statusBg, ddayLabel, dateRange } from '@/lib/format';
import ReportForm from './ReportForm';

interface Props {
  event: PthubEvent;
  onClose: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  conference: '학술대회', ce: '보수교육', seminar: '세미나', workshop: '워크숍'
};

export default function EventModal({ event, onClose }: Props) {
  const [showReport, setShowReport] = useState(false);
  const isClosed = event.status === '마감' || event.status === '교육 종료' || event.status === '취소됨';
  const dday = ddayLabel(event);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6 max-md:p-0 max-md:items-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content-desktop max-md:modal-content-mobile bg-bg-card rounded-2xl max-w-[600px] w-full max-h-[90vh] overflow-y-auto p-8 px-9 relative shadow-2xl max-md:p-6 max-md:px-5 max-md:max-h-[92vh] max-md:rounded-t-2xl max-md:rounded-b-none">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg inline-flex items-center justify-center text-ink-soft hover:bg-ink hover:text-bg-card"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {!showReport ? (
          <>
            <div className="flex gap-1.5 flex-wrap mb-3">
              <span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider text-white"
                    style={{ background: event.org_color }}>
                {TYPE_LABEL[event.type] || event.type}
              </span>
              {event.status && (
                <span
                  className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded text-white"
                  style={{ background: statusBg(event.status) }}
                >
                  {event.status}
                </span>
              )}
              {dday && (
                <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded text-white"
                      style={{ background: 'var(--rose, #d6455d)' }}>
                  {dday}
                </span>
              )}
              {event.is_online && (
                <span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}>
                  온라인 가능
                </span>
              )}
              {event.verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border"
                      style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {event.last_checked} 검증
                </span>
              )}
            </div>

            <h2 className="serif font-bold text-[26px] leading-tight tracking-tight pr-9 mb-1.5 max-md:text-[21px]">
              {event.title}
            </h2>
            <div className="text-[13px] text-ink-mute mb-5">
              {event.org_name}
            </div>

            <dl className="grid grid-cols-[90px_1fr] gap-y-3 gap-x-4 py-4 border-y border-line mb-4 max-md:grid-cols-[80px_1fr] max-md:gap-x-3.5">
              {event.apply_end && (
                <>
                  <dt className="text-xs text-ink-mute font-medium uppercase tracking-wider">접수기간</dt>
                  <dd className="text-sm text-ink font-semibold">
                    {dateRange(event.apply_start, event.apply_end)}
                    {dday && (
                      <span className="ml-2 text-[11px] font-bold px-1.5 py-0.5 rounded text-white align-middle"
                            style={{ background: 'var(--rose, #d6455d)' }}>
                        {dday}
                      </span>
                    )}
                  </dd>
                </>
              )}
              <dt className="text-xs text-ink-mute font-medium uppercase tracking-wider">교육기간</dt>
              <dd className="text-sm text-ink">
                {dateRange(event.edu_start || event.start_date, event.edu_end || event.end_date)} · {event.start_time} 시작
              </dd>
              <dt className="text-xs text-ink-mute font-medium uppercase tracking-wider">장소</dt>
              <dd className="text-sm text-ink">
                {event.location}{event.region && event.region !== '미정' ? ` (${event.region})` : ''}
              </dd>
              {event.fee && (
                <>
                  <dt className="text-xs text-ink-mute font-medium uppercase tracking-wider">참가비</dt>
                  <dd className="text-sm text-ink">{event.fee}</dd>
                </>
              )}
              {event.credit > 0 && (
                <>
                  <dt className="text-xs text-ink-mute font-medium uppercase tracking-wider">보수교육</dt>
                  <dd className="text-sm text-ink">평점 {event.credit}점 인정</dd>
                </>
              )}
              {event.status && (
                <>
                  <dt className="text-xs text-ink-mute font-medium uppercase tracking-wider">상태</dt>
                  <dd className="text-sm text-ink">{event.status}</dd>
                </>
              )}
            </dl>

            <div className="text-sm text-ink-soft leading-relaxed mb-5">{event.description}</div>

            <div className="bg-bg border border-line rounded-xl p-3 px-3.5 mb-4 text-[12.5px] text-ink-soft leading-relaxed">
              <strong className="text-ink">학회 공지글로 이동합니다.</strong> 정확한 일정·강사·신청방법·접수상태는 학회 공지글에서 직접 확인하세요.
            </div>

            <div className="flex flex-col gap-2.5">
              <a
                href={event.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-5 rounded-full font-semibold text-sm inline-flex items-center justify-center gap-1.5 transition-all"
                style={{
                  background: isClosed ? 'transparent' : 'var(--accent)',
                  color: isClosed ? 'var(--ink)' : 'white',
                  border: isClosed ? '1px solid var(--line)' : 'none',
                }}
              >
                {isClosed ? '공지글 확인' : '학회 공지글로 이동'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <div className="flex items-center justify-center gap-4 pt-1">
                <a
                  href={`/event/${event.id}`}
                  className="text-[12.5px] text-ink-soft hover:text-accent underline underline-offset-4 transition-colors"
                >
                  이 일정 페이지 열기
                </a>
                <button
                  onClick={async () => {
                    const url = `${window.location.origin}/event/${event.id}`;
                    const shareData = { title: event.title, text: `${event.org_name} · ${event.title}`, url };
                    if (navigator.share) {
                      try { await navigator.share(shareData); } catch { /* 취소 무시 */ }
                    } else {
                      try {
                        await navigator.clipboard.writeText(url);
                        alert('링크가 복사되었습니다.');
                      } catch { /* 무시 */ }
                    }
                  }}
                  className="text-[12.5px] text-ink-soft hover:text-accent underline underline-offset-4 transition-colors"
                >
                  공유하기
                </button>
              </div>

              <button
                onClick={() => setShowReport(true)}
                className="py-2.5 px-4 text-[12.5px] text-ink-mute hover:text-rose underline underline-offset-4 transition-colors"
              >
                이 일정에 오류가 있어요 (신고)
              </button>
            </div>
          </>
        ) : (
          <ReportForm
            eventId={event.id}
            eventTitle={event.title}
            onCancel={() => setShowReport(false)}
            onSuccess={() => {
              setShowReport(false);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}
