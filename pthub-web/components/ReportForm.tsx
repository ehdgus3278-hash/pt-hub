'use client';

import { useState } from 'react';

interface Props {
  eventId: number;
  eventTitle: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const REASONS = [
  { value: 'cancelled', label: '일정이 취소되었어요' },
  { value: 'wrong_date', label: '일자/장소가 틀려요' },
  { value: 'broken_link', label: '신청 링크가 깨졌어요' },
  { value: 'other', label: '기타' },
] as const;

type ReasonValue = typeof REASONS[number]['value'];

export default function ReportForm({ eventId, eventTitle, onCancel, onSuccess }: Props) {
  const [reason, setReason] = useState<ReasonValue>('cancelled');
  const [detail, setDetail] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          reason,
          detail: detail.trim() || undefined,
          reporter_email: email.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || '신고 처리에 실패했어요. 잠시 후 다시 시도해 주세요.');
      }
      alert('신고해 주셔서 감사합니다. 24시간 내에 확인하고 정정하겠습니다.');
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="serif font-bold text-2xl tracking-tight mb-1.5">오류 신고</h2>
      <div className="text-[13px] text-ink-mute mb-5 line-clamp-1">{eventTitle}</div>

      <div className="mb-4">
        <label className="block text-xs text-ink-mute font-medium uppercase tracking-wider mb-2">신고 이유</label>
        <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
          {REASONS.map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => setReason(r.value)}
              className={`text-left py-2.5 px-3.5 rounded-lg text-[13px] border transition-all ${
                reason === r.value
                  ? 'border-ink text-ink font-semibold bg-bg'
                  : 'border-line text-ink-soft hover:border-ink-mute'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs text-ink-mute font-medium uppercase tracking-wider mb-2">상세 (선택)</label>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="알고 계신 정확한 정보를 알려주시면 빠르게 정정할 수 있어요."
          rows={3}
          className="w-full border border-line rounded-lg p-2.5 text-[13px] resize-none focus:outline-none focus:border-ink-soft bg-bg-card"
        />
      </div>

      <div className="mb-5">
        <label className="block text-xs text-ink-mute font-medium uppercase tracking-wider mb-2">
          이메일 (선택, 처리 결과 회신용)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full border border-line rounded-lg p-2.5 text-[13px] focus:outline-none focus:border-ink-soft bg-bg-card"
        />
      </div>

      {error && (
        <div className="text-[12.5px] text-rose bg-rose/5 border border-rose/20 rounded-lg p-2.5 mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 py-3 px-5 rounded-full border border-line text-ink text-sm font-semibold hover:border-ink"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 py-3 px-5 rounded-full text-white text-sm font-semibold disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {submitting ? '제출 중...' : '신고하기'}
        </button>
      </div>
    </div>
  );
}
