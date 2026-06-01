import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

// 일자별로 회전하는 솔트 → 같은 방문자라도 날짜가 바뀌면 해시가 달라짐.
// 원본 IP 는 어디에도 저장하지 않음 (개인정보 보호).
function visitorHash(ip: string, ua: string): string {
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const secret = process.env.TRACK_SALT || 'pthub';
  return createHash('sha256').update(`${day}|${ip}|${ua}|${secret}`).digest('hex').slice(0, 32);
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const path = typeof body.path === 'string' ? body.path.slice(0, 300) : '/';

    const ua = (req.headers.get('user-agent') || '').slice(0, 400);
    const referrer = (req.headers.get('referer') || '').slice(0, 400);
    const visitor = visitorHash(clientIp(req), ua);

    // anon 키 + RLS: INSERT 만 허용됨
    await supabase.from('page_views').insert({ path, referrer, ua, visitor });

    return NextResponse.json({ ok: true });
  } catch {
    // 트래킹 실패가 사용자 경험을 막지 않도록 항상 200
    return NextResponse.json({ ok: false });
  }
}
