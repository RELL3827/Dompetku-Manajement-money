import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getInstallments } from '../db/services';
import { InstallmentCard } from '../components/installments/InstallmentCard';
import { InstallmentFormModal } from '../components/installments/InstallmentFormModal';
import { InstallmentSimulatorModal } from '../components/installments/InstallmentSimulatorModal';
import { EmptyState } from '../components/common/EmptyState';
import { formatRupiah } from '../utils/currency';
import {
  CreditCard,
  Plus,
  Calculator,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import type { Installment, Wallet } from '../types';

interface InstallmentsPageProps {
  onOpenTransactionModal?: () => void;
}

export const InstallmentsPage: React.FC<InstallmentsPageProps> = () => {
  const [installmentsList, setInstallmentsList] = useState<Installment[]>([]);
  const [filterTab, setFilterTab] = useState<'active' | 'completed' | 'all'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [installmentToEdit, setInstallmentToEdit] = useState<Installment | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [presetFromSimulator, setPresetFromSimulator] = useState<{
    name: string;
    totalAmount: number;
    monthlyAmount: number;
    totalMonths: number;
    interestRate: number;
  } | null>(null);

  // Reactive Dexie queries
  const wallets = useLiveQuery(() => db.wallets.toArray()) || [];
  const installmentsTrigger = useLiveQuery(() => db.installments.toArray());
  const settingsRecord = useLiveQuery(() => db.settings.get('app_settings'));

  const walletMap = useMemo(() => new Map(wallets.map((w: Wallet) => [w.id, w])), [wallets]);
  const monthlyIncome = settingsRecord?.value?.monthlyIncomeTarget || 0;

  const loadData = async () => {
    const all = await getInstallments(true);
    setInstallmentsList(all);
  };

  useEffect(() => {
    loadData();
  }, [installmentsTrigger]);

  // Aggregate Metrics
  const activeInstallments = installmentsList.filter((i) => !i.isCompleted);
  const completedInstallments = installmentsList.filter((i) => i.isCompleted);

  // Total Sisa Hutang
  const totalRemainingDebt = activeInstallments.reduce((sum, i) => {
    const remaining = Math.max(0, i.totalAmount - i.paidMonths * i.monthlyAmount);
    return sum + remaining;
  }, 0);

  // Total Beban Cicilan Per Bulan
  const totalMonthlyBill = activeInstallments.reduce((sum, i) => sum + i.monthlyAmount, 0);

  // Status Bulan Berjalan
  const currentMonthYearStr = new Date().toISOString().slice(0, 7);
  const paidThisMonthCount = activeInstallments.filter((i) =>
    i.payments.some((p) => p.paidAt.startsWith(currentMonthYearStr))
  ).length;

  // Debt Service Ratio (DSR)
  const dsrPercentage = monthlyIncome > 0 ? (totalMonthlyBill / monthlyIncome) * 100 : 0;

  const categoriesPresent = useMemo(() => {
    const cats = new Set(installmentsList.map((i) => i.category).filter(Boolean));
    return Array.from(cats);
  }, [installmentsList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return installmentsList.filter((i) => {
      // Tab filter
      if (filterTab === 'active' && i.isCompleted) return false;
      if (filterTab === 'completed' && !i.isCompleted) return false;

      // Category filter
      if (selectedCategory !== 'all' && i.category !== selectedCategory) return false;

      return true;
    });
  }, [installmentsList, filterTab, selectedCategory]);

  // Handlers
  const handleOpenAdd = () => {
    setInstallmentToEdit(null);
    setPresetFromSimulator(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (inst: Installment) => {
    setInstallmentToEdit(inst);
    setPresetFromSimulator(null);
    setIsFormModalOpen(true);
  };

  const handleApplySimulator = (data: {
    name: string;
    totalAmount: number;
    monthlyAmount: number;
    totalMonths: number;
    interestRate: number;
  }) => {
    setInstallmentToEdit(null);
    setPresetFromSimulator(data);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="text-emerald-500" size={22} />
            <span>Cicilan & Tagihan Rutin</span>
          </h1>
          <p className="text-xs text-slate-500">
            Pantau beban cicilan bulanan, sisa hutang, dan tanggal jatuh tempo secara disiplin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold transition-all shadow-xs"
          >
            <Calculator size={14} className="text-indigo-500" />
            <span>Simulasi Cicilan</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus size={15} />
            <span>+ Tambah Cicilan</span>
          </button>
        </div>
      </div>

      {/* Hero KPI Summary Dashboard */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-700 via-purple-800 to-slate-950 text-white shadow-xl shadow-indigo-700/15 relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-indigo-200 font-semibold flex items-center gap-1.5">
              <CreditCard size={14} /> Total Sisa Hutang Cicilan
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              {formatRupiah(totalRemainingDebt)}
            </p>
            <p className="text-[11px] text-indigo-200/80 mt-0.5">
              dari {activeInstallments.length} cicilan aktif yang sedang berjalan
            </p>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-4">
            <span className="text-xs text-indigo-200 font-semibold block">
              Beban Cicilan Bulan Ini
            </span>
            <p className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1 text-emerald-300">
              {formatRupiah(totalMonthlyBill)}
              <span className="text-xs text-white/70 font-normal"> / bln</span>
            </p>
            <p className="text-[11px] text-indigo-200/80 mt-0.5">
              {paidThisMonthCount} dari {activeInstallments.length} cicilan bulan ini lunas
            </p>
          </div>
        </div>

        {/* Debt Service Ratio (DSR) Indicator */}
        {monthlyIncome > 0 && (
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-indigo-100">
              <TrendingUp size={13} />
              <span>Rasio Cicilan terhadap Gaji (DSR): <strong>{Math.round(dsrPercentage)}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  dsrPercentage <= 30
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : dsrPercentage <= 40
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                }`}
              >
                {dsrPercentage <= 30
                  ? 'Kondisi Sehat (< 30%)'
                  : dsrPercentage <= 40
                  ? 'Waspada (30 - 40%)'
                  : 'Bahaya / Terlalu Tinggi (> 40%)'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit shadow-xs">
          <button
            type="button"
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterTab === 'active'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Sedang Berjalan ({activeInstallments.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
              filterTab === 'completed'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Lunas ({completedInstallments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterTab === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Semua ({installmentsList.length})
          </button>
        </div>

        {/* Category Pills if more than 1 category */}
        {categoriesPresent.length > 1 && (
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Semua Kategori
            </button>
            {categoriesPresent.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Installments Grid */}
      {filteredList.length === 0 ? (
        <EmptyState
          icon="CreditCard"
          title={
            filterTab === 'completed'
              ? 'Belum Ada Cicilan Lunas'
              : 'Belum Ada Cicilan yang Dicatat'
          }
          description={
            filterTab === 'completed'
              ? 'Lunasi pembayaran cicilan setiap bulan agar status cicilan berpindah ke lunas.'
              : 'Catat cicilan motor, gadget, pinjaman, KPR, atau paylater Anda. Dilengkapi pengingat jatuh tempo bulanan dan ceklist pembayaran yang teratur.'
          }
          actionLabel={filterTab !== 'completed' ? '+ Tambah Cicilan Pertama' : undefined}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((inst) => (
            <InstallmentCard
              key={inst.id}
              installment={inst}
              associatedWallet={inst.walletId ? walletMap.get(inst.walletId) : undefined}
              onEdit={handleEdit}
              onDeleted={loadData}
              onRefresh={loadData}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <InstallmentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        installmentToEdit={installmentToEdit}
        initialPreset={presetFromSimulator}
        onSaved={loadData}
      />

      {/* Simulator Modal */}
      <InstallmentSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onApplyToNewInstallment={handleApplySimulator}
      />
    </div>
  );
};