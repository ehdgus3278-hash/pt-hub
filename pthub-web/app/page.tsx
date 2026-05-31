import { getOrganizations, getEvents } from '@/lib/supabase';
import CalendarApp from '@/components/CalendarApp';

export const revalidate = 600; // 10분마다 정적 재생성

export default async function Home() {
  // SSR: 초기 데이터 미리 로드 (SEO + 빠른 첫 페인트)
  const [organizations, events] = await Promise.all([
    getOrganizations(),
    getEvents(),
  ]);

  return <CalendarApp initialOrganizations={organizations} initialEvents={events} />;
}
