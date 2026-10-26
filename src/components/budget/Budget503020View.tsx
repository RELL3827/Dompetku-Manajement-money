import React from 'react';
import { formatRupiah } from '../../utils/currency';
import { IconRenderer } from '../common/IconRenderer';
import {
  ShieldCheck,
  HeartHandshake,
  PiggyBank,
  Sparkles,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import type { Budget503020Summary } from '../../types';

interface Budget503020ViewProps {
  summary: Budget503020Summary;
  onOpenSetup: () => void;
  onNavigateToSavings?: () => void;
}

export const Budget503020View: React.FC<Budget503020ViewProps> = ({
  summary,
  onOpenSetup,
  onNavigateToSavings,
}) => {
  const {
    incomeBase,
    needsTarget,
    wantsTarget,
    savingsTarget,
    needsSpent,
    wantsSpent,
    savingsSpent,
    needsPercentage,
    wantsPercentage,
    savingsPercentage,
    needsRemaining,
    wantsRemaining,
    savingsRemaining,
    needsCategories,
    wantsCategories,
    status,
  } = summary;

  // Calculate actual share of income spent
  const needsShare = incomeBase > 0 ? (needsSpent / incomeBase) * 100 : 0;
  const wantsShare = incomeBase > 0 ? (wantsSpent / incomeBase) * 100 : 0;
  const savingsShare = incomeBase > 0 ? (savingsSpent / incomeBase) * 100 : 0;
  const totalSpentAll = needsSpent + wantsSpent;

  return (
    <div className="space-y-6">
      {/* Hero Card: 50/30/20 Overview */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Pola Anggaran 50 / 30 / 20
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Acuan Pemasukan Bulanan:{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                {formatRupiah(incomeBase)}
              </strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenSetup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <SlidersHorizontal size={14} />
            <span>Sesuaikan Acuan 50/30/20</span>
          </button>
        </div>

        {/* Stacked Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5 text-slate-500">
            <span>Proporsi Realisasi Bulan Ini:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Total Pengeluaran: {formatRupiah(totalSpentAll)}
            </span>
          </div>

          <div className="w-full h-4 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex p-0.5 gap-0.5">
            {needsShare > 0 && (
              <div
                className="h-full rounded-lg bg-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(100, needsShare)}%` }}
                title={`Kebutuhan: ${Math.round(needsShare)}%`}
              />
            )}
            {wantsShare > 0 && (
              <div
                className="h-full rounded-lg bg-purple-500 transition-all duration-500"
                style={{ width: `${Math.min(100 - needsShare, wantsShare)}%` }}
                title={`Keinginan: ${Math.round(wantsShare)}%`}
              />
            )}
            {savingsShare > 0 && (
              <div
                className="h-full rounded-lg bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100 - needsShare - wantsShare, savingsShare)}%` }}
                title={`Tabungan: ${Math.round(savingsShare)}%`}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-blue-500" />
              <span className="text-slate-600 dark:text-slate-300">
                Kebutuhan: <strong>{Math.round(needsShare)}%</strong> (Maks 50%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-purple-500" />
              <span className="text-slate-600 dark:text-slate-300">
                Keinginan: <strong>{Math.round(wantsShare)}%</strong> (Maks 30%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300">
                Tabungan: <strong>{Math.round(savingsShare)}%</strong> (Min 20%)
              </span>
            </div>
          </div>
        </div>

        {/* Financial Insight Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3 text-xs leading-relaxed">
          <Sparkles size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Evaluasi Finansial Bulan Ini:{' '}
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {needsPercentage > 100
                ? 'Pos kebutuhan pokok telah melebihi batas 50%. Tinjau kembali tagihan dan pos belanja rutin.'
                : wantsPercentage > 100
                ? 'Pos keinginan telah melebihi batas 30%. Rem pengeluaran hiburan dan belanja non-esensial.'
                : savingsPercentage >= 100
                ? 'Luar biasa! Target tabungan 20% bulan ini telah tercapai dengan sangat baik.'
                : 'Arus keuangan Anda sehat dan terkontrol sesuai proporsi 50/30/20. Terus pertahankan!'}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. KEBUTUHAN (50%) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    50% Kebutuhan
                  </h3>
                  <p className="text-[11px] text-slate-400">Needs (Esensial)</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  status.needs === 'danger'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    : status.needs === 'warning'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                }`}
              >
                {Math.round(needsPercentage)}%
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1 text-xs">
                <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  {formatRupiah(needsSpent)}
                </span>
                <span className="text-slate-400">Target: {formatRupiah(needsTarget)}</span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    status.needs === 'danger'
                      ? 'bg-rose-500'
                      : status.needs === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, needsPercentage)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                {needsRemaining > 0 ? (
                  <>Sisa batas aman: <strong className="text-emerald-600 dark:text-emerald-400">{formatRupiah(needsRemaining)}</strong></>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">Melebihi alokasi kebutuhan</span>
                )}
              </p>
            </div>

            {/* Sub-categories List */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Rincian Kategori Kebutuhan
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {needsCategories.map(({ category, spent }) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between text-xs p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 text-[11px]"
                        style={{ backgroundColor: category.color }}
                      >
                        <IconRenderer name={category.icon} size={12} />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                        {category.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">
                      {formatRupiah(spent)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. KEINGINAN (30%) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <HeartHandshake size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    30% Keinginan
                  </h3>
                  <p className="text-[11px] text-slate-400">Wants (Gaya Hidup)</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  status.wants === 'danger'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    : status.wants === 'warning'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                    : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400'
                }`}
              >
                {Math.round(wantsPercentage)}%
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1 text-xs">
                <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  {formatRupiah(wantsSpent)}
                </span>
                <span className="text-slate-400">Target: {formatRupiah(wantsTarget)}</span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    status.wants === 'danger'
                      ? 'bg-rose-500'
                      : status.wants === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(100, wantsPercentage)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                {wantsRemaining > 0 ? (
                  <>Sisa anggaran gaya hidup: <strong className="text-emerald-600 dark:text-emerald-400">{formatRupiah(wantsRemaining)}</strong></>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">Melebihi alokasi keinginan</span>
                )}
              </p>
            </div>

            {/* Sub-categories List */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Rincian Kategori Keinginan
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {wantsCategories.map(({ category, spent }) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between text-xs p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 text-[11px]"
                        style={{ backgroundColor: category.color }}
                      >
                        <IconRenderer name={category.icon} size={12} />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                        {category.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">
                      {formatRupiah(spent)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. TABUNGAN & INVESTASI (20%) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <PiggyBank size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    20% Tabungan
                  </h3>
                  <p className="text-[11px] text-slate-400">Savings & Goals</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  savingsPercentage >= 100
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : savingsPercentage >= 50
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {Math.round(savingsPercentage)}%
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1 text-xs">
                <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  {formatRupiah(savingsSpent)}
                </span>
                <span className="text-slate-400">Target: {formatRupiah(savingsTarget)}</span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, savingsPercentage)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                {savingsPercentage >= 100 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Target 20% tabungan telah tercapai!
                  </span>
                ) : (
                  <>Kekurangan: <strong className="text-slate-800 dark:text-slate-200">{formatRupiah(savingsRemaining)}</strong></>
                )}
              </p>
            </div>

            {/* Quick action to savings */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Target Celengan & Investasi
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Sisihkan 20% penghasilan Anda ke celengan impian atau pos dana darurat secara rutin setiap menerima gaji.
              </p>
            </div>
          </div>

          {onNavigateToSavings && (
            <button
              type="button"
              onClick={onNavigateToSavings}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-98"
            >
              <span>Buka Menu Tabungan</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
