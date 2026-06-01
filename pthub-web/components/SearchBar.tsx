'use client';

import type { Organization } from '@/lib/types';

interface Props {
  query: string;
  onQueryChange: (v: string) => void;
  orgFilter: string;
  onOrgFilterChange: (v: string) => void;
  organizations: Organization[];
  view: 'calendar' | 'list';
  onViewChange: (v: 'calendar' | 'list') => void;
}

export default function SearchBar({
  query, onQueryChange,
  orgFilter, onOrgFilterChange,
  organizations,
  view, onViewChange,
}: Props) {
  return (
    <div className="max-w-[1400px] mx-auto px-8 mt-4 max-md:px-4 max-md:mt-3.5">
      <div className="bg-bg-card border border-line rounded-2xl p-3.5 flex gap-3 items-center shadow-soft flex-wrap max-md:p-2.5 max-md:gap-2">
        <div className="flex-1 min-w-[220px] flex items-center gap-2.5 px-2.5 max-md:min-w-full max-md:order-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-mute shrink-0">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="학회명·행사명·강사명·키워드 검색…"
            className="w-full border-none outline-none bg-transparent text-[15px] py-1.5 text-ink placeholder:text-ink-mute max-md:text-sm"
          />
        </div>

        <div className="w-px h-6 bg-line max-md:hidden" />

        <div className="flex gap-1.5 flex-wrap max-md:order-2 max-md:w-full max-md:flex-nowrap max-md:overflow-x-auto scroll-hide max-md:pb-1">
          <Chip active={orgFilter === 'all'} onClick={() => onOrgFilterChange('all')}>전체</Chip>
          {organizations.map(o => (
            <Chip
              key={o.id}
              active={orgFilter === o.id}
              onClick={() => onOrgFilterChange(o.id)}
              dotColor={o.color}
            >
              {o.name}
            </Chip>
          ))}
        </div>

        <div className="w-px h-6 bg-line max-md:hidden" />

        <div className="flex bg-bg border border-line rounded-full p-0.5 max-md:order-3 max-md:self-stretch">
          <ToggleBtn active={view === 'calendar'} onClick={() => onViewChange('calendar')}>캘린더</ToggleBtn>
          <ToggleBtn active={view === 'list'} onClick={() => onViewChange('list')}>리스트</ToggleBtn>
        </div>
      </div>
    </div>
  );
}

function Chip({
  children, active, onClick, dotColor,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  dotColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-1.5 px-3.5 rounded-full text-[12.5px] font-medium border whitespace-nowrap transition-all max-md:py-1.5 max-md:px-2.5 max-md:text-xs ${
        active
          ? 'border-ink text-bg-card'
          : 'border-line text-ink-soft hover:border-ink-soft bg-bg'
      }`}
      style={active ? { background: 'var(--ink)' } : undefined}
    >
      {dotColor && (
        <span
          className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
          style={{ background: dotColor }}
        />
      )}
      {children}
    </button>
  );
}

function ToggleBtn({
  children, active, onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-1.5 px-3.5 rounded-full text-[12.5px] font-medium max-md:flex-1 max-md:py-2 ${
        active ? 'text-bg-card' : 'text-ink-soft'
      }`}
      style={active ? { background: 'var(--ink)' } : undefined}
    >
      {children}
    </button>
  );
}
