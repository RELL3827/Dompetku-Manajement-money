import type { Transaction } from '../types';
import { toLocalISODate } from './date';

export type StreakTierKey =
  | 'ember-0'
  | 'golden-7'
  | 'amethyst-14'
  | 'plasma-30'
  | 'emerald-50'
  | 'ruby-100'
  | 'cosmic-365'
  | 'celestial-1000';

export interface StreakTierColors {
  outer: string;
  middle: string;
  core: string;
  glow: string;
  spark: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
}

export interface StreakTierConfig {
  key: StreakTierKey;
  minDays: number;
  nextMilestone: number;
  name: string;
  shortTitle: string;
  description: string;
  badgeEmoji: string;
  crownText?: string;
  colors: StreakTierColors;
}

export interface DayStreakStatus {
  date: string; // YYYY-MM-DD
  dayLabel: string; // Sen, Sel, Rab, etc.
  isActive: boolean;
  isToday: boolean;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  isRecordedToday: boolean;
  totalActiveDays: number;
  freezesRemaining: number;
  weeklyStatus: DayStreakStatus[];
  streakLevel: StreakTierConfig; // For backward compatibility
  tier: StreakTierConfig;
}

const LONGEST_STREAK_KEY = 'dompetku_longest_streak';
const CHECKIN_DATES_KEY = 'dompetku_checkin_dates';
const STREAK_FREEZES_KEY = 'dompetku_streak_freezes';

/**
 * All 8 TikTok-style flame tiers progressing at:
 * < 7, 7, 14, 30, 50, 100, 365, 1000 days
 */
export const ALL_STREAK_TIERS: StreakTierConfig[] = [
  {
    key: 'ember-0',
    minDays: 0,
    nextMilestone: 7,
    name: 'Api Oranye Pemula',
    shortTitle: '< 7 Hari',
    description: 'Nyalakan api konsistensimu dengan mencatat setiap hari!',
    badgeEmoji: '🔥',
    colors: {
      outer: '#dc2626',
      middle: '#ea580c',
      core: '#fef08a',
      glow: 'rgba(234, 88, 12, 0.45)',
      spark: '#f59e0b',
      pillBg: 'bg-orange-500/15',
      pillText: 'text-orange-700 dark:text-orange-300',
      pillBorder: 'border-orange-500/30',
    },
  },
  {
    key: 'golden-7',
    minDays: 7,
    nextMilestone: 14,
    name: 'Api Emas Membara',
    shortTitle: '7 Hari (Emas)',
    description: '1 Pekan penuh disiplin! Api emasmu memancarkan tekad finansial kuat.',
    badgeEmoji: '⚡',
    colors: {
      outer: '#b45309',
      middle: '#f59e0b',
      core: '#fffbeb',
      glow: 'rgba(245, 158, 11, 0.55)',
      spark: '#fde047',
      pillBg: 'bg-amber-500/20',
      pillText: 'text-amber-700 dark:text-amber-300',
      pillBorder: 'border-amber-500/40',
    },
  },
  {
    key: 'amethyst-14',
    minDays: 14,
    nextMilestone: 30,
    name: 'Api Ungu Mistis',
    shortTitle: '14 Hari (Ungu)',
    description: '2 Pekan konsisten! Api ungu mistis membuktikan ketahanan kebiasaanmu.',
    badgeEmoji: '💜',
    colors: {
      outer: '#7c3aed',
      middle: '#a855f7',
      core: '#fae8ff',
      glow: 'rgba(168, 85, 247, 0.55)',
      spark: '#e879f9',
      pillBg: 'bg-purple-500/20',
      pillText: 'text-purple-700 dark:text-purple-300',
      pillBorder: 'border-purple-500/40',
    },
  },
  {
    key: 'plasma-30',
    minDays: 30,
    nextMilestone: 50,
    name: 'Api Biru Plasma',
    shortTitle: '30 Hari (Plasma)',
    description: '1 Bulan penuh! Panas api membiru tanda disiplin finansial matang dan stabil.',
    badgeEmoji: '🔷',
    colors: {
      outer: '#1d4ed8',
      middle: '#06b6d4',
      core: '#e0f2fe',
      glow: 'rgba(6, 182, 212, 0.6)',
      spark: '#38bdf8',
      pillBg: 'bg-cyan-500/20',
      pillText: 'text-cyan-700 dark:text-cyan-300',
      pillBorder: 'border-cyan-500/40',
    },
  },
  {
    key: 'emerald-50',
    minDays: 50,
    nextMilestone: 100,
    name: 'Api Zamrud Hijau',
    shortTitle: '50 Hari (Zamrud)',
    description: '50 Hari beruntun! Api hijau zamrud merefleksikan pertumbuhan kekayaan nyata.',
    badgeEmoji: '❇️',
    colors: {
      outer: '#047857',
      middle: '#10b981',
      core: '#ecfdf5',
      glow: 'rgba(16, 185, 129, 0.6)',
      spark: '#34d399',
      pillBg: 'bg-emerald-500/20',
      pillText: 'text-emerald-700 dark:text-emerald-300',
      pillBorder: 'border-emerald-500/40',
    },
  },
  {
    key: 'ruby-100',
    minDays: 100,
    nextMilestone: 365,
    name: 'Api Berlian Ruby 100',
    shortTitle: '100 Hari (Ruby)',
    description: 'Klub 100 Hari! Hanya sebagian kecil orang yang mencapai level ketekunan ini.',
    badgeEmoji: '💎',
    crownText: '👑 100',
    colors: {
      outer: '#be123c',
      middle: '#f43f5e',
      core: '#fff1f2',
      glow: 'rgba(244, 63, 94, 0.65)',
      spark: '#fda4af',
      pillBg: 'bg-rose-500/20',
      pillText: 'text-rose-700 dark:text-rose-300',
      pillBorder: 'border-rose-500/40',
    },
  },
  {
    key: 'cosmic-365',
    minDays: 365,
    nextMilestone: 1000,
    name: 'Api Pelangi Kosmik 1 Tahun',
    shortTitle: '365 Hari (Kosmik)',
    description: '1 Tahun Penuh! Transformasi hidup & finansial legendaris dengan aura pelangi kosmik.',
    badgeEmoji: '🌈',
    crownText: '👑 365',
    colors: {
      outer: '#c026d3',
      middle: '#f59e0b',
      core: '#38bdf8',
      glow: 'rgba(217, 70, 239, 0.7)',
      spark: '#ffffff',
      pillBg: 'bg-fuchsia-500/20',
      pillText: 'text-fuchsia-700 dark:text-fuchsia-300',
      pillBorder: 'border-fuchsia-500/40',
    },
  },
  {
    key: 'celestial-1000',
    minDays: 1000,
    nextMilestone: 1000,
    name: 'Api Dewa Abadi 1000 Hari',
    shortTitle: '1000 Hari (Abadi)',
    description: 'Puncak Mahakarya! 1000 Hari disiplin finansial tanpa tanding, diselimuti halo dewa surya.',
    badgeEmoji: '☀️',
    crownText: '🏆 1000',
    colors: {
      outer: '#ea580c',
      middle: '#eab308',
      core: '#ffffff',
      glow: 'rgba(234, 179, 8, 0.85)',
      spark: '#ffffff',
      pillBg: 'bg-amber-500/30',
      pillText: 'text-amber-800 dark:text-amber-200',
      pillBorder: 'border-yellow-400',
    },
  },
];

