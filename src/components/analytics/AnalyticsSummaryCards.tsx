import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Calendar, Flame } from 'lucide-react';
import { formatRupiah } from '../../utils/currency';
import type { FinancialSummary } from '../../db/services';

interface AnalyticsSummaryCardsProps {
  summary: FinancialSummary;
}

export const AnalyticsSummaryCards: React.FC<AnalyticsSummaryCardsProps> = ({ summary }) => {
  const isSurplus = summary.netSavings >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {/* Total Masuk */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60">
            <TrendingUp size={16} />
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Pemasukan</span>
        </div>
        <p className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {formatRupiah(summary.totalIncome)}
        </p>
      </div>

      {/* Total Keluar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
          <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60">
            <TrendingDown size={16} />
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Pengeluaran</span>
        </div>
        <p className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {formatRupiah(summary.totalExpense)}
        </p>
      </div>

      {/* Selisih (Surplus/Defisit) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60">
            <Wallet size={16} />
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Selisih Bersih</span>
        </div>
        <p
          className={`text-base font-bold tracking-tight ${
            isSurplus ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {isSurplus ? '+' : ''}
          {formatRupiah(summary.netSavings)}
        </p>
      </div>

      {/* Rata-rata Harian */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60">
            <Calendar size={16} />
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Rata-rata/Hari</span>
        </div>
        <p className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {formatRupiah(summary.dailyAverageExpense)}
        </p>
      </div>

      {/* Kategori Terboros */}
      <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
          <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/60">
            <Flame size={16} />
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Terboros</span>
        </div>
        {summary.topExpenseCategory ? (
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {summary.topExpenseCategory.name}
            </p>
            <p className="text-[11px] text-slate-400">
              {formatRupiah(summary.topExpenseCategory.amount)} ({summary.topExpenseCategory.percentage}%)
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-medium">Belum ada data</p>
        )}
      </div>
    </div>
  );
};
