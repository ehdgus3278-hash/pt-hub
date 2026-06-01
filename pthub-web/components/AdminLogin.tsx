'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 어드민 로그인 폼. 토큰을 POST 로 전송 → 서버가 HttpOnly 쿠키 발급.
// 토큰은 URL 에 절대 노출되지 않음.
export default function AdminLogin() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || '로그인에 실패했습니다.');
        return;
      }
      router.refresh(); // 쿠키 발급됨 → 서버 컴포넌트 재평가
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg text-ink flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-xs">
        <h1 className="serif text-xl font-bold mb-1 text-center">관리자</h1>
        <p className="text-ink-mute text-xs text-center mb-5">접근 토큰을 입력하세요.</p>
        <input
          type="password"
          value={token}
          onChange={e => setToken(e.target.value)}
          autoFocus
          autoComplete="off"
          placeholder="토큰"
          className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-bg-card focus:outline-none focus:border-ink-soft mb-2"
        />
        {error && <p className="text-rose text-xs mb-2">{error}</p>}
        <button
          type="submit"
          disabled={busy || token.length === 0}
          className="w-full py-2.5 rounded-full font-semibold text-sm text-white disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {busy ? '확인 중…' : '입장'}
        </button>
      </form>
    </main>
  );
}
