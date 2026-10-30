import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import {
  getAllWalletBalances,
  getFinancialSummary,
  getAllBudgetStatuses,
  getRecentTransactions,
  type WalletBalanceInfo,
  type BudgetStatusInfo,
} from '../db/services';
import { formatRupiah } from '../utils/currency';
import { getCurrentYearMonth, getPeriodDateRange } from '../utils/date';
import { shouldShowBackupReminder } from '../utils/exportImport';
import { TransactionItem } from '../components/transaction/TransactionItem';
import { EmptyState } from '../components/common/EmptyState';
import { PwaInstallBanner } from '../components/common/PwaInstallBanner';
import { PwaInstallModal } from '../components/common/PwaInstallModal';
import { usePwaInstall } from '../hooks/usePwaInstall';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  ArrowUpRight,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  PiggyBank,
  Heart,
  FileText,
  Calculator,
} from 'lucide-react';
import { DonationModal } from '../components/common/DonationModal';
import type { Transaction, NavTab, TransactionType, Category, Wallet as WalletType, SavingGoal } from '../types';

interface HomePageProps {
  onNavigate: (tab: NavTab) => void;
  onOpenTransactionModal: (type?: TransactionType) => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenTransactionModal,
  onEditTransaction,
}) => {
  const [walletBalances, setWalletBalances] = useState<WalletBalanceInfo[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetStatusInfo[]>([]);
  const [backupReminder, setBackupReminder] = useState<string | null>(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  // PWA installation state
  const { isInstalled, isIOS, isAndroid, showGuideModal, setShowGuideModal, installApp } = usePwaInstall();

  // Live queries for reactive updates
  const recentTransactions = useLiveQuery(() => getRecentTransactions(5)) || [];
  const categories = useLiveQuery(() => db.categories.toArray()) || [];
  const wallets = useLiveQuery(() => db.wallets.toArray()) || [];
  const savingsGoals = useLiveQuery(() => db.savings.toArray()) || [];

  const catMap = new Map(categories.map((c: Category) => [c.id, c]));
  const walletMap = new Map(wallets.map((w: WalletType) => [w.id, w]));

  // Calculate current month financial summary
  const { startDate, endDate } = getPeriodDateRange('this_month');
  const [monthSummary, setMonthSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
  });

  useEffect(() => {
    async function loadData() {
      const [wb, sum, budgets, reminder] = await Promise.all([
        getAllWalletBalances(),
        getFinancialSummary(startDate, endDate),
        getAllBudgetStatuses(getCurrentYearMonth()),
        shouldShowBackupReminder(),
      ]);

      setWalletBalances(wb.filter((w: WalletBalanceInfo) => !w.wallet.isArchived));
      setMonthSummary({
        totalIncome: sum.totalIncome,
        totalExpense: sum.totalExpense,
        netSavings: sum.netSavings,
      });

      // Filter warning or danger budgets
      setBudgetAlerts(budgets.filter((b: BudgetStatusInfo) => b.status === 'warning' || b.status === 'danger'));

      if (reminder.shouldRemind) {
        setBackupReminder(reminder.message || null);
      } else {
        setBackupReminder(null);
      }
    }
    loadData();
  }, [recentTransactions, wallets, categories, startDate, endDate]);

  // Aggregate total balance across all active wallets
  const totalBalance = walletBalances.reduce((sum, w) => sum + w.balance, 0);

  // Savings summary calculation
  const totalSavingsCollected = savingsGoals.reduce((sum, s: SavingGoal) => sum + s.currentAmount, 0);
  const totalSavingsTarget = savingsGoals.reduce((sum, s: SavingGoal) => sum + s.targetAmount, 0);
  const savingsPercentage = totalSavingsTarget > 0 ? (totalSavingsCollected / totalSavingsTarget) * 100 : 0;

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
      {/* PWA Home Screen Install Banner */}
      <PwaInstallBanner isInstalled={isInstalled} onInstall={installApp} />

      {/* Backup Reminder Notice */}
      {backupReminder && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs">
          <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
            <ShieldAlert size={18} className="text-amber-500 shrink-0" />
            <span className="leading-snug">{backupReminder}</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="px-3 py-1.5 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shrink-0 shadow-xs active:scale-95 transition-all"
          >
            Backup Sekarang
          </button>
        </div>
      )}

      {/* Main Total Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white p-6 shadow-xl shadow-emerald-700/15">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-emerald-100 mb-1">
            <span className="font-medium flex items-center gap-1.5">
              <Wallet size={15} /> Total Saldo Gabungan
            </span>
            <button
              type="button"
              onClick={() => onNavigate('wallets')}
              className="text-[11px] underline opacity-90 hover:opacity-100 flex items-center"
            >
              <span>{walletBalances.length} Dompet</span>
              <ChevronRight size={12} />
            </button>
          </div>

          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            {formatRupiah(totalBalance)}
          </p>

          {/* Month Cashflow Pills */}
          <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/30 text-emerald-200">
                <TrendingUp size={14} />
              </div>
              <div>
                <p className="text-[10px] text-emerald-200 uppercase font-medium">Masuk Bulan Ini</p>
                <p className="text-xs font-bold text-white">+{formatRupiah(monthSummary.totalIncome)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/30 text-rose-200">
                <TrendingDown size={14} />
              </div>
              <div>
                <p className="text-[10px] text-rose-200 uppercase font-medium">Keluar Bulan Ini</p>
                <p className="text-xs font-bold text-white">-{formatRupiah(monthSummary.totalExpense)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => onOpenTransactionModal('expense')}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:border-rose-300 dark:hover:border-rose-900/60 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <TrendingDown size={20} />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Pengeluaran
          </span>
        </button>

        <button
          type="button"
          onClick={() => onOpenTransactionModal('income')}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-900/60 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <TrendingUp size={20} />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Pemasukan
          </span>
        </button>

        <button
          type="button"
          onClick={() => onOpenTransactionModal('transfer')}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-900/60 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ArrowLeftRight size={20} />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Transfer
          </span>
        </button>
      </div>

      {/* Savings Summary Banner / Shortcut */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <PiggyBank size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Target Tabungan
              </h3>
              {savingsGoals.length > 0 && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md">
                  {Math.round(savingsPercentage)}%
                </span>
              )}
            </div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
              {formatRupiah(totalSavingsCollected)}
              <span className="text-[10px] font-normal text-slate-400">
                {' '}
                {totalSavingsTarget > 0 ? `/ ${formatRupiah(totalSavingsTarget)}` : `(${savingsGoals.length} target)`}
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('savings')}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-1 shrink-0"
        >
          <span>Buka Tabungan</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Quick Tools Grid: Notes & Calculator */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('notes')}
          className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-all text-left flex items-center gap-3 cursor-pointer group"
        >
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
            <FileText size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              Catatan & Belanja
            </h4>
            <p className="text-[10px] text-slate-400 truncate">Memo, hutang, wishlist</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('calculator')}
          className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs hover:border-emerald-200 dark:hover:border-emerald-800/60 transition-all text-left flex items-center gap-3 cursor-pointer group"
        >
          <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
            <Calculator size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              Kalkulator Cepat
            </h4>
            <p className="text-[10px] text-slate-400 truncate">50/30/20, diskon, split bill</p>
          </div>
        </button>
      </div>

      {/* Budget Alerts Notice */}
      {budgetAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/50 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={15} />
              <span>Perhatian Anggaran Bulan Ini</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('budgets')}
              className="text-[11px] font-semibold underline"
            >
              Lihat Semua
            </button>
          </div>
          <div className="space-y-1.5">
            {budgetAlerts.slice(0, 2).map((b) => (
              <div
                key={b.budget.id}
                className="flex items-center justify-between text-xs py-1 text-slate-600 dark:text-slate-300"
              >
                <span>{b.category.name}</span>
                <span className="font-semibold text-rose-500">
                  {Math.round(b.percentage)}% ({formatRupiah(b.spent)})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5 Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            5 Transaksi Terakhir
          </h2>
          {recentTransactions.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              <span>Semua Riwayat</span>
              <ArrowUpRight size={14} />
            </button>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <EmptyState
            icon="Receipt"
            title="Belum Ada Transaksi"
            description="Tekan tombol di atas untuk mencatat transaksi keuangan pertama Anda."
            actionLabel="+ Catat Transaksi"
            onAction={() => onOpenTransactionModal('expense')}
          />
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx: Transaction) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                category={catMap.get(tx.categoryId)}
                sourceWallet={walletMap.get(tx.walletId)}
                destWallet={tx.toWalletId ? walletMap.get(tx.toWalletId) : undefined}
                onEdit={onEditTransaction}
              />
            ))}
          </div>
        )}
      </div>

      {/* Support / Donation Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 border border-rose-500/20 dark:border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500 text-white shrink-0 shadow-sm">
            <Heart size={18} className="fill-current animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Suka dengan DompetKu?</span>
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Aplikasi ini 100% gratis & tanpa iklan. Dukung Farel Rizky P lewat donasi seikhlasnya.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsDonationModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 active:scale-95 text-white text-xs font-bold shrink-0 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Heart size={13} className="fill-current" />
          <span>Donasi QRIS</span>
        </button>
      </div>

      {/* PWA Guide Modal */}
      <PwaInstallModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        isIOS={isIOS}
        isAndroid={isAndroid}
        onNativeInstall={installApp}
      />

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </div>
  );
};
