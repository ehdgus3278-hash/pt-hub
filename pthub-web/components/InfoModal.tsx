'use client';

import { useEffect } from 'react';

export type InfoKey = 'about' | 'policy' | 'terms';

interface Props {
  page: InfoKey;
  onClose: () => void;
}

const CONTACT_EMAIL = 'ehdgus3278@naver.com';

export default function InfoModal({ page, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6 max-md:p-0 max-md:items-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-bg-card rounded-2xl max-w-[560px] w-full max-h-[90vh] overflow-y-auto p-8 px-9 relative shadow-2xl max-md:p-6 max-md:px-5 max-md:max-h-[92vh] max-md:rounded-t-2xl max-md:rounded-b-none">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg inline-flex items-center justify-center text-ink-soft hover:bg-ink hover:text-bg-card"
          aria-label="닫기"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {page === 'about' && <About />}
        {page === 'policy' && <Policy />}
        {page === 'terms' && <Terms />}
      </div>
    </div>
  );
}

function About() {
  return (
    <>
      <h2 className="serif font-bold text-2xl tracking-tight mb-4">서비스 소개</h2>
      <p className="text-[14px] text-ink-soft leading-relaxed mb-5">
        PT-Hub는 국내 물리치료 학회·보수교육·세미나·워크숍 일정을 한 곳에 모아
        보여주는 통합 캘린더입니다. 여러 학회 사이트에 흩어져 있어 찾기 번거로운 일정을,
        각 학회 공식 공지를 직접 확인해 검증한 뒤 한눈에 볼 수 있도록 정리합니다.
      </p>

      <dl className="grid grid-cols-[80px_1fr] gap-y-3 gap-x-4 py-4 border-y border-line text-sm">
        <dt className="text-ink-mute font-medium">만든이</dt>
        <dd className="text-ink font-semibold">김동현</dd>
        <dt className="text-ink-mute font-medium">문의</dt>
        <dd>
          <a href="mailto:ehdgus3278@naver.com" className="text-accent font-semibold hover:underline">
            ehdgus3278@naver.com
          </a>
        </dd>
      </dl>

      <p className="text-[12.5px] text-ink-mute leading-relaxed mt-4">
        일정 오류를 발견하시거나 등록을 원하는 학회·교육이 있다면 위 메일 또는
        상단의 “일정 제보” 기능으로 알려주세요.
      </p>
    </>
  );
}

function Policy() {
  return (
    <>
      <h2 className="serif font-bold text-2xl tracking-tight mb-4">데이터 검증 정책</h2>
      <p className="text-[14px] text-ink-soft leading-relaxed mb-4">
        PT-Hub는 정확한 정보 제공을 위해 다음 원칙을 따릅니다.
      </p>
      <ol className="flex flex-col gap-3 text-[13.5px] text-ink-soft leading-relaxed list-none">
        {[
          ['공식 출처 우선', '모든 일정은 각 학회의 공식 홈페이지·공지글에서 직접 확인합니다. 검색·블로그·카페 등 제3자 정보는 등록하지 않습니다.'],
          ['정확한 날짜 원칙', '시작일·종료일이 명확히 확인되지 않은 일정은 등록하지 않습니다. 추정 날짜로 캘린더를 채우지 않습니다.'],
          ['원문 링크 연결', '모든 일정에는 학회 공지글 원문 링크를 함께 제공하여, 신청·강사·비용 등 상세 정보를 직접 확인할 수 있게 합니다.'],
          ['지속 검증', '학회 사이트를 주기적으로 다시 확인하고, 사용자 신고가 접수되면 신속히 정정·삭제합니다.'],
        ].map(([t, d], i) => (
          <li key={t} className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full inline-flex items-center justify-center text-[12px] font-bold text-white" style={{ background: 'var(--accent)' }}>
              {i + 1}
            </span>
            <span><b className="text-ink">{t}.</b> {d}</span>
          </li>
        ))}
      </ol>
      <p className="text-[12.5px] text-ink-mute leading-relaxed mt-5 pt-4 border-t border-line">
        그럼에도 일정 정보는 변경될 수 있으므로, 최종 신청 전 반드시 학회 공지글 원문을 확인해 주세요.
      </p>
    </>
  );
}

function Terms() {
  return (
    <>
      <h2 className="serif font-bold text-2xl tracking-tight mb-4">이용약관</h2>
      <div className="flex flex-col gap-4 text-[13.5px] text-ink-soft leading-relaxed">
        <Section title="제1조 (목적)">
          본 약관은 PT-Hub(이하 “서비스”)가 제공하는 물리치료 학회·교육 일정 정보의
          이용 조건을 규정합니다.
        </Section>
        <Section title="제2조 (정보의 성격)">
          서비스가 제공하는 일정은 각 학회 공식 공지를 기반으로 정리한 참고용 정보입니다.
          서비스는 정확성을 위해 노력하나 정보의 완전성·최신성을 보장하지 않으며,
          최종 확인 책임은 이용자에게 있습니다.
        </Section>
        <Section title="제3조 (저작권 및 출처)">
          각 일정의 권리는 해당 학회·주최 기관에 있으며, 서비스는 공개된 정보를 출처와 함께
          큐레이션합니다. 원문 링크를 통해 공식 출처로 연결합니다.
        </Section>
        <Section title="제4조 (이용자 제보)">
          이용자가 제보한 일정·오류 신고 정보는 검토 후 반영되며, 검증되지 않은 정보는
          등록되지 않을 수 있습니다.
        </Section>
        <Section title="제5조 (면책)">
          서비스는 비영리 정보 큐레이션 서비스로, 일정 정보를 신뢰하여 발생한 손해에 대해
          법령이 허용하는 범위에서 책임을 지지 않습니다.
        </Section>
        <Section title="제6조 (약관 변경)">
          본 약관은 필요 시 변경될 수 있으며, 변경 시 서비스 내 공지합니다.
        </Section>
      </div>
      <p className="text-[12px] text-ink-mute mt-5 pt-4 border-t border-line">
        문의: <a href="mailto:ehdgus3278@naver.com" className="text-accent hover:underline">ehdgus3278@naver.com</a>
      </p>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-bold text-ink text-[14px] mb-1">{title}</h3>
      <p>{children}</p>
    </div>
  );
}
