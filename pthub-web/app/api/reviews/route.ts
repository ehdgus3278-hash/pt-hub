import { NextResponse } from 'next/server';
import { submitReview } from '@/lib/supabase';

// 간단한 비속어 필터 (대표적인 단어만 — 완벽하진 않으나 1차 방어)
const BANNED = ['시발', '씨발', '병신', '개새', '좆', '지랄', 'fuck', 'shit'];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const orgId = String(body.org_id || '').trim();
    if (!orgId) {
      return NextResponse.json({ ok: false, error: '학회를 선택해 주세요.' }, { status: 400 });
    }
    const rating = Number(body.rating);
    if (!(rating >= 1 && rating <= 5)) {
      return NextResponse.json({ ok: false, error: '별점을 선택해 주세요.' }, { status: 400 });
    }
    const text = String(body.body || '').trim();
    if (text.length < 1) {
      return NextResponse.json({ ok: false, error: '후기 내용을 입력해 주세요.' }, { status: 400 });
    }
    if (text.length > 2000) {
      return NextResponse.json({ ok: false, error: '후기는 2000자 이내로 입력해 주세요.' }, { status: 400 });
    }
    const nickname = String(body.nickname || '익명').trim().slice(0, 30);

    const lower = (text + ' ' + nickname).toLowerCase();
    if (BANNED.some(w => lower.includes(w))) {
      return NextResponse.json({ ok: false, error: '부적절한 표현이 포함되어 있습니다.' }, { status: 400 });
    }

    const result = await submitReview({
      event_id: body.event_id ? Number(body.event_id) : null,
      org_id: orgId,
      nickname,
      rating,
      body: text,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : '알 수 없는 오류' },
      { status: 500 },
    );
  }
}
