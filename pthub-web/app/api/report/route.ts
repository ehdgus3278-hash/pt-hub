import { NextResponse } from 'next/server';
import { submitReport } from '@/lib/supabase';
import type { ReportInput } from '@/lib/types';

const VALID_REASONS = ['cancelled', 'wrong_date', 'broken_link', 'other'] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<ReportInput>;

    if (typeof body.event_id !== 'number') {
      return NextResponse.json({ ok: false, error: 'event_id 가 필요합니다.' }, { status: 400 });
    }
    if (!body.reason || !VALID_REASONS.includes(body.reason as any)) {
      return NextResponse.json({ ok: false, error: 'reason 이 잘못됐습니다.' }, { status: 400 });
    }

    // 길이 검증
    if (body.detail && body.detail.length > 2000) {
      return NextResponse.json({ ok: false, error: '상세 내용은 2000자 이내로 작성해 주세요.' }, { status: 400 });
    }
    if (body.reporter_email && body.reporter_email.length > 200) {
      return NextResponse.json({ ok: false, error: '이메일이 너무 깁니다.' }, { status: 400 });
    }

    const result = await submitReport({
      event_id: body.event_id,
      reason: body.reason as ReportInput['reason'],
      detail: body.detail,
      reporter_email: body.reporter_email,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}
