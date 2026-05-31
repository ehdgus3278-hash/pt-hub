"""PT-Hub Crawler 메인 진입점.

사용:
    python -m pthub_crawler
    python -m pthub_crawler --only kaomt
    python -m pthub_crawler --only kbobath,kacrpt --headed
"""
from __future__ import annotations
import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

# Windows 콘솔(cp949)에서도 한글/기호 출력이 깨지지 않도록 UTF-8 강제
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding='utf-8')
    except Exception:
        pass

from .parsers import kbobath, kbobath_ped, kacrpt, kspnf, iapnfk, kaomt
from .util import Event


PARSERS = {
    'kbobath': (kbobath.fetch, 100),
    'kbobath-ped': (kbobath_ped.fetch, 200),
    'kacrpt': (kacrpt.fetch, 300),
    'kspnf': (kspnf.fetch, 400),
    'iapnfk': (iapnfk.fetch, 500),
    'kaomt': (kaomt.fetch, 600),
}


def main():
    ap = argparse.ArgumentParser(description='PT-Hub 학회 일정 크롤러')
    ap.add_argument('--only', help='특정 학회만 (쉼표 구분: kaomt,kbobath)', default='')
    ap.add_argument('--output', default='events.json', help='출력 파일 경로')
    ap.add_argument('--headed', action='store_true', help='브라우저 창 띄우기 (디버그)')
    args = ap.parse_args()

    only = {s.strip() for s in args.only.split(',') if s.strip()}
    targets = [k for k in PARSERS if not only or k in only]

    if not targets:
        print(f"오류: --only 에서 알 수 없는 학회. 가능: {list(PARSERS.keys())}")
        sys.exit(1)

    print(f"=== PT-Hub Crawler 시작 ({datetime.now().strftime('%Y-%m-%d %H:%M')}) ===")
    print(f"대상 학회: {', '.join(targets)}")
    print(f"브라우저 모드: {'headed (창 보임)' if args.headed else 'headless'}")
    print()

    all_events: list[Event] = []
    summary = {}
    errors = []

    for org_id in targets:
        fn, start_id = PARSERS[org_id]
        print(f"[{org_id}] 수집 중...")
        try:
            evts = fn(headless=not args.headed, start_id=start_id)
            all_events.extend(evts)
            summary[org_id] = len(evts)
        except Exception as e:
            print(f"  [error] {org_id} 수집 실패: {type(e).__name__}: {e}")
            errors.append({'org': org_id, 'error': str(e)})
            summary[org_id] = 0

    # 결과 정리
    out = {
        'lastRun': datetime.now().isoformat(),
        'summary': summary,
        'totalEvents': len(all_events),
        'errors': errors,
        'events': [e.to_dict() for e in all_events],
    }

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')

    print()
    print("=== 수집 완료 ===")
    print(f"총 일정: {len(all_events)}건")
    for org, n in summary.items():
        marker = '✓' if n > 0 else '✗'
        print(f"  {marker} {org}: {n}건")
    if errors:
        print(f"\n오류 {len(errors)}건:")
        for e in errors:
            print(f"  - {e['org']}: {e['error']}")
    print(f"\n결과 저장: {out_path.resolve()}")
    print(f"\n다음 단계: python apply_to_demo.py {out_path} pthub-demo.html")


if __name__ == '__main__':
    main()
