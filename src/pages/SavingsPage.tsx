import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getSavings } from '../db/services';
import { SavingGoalCard } from '../components/savings/SavingGoalCard';
import { SavingGoalFormModal } from '../components/savings/SavingGoalFormModal';
import { DepositWithdrawModal } from '../components/savings/DepositWithdrawModal';
import { EmptyState } from '../components/common/EmptyState';
import { formatRupiah } from '../utils/currency';
import { Plus, PiggyBank, Trophy, Sparkles } from 'lucide-react';
import type { SavingGoal, Wallet } from '../types';

export const SavingsPage: React.FC = () => {
  const [savingsList, setSavingsList] = useState<SavingGoal[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('active');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingGoal | null>(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoalForAction, setSelectedGoalForAction] = useState<SavingGoal | null>(null);
  const [actionModalMode, setActionModalMode] = useState<'deposit' | 'withdraw'>('deposit');

  // Reactive live queries
  const wallets = useLiveQuery(() => db.wallets.toArray()) || [];
  const savingsTrigger = useLiveQuery(() => db.savings.count()) || 0;
  const txTrigger = useLiveQuery(() => db.transactions.count()) || 0;

  const walletMap = useMemo(() => new Map(wallets.map((w: Wallet) => [w.id, w])), [wallets]);

  const loadSavings = async () => {
    const all = await getSavings(true);
    setSavingsList(all);
  };

  useEffect(() => {
    loadSavings();
  }, [savingsTrigger, txTrigger]);

  // Calculations for summary metrics
  const totalCurrentSavings = savingsList.reduce((sum, s) => sum + s.currentAmount, 0);
  const totalTargetSavings = savingsList.reduce((sum, s) => sum + s.targetAmount, 0);
  const completedCount = savingsList.filter((s) => s.isCompleted || s.currentAmount >= s.targetAmount).length;
  const overallPercentage = totalTargetSavings > 0 ? (totalCurrentSavings / totalTargetSavings) * 100 : 0;

  // Filtered goals
  const filteredGoals = useMemo(() => {
    if (filterTab === 'active') {
      return savingsList.filter((s) => !s.isCompleted && s.currentAmount < s.targetAmount);
    }
    if (filterTab === 'completed') {
      return savingsList.filter((s) => s.isCompleted || s.currentAmount >= s.targetAmount);
    }
    return savingsList;
  }, [savingsList, filterTab]);

  const handleOpenAdd = () => {
    setGoalToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (goal: SavingGoal) => {
    setGoalToEdit(goal);
    setIsFormModalOpen(true);
  };

  const handleOpenDeposit = (goal: SavingGoal) => {
    setSelectedGoalForAction(goal);
    setActionModalMode('deposit');
    setIsDepositModalOpen(true);
  };

  const handleOpenWithdraw = (goal: SavingGoal) => {
    setSelectedGoalForAction(goal);
    setActionModalMode('withdraw');
    setIsDepositModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PiggyBank className="text-emerald-500" size={22} />
            <span>Target Tabungan</span>
          </h1>
          <p className="text-xs text-slate-500">
            Kumpulkan dana impian Anda secara disiplin dan terukur
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <Plus size={15} />
          <span>Target Baru</span>
        </button>
      </div>

      {/* Aggregate KPI Summary Hero */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white shadow-xl shadow-emerald-700/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between text-xs text-emerald-100">
            <span className="font-semibold flex items-center gap-1.5">
              <Sparkles size={14} /> Total Tabungan Terkumpul
            </span>
            <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full">
              {completedCount} dari {savingsList.length} tercapai
            </span>
          </div>

          <div>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {formatRupiah(totalCurrentSavings)}
            </p>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              dari total target {formatRupiah(totalTargetSavings)} ({Math.round(overallPercentage)}%)
            </p>
          </div>

          <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${Math.min(100, overallPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit shadow-xs">
        <button
          type="button"
          onClick={() => setFilterTab('active')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterTab === 'active'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Sedang Berjalan ({savingsList.filter((s) => !s.isCompleted && s.currentAmount < s.targetAmount).length})
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('completed')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
            filterTab === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Trophy size={13} />
          <span>Tercapai ({completedCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filterTab === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Semua ({savingsList.length})
        </button>
      </div>

      {/* Savings Grid */}
      {filteredGoals.length === 0 ? (
        <EmptyState
          icon="PiggyBank"
          title={filterTab === 'completed' ? 'Belum Ada Target Tercapai' : 'Belum Ada Target Tabungan'}
          description={
            filterTab === 'completed'
              ? 'Terus menabung secara konsisten untuk menyelesaikan target impian Anda.'
              : 'Buat target tabungan pertama Anda, misalnya untuk Dana Darurat, Liburan, atau Beli Gadget Impian.'
          }
          actionLabel={filterTab !== 'completed' ? '+ Buat Target Tabungan' : undefined}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => (
            <SavingGoalCard
              key={goal.id}
              goal={goal}
              associatedWallet={goal.walletId ? walletMap.get(goal.walletId) : undefined}
              onEdit={handleEdit}
              onDeposit={handleOpenDeposit}
              onWithdraw={handleOpenWithdraw}
              onDeleted={loadSavings}
            />
          ))}
        </div>
      )}

      {/* Saving Goal Create/Edit Modal */}
      <SavingGoalFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        goalToEdit={goalToEdit}
        onSaved={loadSavings}
      />

      {/* Deposit / Withdraw Action Modal */}
      <DepositWithdrawModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        goal={selectedGoalForAction}
        defaultMode={actionModalMode}
        onSuccess={loadSavings}
      />
    </div>
  );
};
