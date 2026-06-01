export type EventType = 'conference' | 'ce' | 'seminar' | 'workshop';

export type EventStatus =
  | '예정' | '접수예정' | '접수중' | '마감' | '모집중' | '모집 공고'
  | '수강생 발표' | '교육중' | '교육 종료' | '취소됨' | '안내';

export interface Organization {
  id: string;
  name: string;
  short_name: string;
  category: string | null;
  color: string;
  homepage_url: string | null;
  schedule_url: string | null;
  verified: boolean;
  crawler_status: string;
  sort_order: number;
}

export interface PthubEvent {
  id: number;
  org_id: string;
  org_name: string;
  org_short: string;
  org_color: string;
  title: string;
  type: EventType;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  start_time: string;
  location: string;
  region: string;
  is_online: boolean;
  credit: number;
  fee: string;
  status: EventStatus;
  description: string;
  url: string;
  verified: boolean;
  last_checked: string;
  source: string;
  // 접수기간 / 교육기간 (접수마감일 앵커 모델)
  apply_start: string | null;
  apply_end: string | null;
  edu_start: string | null;
  edu_end: string | null;
  d_day: number | null; // 접수마감까지 남은 일수 (음수=마감)
}

export interface ReportInput {
  event_id: number;
  reason: 'cancelled' | 'wrong_date' | 'broken_link' | 'other';
  detail?: string;
  reporter_email?: string;
}

export interface EventReview {
  id: number;
  event_id: number;
  org_id: string | null;
  nickname: string;
  rating: number; // 1~5
  body: string;
  hidden: boolean;
  created_at: string;
}

export interface ReviewInput {
  event_id: number;
  org_id?: string | null;
  nickname: string;
  rating: number;
  body: string;
}
