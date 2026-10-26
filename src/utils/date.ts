import type { PeriodFilter } from '../types';

/**
 * Format date to YYYY-MM-DD local string
 */
export function toLocalISODate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format Indonesian date (e.g. "Senin, 26 Okt 2026" or "26 Oktober 2026")
 */
export function formatIndonesianDate(
  dateStr: string,
  style: 'full' | 'medium' | 'short' = 'medium'
): string {
  try {
    const [year, month, day] = dateStr.split('T')[0].split('-').map((v) => parseInt(v, 10));
    const d = new Date(year, month - 1, day);

    if (style === 'full') {
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d);
    }
    if (style === 'short') {
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
      }).format(d);
    }
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Get friendly relative label for transactions grouped by date
 * e.g. "Hari Ini", "Kemarin", or "24 Oktober 2026"
 */
export function getRelativeDateLabel(dateStr: string): string {
  const today = toLocalISODate(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = toLocalISODate(yesterdayDate);

  const cleanDate = dateStr.split('T')[0];
  if (cleanDate === today) return 'Hari Ini';
  if (cleanDate === yesterday) return 'Kemarin';

  return formatIndonesianDate(cleanDate, 'full');
}

/**
 * Compute start and end dates based on PeriodFilter
 */
export function getPeriodDateRange(period: PeriodFilter): { startDate: string; endDate: string } {
  const now = new Date();
  const todayStr = toLocalISODate(now);

  switch (period) {
    case 'this_week': {
      // Monday of current week
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      return {
        startDate: toLocalISODate(monday),
        endDate: todayStr,
      };
    }
    case 'this_month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: toLocalISODate(firstDay),
        endDate: todayStr,
      };
    }
    case 'last_3_months': {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return {
        startDate: toLocalISODate(threeMonthsAgo),
        endDate: todayStr,
      };
    }
    case 'this_year': {
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      return {
        startDate: toLocalISODate(firstDayOfYear),
        endDate: todayStr,
      };
    }
    case 'all':
    default:
      return {
        startDate: '1970-01-01',
        endDate: todayStr,
      };
  }
}

/**
 * Returns current Year-Month string (YYYY-MM)
 */
export function getCurrentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
