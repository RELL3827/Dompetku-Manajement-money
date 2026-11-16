import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { calculateStreak, performDailyCheckin, type StreakInfo } from '../utils/streak';
import { triggerHaptic } from '../utils/haptics';

export interface UseStreakResult extends StreakInfo {
  checkInToday: () => boolean;
}

/**
 * Reactive hook for TikTok-style Daily Streak calculation.
 * Listens to Dexie database transactions and manual daily check-ins ("Tombol Masuk").
 */
export const useStreak = (): UseStreakResult => {
  const [checkinVersion, setCheckinVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setCheckinVersion((v) => v + 1);
    };

    window.addEventListener('dompetku_streak_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('dompetku_streak_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Reactively track transactions from Dexie database
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];

  const streak = useMemo(() => {
    return calculateStreak(transactions);
    // Include checkinVersion so manual check-in recomputes immediately
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, checkinVersion]);

  const checkInToday = useCallback((): boolean => {
    const res = performDailyCheckin();
    triggerHaptic('success');
    setCheckinVersion((v) => v + 1);
    return res.success;
  }, []);

  return {
    ...streak,
    checkInToday,
  };
};
