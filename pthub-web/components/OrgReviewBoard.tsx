'use client';

import { useState } from 'react';
import type { EventReview } from '@/lib/types';
import StarRating from './StarRating';

interface Props {
  orgId: string;
  initialReviews: EventReview[];
}

function fmtDate(iso: string) {
  return iso.slice(0, 10);
}

// 학회별 후기 게시판: 목록 + 작성 폼
export default function OrgReviewBoard({ orgId, initialReviews }: Props) {
  const [reviews, setReviews] = useState<EventReview[]>(initialReviews);

  const [nickname, setNickname] = useState('');
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  const handleSubmit = async () => {
    setError(null);
    if (rating < 1) { setError('별점을 선택해 주세요.'); return; }
    if (!body.trim()) { setError('후기 내용을 입력해 주세요.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: orgId, nickname, rating, body }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || '등록에 실패했어요.');

      const newReview: EventReview = {
        id: Date.now(),
        event_id: 0,
        org_id: orgId,
        nickname: nickname.trim() || '익명',
        rating,
        body: body.trim(),
        hidden: false,
        created_at: new Date().toISOString(),
      };
      setReviews([newReview, ...reviews]);
      setNickname(''); setRating(0); setBody('');
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h2 className="serif font-bold text-xl tracking-tight">
          후기 <span className="text-ink-mute font-normal text-base">{reviews.length}</span>
        </h2>
        {avg != null && (
          <div className="inline-flex items-center gap-2">
            <StarRating value={avg} size={16} />
            <span className="text-sm font-bold tabular-nums">{avg.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* 작성 폼 */}
      <div className="bg-bg-card border border-line rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="닉네임 (선택)"
            maxLength={30}
            className="border border-line rounded-lg px-3 py-2 text-[13.5px] bg-bg-card focus:outline-none focus:border-ink-soft w-40"
          />
          <div className="inline-flex items-center gap-1.5">
            <span className="text-[12.5px] text-ink-mute">별점</span>
            <StarRating value={rating} size={22} onChange={setRating} />
          </div>
        </div>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="이 학회 교육의 강사·실습·난이도·신청과정 등 솔직한 후기를 남겨주세요. (최대 2000자)"
          rows={3}
          maxLength={2000}
          className="w-full border border-line rounded-lg p-3 text-[13.5px] resize-none bg-bg-card focus:outline-none focus:border-ink-soft"
        />
        {error && <div className="mt-2 text-[12.5px] text-rose">{error}</div>}
        {done && <div className="mt-2 text-[12.5px] text-accent">후기가 등록되었습니다. 감사합니다!</div>}
        <div className="flex justify-end mt-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="py-2.5 px-6 rounded-full text-white text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--accent)' }}
          >
            {submitting ? '등록 중...' : '후기 등록'}
          </button>
        </div>
      </div>

      {/* 목록 */}
      {reviews.length === 0 ? (
        <p className="text-center text-ink-mute text-sm py-8">
          아직 후기가 없습니다. 첫 후기를 남겨주세요!
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map(r => (
            <div key={r.id} className="border-b border-line-soft pb-4 last:border-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[13.5px] text-ink">{r.nickname}</span>
                  <StarRating value={r.rating} size={13} />
                </div>
                <span className="text-[11.5px] text-ink-mute tabular-nums">{fmtDate(r.created_at)}</span>
              </div>
              <p className="text-[13.5px] text-ink-soft leading-relaxed whitespace-pre-line">{r.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
