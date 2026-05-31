import { createClient } from '@supabase/supabase-js';
import type { PthubEvent, Organization, ReportInput } from './types';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!URL || !ANON) {
  console.warn('Supabase 환경변수가 설정되지 않았습니다. .env.local 또는 Vercel 환경변수 확인.');
}

// 공개 클라이언트 (RLS 적용, 읽기·신고 INSERT 만 가능)
export const supabase = createClient(URL || '', ANON || '', {
  auth: { persistSession: false },
});

// ============================================================
// 데이터 조회 함수
// ============================================================
export async function getOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('getOrganizations:', error);
    return [];
  }
  return data || [];
}

export async function getEvents(): Promise<PthubEvent[]> {
  // end_date >= today: 종료되지 않은 행사만 (진행 중 + 예정)
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('events_with_org')
    .select('*')
    .gte('end_date', today)
    .order('start_date', { ascending: true });
  if (error) {
    console.error('getEvents:', error);
    return [];
  }
  return data || [];
}

// 월별 일정만 가져오는 효율 쿼리 (옵션)
export async function getEventsInMonth(year: number, month: number): Promise<PthubEvent[]> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const next = new Date(year, month, 1); // month는 1-based, JS는 0-based → 자동 +1
  const end = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-01`;

  const { data, error } = await supabase
    .from('events_with_org')
    .select('*')
    .lt('start_date', end)
    .gte('end_date', start)
    .order('start_date', { ascending: true });
  if (error) {
    console.error('getEventsInMonth:', error);
    return [];
  }
  return data || [];
}

// 일정 제보 (event_reports 테이블에 type='submission'으로 저장)
export async function submitEvent(input: {
  title: string;
  org_name: string;
  start_date: string;
  end_date: string;
  location: string;
  url: string;
  contact?: string;
  note?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const detail = JSON.stringify({ type: 'submission', ...input });
  const { error } = await supabase.from('event_reports').insert({
    event_id: null,
    reason: 'other',
    detail,
    reporter_email: input.contact || null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// 신고 등록
export async function submitReport(input: ReportInput): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from('event_reports').insert({
    event_id: input.event_id,
    reason: input.reason,
    detail: input.detail || null,
    reporter_email: input.reporter_email || null,
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
