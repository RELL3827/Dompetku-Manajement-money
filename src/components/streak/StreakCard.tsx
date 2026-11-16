import React from 'react';
import { StreakFlame } from './StreakFlame';
import type { StreakInfo } from '../../utils/streak';
import { Flame, ChevronRight, PlusCircle, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface StreakCardProps {
  streak: StreakInfo;
  onOpenStreakModal: () => void;
  onOpenAddTransaction: () => void;
  onCheckIn?: () => void;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  streak,
  onOpenStreakModal,
  onOpenAddTransaction,
  onCheckIn,
}) => {
  const isAtRisk = !streak.isRecordedToday && streak.currentStreak > 0;

  return (
    <article
      onClick={onOpenStreakModal}
      className={`relative overflow-hidden p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer group shadow-sm hover:shadow-md ${
        streak.isRecordedToday
          ? 'bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 border-orange-500/25 dark:border-orange-500/30'
          : isAtRisk
          ? 'bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-orange-500/15 border-amber-500/35 dark:border-amber-500/40'
          : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/80'
      }`}
    >
      {/* Background Ambient Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-orange-500/15 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-3.5">
        {/* Header Row: Flame & Streak Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StreakFlame
              size="md"
              streakCount={streak.currentStreak}
              tier={streak.tier}
              isActiveToday={streak.isRecordedToday}
              isAtRisk={isAtRisk}
              showCount={false}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Flame size={16} className="text-orange-500 fill-orange-500" />
                  <span>Streak Api</span>
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${streak.tier.colors.pillBg} ${streak.tier.colors.pillText} ${streak.tier.colors.pillBorder}`}
                >
                  {streak.tier.badgeEmoji} {streak.tier.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {streak.isRecordedToday ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>Api menyala hari ini ({streak.currentStreak} hari beruntun)</span>
                  </span>
                ) : isAtRisk ? (
                  <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <Clock size={12} className="animate-spin" />
                    <span>Hampir padam! Tekan tombol masuk di bawah</span>
                  </span>
                ) : (
                  <span>Tekan tombol masuk untuk mulai nyalakan apimu!</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="text-right mr-1">
              <span className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400 tabular-nums">
                {streak.currentStreak}
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block -mt-1">
                Hari
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
              <ChevronRight size={16} />
            </div>
          </div>
        </div>

        {/* 7-Day Mini Track (Mon - Sun) */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-1">
          {streak.weeklyStatus.map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
              <span
                className={`text-[9px] font-bold uppercase ${
                  day.isToday
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {day.dayLabel}
              </span>
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs transition-all ${
                  day.isActive
                    ? 'bg-gradient-to-tr from-orange-500 to-amber-400 text-white shadow-xs font-black ring-2 ring-orange-500/20'
                    : day.isToday
                    ? 'border-2 border-dashed border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 animate-pulse font-bold'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-600'
                }`}
              >
                {day.isActive ? '🔥' : day.isToday ? '⏳' : '•'}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons: Tombol Masuk / Status Api */}
        <div className="pt-1">
          {!streak.isRecordedToday ? (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {/* Primary Tombol Masuk to light the streak */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCheckIn?.();
                }}
                className="ios-btn w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer animate-pulse"
              >
                <Flame size={16} className="fill-white animate-bounce" />
                <span>🔥 Masuk & Nyalakan Api Hari Ini!</span>
              </button>

              {/* Secondary button: Catat Transaksi */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAddTransaction();
                }}
                className="ios-btn w-full sm:w-auto py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <PlusCircle size={14} />
                <span>Catat Transaksi</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Sudah Masuk Hari Ini — Api Menyala Aman 🔥</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAddTransaction();
                }}
                className="ios-btn text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 ml-2"
              >
                <Sparkles size={12} />
                <span>+ Transaksi</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
