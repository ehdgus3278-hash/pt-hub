'use client';

import { useState } from 'react';
import SubmitModal from './SubmitModal';

export default function Header() {
  const [submitOpen, setSubmitOpen] = useState(false);

  return (
    <>
      <header className="border-b border-line bg-bg sticky top-0 z-50 backdrop-blur">
        <div className="max-w-[1400px] mx-auto py-4 px-8 flex items-center justify-between gap-4 max-md:px-4 max-md:py-3">
          <div className="flex items-center">
            <div className="flex items-baseline gap-2.5">
              <div className="serif font-black text-2xl tracking-tight max-md:text-[21px]">
                PT<span style={{ color: 'var(--accent)' }}>·</span>Hub
              </div>
              <div className="text-[11px] text-ink-mute tracking-[.15em] uppercase font-medium max-md:hidden">
                Physical Therapy Calendar
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center max-md:gap-1.5">
            <button
              className="py-2.5 px-4 rounded-full font-semibold text-[13px] border border-line text-ink-soft hover:border-ink-mute hover:text-ink flex items-center gap-1.5 max-md:py-2 max-md:px-3 max-md:text-xs"
              onClick={() => setSubmitOpen(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="max-md:hidden">일정 제보</span>
            </button>
            <a
              href="/api/feed"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-full font-semibold text-[13px] text-white flex items-center gap-1.5 max-md:py-2 max-md:px-3 max-md:text-xs"
              style={{ background: 'var(--accent)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span className="max-md:hidden">캘린더 구독</span>
            </a>
          </div>
        </div>
      </header>

      {submitOpen && <SubmitModal onClose={() => setSubmitOpen(false)} />}
    </>
  );
}
