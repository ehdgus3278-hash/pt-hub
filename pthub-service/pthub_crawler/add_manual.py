"""
수동 등록 도구: CSV 파일의 일정을 events.json 에 추가합니다.
크롤러가 접근 못하는 학회나 캡쳐만 있는 경우 사용.

사용:
    python add_manual.py manual_events.csv events.json

CSV 형식 (헤더 필수):
    org,title,type,start,end,location,region,status,url

예:
    iapnfk,2026 1차 서울 기본중재과정 (개강),workshop,2026-09-12,2026-09-13,서울 (주말반),서울,모집중,https://iapnfk.org/...
"""
from __future__ import annotations
import argparse
import csv
import json
import sys
from datetime import datetime, date
from pathlib import Path


REQUIRED_FIELDS = ['org', 'title', 'start', 'end']


def validate_row(row: dict, row_num: int) -> str | None:
    """행 검증. 오류 메시지 반환 (정상이면 None)."""
    for f in REQUIRED_FIELDS:
        if not row.get(f, '').strip():
            return f"행 {row_num}: 필수 필드 '{f}' 누락"

    # 날짜 형식
    for f in ['start', 'end']:
        try:
            date.fromisoformat(row[f].strip())
        except ValueError:
            return f"행 {row_num}: {f} 날짜 형식 오류 (YYYY-MM-DD): '{row[f]}'"

    # 학회 ID
    valid_orgs = {'kbobath', 'kbobath-ped', 'kacrpt', 'kspnf', 'iapnfk', 'kaomt'}
    if row['org'] not in valid_orgs:
        return f"행 {row_num}: org 값 잘못됨 '{row['org']}'. 가능: {valid_orgs}"

    # 타입
    valid_types = {'conference', 'ce', 'seminar', 'workshop'}
    t = row.get('type', '').strip()
    if t and t not in valid_types:
        return f"행 {row_num}: type 값 잘못됨 '{t}'. 가능: {valid_types}"

    # 종료일이 시작일보다 빠른 경우
    s = date.fromisoformat(row['start'])
    e = date.fromisoformat(row['end'])
    if e < s:
        return f"행 {row_num}: 종료일이 시작일보다 빠름"

    return None


def main():
    ap = argparse.ArgumentParser(description='CSV에서 events.json 으로 일정 수동 추가')
    ap.add_argument('csv_file', help='입력 CSV 파일')
    ap.add_argument('events_json', help='병합할 events.json (없으면 새로 생성)')
    ap.add_argument('--start-id', type=int, default=9000, help='수동 추가 일정 ID 시작 (기본 9000)')
    args = ap.parse_args()

    csv_path = Path(args.csv_file)
    json_path = Path(args.events_json)

    if not csv_path.exists():
        print(f"오류: {csv_path} 없음")
        sys.exit(1)

    # 기존 events.json 로드 (없으면 빈 구조)
    if json_path.exists():
        data = json.loads(json_path.read_text(encoding='utf-8'))
    else:
        data = {
            'lastRun': datetime.now().isoformat(),
            'summary': {},
            'totalEvents': 0,
            'errors': [],
            'events': []
        }

    existing_ids = {e['id'] for e in data['events']}
    next_id = args.start_id
    while next_id in existing_ids:
        next_id += 1

    # CSV 읽기
    added = 0
    errors = []
    with csv_path.open(encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, start=2):  # 헤더 행 다음부터
            err = validate_row(row, i)
            if err:
                errors.append(err)
                continue

            event = {
                'id': next_id,
                'org': row['org'].strip(),
                'title': row['title'].strip(),
                'type': row.get('type', 'workshop').strip() or 'workshop',
                'start': row['start'].strip(),
                'end': row['end'].strip(),
                'time': row.get('time', '09:00').strip() or '09:00',
                'location': row.get('location', '학회 안내').strip(),
                'region': row.get('region', '미정').strip(),
                'online': row.get('online', '').strip().lower() in ('true', '1', 'yes'),
                'credit': int(row.get('credit', '0') or 0),
                'fee': row.get('fee', '학회 안내').strip(),
                'status': row.get('status', '예정').strip(),
                'desc': row.get('desc', '').strip() or f"수동 등록: {row['title'][:60]}",
                'verified': True,
                'lastChecked': date.today().isoformat(),
                'url': row.get('url', '').strip(),
            }
            data['events'].append(event)
            existing_ids.add(next_id)
            added += 1
            # 다음 가용 ID
            next_id += 1
            while next_id in existing_ids:
                next_id += 1

    # summary 재계산
    summary = {}
    for e in data['events']:
        summary[e['org']] = summary.get(e['org'], 0) + 1
    data['summary'] = summary
    data['totalEvents'] = len(data['events'])
    data['lastRun'] = datetime.now().isoformat()

    json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

    print(f"✓ {added}건 추가 → {json_path}")
    print(f"  총 일정: {data['totalEvents']}건")
    if errors:
        print(f"\n오류 {len(errors)}건 (스킵됨):")
        for e in errors:
            print(f"  - {e}")


if __name__ == '__main__':
    main()
