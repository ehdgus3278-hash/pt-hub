import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 베이스
        bg: '#f6f3ec',
        'bg-card': '#fdfbf6',
        ink: '#1a1f1c',
        'ink-soft': '#4a524d',
        'ink-mute': '#8b908a',
        line: '#e2dccb',
        'line-soft': '#ede7d5',
        // 액센트
        accent: '#0f5e58',
        'accent-soft': '#d5e8e5',
        'accent-ink': '#073d39',
        gold: '#b08a3e',
        rose: '#c4604f',
        // 학회별 (Calendar/List에서 동적으로 inline style)
        org: {
          kbobath: '#0f5e58',
          'kbobath-ped': '#4a8e88',
          kacrpt: '#b08a3e',
          kspnf: '#6b4a8f',
          iapnfk: '#8e6dab',
          kaomt: '#c4604f',
        },
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', '-apple-system', 'sans-serif'],
        serif: ['Noto Serif KR', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20,30,25,.04), 0 8px 24px rgba(20,30,25,.06)',
      },
    },
  },
  plugins: [],
};

export default config;
