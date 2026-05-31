'use client';

interface Props {
  month: Date;
  onChange: (delta: number) => void;
}

export default function MonthNav({ month, onChange }: Props) {
  return (
    <div className="flex gap-2 items-center max-md:ml-auto max-md:gap-1">
      <NavButton onClick={() => onChange(-1)} ariaLabel="이전 달">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </NavButton>
      <div className="serif font-semibold text-base min-w-[120px] text-center max-md:text-[13px] max-md:min-w-[80px]">
        {month.getFullYear()}년 {month.getMonth() + 1}월
      </div>
      <NavButton onClick={() => onChange(1)} ariaLabel="다음 달">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </NavButton>
    </div>
  );
}

function NavButton({ onClick, children, ariaLabel }: { onClick: () => void; children: React.ReactNode; ariaLabel: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="w-8 h-8 rounded-lg border border-line inline-flex items-center justify-center text-ink-soft transition-all hover:bg-ink hover:text-bg-card hover:border-ink max-md:w-7 max-md:h-7"
    >
      {children}
    </button>
  );
}
