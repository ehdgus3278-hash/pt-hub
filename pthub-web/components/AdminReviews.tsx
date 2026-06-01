'use client';

import { useState } from 'react';
import type { AdminReview } from '@/lib/supabase-admin';

interface Props {
  initial: AdminReview[];
}

export default function AdminReviews({ initial }: Props) {
  const [reviews, setReviews] = useState<AdminReview[]>(initial);
  const [busy, setBusy] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const act = async (id: number, action: string, extra?: Record<string, unknown>) => {
    setBusy(id);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, ...extra }),
      });
      const data = await res.json();
      if (!data.ok) { alert(data.error || '실패'); return; }

      setReviews(prev => {
        if (action === 'delete') return prev.filter(r => r.id !== id);
        return prev.map(r => {
          if (r.id !== id) return r;
          if (action === 'hide') return { ...r, hidden: true };
          if (action === 'unhide') return { ...r, hidden: false };
          if (action === 'edit') return { ...r, body: String(extra?.body ?? r.body) };
          return r;
        });
      });
      if (action === 'edit') setEditing(null);
    } finally {
      setBusy(null);
    }
  };

  if (reviews.length === 0) {
    return <p className="text-ink-mute text-sm py-6 text-center">등록된 후기가 없습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map(r => (
        <div key={r.id} className={`border rounded-xl p-4 ${r.hidden ? 'border-rose/40 bg-rose/5' : 'border-line bg-bg-card'}`}>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="font-semibold">{r.nickname}</span>
              <span className="text-gold">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              <span className="text-ink-mute">· 학회: {r.org_id ?? '(없음)'}</span>
              <span className="text-ink-mute">· {r.created_at.slice(0, 10)}</span>
              {r.hidden && <span className="text-rose font-semibold">[숨김]</span>}
            </div>
            <div className="flex gap-1.5">
              {editing === r.id ? (
                <>
                  <button onClick={() => act(r.id, 'edit', { body: editText })} disabled={busy === r.id}
                          className="text-[12px] px-2.5 py-1 rounded-full text-white" style={{ background: 'var(--accent)' }}>저장</button>
                  <button onClick={() => setEditing(null)}
                          className="text-[12px] px-2.5 py-1 rounded-full border border-line">취소</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditing(r.id); setEditText(r.body); }}
                          className="text-[12px] px-2.5 py-1 rounded-full border border-line hover:border-ink">수정</button>
                  {r.hidden ? (
                    <button onClick={() => act(r.id, 'unhide')} disabled={busy === r.id}
                            className="text-[12px] px-2.5 py-1 rounded-full border border-line hover:border-ink">표시</button>
                  ) : (
                    <button onClick={() => act(r.id, 'hide')} disabled={busy === r.id}
                            className="text-[12px] px-2.5 py-1 rounded-full border border-line hover:border-ink">숨김</button>
                  )}
                  <button onClick={() => { if (confirm('정말 삭제할까요?')) act(r.id, 'delete'); }} disabled={busy === r.id}
                          className="text-[12px] px-2.5 py-1 rounded-full border border-rose/40 text-rose hover:bg-rose/10">삭제</button>
                </>
              )}
            </div>
          </div>
          {editing === r.id ? (
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              rows={3}
              className="w-full border border-line rounded-lg p-2.5 text-[13px] bg-bg-card focus:outline-none focus:border-ink-soft"
            />
          ) : (
            <p className="text-[13px] text-ink-soft leading-relaxed whitespace-pre-line">{r.body}</p>
          )}
        </div>
      ))}
    </div>
  );
}
