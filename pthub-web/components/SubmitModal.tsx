'use client';

import { useState, useEffect } from 'react';

interface Props {
  onClose: () => void;
}

export default function SubmitModal({ onClose }: Props) {
  const [form, setForm] = useState({
    title: '',
    org_name: '',
    start_date: '',
    end_date: '',
    location: '',
    url: '',
    contact: '',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('행사명을 입력해 주세요.'); return; }
    if (!form.org_name.trim()) { setError('주최 학회/기관명을 입력해 주세요.'); return; }
    if (!form.start_date) { setError('시작일을 입력해 주세요.'); return; }
    if (!form.end_date) { setError('종료일을 입력해 주세요.'); return; }
    if (form.end_date < form.start_date) { setError('종료일이 시작일보다 앞설 수 없습니다.'); return; }
    if (!form.url.trim()) { setError('학회 공지글 URL을 입력해 주세요.'); return; }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || '제보 처리에 실패했어요.');
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6 max-md:p-0 max-md:items-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content-desktop max-md:modal-content-mobile bg-bg-card rounded-2xl max-w-[560px] w-full max-h-[92vh] overflow-y-auto p-8 px-9 relative shadow-2xl max-md:p-6 max-md:px-5 max-md:max-h-[94vh] max-md:rounded-t-2xl max-md:rounded-b-none">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg inline-flex items-center justify-center text-ink-soft hover:bg-ink hover:text-bg-card"
          aria-label="닫기"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {done ? (
          <div className="py-6 text-center">
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                 style={{ background: 'var(--accent-soft)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                   style={{ color: 'var(--accent)' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="serif font-bold text-2xl tracking-tight mb-2">제보 감사합니다!</h2>
            <p className="text-[13.5px] text-ink-soft leading-relaxed mb-6">
              검토 후 빠르게 등록하겠습니다.<br />
              정확한 일정 정보를 공유해 주셔서 감사해요.
            </p>
            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-full text-sm font-semibold border border-line hover:border-ink text-ink"
            >
              닫기
            </button>
          </div>
        ) : (
          <>
            <h2 className="serif font-bold text-2xl tracking-tight mb-1">일정 제보</h2>
            <p className="text-[13px] text-ink-mute mb-6">
              학회 공식 홈페이지에 공개된 일정만 제보해 주세요. 검토 후 24시간 내 반영합니다.
            </p>

            <div className="flex flex-col gap-4">
              <Field label="행사명 *">
                <input
                  type="text" value={form.title} onChange={set('title')}
                  placeholder="예) 2026 춘계학술대회"
                  className="w-full border border-line rounded-lg p-2.5 text-[13.5px] focus:outline-none focus:border-ink-soft bg-bg-card"
                />
              </Field>

              <Field label="주최 학회 / 기관명 *">
                <input
                  type="text" value={form.org_name} onChange={set('org_name')}
                  placeholder="예) 한국보바스협회"
                  className="w-full border border-line rounded-lg p-2.5 text-[13.5px] focus:outline-none focus:border-ink-soft bg-bg-card"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="시작일 *">
                  <input
                    type="date" value={form.start_date} onChange={set('start_date')}
                    className="w-full border border-line rounded-lg p-2.5 text-[13.5px] focus:outline-none focus:border-ink-soft bg-bg-card"
                  />
                </Field>
                <Field label="종료일 *">
                  <input
                    type="date" value={form.end_date} onChange={set('end_date')}
                    className="w-full border border-line rounded-lg p-2.5 text-[13.5px] focus:outline-none focus:border-ink-soft bg-bg-card"
                  />
                </Field>
              </div>

              <Field label="장소">
                <input
                  type="text" value={form.location} onChange={set('location')}
                  placeholder="예) 서울대병원 의생명연구원 (서울)"
                  className="w-full border border-line rounded-lg p-2.5 text-[13.5px] focus:outline-none focus:border-ink-soft bg-bg-card"
                />
              </Field>

              <Field label="학회 공지글 URL *">
                <input
                  type="url" value={form.url} onChange={set('url')}
                  placeholder="https://..."
                  className="w-full border border-line rounded-lg p-2.5 text-[13.5px] focus:outline-none focus:border-ink-soft bg-bg-card"
                />
              </Field>

              <Field label="추가 메모 (선택)">
                <textarea
                  value={form.note} onChange={set('note')}
                  placeholder="보수교육 평점, 참가비 등 추가 정보를 알려주시면 빠르게 등록할 수 있어요."
                  rows={2}
                  className="w-full border border-line rounded-lg p-2.5 text-[13.5px] resize-none focus:outline-none focus:border-ink-soft bg-bg-card"
                />
              </Field>

              <Field label="연락처 이메일 (선택, 처리 결과 회신용)">
                <input
                  type="email" value={form.contact} onChange={set('contact')}
                  placeholder="you@example.com"
                  className="w-full border border-line rounded-lg p-2.5 text-[13.5px] focus:outline-none focus:border-ink-soft bg-bg-card"
                />
              </Field>
            </div>

            {error && (
              <div className="mt-4 text-[12.5px] text-rose bg-rose/5 border border-rose/20 rounded-lg p-2.5">
                {error}
              </div>
            )}

            <div className="flex gap-2.5 mt-6">
              <button
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-3 px-5 rounded-full border border-line text-ink text-sm font-semibold hover:border-ink transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 px-5 rounded-full text-white text-sm font-semibold disabled:opacity-50 transition-opacity"
                style={{ background: 'var(--accent)' }}
              >
                {submitting ? '제출 중...' : '제보하기'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-ink-mute font-medium uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
