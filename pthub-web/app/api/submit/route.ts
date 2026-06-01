import { NextResponse } from 'next/server';
import { submitEvent } from '@/lib/supabase';
import { sendNotificationEmail, esc } from '@/lib/email';

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

    // 이메일 알림 (실패해도 제보 접수는 성공 처리)
    await sendNotificationEmail({
      subject: `[PT-Hub] 새 일정 제보 — ${body.title.trim()}`,
      replyTo: body.contact?.trim() || null,
      html: `<h3>새 일정 제보</h3>
        <p>
          <b>행사명:</b> ${esc(body.title)}<br/>
          <b>주최 기관:</b> ${esc(body.org_name)}<br/>
          <b>기간:</b> ${esc(body.start_date)} ~ ${esc(body.end_date)}<br/>
          <b>장소:</b> ${esc(body.location) || '-'}<br/>
          <b>공지 URL:</b> <a href="${esc(body.url)}">${esc(body.url)}</a><br/>
          <b>메모:</b> ${esc(body.note) || '-'}<br/>
          <b>제보자 연락:</b> ${esc(body.contact) || '미입력'}
        </p>`,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : '알 수 없는 오류' },
      { status: 500 },
    );
  }
}
