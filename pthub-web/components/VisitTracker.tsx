'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// 모든 페이지 진입·이동 시 방문 1회 기록 (실패해도 무시).
// 루트 layout 에 mount 되어 클라이언트 내비게이션(경로 변경)까지 추적.
// 관리자(/admin) 경로는 집계에서 제외.
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
