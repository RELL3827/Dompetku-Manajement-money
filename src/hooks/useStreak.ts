import { useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { calculateStreak, recordDailyVisitCheckin, type StreakInfo } from '../utils/streak';

/**
 * Reactive hook for TikTok-style Daily Streak calculation.
 * Automatically recalculates whenever transactions change in Dexie DB.
 */
export const useStreak = (): StreakInfo => {
  // Record daily app visit checkin once on mount
  useEffect(() => {
    recordDailyVisitCheckin();
  }, []);

  // Reactively track transactions from Dexie database
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];

  return useMemo(() => {
    return calculateStreak(transactions);
  }, [transactions]);
};
