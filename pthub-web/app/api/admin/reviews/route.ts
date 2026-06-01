import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminSetReviewHidden, adminUpdateReview, adminDeleteReview } from '@/lib/supabase-admin';
import { ADMIN_COOKIE } from '@/lib/admin-auth';

// 어드민 후기 관리 (숨김/수정/삭제). HttpOnly 쿠키(pthub_admin)로 인증.
export async function POST(request: Request) {
  const token = process.env.ADMIN_TOKEN;
  try {
    const session = cookies().get(ADMIN_COOKIE)?.value;
    if (!token || session !== token) {
      return NextResponse.json({ ok: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();

    const id = Number(body.id);
    if (!id) return NextResponse.json({ ok: false, error: '잘못된 요청입니다.' }, { status: 400 });

    let ok = false;
    switch (body.action) {
      case 'hide':   ok = await adminSetReviewHidden(id, true); break;
      case 'unhide': ok = await adminSetReviewHidden(id, false); break;
      case 'delete': ok = await adminDeleteReview(id); break;
      case 'edit':   ok = await adminUpdateReview(id, String(body.body || '').slice(0, 2000)); break;
      default:
        return NextResponse.json({ ok: false, error: '알 수 없는 작업입니다.' }, { status: 400 });
    }

    if (!ok) return NextResponse.json({ ok: false, error: '처리에 실패했습니다.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : '알 수 없는 오류' },
      { status: 500 },
    );
  }
}
