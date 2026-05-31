# PT-Hub Crawler

국내 물리치료 학회 일정을 자동 수집하는 크롤러입니다.
각 학회별 파서가 독립적으로 동작하며, 결과는 `events.json` 으로 저장됩니다.

## 지원 학회

| 약어 | 학회 | 출처 |
|---|---|---|
| KBA | 한국보바스협회 (성인) | kbobath.com 공지사항 |
| KBA-Ped | 한국보바스협회 (소아) | kbobath.co.kr 공지 |
| KACRPT | 대한심장호흡물리치료학회 | kacrpt.org |
| KSPNF | 대한PNF학회 | kspnf.org |
| IAPNFK | 국제PNF한국학회 | iapnfk.org |
| KAOMT | 대한정형도수물리치료학회 | kaomt.or.kr |

## 설치 (최초 1회)

```bash
# 1) Python 3.10 이상 필요. 확인:
python3 --version

# 2) 가상환경 (선택, 권장)
python3 -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate

# 3) 패키지 설치
pip install -r requirements.txt

# 4) Playwright 브라우저 다운로드 (약 200MB)
playwright install chromium
```

## 실행

```bash
# 전체 학회 수집
python -m pthub_crawler

# 특정 학회만
python -m pthub_crawler --only kaomt
python -m pthub_crawler --only kbobath,kacrpt

# 결과 위치 변경
python -m pthub_crawler --output ./out/events.json

# 디버그 (브라우저 창 띄우기)
python -m pthub_crawler --headed
```

## 출력 형식

`events.json` 예시:

```json
{
  "lastRun": "2026-05-28T10:23:45+09:00",
  "summary": {
    "kaomt": 122,
    "kbobath": 12,
    "kacrpt": 27
  },
  "events": [
    {
      "id": 1000,
      "org": "kaomt",
      "title": "BLE 정의용 (울산)",
      "type": "workshop",
      "start": "2026-01-17",
      "end": "2026-01-18",
      "time": "09:00",
      "location": "울산",
      "region": "울산",
      "online": false,
      "credit": 0,
      "fee": "학회 안내",
      "status": "예정",
      "desc": "BLE · 정의용 강사 · 울산",
      "verified": true,
      "lastChecked": "2026-05-28",
      "url": "http://www.kaomt.or.kr/edu/?page_num=0102"
    }
  ]
}
```

## PT-Hub 데모에 반영

```bash
# events.json 으로 pthub-demo.html 의 EVENTS 배열 자동 갱신
python apply_to_demo.py events.json pthub-demo.html
```

## 자주 묻는 질문

**Q. 봇 차단 메시지가 떠요**
A. Playwright 가 실제 Chromium 을 띄우기 때문에 대부분 통과합니다. 그래도 막힐 경우:
   - `--headed` 로 직접 보고 학회 사이트가 어떻게 응답하는지 확인
   - 학회 사이트가 일시 다운된 경우도 있으니 잠시 후 재시도

**Q. 특정 학회만 새로 추가하고 싶어요**
A. `pthub_crawler/parsers/` 안에 새 파서 파일을 만들고
   `pthub_crawler/__main__.py` 의 PARSERS 딕셔너리에 등록하면 됩니다.

**Q. 결과를 매주 자동 실행하려면?**
A. macOS/Linux 의 `cron` 또는 Windows 작업 스케줄러로 매주 월요일 09:00 KST 에 실행 설정.

## 데이터 검증 원칙

- 정확한 시작일·종료일을 모르면 등록 금지
- 학회 공식 페이지의 일정만 수집 (3자 정보 사이트 금지)
- 학회가 "모집 기간"으로 표시한 코스는 시작 주말·종료 주말만 등록
- 모든 일정에 학회 공지글 URL 직접 연결
