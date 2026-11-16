import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { StreakFlame } from './StreakFlame';
import { ALL_STREAK_TIERS, type StreakInfo, type StreakTierConfig } from '../../utils/streak';
import { Trophy, Calendar, ShieldCheck, Flame, PlusCircle, CheckCircle2, AlertTriangle, Lock, Sparkles } from 'lucide-react';
import { formatIndonesianDate } from '../../utils/date';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: StreakInfo;
  onOpenAddTransaction: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  streak,
  onOpenAddTransaction,
}) => {
  // Allow user to preview how each flame tier looks when tapped!
  const [selectedPreviewTier, setSelectedPreviewTier] = useState<StreakTierConfig | null>(null);

  const activeTier = selectedPreviewTier || streak.tier;
  const isAtRisk = !streak.isRecordedToday && streak.currentStreak > 0;

  const isCurrentMaxTier = streak.tier.minDays >= 1000;
  const progressPercent = isCurrentMaxTier
    ? 100
    : Math.min(
        100,
        Math.round((streak.currentStreak / Math.max(1, streak.tier.nextMilestone)) * 100)
      );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Streak Api Keuangan TikTok Style 🔥" maxWidth="lg">
      <div className="space-y-6">
        {/* Hero Flame Header */}
        <div
          className="relative overflow-hidden p-6 rounded-3xl border text-center flex flex-col items-center justify-center transition-all duration-500"
          style={{
            background: `radial-gradient(circle at center top, ${activeTier.colors.glow} 0%, rgba(15, 23, 42, 0.02) 70%)`,
            borderColor: activeTier.colors.glow,
          }}
        >
          {/* Interactive Tier Switch Tag if previewing */}
          {selectedPreviewTier && selectedPreviewTier.key !== streak.tier.key && (
            <div className="mb-2 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
              <Sparkles size={13} />
              <span>Pratinjau Tingkatan: {selectedPreviewTier.name}</span>
              <button
                type="button"
                onClick={() => setSelectedPreviewTier(null)}
                className="underline ml-1 cursor-pointer hover:text-amber-900 dark:hover:text-amber-100"
              >
                (Reset ke Apiku)
              </button>
            </div>
          )}

          <div className="relative mb-3">
            <StreakFlame
              size="xl"
              streakCount={selectedPreviewTier ? selectedPreviewTier.minDays || 1 : streak.currentStreak}
              tier={activeTier}
              isActiveToday={streak.isRecordedToday}
              isAtRisk={isAtRisk && !selectedPreviewTier}
              showCount={false}
              showCrown={true}
            />
          </div>

          <div className="space-y-1">
            <span
              className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent tabular-nums drop-shadow-xs"
              style={{
                backgroundImage: `linear-gradient(135deg, ${activeTier.colors.middle}, ${activeTier.colors.outer})`,
              }}
            >
              {streak.currentStreak} Hari
            </span>
            <p className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5">
              <span>{activeTier.badgeEmoji}</span>
              <span>{activeTier.name}</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {activeTier.description}
            </p>
          </div>

          {/* Status Banner */}
          <div className="mt-4 w-full max-w-md">
            {streak.isRecordedToday ? (
              <div className="p-3 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Api menyala hari ini! Streak keuanganmu aman hingga besok.</span>
              </div>
            ) : isAtRisk ? (
              <div className="p-3 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 animate-pulse">
                <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                <span>Api hampir padam! Catat minimal 1 transaksi hari ini sebelum 23:59 WIB.</span>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2">
                <Flame size={16} className="text-orange-500 shrink-0" />
                <span>Mulai streak pertamamu dengan mencatat transaksi hari ini!</span>
              </div>
            )}
          </div>
        </div>

        {/* TikTok-Style Flame Tier Evolution Showcase (7, 14, 30, 50, 100, 365, 1000 Hari) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>Evolusi Tingkatan Api TikTok (7 Taraf Pencapaian)</span>
            </h4>
            <span className="text-[11px] text-slate-400">Klik untuk pratinjau</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {ALL_STREAK_TIERS.map((tier) => {
              const isUnlocked = streak.currentStreak >= tier.minDays;
              const isSelected = activeTier.key === tier.key;

              return (
                <div
                  key={tier.key}
                  onClick={() => setSelectedPreviewTier(tier)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center relative group ${
                    isSelected
                      ? 'ring-2 ring-orange-500 bg-orange-50/40 dark:bg-orange-950/30 border-orange-500/50 shadow-sm'
                      : isUnlocked
                      ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-orange-400/50'
                      : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/60 opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Lock / Unlock Status Pill */}
                  <div className="absolute top-2 right-2">
                    {isUnlocked ? (
                      <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400">
                        ✓
                      </span>
                    ) : (
                      <Lock size={11} className="text-slate-400 dark:text-slate-500" />
                    )}
                  </div>

                  {/* Flame preview icon */}
                  <div className="my-1">
                    <StreakFlame
                      size="sm"
                      streakCount={tier.minDays || 1}
                      tier={tier}
                      isActiveToday={true}
                      showCount={false}
                      showCrown={false}
                    />
                  </div>

                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                    {tier.shortTitle}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {tier.name}
                  </p>

                  <span
                    className={`mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full border ${tier.colors.pillBg} ${tier.colors.pillText} ${tier.colors.pillBorder}`}
                  >
                    {isUnlocked ? 'Terbuka ✨' : `${tier.minDays} Hari`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Day Weekly Streak Track */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-orange-500" />
              <span>Aktivitas 7 Hari Terakhir</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              Hari ini: {formatIndonesianDate(new Date().toISOString(), 'short')}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            {streak.weeklyStatus.map((day) => (
              <div
                key={day.date}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  day.isToday
                    ? 'ring-2 ring-orange-500/40 bg-orange-500/10 dark:bg-orange-500/15'
                    : ''
                }`}
              >
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  {day.dayLabel}
                </span>
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm transition-all ${
                    day.isActive
                      ? 'text-white shadow-xs font-black'
                      : day.isToday
                      ? 'border-2 border-dashed border-amber-500 text-amber-600 dark:text-amber-400 animate-pulse font-bold'
                      : 'bg-white dark:bg-slate-700 text-slate-300 dark:text-slate-600 border border-slate-200 dark:border-slate-600'
                  }`}
                  style={{
                    backgroundColor: day.isActive ? streak.tier.colors.middle : undefined,
                  }}
                >
                  {day.isActive ? '🔥' : day.isToday ? '⏳' : '•'}
                </div>
                <span className="text-[9px] font-medium text-slate-400">
                  {day.date.split('-')[2]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center">
            <Trophy size={18} className="text-amber-500 mb-1" />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Rekor Terbaik</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100 tabular-nums">
              {streak.longestStreak} Hari
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center">
            <Calendar size={18} className="text-emerald-500 mb-1" />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Total Hari Aktif</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100 tabular-nums">
              {streak.totalActiveDays} Hari
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center">
            <ShieldCheck size={18} className="text-blue-500 mb-1" />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Pelindung Api</span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-100 tabular-nums">
              {streak.freezesRemaining}x ❄️
            </span>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        {!isCurrentMaxTier && (
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Target Level Berikutnya: {streak.tier.nextMilestone} Hari
              </span>
              <span className="font-extrabold text-orange-600 dark:text-orange-400 tabular-nums">
                {streak.currentStreak}/{streak.tier.nextMilestone} ({progressPercent}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, ${streak.tier.colors.outer}, ${streak.tier.colors.middle}, ${streak.tier.colors.core})`,
                }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {!streak.isRecordedToday && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAddTransaction();
              }}
              className="ios-btn w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>🔥 Catat Transaksi Hari Ini</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="ios-btn w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer text-center"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
