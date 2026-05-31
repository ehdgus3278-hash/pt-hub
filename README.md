# PT-Hub — 국내 물리치료 학회 일정 통합 캘린더

> 흩어진 학회·보수교육·세미나·워크숍 일정을 한 곳에서, 검증된 정보로.

## 구조

```
pthub/
├── pthub-service/          ← 1단계: 데이터 인프라
│   ├── supabase/           ← DB 스키마·시드 SQL
│   ├── scripts/            ← Supabase 업로드
│   ├── pthub_crawler/      ← 학회 사이트 크롤러
│   └── .github/workflows/  ← 매주 자동 크롤링
└── pthub-web/              ← 2단계: Next.js 웹사이트
    ├── app/                ← 페이지·API
    ├── components/         ← React 컴포넌트
    └── lib/                ← Supabase 클라이언트
```

## 3단계 배포 로드맵

| 단계 | 산출물 | 결과 |
|---|---|---|
| **1. 데이터 인프라** | Supabase DB + 크롤러 + GitHub Actions | DB가 매주 자동 갱신 |
| **2. 웹사이트** | Next.js 앱 + Vercel 배포 | `pthub-xxx.vercel.app` 접속 가능 |
| **3. 도메인 + 운영** | 커스텀 도메인 + 모니터링 | `pthub.kr` 정식 서비스 |

각 단계는 독립적으로 검증 가능하며, **앞 단계가 안정된 후 다음으로 진행**합니다.

---

## 빠른 시작 (전체 셋업)

### 사전 준비물
- [ ] **Supabase** 계정 (무료, GitHub 로그인)
- [ ] **GitHub** 계정 (저장소 1개 필요, Private 권장)
- [ ] **Vercel** 계정 (무료, GitHub 로그인)
- [ ] **로컬 환경**: Node.js 20+, Python 3.10+

### 1단계: 데이터 인프라 (30~40분)

자세한 가이드: [`pthub-service/README.md`](pthub-service/README.md)

요약:
```bash
# 1) Supabase 프로젝트 생성 + 3개 SQL 실행
# 2) GitHub 저장소에 코드 푸시
# 3) GitHub Secrets 등록 (SUPABASE_URL, SUPABASE_SERVICE_KEY)
# 4) Actions → "Weekly Crawl" 수동 실행으로 검증
```

✅ 완료 기준: Supabase events 테이블에 179건 + 매주 월요일 자동 갱신

### 2단계: 웹사이트 (20분)

자세한 가이드: [`pthub-web/README.md`](pthub-web/README.md)

요약:
```bash
# 1) Vercel 에서 GitHub 저장소 import
# 2) Root Directory: pthub-web 지정
# 3) 환경변수 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 등록
# 4) Deploy
```

✅ 완료 기준: `https://pthub-xxx.vercel.app` 에서 캘린더 화면 표시

### 3단계: 도메인 + 운영 (10분 + 1~24시간 대기)

```bash
# 1) 도메인 구매 (가비아 등) — 예: pthub.kr
# 2) Vercel → Settings → Domains → Add Domain
# 3) DNS 레코드 설정 (Vercel 안내대로)
# 4) SSL 자동 발급 대기
```

✅ 완료 기준: `https://pthub.kr` 접속 가능

---

## 운영 체크리스트

### 매주 자동 (GitHub Actions)
- [x] 월요일 09:00 KST 크롤링 실행
- [x] Supabase DB upsert
- [x] verification_logs 기록
- [x] 실패 시 Slack 알림 (선택)

### 매월 수동 점검
- [ ] verification_logs 검토 (자주 실패하는 학회 확인)
- [ ] event_reports 처리 (사용자 신고 정정)
- [ ] 학회 사이트 구조 변경 모니터링 (파서 깨졌는지)

### 분기별
- [ ] 검증 대기 학회 (KPTA, KSPT, KAUPT 등) 신규 파서 추가
- [ ] 학회 공식 협력 메일 발송

---

## 데이터 검증 원칙

이 프로젝트는 다음 원칙을 엄격히 따릅니다:

1. **정확한 시작일·종료일을 모르면 등록 금지** (DB CHECK 제약으로 강제)
2. **14일 초과 기간 금지** (DB CHECK 제약 — 캘린더 도배 방지)
3. **학회 공식 페이지에서 직접 확인된 일정만** 등록
4. **3자 정보 사이트 (검색·블로그·카페) 등록 금지**
5. **PNF 같은 모듈식 강좌는 개강/종강 주말만** 등록
6. **모든 일정에 학회 공지글 URL 직접 연결**

자세한 운영 원칙: `pthub-service/supabase/01_schema.sql` 내 CHECK 제약과 파서 코드 주석 참조.

---

## 비용 추정

| 항목 | 비용 | 비고 |
|---|---|---|
| Vercel Hobby | $0 / 월 | 개인 프로젝트 무제한 |
| Supabase Free | $0 / 월 | 500MB DB, 5GB 대역폭 |
| GitHub Actions | $0 / 월 | Private 저장소 월 2000분 무료 |
| 도메인 (.kr) | ~20,000원 / 년 | 가비아 등 |
| **합계** | **약 2만원 / 년** | |

## 기여 / 문의

- 이슈: GitHub Issues
- 학회 협력 요청: 별도 안내 예정
- 일정 제보: 웹사이트 우측 상단 "일정 제보" 버튼
