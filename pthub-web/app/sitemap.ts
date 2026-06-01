import type { MetadataRoute } from 'next';
import { getAllEventIds } from '@/lib/supabase';

const BASE = 'https://pt-hub-xi.vercel.app';

export const revalidate = 3600; // 1시간마다 갱신

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ids = await getAllEventIds();

  const eventUrls: MetadataRoute.Sitemap = ids.map(id => ({
    url: `${BASE}/event/${id}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    { url: BASE, changeFrequency: 'daily', priority: 1 },
    ...eventUrls,
  ];
}
