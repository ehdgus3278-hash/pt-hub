'use client';

import { useEffect } from 'react';

// 페이지 진입 시 1회 방문 기록 전송 (실패해도 무시).
// 관리자(/admin) 경로는 집계에서 제외.
export default function VisitTracker() {
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return;
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
