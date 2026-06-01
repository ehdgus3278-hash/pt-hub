'use client';

interface Props {
  value: number;          // 0~5 (소수 가능)
  size?: number;
  onChange?: (v: number) => void; // 있으면 입력 모드
}

// 별점 표시/입력. onChange 가 있으면 클릭 가능한 입력 위젯.
export default function StarRating({ value, size = 18, onChange }: Props) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="inline-flex items-center gap-0.5">
      {stars.map(n => {
        const filled = onChange ? n <= value : n <= Math.round(value);
        return (
          <button
            key={n}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(n)}
            className={onChange ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
            aria-label={`${n}점`}
          >
            <svg width={size} height={size} viewBox="0 0 24 24"
                 fill={filled ? 'var(--gold)' : 'none'}
                 stroke="var(--gold)" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
