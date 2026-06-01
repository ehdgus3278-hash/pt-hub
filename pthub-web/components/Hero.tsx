'use client';

interface Props {
  totalEvents: number;
  totalOrgs: number;
  lastVerified: string;
}

export default function Hero({ totalEvents, totalOrgs, lastVerified }: Props) {
  return (
    <section className="max-w-[1400px] mx-auto px-8 pt-10 pb-6 max-md:px-4 max-md:pt-5 max-md:pb-2">
      <p className="text-[15px] text-ink-soft max-w-[560px] max-md:text-[13px]">
        국내 물리치료 학회·보수교육·세미나·워크숍 일정을 한 곳에서. 각 일정은 학회 공식 공지글로 직접 연결되며, 정확한 정보는 공지글 본문을 확인하세요.
      </p>
      <div className="mt-5 flex gap-5 flex-wrap items-center pt-4 border-t border-line text-[13px] text-ink-soft max-md:mt-3.5 max-md:pt-3 max-md:gap-3 max-md:text-xs">
        <div className="inline-flex items-center gap-1.5">
          <b className="text-ink font-bold tabular-nums">{totalEvents}</b>개 일정
        </div>
        <div className="inline-flex items-center gap-1.5">
          <b className="text-ink font-bold tabular-nums">{totalOrgs}</b>개 학회
        </div>
        <div className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[11.5px] font-semibold"
             style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>마지막 검증: <b>{lastVerified || '—'}</b></span>
        </div>
      </div>
    </section>
  );
}
