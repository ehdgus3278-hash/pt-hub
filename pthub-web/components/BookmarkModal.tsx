'use client';

import { useEffect, useState } from 'react';

interface Props {
  onClose: () => void;
}

// 브라우저는 보안상 JS로 즐겨찾기를 강제 추가할 수 없으므로,
// (구형 IE 한정 자동 추가를 시도하고) 안 되면 단축키 안내를 띄운다.
export default function BookmarkModal({ onClose }: Props) {
  const [shortcut, setShortcut] = useState('Ctrl + D');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    setShortcut(isMac ? '⌘ + D' : 'Ctrl + D');

    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  const tryAddFavorite = () => {
    // 구형 IE 전용 API. 최신 브라우저에서는 동작하지 않음(예외 무시).
    try {
      const ext = (window as unknown as { external?: { AddFavorite?: (url: string, title: string) => void } }).external;
      if (ext && typeof ext.AddFavorite === 'function') {
        ext.AddFavorite(window.location.href, document.title);
        return;
      }
    } catch {
      /* 무시하고 단축키 안내로 폴백 */
    }
    setTried(true);
  };

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6 max-md:p-0 max-md:items-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-bg-card rounded-2xl max-w-[420px] w-full p-8 px-9 relative shadow-2xl max-md:p-6 max-md:px-5 max-md:rounded-t-2xl max-md:rounded-b-none">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg inline-flex items-center justify-center text-ink-soft hover:bg-ink hover:text-bg-card"
          aria-label="닫기"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{ background: 'var(--accent-soft)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}>
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        <h2 className="serif font-bold text-2xl tracking-tight mb-2">즐겨찾기에 추가</h2>
        <p className="text-[13.5px] text-ink-soft leading-relaxed mb-5">
          PT-Hub를 즐겨찾기에 추가하면 새 학회 일정을 빠르게 확인할 수 있어요.
          아래 단축키를 누르면 즐겨찾기 추가 창이 열립니다.
        </p>

        <div className="bg-bg border border-line rounded-xl p-4 text-center mb-5">
          <kbd className="font-mono font-bold text-lg text-ink">{shortcut}</kbd>
          <div className="text-[12px] text-ink-mute mt-1.5">키를 눌러 즐겨찾기에 추가하세요</div>
        </div>

        {tried && (
          <p className="text-[12.5px] text-ink-mute leading-relaxed mb-4">
            ※ 브라우저 보안 정책상 버튼만으로는 즐겨찾기에 자동 등록할 수 없습니다.
            위 단축키 <b className="text-ink">{shortcut}</b> 를 눌러 추가해 주세요.
          </p>
        )}

        <button
          onClick={tryAddFavorite}
          className="w-full py-3 px-5 rounded-full text-white text-sm font-semibold transition-opacity"
          style={{ background: 'var(--accent)' }}
        >
          즐겨찾기 추가
        </button>
      </div>
    </div>
  );
}
