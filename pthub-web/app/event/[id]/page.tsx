import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getEventById, getAllEventIds, getReviews, getReviewStats } from '@/lib/supabase';
import { dateRange } from '@/lib/format';
import ReviewSection from '@/components/ReviewSection';

export const revalidate = 600; // 10분마다 재생성

const TYPE_LABEL: Record<string, string> = {
  conference: '학술대회', ce: '보수교육', seminar: '세미나', workshop: '워크숍',
};

// 빌드 시 알려진 일정 페이지를 정적 생성 (없는 ID는 요청 시 ISR 생성)
export async function generateStaticParams() {
  const ids = await getAllEventIds();
  return ids.map(id => ({ id: String(id) }));
}

// 검색 결과·SNS 공유 미리보기용 메타데이터
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const event = await getEventById(Number(params.id));
  if (!event) return { title: '일정을 찾을 수 없습니다 · PT-Hub' };

  const typeLabel = TYPE_LABEL[event.type] || event.type;
  const period = dateRange(event.edu_start || event.start_date, event.edu_end || event.end_date);
  const title = `${event.title} | ${event.org_name} · PT-Hub`;
  const description =
    `${event.org_name} ${typeLabel} · ${period}` +
    `${event.location ? ` · ${event.location}` : ''}` +
    `${event.credit > 0 ? ` · 보수교육 ${event.credit}점` : ''}` +
    `. 국내 물리치료 학회·교육 일정을 PT-Hub에서 확인하세요.`;

  return {
    title,
    description,
    alternates: { canonical: `/event/${event.id}` },
    openGraph: {
      title: `${event.title} | ${event.org_name}`,
      description,
      type: 'article',
      locale: 'ko_KR',
      url: `/event/${event.id}`,
    },
    twitter: {
      card: 'summary',
      title: `${event.title} | ${event.org_name}`,
      description,
    },
  };
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const eventId = Number(params.id);
  const event = await getEventById(eventId);
  if (!event) notFound();

  const [reviews, reviewStats] = await Promise.all([
    getReviews(eventId),
    getReviewStats(eventId),
  ]);

  const typeLabel = TYPE_LABEL[event.type] || event.type;
  const isClosed = event.status === '마감' || event.status === '교육 종료' || event.status === '취소됨';

  // 구조화 데이터(JSON-LD) — 검색엔진이 '이벤트'로 인식하도록
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.edu_start || event.start_date,
    endDate: event.edu_end || event.end_date,
    eventStatus: event.status === '취소됨'
      ? 'https://schema.org/EventCancelled'
      : 'https://schema.org/EventScheduled',
    eventAttendanceMode: event.is_online
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    location: event.is_online
      ? { '@type': 'VirtualLocation', url: event.url }
      : { '@type': 'Place', name: event.location || '미정', address: event.region || '대한민국' },
    organizer: { '@type': 'Organization', name: event.org_name, url: event.url },
    description: event.description || `${event.org_name} ${typeLabel}`,
    url: event.url,
    ...(reviewStats.avg != null && reviewStats.count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: reviewStats.avg,
            reviewCount: reviewStats.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <main className="min-h-screen bg-bg text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-[760px] mx-auto px-6 py-8 max-md:px-4 max-md:py-5">
        {/* 상단: 홈으로 */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-accent mb-6">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          전체 일정 보기
        </Link>

        {/* 뱃지 */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          <span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider text-white"
                style={{ background: event.org_color }}>
            {typeLabel}
          </span>
          {event.status && (
            <span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded text-white" style={{ background: 'var(--gold)' }}>
              {event.status}
            </span>
          )}
          {event.is_online && (
            <span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}>
              온라인 가능
            </span>
          )}
        </div>

        <h1 className="serif font-bold text-[30px] leading-tight tracking-tight mb-1.5 max-md:text-[24px]">
          {event.title}
        </h1>
        <div className="text-[14px] text-ink-mute mb-6">{event.org_name}</div>

        <dl className="grid grid-cols-[100px_1fr] gap-y-3.5 gap-x-4 py-5 border-y border-line mb-6 text-sm max-md:grid-cols-[84px_1fr]">
          {event.apply_end && (
            <>
              <dt className="text-ink-mute font-medium uppercase tracking-wider text-xs">접수기간</dt>
              <dd className="text-ink font-semibold">{dateRange(event.apply_start, event.apply_end)}</dd>
            </>
          )}
          <dt className="text-ink-mute font-medium uppercase tracking-wider text-xs">교육기간</dt>
          <dd className="text-ink">
            {dateRange(event.edu_start || event.start_date, event.edu_end || event.end_date)}
            {event.start_time ? ` · ${event.start_time} 시작` : ''}
          </dd>
          <dt className="text-ink-mute font-medium uppercase tracking-wider text-xs">장소</dt>
          <dd className="text-ink">
            {event.location}{event.region && event.region !== '미정' ? ` (${event.region})` : ''}
          </dd>
          {event.fee && (
            <>
              <dt className="text-ink-mute font-medium uppercase tracking-wider text-xs">참가비</dt>
              <dd className="text-ink">{event.fee}</dd>
            </>
          )}
          {event.credit > 0 && (
            <>
              <dt className="text-ink-mute font-medium uppercase tracking-wider text-xs">보수교육</dt>
              <dd className="text-ink">평점 {event.credit}점 인정</dd>
            </>
          )}
        </dl>

        {event.description && (
          <p className="text-[14px] text-ink-soft leading-relaxed mb-6 whitespace-pre-line">{event.description}</p>
        )}

        <div className="bg-bg-card border border-line rounded-xl p-3.5 mb-5 text-[12.5px] text-ink-soft leading-relaxed">
          <strong className="text-ink">학회 공지글로 이동합니다.</strong> 정확한 일정·강사·신청방법·접수상태는 학회 공지글에서 직접 확인하세요.
        </div>

        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 py-3 px-6 rounded-full font-semibold text-sm transition-all"
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

        <ReviewSection
          eventId={event.id}
          orgId={event.org_id}
          initialReviews={reviews}
          initialAvg={reviewStats.avg}
        />
      </div>
    </main>
  );
}
