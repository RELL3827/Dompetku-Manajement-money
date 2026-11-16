import type { Transaction } from '../types';
import { toLocalISODate } from './date';

export interface DayStreakStatus {
  date: string; // YYYY-MM-DD
  dayLabel: string; // Sen, Sel, Rab, etc.
  isActive: boolean;
  isToday: boolean;
}

export interface StreakLevel {
  title: string;
  description: string;
  badgeEmoji: string;
  nextMilestone: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  isRecordedToday: boolean;
  totalActiveDays: number;
  freezesRemaining: number;
  weeklyStatus: DayStreakStatus[]; // 7 days (6 days ago -> today)
  streakLevel: StreakLevel;
}

const LONGEST_STREAK_KEY = 'dompetku_longest_streak';
const CHECKIN_DATES_KEY = 'dompetku_checkin_dates';
const STREAK_FREEZES_KEY = 'dompetku_streak_freezes';

/**
 * Record a visit check-in for today so activity persists even before transactions
 */
export function recordDailyVisitCheckin(): void {
  try {
    const today = toLocalISODate(new Date());
    const raw = localStorage.getItem(CHECKIN_DATES_KEY);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    if (!set.has(today)) {
      set.add(today);
      localStorage.setItem(CHECKIN_DATES_KEY, JSON.stringify(Array.from(set)));
    }
  } catch {
    // Ignore storage issues
  }
}

/**
 * Get all active dates from transactions and stored check-in dates
 */
export function getActiveDatesSet(transactions: Transaction[]): Set<string> {
  const dates = new Set<string>();

  // Add transaction dates
  for (const tx of transactions) {
    if (tx.date) {
      dates.add(tx.date.split('T')[0]);
    }
  }

  // Add visit checkin dates
  try {
    const raw = localStorage.getItem(CHECKIN_DATES_KEY);
    if (raw) {
      const stored: string[] = JSON.parse(raw);
      for (const d of stored) {
        dates.add(d);
      }
    }
  } catch {
    // Ignore parse errors
  }

  return dates;
}

/**
 * Determine streak tier based on day count (TikTok / gamified styling)
 */
export function getStreakLevel(streak: number): StreakLevel {
  if (streak >= 30) {
    return {
      title: 'Master Api Abadi',
      description: 'Luar biasa! Disiplin finansialmu sangat solid dan melegenda.',
      badgeEmoji: '👑',
      nextMilestone: 60,
    };
  }
  if (streak >= 14) {
    return {
      title: 'Dua Pekan Berkobar',
      description: 'Konsistensi tinggi! Keuanganmu semakin tertata rapi.',
      badgeEmoji: '🌟',
      nextMilestone: 30,
    };
  }
  if (streak >= 7) {
    return {
      title: 'Seminggu Membara',
      description: 'Hebat! Satu minggu penuh konsisten mencatat keuangan.',
      badgeEmoji: '⚡',
      nextMilestone: 14,
    };
  }
  if (streak >= 3) {
    return {
      title: 'Percikan Api Menyala',
      description: 'Awal yang sangat baik! Terus jaga ritme harianmu.',
      badgeEmoji: '✨',
      nextMilestone: 7,
    };
  }
  return {
    title: 'Pemula Berapi',
    description: 'Catat transaksi setiap hari untuk membesarkan apimu!',
    badgeEmoji: '🔥',
    nextMilestone: 3,
  };
}

/**
 * Compute comprehensive streak details from transactions
 */
export function calculateStreak(transactions: Transaction[]): StreakInfo {
  const now = new Date();
  const today = toLocalISODate(now);

  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = toLocalISODate(yesterdayDate);

  const activeDates = getActiveDatesSet(transactions);
  const isRecordedToday = activeDates.has(today);

  let currentStreak = 0;

  // Determine starting anchor: if recorded today, start from today;
  // otherwise, if recorded yesterday, the streak is alive waiting for today's entry!
  if (isRecordedToday) {
    let checkDate = new Date(now);
    while (activeDates.has(toLocalISODate(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else if (activeDates.has(yesterday)) {
    let checkDate = new Date(yesterdayDate);
    while (activeDates.has(toLocalISODate(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else {
    currentStreak = 0;
  }

  // Update or retrieve longest streak
  let savedLongest = 0;
  try {
    savedLongest = parseInt(localStorage.getItem(LONGEST_STREAK_KEY) || '0', 10);
  } catch {
    savedLongest = 0;
  }

  const longestStreak = Math.max(savedLongest, currentStreak);
  try {
    if (longestStreak > savedLongest) {
      localStorage.setItem(LONGEST_STREAK_KEY, longestStreak.toString());
    }
  } catch {
    // Ignore storage errors
  }

  // Retrieve remaining streak freezes (default 2)
  let freezesRemaining = 2;
  try {
    const rawFreeze = localStorage.getItem(STREAK_FREEZES_KEY);
    if (rawFreeze !== null) {
      freezesRemaining = parseInt(rawFreeze, 10);
    } else {
      localStorage.setItem(STREAK_FREEZES_KEY, '2');
    }
  } catch {
    freezesRemaining = 2;
  }

  // Build 7-day mini calendar status (6 days ago -> today)
  const weeklyStatus: DayStreakStatus[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = toLocalISODate(d);
    const dayLabel = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d);

    weeklyStatus.push({
      date: dateStr,
      dayLabel,
      isActive: activeDates.has(dateStr),
      isToday: i === 0,
    });
  }

  const streakLevel = getStreakLevel(currentStreak);

  return {
    currentStreak,
    longestStreak,
    isRecordedToday,
    totalActiveDays: activeDates.size,
    freezesRemaining,
    weeklyStatus,
    streakLevel,
  };
}
