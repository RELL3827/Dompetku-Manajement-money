import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import {
  getFinancialSummary,
  getCategoryExpensesBreakdown,
  getMonthlyIncomeExpenseTrend,
  type FinancialSummary,
} from '../db/services';
import { AnalyticsSummaryCards } from '../components/analytics/AnalyticsSummaryCards';
import { CategoryExpensePie } from '../components/analytics/CategoryExpensePie';
import { IncomeExpenseBar } from '../components/analytics/IncomeExpenseBar';
import { TrendLineChart } from '../components/analytics/TrendLineChart';
import { getPeriodDateRange, toLocalISODate } from '../utils/date';
import type { PeriodFilter } from '../types';
import { BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<PeriodFilter>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState(toLocalISODate());

  const txTrigger = useLiveQuery(() => db.transactions.count()) || 0;

  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    dailyAverageExpense: 0,
    transactionCount: 0,
  });

  const [categoryBreakdown, setCategoryBreakdown] = useState<{
    total: number;
    items: Array<{ name: string; color: string; amount: number; percentage: number }>;
  }>({ total: 0, items: [] });

  const [monthlyTrend, setMonthlyTrend] = useState<
    Array<{ monthKey: string; label: string; income: number; expense: number; net: number }>
  >([]);

  useEffect(() => {
    async function loadAnalytics() {
      let startDate: string;
      let endDate: string;

      if (period === 'custom') {
        startDate = customStart || '1970-01-01';
        endDate = customEnd || toLocalISODate();
      } else {
        const range = getPeriodDateRange(period);
        startDate = range.startDate;
        endDate = range.endDate;
      }

      const [sum, catBreakdown, trend] = await Promise.all([
        getFinancialSummary(startDate, endDate),
        getCategoryExpensesBreakdown(startDate, endDate),
        getMonthlyIncomeExpenseTrend(6),
      ]);

      setSummary(sum);
      setCategoryBreakdown(catBreakdown);
      setMonthlyTrend(trend);
    }

    loadAnalytics();
  }, [period, customStart, customEnd, txTrigger]);

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
      {/* Header bar & Period Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Statistik & Analitik
          </h1>
          <p className="text-xs text-slate-500">
            Wawasan arus kas dan kebiasaan finansial Anda
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto scrollbar-none shadow-xs">
          {[
            { id: 'this_week' as PeriodFilter, label: 'Minggu Ini' },
            { id: 'this_month' as PeriodFilter, label: 'Bulan Ini' },
            { id: 'last_3_months' as PeriodFilter, label: '3 Bulan' },
            { id: 'this_year' as PeriodFilter, label: 'Tahun Ini' },
            { id: 'custom' as PeriodFilter, label: 'Kustom' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPeriod(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                period === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Inputs if selected */}
      {period === 'custom' && (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <Calendar size={16} className="text-slate-400 shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Dari:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Sampai:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <AnalyticsSummaryCards summary={summary} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doughnut: Pengeluaran per Kategori */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <PieChart size={16} />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Pengeluaran per Kategori
            </h2>
          </div>

          <CategoryExpensePie data={categoryBreakdown} />
        </div>

        {/* Bar Chart: Pemasukan vs Pengeluaran per Bulan */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <BarChart3 size={16} />
            </div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Pemasukan vs Pengeluaran (6 Bulan Terakhir)
            </h2>
          </div>

          <IncomeExpenseBar monthlyData={monthlyTrend} />
        </div>
      </div>

      {/* Line Chart: Arus Kas / Tren Saldo Bersih */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <TrendingUp size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Tren Arus Kas Bersih (Surplus / Defisit)
            </h2>
            <p className="text-[11px] text-slate-400">
              Pergerakan selisih pemasukan dikurangi pengeluaran bulanan Anda
            </p>
          </div>
        </div>

        <TrendLineChart trendData={monthlyTrend} />
      </div>
    </div>
  );
};
