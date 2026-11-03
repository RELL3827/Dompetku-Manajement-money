import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getSavings, getSharedSavings, getInstallmentSavings } from '../db/services';
import { SavingGoalCard } from '../components/savings/SavingGoalCard';
import { SavingGoalFormModal } from '../components/savings/SavingGoalFormModal';
import { DepositWithdrawModal } from '../components/savings/DepositWithdrawModal';
import { SharedSavingCard } from '../components/savings/SharedSavingCard';
import { SharedSavingFormModal } from '../components/savings/SharedSavingFormModal';
import { InstallmentSavingCard } from '../components/installments/InstallmentSavingCard';
import { InstallmentSavingFormModal } from '../components/installments/InstallmentSavingFormModal';
import { EmptyState } from '../components/common/EmptyState';
import { formatRupiah } from '../utils/currency';
import {
  Plus,
  PiggyBank,
  Trophy,
  Sparkles,
  Users,
  UserCheck,
  Coins,
} from 'lucide-react';
import type { SavingGoal, SharedSaving, InstallmentSaving, Wallet } from '../types';

export const SavingsPage: React.FC = () => {
  // Tab switcher: Personal Savings vs Tabungan Cicilan vs Nabung Bersama
  const [savingsType, setSavingsType] = useState<'personal' | 'installment' | 'shared'>('personal');

  // Filter tabs for active/completed/all
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('active');

  // Personal Savings States
  const [savingsList, setSavingsList] = useState<SavingGoal[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingGoal | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoalForAction, setSelectedGoalForAction] = useState<SavingGoal | null>(null);
  const [actionModalMode, setActionModalMode] = useState<'deposit' | 'withdraw'>('deposit');

  // Installment Savings States (Tabungan Cicilan)
  const [installmentSavingsList, setInstallmentSavingsList] = useState<InstallmentSaving[]>([]);
  const [isInstallmentFormModalOpen, setIsInstallmentFormModalOpen] = useState(false);
  const [installmentSavingToEdit, setInstallmentSavingToEdit] = useState<InstallmentSaving | null>(null);

  // Shared Savings States
  const [sharedSavingsList, setSharedSavingsList] = useState<SharedSaving[]>([]);
  const [isSharedFormModalOpen, setIsSharedFormModalOpen] = useState(false);
  const [sharedSavingToEdit, setSharedSavingToEdit] = useState<SharedSaving | null>(null);

  // Reactive live queries
  const wallets = useLiveQuery(() => db.wallets.toArray()) || [];
  const savingsTrigger = useLiveQuery(() => db.savings.toArray());
  const sharedSavingsTrigger = useLiveQuery(() => db.sharedSavings.toArray());
  const installmentTrigger = useLiveQuery(() => db.installments.toArray());
  const txTrigger = useLiveQuery(() => db.transactions.toArray());

  const walletMap = useMemo(() => new Map(wallets.map((w: Wallet) => [w.id, w])), [wallets]);

  // Load personal savings
  const loadSavings = async () => {
    const all = await getSavings(true);
    setSavingsList(all);
  };

  // Load installment savings
  const loadInstallmentSavings = async () => {
    const all = await getInstallmentSavings(true);
    setInstallmentSavingsList(all);
  };

  // Load shared savings
  const loadSharedSavings = async () => {
    const all = await getSharedSavings(true);
    setSharedSavingsList(all);
  };

  useEffect(() => {
    loadSavings();
  }, [savingsTrigger, txTrigger]);

  useEffect(() => {
    loadInstallmentSavings();
  }, [installmentTrigger, txTrigger]);

  useEffect(() => {
    loadSharedSavings();
  }, [sharedSavingsTrigger]);

  // Personal Savings Calculations
  const totalCurrentSavings = savingsList.reduce((sum, s) => sum + s.currentAmount, 0);
  const totalTargetSavings = savingsList.reduce((sum, s) => sum + s.targetAmount, 0);
  const completedCount = savingsList.filter((s) => s.isCompleted || s.currentAmount >= s.targetAmount).length;
  const overallPercentage = totalTargetSavings > 0 ? (totalCurrentSavings / totalTargetSavings) * 100 : 0;

  // Installment Savings Calculations
  const totalInstallmentCollected = installmentSavingsList.reduce((sum, s) => sum + s.currentAmount, 0);
  const totalInstallmentTarget = installmentSavingsList.reduce((sum, s) => sum + s.targetAmount, 0);
  const installmentCompletedCount = installmentSavingsList.filter(
    (s) => s.isCompleted || s.currentAmount >= s.targetAmount
  ).length;
  const installmentOverallPercentage = totalInstallmentTarget > 0 ? (totalInstallmentCollected / totalInstallmentTarget) * 100 : 0;
  const totalPaidInstallments = installmentSavingsList.reduce((sum, s) => sum + s.paidInstallments, 0);
  const totalAllInstallments = installmentSavingsList.reduce((sum, s) => sum + s.totalInstallments, 0);

  // Shared Savings Calculations
  const totalSharedCollected = sharedSavingsList.reduce((sum, s) => sum + s.currentAmount, 0);
  const totalSharedTarget = sharedSavingsList.reduce((sum, s) => sum + s.targetAmount, 0);
  const sharedCompletedCount = sharedSavingsList.filter(
    (s) => s.isCompleted || s.currentAmount >= s.targetAmount
  ).length;
  const sharedOverallPercentage = totalSharedTarget > 0 ? (totalSharedCollected / totalSharedTarget) * 100 : 0;
  const totalMembersCount = sharedSavingsList.reduce((sum, s) => sum + s.members.length, 0);
  const totalPaidMembersCount = sharedSavingsList.reduce(
    (sum, s) => sum + s.members.filter((m) => m.isPaid || m.currentAmount >= m.targetAmount).length,
    0
  );

  // Filtered Personal Goals
  const filteredGoals = useMemo(() => {
    if (filterTab === 'active') {
      return savingsList.filter((s) => !s.isCompleted && s.currentAmount < s.targetAmount);
    }
    if (filterTab === 'completed') {
      return savingsList.filter((s) => s.isCompleted || s.currentAmount >= s.targetAmount);
    }
    return savingsList;
  }, [savingsList, filterTab]);

  // Filtered Installment Savings
  const filteredInstallmentSavings = useMemo(() => {
    if (filterTab === 'active') {
      return installmentSavingsList.filter((s) => !s.isCompleted && s.currentAmount < s.targetAmount);
    }
    if (filterTab === 'completed') {
      return installmentSavingsList.filter((s) => s.isCompleted || s.currentAmount >= s.targetAmount);
    }
    return installmentSavingsList;
  }, [installmentSavingsList, filterTab]);

  // Filtered Shared Goals
  const filteredSharedSavings = useMemo(() => {
    if (filterTab === 'active') {
      return sharedSavingsList.filter((s) => !s.isCompleted && s.currentAmount < s.targetAmount);
    }
    if (filterTab === 'completed') {
      return sharedSavingsList.filter((s) => s.isCompleted || s.currentAmount >= s.targetAmount);
    }
    return sharedSavingsList;
  }, [sharedSavingsList, filterTab]);

  // Handlers Personal
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

  // Handlers Installment Savings
  const handleOpenAddInstallment = () => {
    setInstallmentSavingToEdit(null);
    setIsInstallmentFormModalOpen(true);
  };

  const handleEditInstallment = (saving: InstallmentSaving) => {
    setInstallmentSavingToEdit(saving);
    setIsInstallmentFormModalOpen(true);
  };

  // Handlers Shared
  const handleOpenAddShared = () => {
    setSharedSavingToEdit(null);
    setIsSharedFormModalOpen(true);
  };

  const handleEditShared = (saving: SharedSaving) => {
    setSharedSavingToEdit(saving);
    setIsSharedFormModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
      {/* Category Type Switcher (Pribadi vs Tabungan Cicilan vs Nabung Bersama) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl w-fit flex-wrap">
        <button
          type="button"
          onClick={() => setSavingsType('personal')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            savingsType === 'personal'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <PiggyBank size={15} />
          <span>Tabungan Bebas</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              savingsType === 'personal'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-200/70 dark:bg-slate-700 text-slate-500'
            }`}
          >
            {savingsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSavingsType('installment')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            savingsType === 'installment'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Coins size={15} />
          <span>Tabungan Cicilan</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              savingsType === 'installment'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-200/70 dark:bg-slate-700 text-slate-500'
            }`}
          >
            {installmentSavingsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSavingsType('shared')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            savingsType === 'shared'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Users size={15} />
          <span>Nabung Bersama</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              savingsType === 'shared'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-200/70 dark:bg-slate-700 text-slate-500'
            }`}
          >
            {sharedSavingsList.length}
          </span>
        </button>
      </div>

      {savingsType === 'personal' && (
        <>
          {/* Personal Header bar */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PiggyBank className="text-emerald-500" size={22} />
                <span>Target Tabungan Bebas</span>
              </h1>
              <p className="text-xs text-slate-500">
                Kumpulkan dana impian Anda secara fleksibel, setor dan tarik kapan saja
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
        </>
      )}

      {savingsType === 'installment' && (
        <>
          {/* Tabungan Cicilan Header bar */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Coins className="text-emerald-500" size={22} />
                <span>Tabungan Cicilan (Menabung Berkala)</span>
              </h1>
              <p className="text-xs text-slate-500">
                Menabung dengan skema cicilan setoran teratur (bulanan/mingguan) lengkap dengan ceklist setoran
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddInstallment}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Plus size={15} />
              <span>+ Buat Tabungan Cicilan</span>
            </button>
          </div>

          {/* Installment KPI Summary Hero */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white shadow-xl shadow-emerald-700/15 relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between text-xs text-emerald-100">
                <span className="font-semibold flex items-center gap-1.5">
                  <Sparkles size={14} /> Total Tabungan Cicilan Terkumpul
                </span>
                <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full">
                  {totalPaidInstallments} dari {totalAllInstallments} cicilan disetor
                </span>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {formatRupiah(totalInstallmentCollected)}
                </p>
                <p className="text-xs text-emerald-100/80 mt-0.5">
                  dari total target {formatRupiah(totalInstallmentTarget)} ({Math.round(installmentOverallPercentage)}%)
                </p>
              </div>

              <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${Math.min(100, installmentOverallPercentage)}%` }}
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
              Sedang Berjalan ({installmentSavingsList.filter((s) => !s.isCompleted && s.currentAmount < s.targetAmount).length})
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
              <span>Tercapai ({installmentCompletedCount})</span>
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
              Semua ({installmentSavingsList.length})
            </button>
          </div>

          {/* Installment Savings Grid */}
          {filteredInstallmentSavings.length === 0 ? (
            <EmptyState
              icon="Coins"
              title={
                filterTab === 'completed'
                  ? 'Belum Ada Tabungan Cicilan Tercapai'
                  : 'Belum Ada Tabungan Cicilan'
              }
              description={
                filterTab === 'completed'
                  ? 'Terus menabung secara konsisten setiap cicilan untuk menyelesaikan target Anda.'
                  : 'Mulai menabung dengan skema cicilan: misalnya Tabungan Qurban, Beli Gadget Impian, Dana Darurat, atau Liburan. Terdapat ceklist setoran tiap kali menabung!'
              }
              actionLabel={filterTab !== 'completed' ? '+ Buat Tabungan Cicilan Pertama' : undefined}
              onAction={handleOpenAddInstallment}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInstallmentSavings.map((s) => (
                <InstallmentSavingCard
                  key={s.id}
                  saving={s}
                  associatedWallet={s.walletId ? walletMap.get(s.walletId) : undefined}
                  onEdit={handleEditInstallment}
                  onDeleted={loadInstallmentSavings}
                  onRefresh={loadInstallmentSavings}
                />
              ))}
            </div>
          )}
        </>
      )}

      {savingsType === 'shared' && (
        <>
          {/* Nabung Bersama Header bar */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="text-emerald-500" size={22} />
                <span>Nabung Bersama / Patungan</span>
              </h1>
              <p className="text-xs text-slate-500">
                Kelola kas bersama, liburan bareng & arisan dengan ceklist pembayaran per anggota
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddShared}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Plus size={15} />
              <span>+ Buat Nabung Bersama</span>
            </button>
          </div>

          {/* Shared KPI Summary Hero */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-teal-700 via-emerald-800 to-slate-950 text-white shadow-xl shadow-teal-700/15 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between text-xs text-teal-100">
                <span className="font-semibold flex items-center gap-1.5">
                  <UserCheck size={14} /> Total Kas Bersama Terkumpul
                </span>
                <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full">
                  {totalPaidMembersCount} dari {totalMembersCount} iuran anggota lunas
                </span>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {formatRupiah(totalSharedCollected)}
                </p>
                <p className="text-xs text-teal-100/80 mt-0.5">
                  dari total target patungan {formatRupiah(totalSharedTarget)} ({Math.round(sharedOverallPercentage)}%)
                </p>
              </div>

              <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, sharedOverallPercentage)}%` }}
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
              Sedang Berjalan ({sharedSavingsList.filter((s) => !s.isCompleted && s.currentAmount < s.targetAmount).length})
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
              <span>Tercapai ({sharedCompletedCount})</span>
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
              Semua ({sharedSavingsList.length})
            </button>
          </div>

          {/* Shared Savings Grid */}
          {filteredSharedSavings.length === 0 ? (
            <EmptyState
              icon="Users"
              title={filterTab === 'completed' ? 'Belum Ada Tabungan Bersama Tercapai' : 'Belum Ada Tabungan Bersama'}
              description={
                filterTab === 'completed'
                  ? 'Ajak teman dan anggota keluarga untuk melunasi iuran bersama.'
                  : 'Buat tabungan patungan untuk liburan bareng kawan, kado pernikahan sahabat, arisan keluarga, atau kas komunitas. Lengkap dengan ceklist pelunasan tiap anggota dan share ke WhatsApp!'
              }
              actionLabel={filterTab !== 'completed' ? '+ Buat Nabung Bersama' : undefined}
              onAction={handleOpenAddShared}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSharedSavings.map((saving) => (
                <SharedSavingCard
                  key={saving.id}
                  saving={saving}
                  associatedWallet={saving.walletId ? walletMap.get(saving.walletId) : undefined}
                  onEdit={handleEditShared}
                  onDeleted={loadSharedSavings}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Personal Saving Goal Create/Edit Modal */}
      <SavingGoalFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        goalToEdit={goalToEdit}
        onSaved={loadSavings}
      />

      {/* Personal Deposit / Withdraw Action Modal */}
      <DepositWithdrawModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        goal={selectedGoalForAction}
        defaultMode={actionModalMode}
        onSuccess={loadSavings}
      />

      {/* Installment Saving Create/Edit Modal */}
      <InstallmentSavingFormModal
        isOpen={isInstallmentFormModalOpen}
        onClose={() => setIsInstallmentFormModalOpen(false)}
        savingToEdit={installmentSavingToEdit}
        onSaved={loadInstallmentSavings}
      />

      {/* Shared Saving Create/Edit Modal */}
      <SharedSavingFormModal
        isOpen={isSharedFormModalOpen}
        onClose={() => setIsSharedFormModalOpen(false)}
        savingToEdit={sharedSavingToEdit}
        onSaved={loadSharedSavings}
      />
    </div>
  );
};