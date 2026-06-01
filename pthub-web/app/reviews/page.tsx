import type { Metadata } from 'next';
import Link from 'next/link';
import { getOrganizations, getOrgReviewStats } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store'; // Supabase 쿼리를 Next Data Cache 에 캐싱하지 않음 (최신 학회/후기 반영)

export const metadata: Metadata = {
  title: '교육 후기 게시판 · PT-Hub',
  description: '국내 물리치료 학회별 교육 후기. 강사·실습·난이도 등 실제 수강생의 솔직한 후기를 확인하세요.',
  alternates: { canonical: '/reviews' },
};

function Stars({ avg }: { avg: number | null }) {
  if (avg == null) return <span className="text-[12px] text-ink-mute">후기 없음</span>;
  return (
    <span className="inline-flex items-center gap-1 text-[13px]">
      <span className="text-gold">{'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))}</span>
      <span className="font-bold tabular-nums">{avg.toFixed(1)}</span>
    </span>
  );
}

export default async function ReviewsHome() {
  const [orgs, stats] = await Promise.all([
    getOrganizations(),
    getOrgReviewStats(),
  ]);

  return (
    <main className="min-h-screen bg-bg text-ink">
      <div className="max-w-[900px] mx-auto px-6 py-10 max-md:px-4 max-md:py-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-accent mb-6">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          캘린더로 돌아가기
        </Link>

        <h1 className="serif font-black text-3xl tracking-tight mb-2 max-md:text-2xl">교육 후기 게시판</h1>
        <p className="text-[14px] text-ink-soft mb-8 max-md:text-[13px]">
          학회를 선택해 교육 후기를 보거나 직접 남겨보세요.
        </p>

        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          {orgs.map(o => {
            const s = stats[o.id] || { count: 0, avg: null };
            return (
              <Link
                key={o.id}
                href={`/reviews/${o.id}`}
                className="bg-bg-card border border-line rounded-xl p-4 hover:border-ink-soft hover:shadow-soft transition-all flex items-center gap-3 group"
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: o.color }} />
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-[14.5px] text-ink truncate group-hover:text-accent">{o.name}</span>
                  <span className="block text-[12px] text-ink-mute mt-0.5">후기 {s.count}개</span>
                </span>
                <Stars avg={s.avg} />
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
