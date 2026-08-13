export const NEPAL_TIMEZONE = 'Asia/Kathmandu' as const;

export interface DateParts {
  year: number;
  month: number;
  day: number;
}

export function formatIsoDate(year: number, month: number, day: number): string {
  return `${year.toString().padStart(4, '0')}-${month
    .toString()
    .padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

export function getKathmanduDateParts(date: Date = new Date()): DateParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: NEPAL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
  };
}

/** Today's calendar date in Asia/Kathmandu, as YYYY-MM-DD. */
export function kathmanduTodayIso(date: Date = new Date()): string {
  const parts = getKathmanduDateParts(date);
  return formatIsoDate(parts.year, parts.month, parts.day);
}

export function utcDateToIso(date: Date): string {
  return formatIsoDate(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  );
}
