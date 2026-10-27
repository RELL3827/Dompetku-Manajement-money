import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import {
  getAllBudgetStatuses,
  getBudget503020Summary,
  type BudgetStatusInfo,
} from '../db/services';
import { BudgetCard } from '../components/budget/BudgetCard';
import { BudgetFormModal } from '../components/budget/BudgetFormModal';
import { Budget503020Modal } from '../components/budget/Budget503020Modal';
import { Budget503020View } from '../components/budget/Budget503020View';
import { EmptyState } from '../components/common/EmptyState';
import { formatRupiah } from '../utils/currency';
import { getCurrentYearMonth } from '../utils/date';
import { Plus, PiggyBank, Sparkles, LayoutGrid } from 'lucide-react';
import type { Budget, Budget503020Summary, NavTab } from '../types';

interface BudgetsPageProps {
  onNavigate?: (tab: NavTab) => void;
}

export const BudgetsPage: React.FC<BudgetsPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'503020' | 'categories'>('503020');
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatusInfo[]>([]);
  const [summary503020, setSummary503020] = useState<Budget503020Summary | null>(null);

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const [is503020ModalOpen, setIs503020ModalOpen] = useState(false);

  // Trigger query on database changes
  const txTrigger = useLiveQuery(() => db.transactions.toArray());
  const budgetTrigger = useLiveQuery(() => db.budgets.toArray());
  const settingsTrigger = useLiveQuery(() => db.settings.get('app_settings'));

  useEffect(() => {
    async function loadBudgets() {
      const ym = getCurrentYearMonth();
      const [statuses, sum503020] = await Promise.all([
        getAllBudgetStatuses(ym),
        getBudget503020Summary(ym),
      ]);
      setBudgetStatuses(statuses);
      setSummary503020(sum503020);
    }
    loadBudgets();
  }, [txTrigger, budgetTrigger, settingsTrigger]);

  const totalMonthlyLimit = budgetStatuses.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpent = budgetStatuses.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = totalMonthlyLimit > 0 ? (totalSpent / totalMonthlyLimit) * 100 : 0;
  const totalRemaining = Math.max(0, totalMonthlyLimit - totalSpent);

  const handleOpenAdd = () => {
    setBudgetToEdit(null);
    setIsCategoryModalOpen(true);
  };

  const handleEdit = (budget: Budget) => {
    setBudgetToEdit(budget);
    setIsCategoryModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Anggaran & Budgeting</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kendalikan pengeluaran bulanan dengan formula 50/30/20 & batas kategori
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIs503020ModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-200/60 dark:border-purple-800/40 active:scale-95 transition-all shadow-xs"
          >
            <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
            <span>Setup 50/30/20</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus size={15} />
            <span>Atur Kategori</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher: Metode 50/30/20 vs Per Kategori */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('503020')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === '503020'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <Sparkles size={14} className="text-purple-500" />
          <span>Metode 50 / 30 / 20</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'categories'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          }`}
        >
          <LayoutGrid size={14} className="text-emerald-500" />
          <span>Anggaran per Kategori ({budgetStatuses.length})</span>
        </button>
      </div>

      {/* Tab 1: Metode 50/30/20 View */}
      {activeTab === '503020' && summary503020 && (
        <Budget503020View
          summary={summary503020}
          onOpenSetup={() => setIs503020ModalOpen(true)}
          onNavigateToSavings={onNavigate ? () => onNavigate('savings') : undefined}
        />
      )}

      {/* Tab 2: Category Budgets View */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Aggregate Budget Hero Card */}
          {budgetStatuses.length > 0 && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <PiggyBank size={16} className="text-emerald-500" />
                  Total Anggaran Gabungan Bulan Ini
                </span>
                <span className="font-bold text-slate-600 dark:text-slate-400">
                  {Math.round(overallPercentage)}% Terpakai
                </span>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-1.5 text-xs">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    {formatRupiah(totalSpent)}
                    <span className="text-xs font-normal text-slate-400">
                      {' '}
                      / {formatRupiah(totalMonthlyLimit)}
                    </span>
                  </span>
                  <span className="text-xs text-slate-500">
                    Sisa:{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(totalRemaining)}
                    </strong>
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      overallPercentage >= 100
                        ? 'bg-rose-500'
                        : overallPercentage >= 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, overallPercentage)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Category Budgets Grid */}
          {budgetStatuses.length === 0 ? (
            <EmptyState
              icon="PiggyBank"
              title="Belum Ada Anggaran Kategori"
              description="Atur batas maksimal pengeluaran bulanan per kategori atau gunakan tombol 'Setup 50/30/20' untuk pembagian otomatis."
              actionLabel="⚡ Atur Otomatis 50/30/20"
              onAction={() => setIs503020ModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgetStatuses.map((status) => (
                <BudgetCard
                  key={status.budget.id}
                  budgetInfo={status}
                  onEdit={handleEdit}
                  onDeleted={() => {
                    // Reactive query will update state
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Category Budget Form Modal */}
      <BudgetFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        budgetToEdit={budgetToEdit}
        onSaved={() => {
          // Live query auto-updates
        }}
      />

      {/* Modal: 50/30/20 Wizard Modal */}
      <Budget503020Modal
        isOpen={is503020ModalOpen}
        onClose={() => setIs503020ModalOpen(false)}
        onSuccess={() => {
          // Live queries auto-update
        }}
        initialIncome={summary503020?.incomeBase}
      />
    </div>
  );
};
