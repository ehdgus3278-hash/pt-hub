# PT-Hub 1단계: 데이터 인프라 구축

> Next.js 웹앱 빌드 전, **DB·크롤러·자동화** 인프라부터 완성합니다.
> 이 단계를 마치면 매주 월요일 자동으로 학회 일정이 DB에 채워집니다.

---

## 0. 준비물

1. **Supabase 계정** — https://supabase.com 에서 무료 가입 (GitHub 로그인 권장)
2. **GitHub 계정** — 이미 있을 것
3. (선택) **Slack 워크스페이스** — 크롤링 실패 알림용

---

## 1. Supabase 프로젝트 생성 (10분)

### 1-1. 프로젝트 만들기
1. https://supabase.com/dashboard 접속
2. **New Project** 클릭
3. 입력값:
   - **Name**: `pthub`
   - **Database Password**: 강력한 비밀번호 (별도 저장)
   - **Region**: `Northeast Asia (Seoul) — ap-northeast-2`
   - **Plan**: Free
4. **Create new project** 클릭 (1~2분 소요)

### 1-2. 스키마 적용
1. 좌측 메뉴 **SQL Editor** → **New query**
2. `supabase/01_schema.sql` 내용 전체 복사 → 붙여넣기 → **Run**
   - 성공 메시지 확인: `✓ PT-Hub 스키마 생성 완료`
3. `supabase/02_seed_organizations.sql` 동일 방식으로 실행
4. `supabase/03_seed_events.sql` 동일 방식으로 실행
   - 성공 메시지: `✓ 179 건 일정 등록 (6 개 학회)`

### 1-3. 데이터 확인
1. 좌측 메뉴 **Table Editor** → `events` 테이블 클릭
2. 179건 정도 데이터가 보이면 성공
3. `organizations` 테이블도 6건 보이는지 확인

### 1-4. API 키 확보 (중요)
1. 좌측 메뉴 **Settings (톱니바퀴)** → **API**
2. 두 값 복사:
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **service_role** secret key: `eyJhbGc...` (긴 문자열)
3. ⚠️ **service_role 키는 절대 공개 저장소에 커밋 금지** (모든 RLS 우회 권한)

---

## 2. GitHub 저장소 만들기 (10분)

### 2-1. 저장소 생성
1. GitHub → **New repository**
2. 이름: `pthub`
3. **Private** 선택 (공개해도 무방하지만 시크릿 관리 신중)
4. **Create repository**

### 2-2. 파일 업로드
로컬에서:
```bash
# 1) 저장소 클론
git clone https://github.com/<your-id>/pthub.git
cd pthub

# 2) PT-Hub 파일 복사
# (이 패키지의 모든 파일을 저장소 루트에 복사)
cp -r /path/to/pthub-service/* .
cp -r /path/to/pthub_crawler ./pthub_crawler

# 3) 디렉토리 구조 확인
tree -L 2
# pthub/
# ├── .github/workflows/crawl.yml
# ├── pthub_crawler/           # 크롤러 패키지
# ├── scripts/upload_to_supabase.py
# ├── supabase/                # SQL 스크립트
# └── README.md

# 4) 커밋 + 푸시
git add .
git commit -m "Initial setup: crawler + Supabase scripts"
git push
```

### 2-3. GitHub Secrets 등록
1. 저장소 페이지 → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 두 개 등록:
   - `SUPABASE_URL` = (1-4에서 복사한 Project URL)
   - `SUPABASE_SERVICE_KEY` = (1-4에서 복사한 service_role key)
3. (선택) `SLACK_WEBHOOK` 추가하면 실패 시 알림

---

## 3. 첫 크롤링 테스트 (15분)

### 3-1. 로컬에서 먼저 테스트
```bash
cd pthub_crawler

# 가상환경 + 설치
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium

# .env 파일 생성 (Git에 절대 커밋 금지)
cat > .env <<EOF
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
EOF

# 크롤링 (한 학회만 먼저)
python -m pthub_crawler --only kacrpt --headed

# 결과 확인
cat events.json | head -50

# Supabase 업로드
export $(cat .env | xargs)
pip install supabase python-dotenv
python ../scripts/upload_to_supabase.py events.json
```

### 3-2. GitHub Actions 수동 실행
1. 저장소 → **Actions** 탭 → **Weekly Crawl** 워크플로 선택
2. **Run workflow** 버튼 → **Run workflow** 확인
3. 5~10분 후 실행 완료, 녹색 체크 확인
4. Supabase Table Editor에서 데이터 갱신 확인 (`updated_at` 시간 변경)

### 3-3. 정기 실행 확인
- 워크플로는 매주 **월요일 09:00 KST**에 자동 실행
- 실패 시 Slack 알림 (SLACK_WEBHOOK 설정 시)

---

## 4. 운영 단계 체크리스트

### 매주 (자동)
- [x] GitHub Actions 가 월요일 09:00 자동 크롤링
- [x] 결과 events.json 을 GitHub Artifact 로 30일 보관
- [x] Supabase 에 upsert (중복 자동 처리)
- [x] verification_logs 에 실행 기록

### 매월 (수동)
- [ ] Supabase verification_logs 검토 → 자주 실패하는 학회 확인
- [ ] event_reports 처리 → 사용자 신고 일정 정정
- [ ] 학회 사이트 구조 변경 여부 점검 (파서 깨졌는지)

### 분기별
- [ ] 검증 대기 학회 (KPTA, KSPT, KAUPT 등) 추가 파서 작성
- [ ] 신규 학회 협력 요청 메일 발송

---

## 5. 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| GitHub Actions 가 빨간색으로 실패 | Secrets 미설정 또는 잘못된 키 | Settings → Secrets 재확인 |
| 일정이 0건 수집됨 | 학회 사이트 구조 변경 | 해당 파서 수정 (`pthub_crawler/parsers/*.py`) |
| upsert 에서 unique 제약 위반 | external_id 중복 | 파서에서 external_id 생성 로직 점검 |
| Playwright 가 봇 차단됨 | 사이트가 Cloudflare 등 더 강화 | `browser.py` 에 stealth 플러그인 추가 |
| Supabase 무료 한도 초과 | 데이터 폭증 | events 30일 이전 archive 테이블로 이동 |

---

## 다음 단계 (2단계)

데이터 인프라가 안정화되면 **2단계: Next.js 웹앱 구축**으로 진행합니다.

지금까지 만든 자산:
- ✅ Supabase DB (179건 검증된 일정)
- ✅ 자동 크롤링 (매주 월요일)
- ✅ 사용자 신고 테이블 (아직 UI 없음)

다음에 할 일:
- Next.js + Tailwind 프로젝트 셋업
- `pthub-demo.html` 의 디자인을 React 컴포넌트로 이식
- Supabase JS 클라이언트로 events_with_org 뷰 조회
- Vercel 배포 + 도메인 연결

---

## 부록: 수동으로 일정 추가하기

크롤러가 막힌 학회 일정은 CSV로 직접 추가 가능:
```bash
# 1) manual_events_template.csv 복사 → 본인 데이터로 채우기
cp pthub_crawler/manual_events_template.csv my_events.csv
# (편집기로 my_events.csv 작성)

# 2) events.json 으로 변환
python pthub_crawler/add_manual.py my_events.csv events.json

# 3) Supabase 업로드
python scripts/upload_to_supabase.py events.json
```
