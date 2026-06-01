import { createClient } from '@supabase/supabase-js';

// 서버 전용 모듈. service_role 키는 RLS 를 우회하므로 절대 클라이언트에 노출 금지.
// 이 파일은 서버 컴포넌트(app/admin/page.tsx)에서만 import 되며,
// SUPABASE_SERVICE_KEY 는 NEXT_PUBLIC_ 접두사가 없어 클라이언트 번들에 포함되지 않음.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_KEY!;

export function getAdminClient() {
  if (!URL || !SERVICE) return null;
  return createClient(URL, SERVICE, {
    auth: { persistSession: false },
  });
}

export interface AdminReview {
  id: number;
  event_id: number | null;
  org_id: string | null;
  nickname: string;
  rating: number;
  body: string;
  hidden: boolean;
  created_at: string;
}

// 어드민: 최근 후기 목록 (숨김 포함)
export async function adminListReviews(limit = 200): Promise<AdminReview[]> {
  const admin = getAdminClient();
  if (!admin) return [];
  const { data, error } = await admin
    .from('event_reviews')
    .select('id, event_id, org_id, nickname, rating, body, hidden, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as AdminReview[];
}

// 어드민: 후기 숨김/표시 토글
export async function adminSetReviewHidden(id: number, hidden: boolean): Promise<boolean> {
  const admin = getAdminClient();
  if (!admin) return false;
  const { error } = await admin.from('event_reviews').update({ hidden }).eq('id', id);
  return !error;
}

// 어드민: 후기 본문 수정
export async function adminUpdateReview(id: number, body: string): Promise<boolean> {
  const admin = getAdminClient();
  if (!admin) return false;
  const { error } = await admin.from('event_reviews').update({ body }).eq('id', id);
  return !error;
}

// 어드민: 후기 완전 삭제
export async function adminDeleteReview(id: number): Promise<boolean> {
  const admin = getAdminClient();
  if (!admin) return false;
  const { error } = await admin.from('event_reviews').delete().eq('id', id);
  return !error;
}

export interface VisitStats {
  total: number;
  today: number;
  last7: number;
  last30: number;
  uniqueToday: number;
  unique7: number;
  daily: { date: string; views: number; uniques: number }[];
  topPaths: { path: string; views: number }[];
}

export async function getVisitStats(): Promise<VisitStats | null> {
  const admin = getAdminClient();
  if (!admin) return null;

  // 최근 30일치만 조회 (가벼운 집계는 앱에서 수행)
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString();

  const { data, error } = await admin
    .from('page_views')
    .select('path, visitor, created_at')
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false })
    .limit(100000);

  if (error || !data) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const d7 = new Date(); d7.setDate(d7.getDate() - 7);
  const d30 = new Date(); d30.setDate(d30.getDate() - 30);

  let today = 0, last7 = 0, last30 = 0;
  const uniqToday = new Set<string>();
  const uniq7 = new Set<string>();
  const dailyMap = new Map<string, { views: number; u: Set<string> }>();
  const pathMap = new Map<string, number>();

  for (const row of data) {
    const created = new Date(row.created_at as string);
    const dayKey = (row.created_at as string).slice(0, 10);
    const v = (row.visitor as string) || '?';

    last30++;
    if (created >= d30) {
      const e = dailyMap.get(dayKey) || { views: 0, u: new Set<string>() };
      e.views++; e.u.add(v);
      dailyMap.set(dayKey, e);
    }
    if (created >= d7) { last7++; uniq7.add(v); }
    if (dayKey === todayStr) { today++; uniqToday.add(v); }

    const p = (row.path as string) || '/';
    pathMap.set(p, (pathMap.get(p) || 0) + 1);
  }

  const daily = Array.from(dailyMap.entries())
    .map(([date, e]) => ({ date, views: e.views, uniques: e.u.size }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const topPaths = Array.from(pathMap.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return {
    total: data.length,
    today,
    last7,
    last30,
    uniqueToday: uniqToday.size,
    unique7: uniq7.size,
    daily,
    topPaths,
  };
}
