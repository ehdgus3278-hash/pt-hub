import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getOrganizationById, getReviewsByOrg } from '@/lib/supabase';
import OrgReviewBoard from '@/components/OrgReviewBoard';

// 후기는 작성 즉시 반영돼야 하므로 캐시하지 않고 매 요청 렌더링
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { orgId: string } }): Promise<Metadata> {
  const org = await getOrganizationById(params.orgId);
  if (!org) return { title: '학회를 찾을 수 없습니다 · PT-Hub' };
  return {
    title: `${org.name} 교육 후기 · PT-Hub`,
    description: `${org.name}의 교육 후기. 실제 수강생들의 강사·실습·난이도 평가를 확인하세요.`,
    alternates: { canonical: `/reviews/${org.id}` },
    openGraph: {
      title: `${org.name} 교육 후기`,
      description: `${org.name}의 교육 후기 — PT-Hub`,
      type: 'website',
      locale: 'ko_KR',
    },
  };
}

export default async function OrgReviewPage({ params }: { params: { orgId: string } }) {
  const org = await getOrganizationById(params.orgId);
  if (!org) notFound();

  const reviews = await getReviewsByOrg(org.id);

  return (
    <main className="min-h-screen bg-bg text-ink">
      <div className="max-w-[760px] mx-auto px-6 py-10 max-md:px-4 max-md:py-6">
        <Link href="/reviews" className="inline-flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-accent mb-6">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          후기 게시판
        </Link>

        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: org.color }} />
          <h1 className="serif font-black text-[28px] tracking-tight max-md:text-2xl">{org.name}</h1>
        </div>
        {org.category && <p className="text-[13px] text-ink-mute mb-8">{org.category}</p>}

        <OrgReviewBoard orgId={org.id} initialReviews={reviews} />
      </div>
    </main>
  );
}
