'use client';

import { useMemo } from 'react';
import type { Organization, PthubEvent } from '@/lib/types';

interface Props {
  organizations: Organization[];
  events: PthubEvent[];
  orgFilter: string;
  onOrgFilterChange: (v: string) => void;
  regionFilter: string;
  onRegionFilterChange: (v: string) => void;
  onlineOnly: boolean;
  onOnlineChange: (v: boolean) => void;
  verifiedOnly: boolean;
  onVerifiedChange: (v: boolean) => void;
  open: boolean;
  onClose: () => void;
}

export default function FilterSidebar(props: Props) {
  const {
    organizations, events, orgFilter, onOrgFilterChange,
    regionFilter, onRegionFilterChange,
    onlineOnly, onOnlineChange,
    verifiedOnly, onVerifiedChange,
    open, onClose,
  } = props;

  const orgCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of events) m[e.org_id] = (m[e.org_id] || 0) + 1;
    return m;
  }, [events]);

  const regionCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of events) m[e.region] = (m[e.region] || 0) + 1;
    return m;
  }, [events]);

  const onlineCount = events.filter(e => e.is_online).length;
  const verifiedCount = events.filter(e => e.verified).length;
  const regions = Object.keys(regionCounts).sort();

  return (
    <>
      {/* 모바일 backdrop */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 z-[199] ${open ? 'block' : 'hidden'}`}
        onClick={onClose}
      />

      <aside
        className={`
          md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-100px)] md:overflow-y-auto md:pr-1.5
          sidebar-scroll
          max-md:fixed max-md:top-0 max-md:bottom-0 max-md:w-[86%] max-md:max-w-[340px]
          max-md:bg-bg max-md:py-5 max-md:px-4 max-md:pb-20 max-md:z-[200] max-md:overflow-y-auto
          max-md:transition-all max-md:duration-300
          ${open ? 'max-md:left-0' : 'max-md:-left-full'}
          max-md:shadow-xl
        `}
      >
        {/* 모바일 닫기 헤더 */}
        <div className="md:hidden flex items-center justify-between pb-4 mb-4 border-b border-line">
          <div className="serif font-bold text-lg">필터</div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-bg-card inline-flex items-center justify-center border border-line hover:bg-ink hover:text-bg-card"
            aria-label="필터 닫기"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 학회 */}
        <Group title="학회 / 주최">
          <FilterRow
            active={orgFilter === 'all'}
            onClick={() => onOrgFilterChange('all')}
            label="전체"
            count={events.length}
          />
          {organizations.map(o => {
            const n = orgCounts[o.id] || 0;
            if (n === 0) return null;
            return (
              <FilterRow
                key={o.id}
                active={orgFilter === o.id}
                onClick={() => { onOrgFilterChange(o.id); if (window.innerWidth <= 768) setTimeout(onClose, 150); }}
                label={
                  <span className="flex items-center min-w-0 flex-1 overflow-hidden">
                    <span className="inline-block w-2 h-2 rounded-full mr-1.5 shrink-0" style={{ background: o.color }} />
                    <strong className="font-semibold text-[12.5px] whitespace-nowrap overflow-hidden text-ellipsis">
                      {o.name}
                    </strong>
                  </span>
                }
                count={n}
              />
            );
          })}
        </Group>

        {/* 지역 */}
        <Group title="지역">
          <div className="grid grid-cols-2 gap-0.5 max-md:grid-cols-1">
            <div className="col-span-2 max-md:col-span-1">
              <FilterRow
                active={regionFilter === 'all'}
                onClick={() => onRegionFilterChange('all')}
                label="전체"
                count={events.length}
              />
            </div>
            {regions.map(r => (
              <FilterRow
                key={r}
                active={regionFilter === r}
                onClick={() => { onRegionFilterChange(r); if (window.innerWidth <= 768) setTimeout(onClose, 150); }}
                label={r}
                count={regionCounts[r]}
                compact
              />
            ))}
          </div>
        </Group>

        {/* 옵션 */}
        <Group title="옵션">
          <FilterRow
            active={onlineOnly}
            onClick={() => onOnlineChange(!onlineOnly)}
            label="온라인 가능"
            count={onlineCount}
          />
          <FilterRow
            active={verifiedOnly}
            onClick={() => onVerifiedChange(!verifiedOnly)}
            label="✓ 검증 완료만"
            count={verifiedCount}
          />
        </Group>
      </aside>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-[11px] font-bold text-ink-mute uppercase tracking-[.12em] mb-2.5 pb-2 border-b border-line">
        {title}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function FilterRow({
  active, onClick, label, count, compact,
}: {
  active: boolean;
  onClick: () => void;
  label: React.ReactNode;
  count: number;
  compact?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between rounded-lg cursor-pointer text-[13px] transition-all gap-2 min-w-0 max-md:py-2.5 max-md:px-3 max-md:text-sm ${
        compact ? 'py-1.5 px-2 text-[12.5px]' : 'py-2 px-2.5'
      } ${
        active
          ? 'font-semibold'
          : 'text-ink-soft hover:bg-bg-card hover:text-ink'
      }`}
      style={active ? { background: 'var(--accent-soft)', color: 'var(--accent-ink)' } : undefined}
    >
      {typeof label === 'string' ? <span>{label}</span> : label}
      <span className={`text-[11px] tabular-nums shrink-0 ${active ? '' : 'text-ink-mute'}`}>{count}</span>
    </div>
  );
}
