// 한국시간(KST, UTC+9) 기준 날짜 처리 유틸.
// 서버가 어느 시간대에 있든 항상 KST 기준 "YYYY-MM-DD" 를 반환한다.

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// 주어진 시각(기본: 현재)을 KST 기준 YYYY-MM-DD 문자열로 반환
export function kstDateStr(d: Date = new Date()): string {
  return new Date(d.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

// n일 전의 KST 날짜 문자열 (오늘 포함 비교용)
export function kstDateStrDaysAgo(n: number, base: Date = new Date()): string {
  const d = new Date(base.getTime() - n * 24 * 60 * 60 * 1000);
  return kstDateStr(d);
}
