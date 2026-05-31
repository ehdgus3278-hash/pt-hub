import { NextResponse } from 'next/server';
import { submitEvent } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ ok: false, error: '행사명이 필요합니다.' }, { status: 400 });
    }
    if (!body.org_name?.trim()) {
      return NextResponse.json({ ok: false, error: '주최 기관명이 필요합니다.' }, { status: 400 });
    }
    if (!body.start_date || !body.end_date) {
      return NextResponse.json({ ok: false, error: '일정을 입력해 주세요.' }, { status: 400 });
    }
    if (body.end_date < body.start_date) {
      return NextResponse.json({ ok: false, error: '종료일이 시작일보다 앞설 수 없습니다.' }, { status: 400 });
    }
    if (!body.url?.trim()) {
      return NextResponse.json({ ok: false, error: '학회 공지글 URL이 필요합니다.' }, { status: 400 });
    }

    // 길이 제한
    if (body.note && body.note.length > 1000) {
      return NextResponse.json({ ok: false, error: '메모는 1000자 이내로 입력해 주세요.' }, { status: 400 });
    }
    if (body.contact && body.contact.length > 200) {
      return NextResponse.json({ ok: false, error: '이메일이 너무 깁니다.' }, { status: 400 });
    }

    const result = await submitEvent({
      title: body.title.trim(),
      org_name: body.org_name.trim(),
      start_date: body.start_date,
      end_date: body.end_date,
      location: body.location?.trim() || '',
      url: body.url.trim(),
      contact: body.contact?.trim(),
      note: body.note?.trim(),
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
