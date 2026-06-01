// 이메일 알림 (Resend REST API).
// RESEND_API_KEY 가 없으면 조용히 스킵 → DB 저장은 그대로 동작(이메일은 부가기능).
//
// 환경변수:
//   RESEND_API_KEY  (필수, resend.com → API Keys)
//   MAIL_TO         (선택, 기본 ehdgus3278@gmail.com)
//   MAIL_FROM       (선택, 기본 'PT-Hub <onboarding@resend.dev>')
//                   ※ 커스텀 도메인 미인증 시 onboarding@resend.dev 로만 발송 가능하며,
//                     수신은 Resend 가입 이메일(=MAIL_TO)로만 됩니다.

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export function esc(s: string | null | undefined): string {
  return String(s ?? '').replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string),
  );
}

export async function sendNotificationEmail(opts: {
  subject: string;
  html: string;
  replyTo?: string | null;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return; // 미설정 시 스킵

  const to = process.env.MAIL_TO || 'ehdgus3278@gmail.com';
  const from = process.env.MAIL_FROM || 'PT-Hub <onboarding@resend.dev>';

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('[email] 발송 실패', res.status, await res.text().catch(() => ''));
    }
  } catch (e) {
    console.error('[email] 발송 오류', e);
  }
}
