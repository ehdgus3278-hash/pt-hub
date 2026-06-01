import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'PT-Hub · 국내 물리치료 학회·교육 통합 캘린더',
  description: '국내 물리치료 학회·보수교육·세미나·워크숍 일정을 한 곳에서. 검증된 정보로.',
  metadataBase: new URL('https://pt-hub-xi.vercel.app'),
  openGraph: {
    title: 'PT-Hub',
    description: '국내 물리치료 학회 일정 통합 캘린더',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
