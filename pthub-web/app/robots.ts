import type { MetadataRoute } from 'next';

const BASE = 'https://pt-hub-xi.vercel.app';

// /admin, /api 는 색인에서 제외 (방문자 통계 페이지 비공개 유지)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/'],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
