import { NextResponse } from 'next/server';
import { getEvents } from '@/lib/supabase';

const TYPE_LABEL: Record<string, string> = {
  conference: '학술대회', ce: '보수교육', seminar: '세미나', workshop: '워크숍',
};

function esc(str: string) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// iCal spec: fold lines at 75 octets
function fold(line: string): string {
  if (line.length <= 75) return line;
  let out = '';
  let rest = line;
  while (rest.length > 75) {
    out += rest.slice(0, 75) + '\r\n ';
    rest = rest.slice(75);
  }
  return out + rest;
}

export async function GET() {
  const events = await getEvents();

  const dtstamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d+/, '')
    .slice(0, 15) + 'Z';

  const vevents = events.map(e => {
    const dtstart = e.start_date.replace(/-/g, '');
    // DTEND is exclusive for DATE values in iCal
    const dtEndDate = new Date(e.end_date);
    dtEndDate.setDate(dtEndDate.getDate() + 1);
    const dtend = dtEndDate.toISOString().slice(0, 10).replace(/-/g, '');

    const typeLabel = TYPE_LABEL[e.type] || e.type;
    const desc = [
      `${e.org_name} · ${typeLabel}`,
      e.status ? `상태: ${e.status}` : '',
      e.fee ? `참가비: ${e.fee}` : '',
      e.credit > 0 ? `보수교육 ${e.credit}점` : '',
      e.description || '',
      '',
      `공지글: ${e.url}`,
    ].filter(Boolean).join('\\n');

    const location = e.location + (e.region && e.region !== '미정' ? ` (${e.region})` : '');

    return [
      'BEGIN:VEVENT',
      `UID:pthub-${e.id}@pthub.kr`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `DTEND;VALUE=DATE:${dtend}`,
      fold(`SUMMARY:[${esc(e.org_name)}] ${esc(e.title)}`),
      fold(`DESCRIPTION:${esc(desc)}`),
      fold(`LOCATION:${esc(location)}`),
      fold(`URL:${e.url}`),
      fold(`CATEGORIES:${esc(e.org_name)},${esc(typeLabel)}`),
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n');
  });

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PT-Hub//물리치료 학회 캘린더//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:PT-Hub 물리치료 학회 일정',
    'X-WR-TIMEZONE:Asia/Seoul',
    'X-WR-CALDESC:국내 물리치료 학회·보수교육·세미나·워크숍 통합 캘린더',
    ...vevents,
    'END:VCALENDAR',
  ].join('\r\n');

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="pthub.ics"',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600',
    },
  });
}
