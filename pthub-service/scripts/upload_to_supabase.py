"""
events.json 의 일정을 Supabase 에 업로드 (PostgREST REST API, requests 기반).

upsert 전략:
    (org_id, external_id, start_date) 조합으로 중복 방지.
    크롤러는 externalId 를 학회 상세글 id 로 설정 → 재실행 시 같은 행 갱신.

접수마감일 앵커 모델:
    apply_start/apply_end/edu_start/edu_end 를 함께 적재.
    status 저장값은 초기값일 뿐, 런타임 표시는 DB 뷰(events_with_org)가 날짜로 재계산.

사용:
    python scripts/upload_to_supabase.py events.json

환경변수:
    SUPABASE_URL          예) https://xxxx.supabase.co
    SUPABASE_SERVICE_KEY  Settings → API → service_role secret key (RLS 우회, 쓰기 권한)
"""
from __future__ import annotations
import json
import os
import sys
from datetime import datetime, date
from pathlib import Path

import requests


def get_env(key: str) -> str:
    v = os.environ.get(key)
    if not v:
        print(f"환경변수 {key} 없음. .env 또는 CI 시크릿 확인.")
        sys.exit(1)
    return v


# DB event_status enum 에 존재하는 값만 저장 가능.
# 표시 상태는 뷰(events_with_org)가 날짜로 재계산하므로,
# 저장값은 '취소됨'(뷰가 특수처리)만 보존하고 나머지는 '예정'으로 정규화.
def safe_status(raw: str) -> str:
    return '취소됨' if raw == '취소됨' else '예정'


def to_row(e: dict) -> dict:
    ext = e.get('externalId') or f"{e['org']}_{e['id']}"
    return {
        'org_id': e['org'],
        'title': e['title'],
        'type': e.get('type', 'workshop'),
        'start_date': e['start'],
        'end_date': e['end'],
        'start_time': e.get('time', '09:00'),
        'location': e.get('location', '학회 안내'),
        'region': e.get('region', '미정'),
        'is_online': e.get('online', False),
        'credit': e.get('credit', 0),
        'fee': e.get('fee', '학회 안내'),
        'status': safe_status(e.get('status', '예정')),
        'description': e.get('desc', ''),
        'url': e.get('url', ''),
        'verified': e.get('verified', True),
        'last_checked': e.get('lastChecked', date.today().isoformat()),
        'source': 'crawler',
        'external_id': ext,
        'apply_start': e.get('applyStart'),
        'apply_end': e.get('applyEnd'),
        'edu_start': e.get('eduStart') or e['start'],
        'edu_end': e.get('eduEnd') or e['end'],
    }


def main():
    if len(sys.argv) < 2:
        print("사용: python upload_to_supabase.py events.json")
        sys.exit(1)

    events_path = Path(sys.argv[1])
    if not events_path.exists():
        print(f"파일 없음: {events_path}")
        sys.exit(1)

    base = get_env('SUPABASE_URL').rstrip('/')
    key = get_env('SUPABASE_SERVICE_KEY')
    rest = f"{base}/rest/v1"
    headers = {
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json',
    }

    data = json.loads(events_path.read_text(encoding='utf-8'))
    events = data.get('events', [])
    print(f"events.json 로드: {len(events)}건")

    by_org: dict[str, list] = {}
    for e in events:
        by_org.setdefault(e['org'], []).append(e)

    run_start = datetime.now()
    total, errors = 0, []
    insert_headers = {**headers, 'Prefer': 'return=minimal'}

    # 학회별 '전체 교체' (delete-then-insert).
    # 목록형 크롤러는 매 실행마다 그 학회의 현재 일정 전체를 가져오므로,
    # 기존 행(수동 시드 포함)을 지우고 새로 넣는 것이 중복/유령행 없이 정확하다.
    # source='manual' 로 손수 넣은 행은 보존하고, 크롤러 관리분만 교체한다.
    for org_id, evs in by_org.items():
        org_rows = [to_row(e) for e in evs]
        try:
            # 1) 이 학회의 기존 크롤러/시드 행 삭제 (수동 보정 source='manual' 은 보존)
            d = requests.delete(
                f"{rest}/events?org_id=eq.{org_id}&source=in.(crawler,seed)",
                headers=insert_headers, timeout=30,
            )
            if d.status_code >= 300:
                raise RuntimeError(f"DELETE HTTP {d.status_code}: {d.text[:200]}")
            # 2) 새 행 삽입
            r = requests.post(f"{rest}/events", headers=insert_headers, json=org_rows, timeout=30)
            if r.status_code >= 300:
                raise RuntimeError(f"INSERT HTTP {r.status_code}: {r.text[:300]}")
            total += len(org_rows)
            print(f"  [{org_id}] 전체 교체 {len(org_rows)}건")
        except Exception as ex:
            msg = f"{org_id}: {type(ex).__name__}: {ex}"
            print(f"  [error] {msg}")
            errors.append(msg)

    # ---- 2) 검증 로그 ----
    duration_ms = int((datetime.now() - run_start).total_seconds() * 1000)
    log_headers = {**headers, 'Prefer': 'return=minimal'}
    for org_id, evs in by_org.items():
        try:
            requests.post(f"{rest}/verification_logs", headers=log_headers, timeout=15, json={
                'org_id': org_id,
                'status': 'success' if not errors else 'partial',
                'events_found': len(evs),
                'events_added': len(evs),
                'events_updated': 0,
                'duration_ms': duration_ms,
                'error_message': '; '.join(errors[:3]) if errors else None,
            })
        except Exception as ex:
            print(f"  [warn] {org_id} 로그 기록 실패: {ex}")

    print(f"\n✓ Supabase 업로드 완료: {total}/{len(events)}건")
    if errors:
        print(f"오류 {len(errors)}건:")
        for e in errors[:5]:
            print(f"  - {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