/**
 * Determine streak tier based on exact day count
 */
export function getStreakTier(streak: number): StreakTierConfig {
  if (streak >= 1000) return ALL_STREAK_TIERS[7];
  if (streak >= 365) return ALL_STREAK_TIERS[6];
  if (streak >= 100) return ALL_STREAK_TIERS[5];
  if (streak >= 50) return ALL_STREAK_TIERS[4];
  if (streak >= 30) return ALL_STREAK_TIERS[3];
  if (streak >= 14) return ALL_STREAK_TIERS[2];
  if (streak >= 7) return ALL_STREAK_TIERS[1];
  return ALL_STREAK_TIERS[0];
}

/**
 * Backward compatibility alias
 */
export const getStreakLevel = getStreakTier;

/**
 * Check if the user has manually checked in (masuk) today
 */
export function hasCheckedInToday(): boolean {
  try {
    const today = toLocalISODate(new Date());
    const raw = localStorage.getItem(CHECKIN_DATES_KEY);
    if (!raw) return false;
    const dates: string[] = JSON.parse(raw);
    return dates.includes(today);
  } catch {
    return false;
  }
}

/**
 * Perform explicit manual daily check-in ("Tombol Masuk") to ignite the streak!
 * Dispatches an event to instantly refresh all UI components without page reload.
 */
export function performDailyCheckin(): { success: boolean; alreadyCheckedIn: boolean } {
  try {
    const today = toLocalISODate(new Date());
    const raw = localStorage.getItem(CHECKIN_DATES_KEY);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    const alreadyCheckedIn = set.has(today);

    if (!alreadyCheckedIn) {
      set.add(today);
      localStorage.setItem(CHECKIN_DATES_KEY, JSON.stringify(Array.from(set)));
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('dompetku_streak_updated'));
    }

    return { success: true, alreadyCheckedIn };
  } catch {
    return { success: false, alreadyCheckedIn: false };
  }
}

/**
 * Backward compatibility alias
 */
export const recordDailyVisitCheckin = performDailyCheckin;

/**
 * Get all active dates from transactions and stored check-in dates
 */
export function getActiveDatesSet(transactions: Transaction[]): Set<string> {
  const dates = new Set<string>();

  for (const tx of transactions) {
    if (tx.date) {
      dates.add(tx.date.split('T')[0]);
    }
  }

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

  const tier = getStreakTier(currentStreak);

  return {
    currentStreak,
    longestStreak,
    isRecordedToday,
    totalActiveDays: activeDates.size,
    freezesRemaining,
    weeklyStatus,
    streakLevel: tier,
    tier,
  };
}
