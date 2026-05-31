"""
PT-Hub 크롤러 결과(events.json)를 pthub-demo.html 에 자동 반영합니다.

사용:
    python apply_to_demo.py events.json pthub-demo.html
    python apply_to_demo.py events.json pthub-demo.html --output pthub-demo-new.html

동작:
    HTML 내 'const EVENTS = [ ... ];' 블록을 events.json 의 내용으로 교체.
    원본은 .bak 으로 백업.
"""
from __future__ import annotations
import argparse
import json
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path


EVENTS_START_MARKER = 'const EVENTS = ['
EVENTS_END_MARKER = '];'


def js_value(v):
    """Python 값 → JS 리터럴"""
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, str):
        return "'" + v.replace("\\", "\\\\").replace("'", "\\'") + "'"
    if v is None:
        return 'null'
    return repr(v)


def event_to_js(e: dict) -> str:
    """이벤트 dict → JS 객체 한 줄"""
    fields = ['id', 'org', 'title', 'type', 'start', 'end', 'time',
              'location', 'region', 'online', 'credit', 'fee',
              'status', 'desc', 'verified', 'lastChecked', 'url']
    parts = []
    for f in fields:
        if f in e and e[f] != '' and e[f] is not None:
            parts.append(f'{f}: {js_value(e[f])}')
    return '  { ' + ', '.join(parts) + ' },'


def find_events_block(html: str) -> tuple[int, int]:
    """HTML 내 EVENTS 배열 위치 (start, end) 반환"""
    start = html.find(EVENTS_START_MARKER)
    if start == -1:
        return -1, -1

    # EVENTS 배열의 닫는 ']'를 찾기 (중첩 괄호 무시)
    depth = 0
    i = start + len(EVENTS_START_MARKER) - 1  # '[' 위치
    while i < len(html):
        c = html[i]
        if c == '[':
            depth += 1
        elif c == ']':
            depth -= 1
            if depth == 0:
                # ']' 다음 ';' 까지 포함
                end = html.find(';', i) + 1
                return start, end
        i += 1
    return -1, -1


def main():
    ap = argparse.ArgumentParser(description='크롤링 결과를 데모 HTML에 반영')
    ap.add_argument('events_json', help='크롤러 결과 JSON 파일')
    ap.add_argument('html_file', help='수정할 pthub-demo.html')
    ap.add_argument('--output', help='출력 경로 (없으면 원본 덮어쓰기)', default=None)
    ap.add_argument('--no-backup', action='store_true', help='.bak 백업 안 함')
    args = ap.parse_args()

    events_path = Path(args.events_json)
    html_path = Path(args.html_file)
    out_path = Path(args.output) if args.output else html_path

    if not events_path.exists():
        print(f"오류: {events_path} 파일이 없습니다.")
        sys.exit(1)
    if not html_path.exists():
        print(f"오류: {html_path} 파일이 없습니다.")
        sys.exit(1)

    data = json.loads(events_path.read_text(encoding='utf-8'))
    events = data.get('events', [])
    summary = data.get('summary', {})

    print(f"events.json 로드: {len(events)}건")
    for org, n in summary.items():
        print(f"  {org}: {n}건")

    html = html_path.read_text(encoding='utf-8')

    start, end = find_events_block(html)
    if start == -1:
        print("오류: EVENTS 배열을 HTML 에서 찾을 수 없습니다.")
        sys.exit(1)

    # 새 EVENTS 블록 구성
    js_lines = [EVENTS_START_MARKER]
    js_lines.append(f'  // 자동 생성 (PT-Hub Crawler {data.get("lastRun", "")})')
    js_lines.append(f'  // 학회별 일정 수: ' + ', '.join(f"{k} {v}" for k, v in summary.items()))
    for e in events:
        js_lines.append(event_to_js(e))
    js_lines.append('];')
    new_block = '\n'.join(js_lines)

    new_html = html[:start] + new_block + html[end:]

    # 백업
    if not args.no_backup and out_path == html_path:
        bak = html_path.with_suffix(html_path.suffix + '.bak')
        shutil.copy(html_path, bak)
        print(f"백업: {bak}")

    out_path.write_text(new_html, encoding='utf-8')
    print(f"✓ 반영 완료: {out_path}")
    print(f"  크기 변화: {len(html):,}자 → {len(new_html):,}자")


if __name__ == '__main__':
    main()
