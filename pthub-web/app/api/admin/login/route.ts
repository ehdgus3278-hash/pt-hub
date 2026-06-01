import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/admin-auth';

// 어드민 로그인: 토큰을 본문(POST)으로 받아 검증 후 HttpOnly 쿠키 발급.
// → 토큰이 URL(쿼리스트링)·브라우저 기록·서버 액세스 로그·Referer 에 남지 않음.
//   쿠키는 HttpOnly 라 JS(클라이언트 번들)에서도 읽을 수 없음.

export async function POST(request: Request) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: 'ADMIN_TOKEN 이 설정되지 않았습니다.' }, { status: 500 });
  }

  let provided = '';
  try {
    const body = await request.json();
    provided = String(body?.token ?? '');
  } catch {
    return NextResponse.json({ ok: false, error: '잘못된 요청입니다.' }, { status: 400 });
  }

  if (provided.length === 0 || provided !== token) {
    return NextResponse.json({ ok: false, error: '토큰이 올바르지 않습니다.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30일
  });
  return res;
}

// 로그아웃
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
