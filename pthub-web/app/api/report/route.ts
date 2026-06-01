import { NextResponse } from 'next/server';
import { submitReport, getEventById } from '@/lib/supabase';
import { sendNotificationEmail, esc } from '@/lib/email';
import type { ReportInput } from '@/lib/types';

const VALID_REASONS = ['cancelled', 'wrong_date', 'broken_link', 'other'] as const;
const REASON_LABEL: Record<string, string> = {
  cancelled: '취소됨', wrong_date: '날짜 오류', broken_link: '링크 깨짐', other: '기타',
};
const SITE = 'https://pt-hub-xi.vercel.app';

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

    // 이메일 알림 (실패해도 신고 접수는 성공 처리)
    const ev = await getEventById(body.event_id).catch(() => null);
    await sendNotificationEmail({
      subject: `[PT-Hub] 일정 오류 신고 — ${ev?.title ?? `#${body.event_id}`}`,
      replyTo: body.reporter_email || null,
      html: `<h3>일정 오류 신고</h3>
        <p>
          <b>일정:</b> ${esc(ev?.title) || `#${body.event_id}`} (#${body.event_id})<br/>
          <b>학회:</b> ${esc(ev?.org_name) || '-'}<br/>
          <b>사유:</b> ${REASON_LABEL[body.reason as string] ?? esc(body.reason)}<br/>
          <b>상세:</b> ${esc(body.detail) || '-'}<br/>
          <b>신고자 연락:</b> ${esc(body.reporter_email) || '미입력'}
        </p>
        <p><a href="${SITE}/event/${body.event_id}">→ 일정 페이지 보기</a></p>`,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}
