'use client';

import { useState } from 'react';
import Link from 'next/link';
import SubmitModal from './SubmitModal';
import BookmarkModal from './BookmarkModal';

export default function Header() {
  const [submitOpen, setSubmitOpen] = useState(false);
  const [bookmarkOpen, setBookmarkOpen] = useState(false);

  return (
    <>
      <header className="border-b border-line bg-bg sticky top-0 z-50 backdrop-blur">
        <div className="max-w-[1400px] mx-auto py-4 px-8 flex items-center justify-between gap-4 max-md:px-4 max-md:py-3">
          <div className="flex items-center">
            <Link href="/" className="flex items-baseline gap-2.5">
              <div className="serif font-black text-2xl tracking-tight max-md:text-[21px]">
                PT<span style={{ color: 'var(--accent)' }}>·</span>Hub
              </div>
              <div className="text-[11px] text-ink-mute tracking-[.15em] uppercase font-medium max-md:hidden">
                Physical Therapy Calendar
              </div>
            </Link>
            <nav className="flex gap-5 ml-6 max-md:ml-3">
              <Link href="/" className="text-sm text-ink-soft font-medium cursor-pointer hover:text-accent max-md:text-[13px]">
                캘린더
              </Link>
              <Link href="/reviews" className="text-sm text-ink-soft font-medium cursor-pointer hover:text-accent max-md:text-[13px]">
                후기게시판
              </Link>
            </nav>
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
            <button
              className="py-2.5 px-4 rounded-full font-semibold text-[13px] text-white flex items-center gap-1.5 max-md:py-2 max-md:px-3 max-md:text-xs"
              style={{ background: 'var(--accent)' }}
              onClick={() => setBookmarkOpen(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              <span className="max-md:hidden">즐겨찾기 추가</span>
            </button>
          </div>
        </div>
      </header>

      {submitOpen && <SubmitModal onClose={() => setSubmitOpen(false)} />}
      {bookmarkOpen && <BookmarkModal onClose={() => setBookmarkOpen(false)} />}
    </>
  );
}
