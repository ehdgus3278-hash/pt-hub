# PT-Hub Web (Next.js)

> Supabase의 일정 데이터를 읽어 보여주는 공개 웹사이트.
> 1단계(`pthub-service`)에서 DB가 채워진 상태를 전제로 합니다.

## 로컬 개발

```bash
# 1) 패키지 설치
npm install

# 2) 환경변수 설정
cp .env.example .env.local
# .env.local 편집:
#   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
#
# 이 키는 anon (public) 키입니다. service_role 키는 절대 여기에 넣지 마세요.
# Supabase Dashboard → Settings → API → "anon" "public" 값 사용.

# 3) 개발 서버
npm run dev
# http://localhost:3000

# 4) 빌드 검증
npm run build
npm start
```

## Vercel 배포 (10분)

### 1. Vercel 계정 만들기
- https://vercel.com 접속 → **Sign Up** → GitHub 계정으로 가입

### 2. 프로젝트 가져오기
- **Add New** → **Project**
- GitHub 저장소 목록에서 `pthub` 선택 → **Import**
- 입력:
  - **Framework Preset**: Next.js (자동 감지)
  - **Root Directory**: `pthub-web` (서비스 패키지의 하위 폴더면 지정)
  - **Build Command**: `npm run build` (기본값)

### 3. 환경 변수 등록
**Environment Variables** 섹션에서:
- `NEXT_PUBLIC_SUPABASE_URL` = Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase anon key
- Environment: **Production**, **Preview**, **Development** 모두 체크

### 4. Deploy 클릭
- 약 1-2분 후 배포 완료
- `https://pthub-xxx.vercel.app` 같은 URL 자동 발급
- 접속하면 캘린더 화면 표시됨

### 5. 커스텀 도메인 (선택)
- 가비아·후이즈 등에서 도메인 구매 (예: `pthub.kr`, 연 2만원선)
- Vercel 프로젝트 → **Settings** → **Domains** → **Add Domain**
- 안내에 따라 DNS 레코드 설정 (A 또는 CNAME)
- 약 5분~24시간 후 SSL 자동 발급 + 도메인 연결 완료

## 자동 배포

GitHub `main` 브랜치에 push 하면 Vercel이 자동으로 재배포합니다.
크롤러가 매주 월요일 Supabase DB를 업데이트하면, 페이지는 `revalidate: 600` 설정으로 최대 10분 이내 새 데이터를 반영합니다.

## 자주 묻는 질문

**Q. 일정이 안 보여요**
- Supabase Dashboard → Table Editor → events 테이블에 데이터가 있는지 확인
- 환경변수 NEXT_PUBLIC_SUPABASE_URL/ANON_KEY 가 정확한지 확인
- 브라우저 콘솔에 에러 메시지가 있는지 확인

**Q. 빌드는 되는데 데이터가 안 나와요**
- service_role 키를 anon 키 자리에 넣었을 가능성 (둘은 다른 키)
- Supabase RLS 정책이 SELECT 허용으로 되어 있는지 (01_schema.sql 에 이미 포함)

**Q. 사용자 신고가 안 들어가요**
- `/api/report` 라우트 응답 확인 (브라우저 Network 탭)
- event_reports 테이블에 INSERT 권한이 anon role 에 있는지

## 파일 구조

```
pthub-web/
├── app/
│   ├── layout.tsx          ← 메타데이터 + 루트
│   ├── page.tsx            ← 메인 (Server Component, SSR)
│   ├── globals.css         ← 디자인 토큰
│   └── api/report/route.ts ← 신고 API
├── components/
│   ├── CalendarApp.tsx     ← 메인 클라이언트 (상태 관리)
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── SearchBar.tsx
│   ├── FilterSidebar.tsx
│   ├── MonthNav.tsx
│   ├── Calendar.tsx        ← 캘린더 그리드
│   ├── EventList.tsx       ← 리스트 카드
│   ├── EventModal.tsx      ← 상세 모달
│   └── ReportForm.tsx      ← 오류 신고 폼
├── lib/
│   ├── supabase.ts         ← DB 클라이언트
│   └── types.ts            ← 공통 타입
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── postcss.config.js
```
