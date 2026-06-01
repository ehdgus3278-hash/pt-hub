import { cookies } from 'next/headers';
import { getVisitStats, adminListReviews } from '@/lib/supabase-admin';
import AdminReviews from '@/components/AdminReviews';
import AdminLogin from '@/components/AdminLogin';
import { ADMIN_COOKIE } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic'; // 항상 최신 집계
export const revalidate = 0;

// 나만 보는 방문자 통계 페이지.
// 인증: HttpOnly 쿠키(pthub_admin) — 토큰이 URL 에 노출되지 않음.
//       쿠키 미보유/불일치 시 로그인 폼을 노출.
export default async function AdminPage() {
  const token = process.env.ADMIN_TOKEN;

  // 토큰 미설정 시 설정 안내
  if (!token) {
    return (
      <Shell>
        <h1 className="text-xl font-bold mb-2">설정 필요</h1>
        <p className="text-ink-soft text-sm leading-relaxed">
          환경변수 <code className="bg-bg px-1.5 py-0.5 rounded">ADMIN_TOKEN</code> 과{' '}
          <code className="bg-bg px-1.5 py-0.5 rounded">SUPABASE_SERVICE_KEY</code> 를 Vercel에 등록한 뒤
          <br />
          <code className="bg-bg px-1.5 py-0.5 rounded">/admin</code> 에서 토큰으로 로그인하세요.
        </p>
      </Shell>
    );
  }

  // 쿠키 인증 — 불일치 시 로그인 폼
  const session = cookies().get(ADMIN_COOKIE)?.value;
  if (session !== token) {
    return <AdminLogin />;
  }

  const [stats, reviews] = await Promise.all([
    getVisitStats(),
    adminListReviews(),
  ]);

  if (!stats) {
    return (
      <Shell>
        <h1 className="text-xl font-bold mb-2">집계를 불러오지 못했습니다</h1>
        <p className="text-ink-soft text-sm">
          <code className="bg-bg px-1.5 py-0.5 rounded">SUPABASE_SERVICE_KEY</code> 가 올바른지,
          DB에 <code className="bg-bg px-1.5 py-0.5 rounded">page_views</code> 테이블(04_page_views.sql)이 있는지 확인하세요.
        </p>
      </Shell>
    );
  }

  const maxDaily = Math.max(1, ...stats.daily.map(d => d.views));

  return (
    <Shell>
      <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
        <h1 className="serif text-2xl font-black">방문자 통계</h1>
        <span className="text-xs text-ink-mute">최근 30일 · 비공개</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Stat label="오늘 방문" value={stats.today} sub={`순방문 ${stats.uniqueToday}`} />
        <Stat label="최근 7일" value={stats.last7} sub={`순방문 ${stats.unique7}`} />
        <Stat label="최근 30일" value={stats.last30} />
        <Stat label="누적(30일내)" value={stats.total} />
      </div>

      <h2 className="text-sm font-bold text-ink-mute uppercase tracking-wider mb-3">일별 방문</h2>
      <div className="bg-bg-card border border-line rounded-xl p-4 mb-8">
        {stats.daily.length === 0 ? (
          <p className="text-ink-mute text-sm py-6 text-center">아직 방문 기록이 없습니다.</p>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {stats.daily.map(d => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1 group">
                <div className="text-[9px] text-ink-mute opacity-0 group-hover:opacity-100 tabular-nums">
                  {d.views}
                </div>
                <div
                  className="w-full rounded-t"
                  style={{ height: `${(d.views / maxDaily) * 100}%`, background: 'var(--accent)', minHeight: '2px' }}
                  title={`${d.date}: ${d.views}회 / 순방문 ${d.uniques}`}
                />
                <div className="text-[8px] text-ink-mute whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
                  {d.date.slice(5)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 className="text-sm font-bold text-ink-mute uppercase tracking-wider mb-3">인기 경로</h2>
      <div className="bg-bg-card border border-line rounded-xl overflow-hidden mb-10">
        {stats.topPaths.map((p, i) => (
          <div key={p.path} className={`flex justify-between px-4 py-2.5 text-sm ${i > 0 ? 'border-t border-line' : ''}`}>
            <span className="font-mono text-ink-soft truncate">{p.path}</span>
            <span className="tabular-nums font-semibold">{p.views}</span>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-bold text-ink-mute uppercase tracking-wider mb-3">
        교육 후기 관리 <span className="text-ink-mute font-normal normal-case">({reviews.length})</span>
      </h2>
      <AdminReviews initial={reviews} />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <div className="max-w-[900px] mx-auto px-6 py-12">{children}</div>
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-bg-card border border-line rounded-xl p-4">
      <div className="text-[11px] text-ink-mute uppercase tracking-wider font-semibold mb-1">{label}</div>
      <div className="serif text-3xl font-black tabular-nums leading-none">{value.toLocaleString()}</div>
      {sub && <div className="text-[11px] text-ink-mute mt-1.5">{sub}</div>}
    </div>
  );
}
