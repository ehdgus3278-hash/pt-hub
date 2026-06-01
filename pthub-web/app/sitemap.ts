import type { MetadataRoute } from 'next';
import { getAllEventIds, getOrganizations } from '@/lib/supabase';

const BASE = 'https://pt-hub-xi.vercel.app';

export const revalidate = 3600; // 1시간마다 갱신

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [ids, orgs] = await Promise.all([getAllEventIds(), getOrganizations()]);

  const eventUrls: MetadataRoute.Sitemap = ids.map(id => ({
    url: `${BASE}/event/${id}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const reviewUrls: MetadataRoute.Sitemap = orgs.map(o => ({
    url: `${BASE}/reviews/${o.id}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [
    { url: BASE, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/reviews`, changeFrequency: 'weekly', priority: 0.6 },
    ...reviewUrls,
    ...eventUrls,
  ];
}
