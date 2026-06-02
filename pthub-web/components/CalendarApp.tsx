'use client';

import { useState, useMemo } from 'react';
import type { Organization, PthubEvent } from '@/lib/types';
import Header from './Header';
import Hero from './Hero';
import SearchBar from './SearchBar';
import FilterSidebar from './FilterSidebar';
import Calendar from './Calendar';
import EventList from './EventList';
import EventModal from './EventModal';
import MonthNav from './MonthNav';
import InfoModal, { type InfoKey } from './InfoModal';

interface Props {
  initialOrganizations: Organization[];
  initialEvents: PthubEvent[];
}

export default function CalendarApp({ initialOrganizations, initialEvents }: Props) {
  const orgs = initialOrganizations;
  const events = initialEvents;

  // 상태
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [orgFilter, setOrgFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [month, setMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedEvent, setSelectedEvent] = useState<PthubEvent | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 필터 적용
  const filtered = useMemo(() => {
    return events.filter(e => {
      if (orgFilter !== 'all' && e.org_id !== orgFilter) return false;
      if (regionFilter !== 'all' && e.region !== regionFilter) return false;
      if (onlineOnly && !e.is_online) return false;
      if (verifiedOnly && !e.verified) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${e.title} ${e.description} ${e.org_name} ${e.location}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, orgFilter, regionFilter, onlineOnly, verifiedOnly, query]);

  // 활성 필터 카운트
  const activeFilterCount =
    (orgFilter !== 'all' ? 1 : 0) +
    (regionFilter !== 'all' ? 1 : 0) +
    (onlineOnly ? 1 : 0) +
    (verifiedOnly ? 1 : 0);

  const changeMonth = (delta: number) => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  };

  return (
    <>
      <Header />
      <Hero
        totalEvents={events.length}
        totalOrgs={orgs.length}
        lastVerified={events.length > 0 ? events[0].last_checked : ''}
      />
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        orgFilter={orgFilter}
        onOrgFilterChange={setOrgFilter}
        organizations={orgs}
        view={view}
        onViewChange={setView}
      />

      <main className="max-w-[1400px] mx-auto mt-6 mb-20 px-8 grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] gap-8 max-md:px-4 max-md:gap-3 max-md:mb-10">
        {/* 모바일 필터 토글 */}
        <button
          className="md:hidden flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold text-sm cursor-pointer"
          style={{ borderColor: 'var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}
          onClick={() => setSidebarOpen(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
          학회·지역·옵션 필터
          {activeFilterCount > 0 && (
            <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-full font-bold ml-1">
              {activeFilterCount}
            </span>
          )}
        </button>

        <FilterSidebar
          organizations={orgs}
          events={events}
          orgFilter={orgFilter}
          onOrgFilterChange={setOrgFilter}
          regionFilter={regionFilter}
          onRegionFilterChange={setRegionFilter}
          onlineOnly={onlineOnly}
          onOnlineChange={setOnlineOnly}
          verifiedOnly={verifiedOnly}
          onVerifiedChange={setVerifiedOnly}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <section>
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-line gap-4 flex-wrap max-md:gap-2 max-md:mb-3 max-md:pb-2.5">
            <div>
              <span className="serif font-bold text-[22px] max-md:text-[17px] tracking-tight">
                예정된 일정
              </span>
              <small className="ml-3 text-ink-mute text-[13px] max-md:text-[11px] max-md:ml-1.5">
                {month.getFullYear()}년 {month.getMonth() + 1}월 {countInMonth(filtered, month)}건 · 전체 {filtered.length}건
              </small>
            </div>
            <MonthNav month={month} onChange={changeMonth} />
          </div>

          {view === 'calendar' ? (
            <Calendar
              month={month}
              events={filtered}
              onEventClick={setSelectedEvent}
            />
          ) : (
            <EventList
              month={month}
              events={filtered}
              onEventClick={setSelectedEvent}
            />
          )}
        </section>
      </main>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      <Footer lastVerified={events.length > 0 ? events[0].last_checked : ''} />
    </>
  );
}

function countInMonth(events: PthubEvent[], month: Date): number {
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);
  return events.filter(e => {
    const s = new Date(e.start_date);
    const en = new Date(e.end_date);
    en.setHours(23, 59, 59, 999);
    return s <= monthEnd && en >= monthStart;
  }).length;
}

function Footer({ lastVerified }: { lastVerified: string }) {
  const [info, setInfo] = useState<InfoKey | null>(null);

  return (
    <footer>
      <div className="bg-ink text-bg py-10 px-8 mt-16 max-md:px-4 max-md:py-7 max-md:mt-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-[11px] tracking-[.2em] uppercase text-gold mb-2.5">
            학회·교육기관 후원사 모집
          </div>
          <div className="serif font-bold text-2xl leading-tight max-md:text-xl whitespace-nowrap max-md:whitespace-normal">
            우리 학회 일정을 더 많은 임상가에게 알리고 싶다면.
          </div>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto py-10 px-8 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-9 max-md:px-4 max-md:py-7 max-md:gap-6">
        <div>
          <div className="serif font-black text-2xl">PT<span style={{ color: 'var(--accent)' }}>·</span>Hub</div>
          <p className="text-[13px] text-ink-mute mt-3 leading-relaxed max-w-[320px]">
            모든 일정은 각 학회 공식 홈페이지에서 직접 확인하여 검증합니다. 오류 발견 시 신고해 주시면 빠르게 정정합니다.
          </p>
        </div>
        <div>
          <h4 className="text-[11px] tracking-widest uppercase text-ink-mute font-bold mb-3">안내</h4>
          <button onClick={() => setInfo('about')} className="block text-[13px] text-ink-soft py-1 cursor-pointer hover:text-accent text-left">
            서비스 소개
          </button>
          <button onClick={() => setInfo('policy')} className="block text-[13px] text-ink-soft py-1 cursor-pointer hover:text-accent text-left">
            데이터 검증 정책
          </button>
          <button onClick={() => setInfo('terms')} className="block text-[13px] text-ink-soft py-1 cursor-pointer hover:text-accent text-left">
            이용약관
          </button>
          <a href="mailto:ehdgus3278@naver.com" className="block text-[13px] text-ink-soft py-1 cursor-pointer hover:text-accent">
            문의
          </a>
        </div>
      </div>
      <div className="max-w-[1400px] mx-auto border-t border-line py-4 px-8 flex justify-between text-xs text-ink-mute flex-wrap gap-2 max-md:px-4">
        <span>© 2026 PT-Hub. 비영리 정보 큐레이션 서비스.</span>
        <span>마지막 데이터 검증: {lastVerified}</span>
      </div>

      {info && <InfoModal page={info} onClose={() => setInfo(null)} />}
    </footer>
  );
}
