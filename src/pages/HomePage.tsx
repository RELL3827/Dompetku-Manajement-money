import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import {
  getAllWalletBalances,
  getFinancialSummary,
  getAllBudgetStatuses,
  getRecentTransactions,
  deleteTransaction,
  type WalletBalanceInfo,
  type BudgetStatusInfo,
} from '../db/services';
import { formatRupiah } from '../utils/currency';
import { getCurrentYearMonth, getPeriodDateRange } from '../utils/date';
import { shouldShowBackupReminder } from '../utils/exportImport';
import { TransactionItem } from '../components/transaction/TransactionItem';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { PwaInstallBanner } from '../components/common/PwaInstallBanner';
import { PwaInstallModal } from '../components/common/PwaInstallModal';
import { usePwaInstall } from '../hooks/usePwaInstall';
import {
  ArrowUpRight,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  Coffee,
} from 'lucide-react';
import { RealisticIcon } from '../components/common/RealisticIcon';
import { DonationModal } from '../components/common/DonationModal';
import { StreakCard } from '../components/streak/StreakCard';
import { useStreak } from '../hooks/useStreak';
import type { Transaction, NavTab, TransactionType, Category, Wallet as WalletType, SavingGoal, CalendarEvent } from '../types';

interface HomePageProps {
  onNavigate: (tab: NavTab) => void;
  onOpenTransactionModal: (type?: TransactionType) => void;
  onEditTransaction: (tx: Transaction) => void;
  onOpenStreakModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenTransactionModal,
  onEditTransaction,
  onOpenStreakModal,
}) => {
  const streak = useStreak();
  const [walletBalances, setWalletBalances] = useState<WalletBalanceInfo[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetStatusInfo[]>([]);
  const [backupReminder, setBackupReminder] = useState<string | null>(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const handleConfirmDeleteTx = async () => {
    if (!txToDelete) return;
    try {
      await deleteTransaction(txToDelete.id);
      setTxToDelete(null);
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  // PWA installation state
  const { isInstalled, isIOS, isAndroid, showGuideModal, setShowGuideModal, installApp } = usePwaInstall();

  // Live queries for reactive updates
  const recentTransactions = useLiveQuery(() => getRecentTransactions(5)) || [];
  const categories = useLiveQuery(() => db.categories.toArray()) || [];
  const wallets = useLiveQuery(() => db.wallets.toArray()) || [];
  const savingsGoals = useLiveQuery(() => db.savings.toArray()) || [];
  const calendarEvents = useLiveQuery(() => db.calendarEvents.toArray()) || [];
  const installments = useLiveQuery(() => db.installments.toArray()) || [];

  const todayDateStr = new Date().toISOString().slice(0, 10);
  const upcomingEvent = calendarEvents
    .filter((e: CalendarEvent) => e.date >= todayDateStr && !e.isDone)
    .sort((a: CalendarEvent, b: CalendarEvent) => a.date.localeCompare(b.date))[0] || null;

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

  // Unified Savings summary calculation (Personal + Installment Savings)
  const totalPersonalCollected = savingsGoals.reduce((sum, s: SavingGoal) => sum + s.currentAmount, 0);
  const totalInstallmentCollected = installments.reduce((sum: number, i: any) => sum + (i.currentAmount || 0), 0);
  const totalCombinedSavingsCollected = totalPersonalCollected + totalInstallmentCollected;

  const totalPersonalTarget = savingsGoals.reduce((sum, s: SavingGoal) => sum + s.targetAmount, 0);
  const totalInstallmentTarget = installments.reduce((sum: number, i: any) => sum + (i.targetAmount || 0), 0);
  const totalCombinedSavingsTarget = totalPersonalTarget + totalInstallmentTarget;

  const combinedSavingsCount = savingsGoals.length + installments.length;
  const savingsPercentage = totalCombinedSavingsTarget > 0 ? (totalCombinedSavingsCollected / totalCombinedSavingsTarget) * 100 : 0;

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
      <article
        className="relative overflow-hidden rounded-3xl text-white p-6 border border-white/15"
        style={{
          background: 'linear-gradient(135deg var(--in-oklab), #059669 0%, #0f766e 55%, #0f172a 100%)',
          boxShadow: 'var(--shadow-hero)',
        }}
      >
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-10 w-40 h-40 rounded-full bg-teal-300/10 blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-emerald-100 mb-1">
            <span className="font-semibold flex items-center gap-2">
              <span className="p-1 rounded-lg bg-white/15 backdrop-blur-xs">
                <RealisticIcon name="Wallet" size={18} />
              </span>
              Total Saldo Gabungan
            </span>
            <button
              type="button"
              onClick={() => onNavigate('wallets')}
              className="ios-btn text-[11px] font-semibold bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-full flex items-center gap-0.5 backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            >
              <span>{walletBalances.length} Dompet</span>
              <ChevronRight size={12} />
            </button>
          </div>

          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums mt-2 drop-shadow-xs">
            {formatRupiah(totalBalance)}
          </p>

          {/* Month Cashflow Pills */}
          <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/15 text-xs">
            <div className="flex items-center gap-2.5 bg-white/5 px-3 py-2 rounded-2xl border border-white/10 backdrop-blur-xs">
              <div className="p-1 rounded-xl bg-white/10 shrink-0">
                <RealisticIcon name="TrendingUp" size={20} />
              </div>
              <div>
                <p className="text-[10px] text-emerald-200 uppercase font-semibold tracking-wider">Masuk Bulan Ini</p>
                <p className="text-xs font-extrabold text-white tabular-nums">+{formatRupiah(monthSummary.totalIncome)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/5 px-3 py-2 rounded-2xl border border-white/10 backdrop-blur-xs">
              <div className="p-1 rounded-xl bg-white/10 shrink-0">
                <RealisticIcon name="TrendingDown" size={20} />
              </div>
              <div>
                <p className="text-[10px] text-rose-200 uppercase font-semibold tracking-wider">Keluar Bulan Ini</p>
                <p className="text-xs font-extrabold text-white tabular-nums">-{formatRupiah(monthSummary.totalExpense)}</p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => onOpenTransactionModal('expense')}
          className="ios-btn ios-glass-card p-4 flex flex-col items-center justify-center gap-2.5 hover:border-rose-300/80 dark:hover:border-rose-800/70 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/60 dark:to-rose-900/40 border border-rose-200/70 dark:border-rose-800/60 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
            <RealisticIcon name="TrendingDown" size={28} />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Pengeluaran
          </span>
        </button>

        <button
          type="button"
          onClick={() => onOpenTransactionModal('income')}
          className="ios-btn ios-glass-card p-4 flex flex-col items-center justify-center gap-2.5 hover:border-emerald-300/80 dark:hover:border-emerald-800/70 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/60 dark:to-emerald-900/40 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
            <RealisticIcon name="TrendingUp" size={28} />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Pemasukan
          </span>
        </button>

        <button
          type="button"
          onClick={() => onOpenTransactionModal('transfer')}
          className="ios-btn ios-glass-card p-4 flex flex-col items-center justify-center gap-2.5 hover:border-blue-300/80 dark:hover:border-blue-800/70 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/60 dark:to-blue-900/40 border border-blue-200/70 dark:border-blue-800/60 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
            <RealisticIcon name="ArrowLeftRight" size={28} />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Transfer
          </span>
        </button>
      </div>

      {/* TikTok-Style Daily Streak Flame Card */}
      {onOpenStreakModal && (
        <StreakCard
          streak={streak}
          onOpenStreakModal={onOpenStreakModal}
          onOpenAddTransaction={() => onOpenTransactionModal('expense')}
        />
      )}

      {/* Savings Summary Banner / Shortcut */}
      <article className="ios-glass-card p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/40 border border-pink-200/60 dark:border-pink-900/40 flex items-center justify-center shrink-0 shadow-xs">
            <RealisticIcon name="PiggyBank" size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Target Tabungan
              </h3>
              {combinedSavingsCount > 0 && (
                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/80 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/40">
                  {Math.round(savingsPercentage)}%
                </span>
              )}
            </div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
              {formatRupiah(totalCombinedSavingsCollected)}
              <span className="text-[10px] font-normal text-slate-400">
                {' '}
                {totalCombinedSavingsTarget > 0
                  ? `/ ${formatRupiah(totalCombinedSavingsTarget)} (${combinedSavingsCount} target)`
                  : `(${combinedSavingsCount} target)`}
              </span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('savings')}
          className="ios-btn px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center gap-1 shrink-0"
        >
          <span>Buka Tabungan</span>
          <ChevronRight size={14} />
        </button>
      </article>

      {/* Calendar & Agenda Banner (Gajian, Liburan, Tagihan) */}
      <article className="ios-glass-card p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/40 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-center shrink-0 shadow-xs">
            <RealisticIcon name="Calendar" size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Kalender Keuangan
              </h3>
              {upcomingEvent && (
                <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/40">
                  {upcomingEvent.type === 'gajian'
                    ? '💰 Gajian'
                    : upcomingEvent.type === 'liburan'
                    ? '🏖️ Liburan'
                    : '⚡ Tagihan'}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
              {upcomingEvent ? (
                <>
                  <strong className="text-slate-900 dark:text-slate-100">{upcomingEvent.title}</strong>
                  <span className="text-[11px] text-slate-400 font-normal"> ({upcomingEvent.date})</span>
                </>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">Tandai gajian, liburan & tagihan bulanan</span>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('calendar')}
          className="ios-btn px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50/80 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/60 border border-amber-200/70 dark:border-amber-800/50 flex items-center gap-1 shrink-0"
        >
          <span>Buka Kalender</span>
          <ChevronRight size={14} />
        </button>
      </article>

      {/* Quick Tools Grid: Notes & Calculator */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('notes')}
          className="btn-tactile card-elevated p-3.5 text-left flex items-center gap-3 cursor-pointer group hover:border-emerald-300/70 dark:hover:border-emerald-700/60"
        >
          <div className="p-2 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200/50 dark:border-emerald-800/40 group-hover:scale-110 transition-transform shadow-xs">
            <RealisticIcon name="FileText" size={24} />
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
          className="btn-tactile card-elevated p-3.5 text-left flex items-center gap-3 cursor-pointer group hover:border-blue-300/70 dark:hover:border-blue-700/60"
        >
          <div className="p-2 rounded-2xl bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/50 dark:border-blue-800/40 group-hover:scale-110 transition-transform shadow-xs">
            <RealisticIcon name="Calculator" size={24} />
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
          <div className="space-y-2.5">
            {recentTransactions.map((tx: Transaction, idx: number) => (
              <div
                key={tx.id}
                className="stagger-item"
                style={{ '--sibling-index': idx + 1 } as React.CSSProperties}
              >
                <TransactionItem
                  transaction={tx}
                  category={catMap.get(tx.categoryId)}
                  sourceWallet={walletMap.get(tx.walletId)}
                  destWallet={tx.toWalletId ? walletMap.get(tx.toWalletId) : undefined}
                  onEdit={onEditTransaction}
                  onDelete={(t) => setTxToDelete(t)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Support / Traktir Kopi Banner */}
      <article className="card-elevated p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 border-amber-500/25 dark:border-amber-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-600 dark:text-amber-400 shrink-0 shadow-sm">
            <Coffee size={24} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Suka dengan DompetKu?</span>
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Aplikasi ini 100% gratis & tanpa iklan. Dukung Farel Rizky P dengan traktir secangkir kopi.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsDonationModalOpen(true)}
          className="ios-btn px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-600/20"
        >
          <Coffee size={15} />
          <span>Traktir Kopi</span>
        </button>
      </article>

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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={txToDelete !== null}
        onClose={() => setTxToDelete(null)}
        onConfirm={handleConfirmDeleteTx}
        title="Hapus Transaksi"
        message={
          txToDelete
            ? `Apakah Anda yakin ingin menghapus transaksi sebesar ${formatRupiah(txToDelete.amount)}? Data yang dihapus tidak dapat dipulihkan.`
            : ''
        }
        confirmLabel="Ya, Hapus Transaksi"
      />
    </div>
  );
};
