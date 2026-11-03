import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getInstallmentSavings } from '../db/services';
import { InstallmentSavingCard } from '../components/installments/InstallmentSavingCard';
import { InstallmentSavingFormModal } from '../components/installments/InstallmentSavingFormModal';
import { EmptyState } from '../components/common/EmptyState';
import { formatRupiah } from '../utils/currency';
import {
  Coins,
  Plus,
  Sparkles,
  Trophy,
} from 'lucide-react';
import type { InstallmentSaving, Wallet } from '../types';

interface InstallmentsPageProps {
  onOpenTransactionModal?: () => void;
}

export const InstallmentsPage: React.FC<InstallmentsPageProps> = () => {
  const [savingsList, setSavingsList] = useState<InstallmentSaving[]>([]);
  const [filterTab, setFilterTab] = useState<'active' | 'completed' | 'all'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [savingToEdit, setSavingToEdit] = useState<InstallmentSaving | null>(null);

  // Reactive Dexie queries
  const wallets = useLiveQuery(() => db.wallets.toArray()) || [];
  const installmentsTrigger = useLiveQuery(() => db.installments.toArray());

  const walletMap = useMemo(() => new Map(wallets.map((w: Wallet) => [w.id, w])), [wallets]);

  const loadData = async () => {
    const all = await getInstallmentSavings(true);
    setSavingsList(all);
  };

  useEffect(() => {
    loadData();
  }, [installmentsTrigger]);

  // Aggregate Metrics
  const activeSavings = savingsList.filter((s) => !s.isCompleted);
  const completedSavings = savingsList.filter((s) => s.isCompleted);

  const totalCollected = savingsList.reduce((sum, s) => sum + s.currentAmount, 0);
  const totalTarget = savingsList.reduce((sum, s) => sum + s.targetAmount, 0);
  const overallPercentage = totalTarget > 0 ? (totalCollected / totalTarget) * 100 : 0;

  const totalPaidInstallments = savingsList.reduce((sum, s) => sum + s.paidInstallments, 0);
  const totalAllInstallments = savingsList.reduce((sum, s) => sum + s.totalInstallments, 0);

  // Categories present
  const categoriesPresent = useMemo(() => {
    const cats = new Set(savingsList.map((s) => s.category).filter(Boolean));
    return Array.from(cats);
  }, [savingsList]);

  // Filtered List
  const filteredList = useMemo(() => {
    return savingsList.filter((s) => {
      if (filterTab === 'active' && s.isCompleted) return false;
      if (filterTab === 'completed' && !s.isCompleted) return false;
      if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
      return true;
    });
  }, [savingsList, filterTab, selectedCategory]);

  const handleOpenAdd = () => {
    setSavingToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (saving: InstallmentSaving) => {
    setSavingToEdit(saving);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Coins className="text-emerald-500" size={22} />
            <span>Tabungan Cicilan (Menabung Berkala)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Nabung secara berkala dengan target cicilan per periode & ceklist setoran
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs shadow-emerald-600/20 active:scale-95 transition-all w-fit"
        >
          <Plus size={15} />
          <span>+ Buat Tabungan Cicilan</span>
        </button>
      </div>

      {/* Hero KPI Summary Dashboard */}
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
              {formatRupiah(totalCollected)}
            </p>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              dari total target {formatRupiah(totalTarget)} ({Math.round(overallPercentage)}%)
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
      <div className="flex flex-wrap items-center justify-between gap-3">
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
            Sedang Berjalan ({activeSavings.length})
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
            <span>Tercapai ({completedSavings.length})</span>
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

        {/* Category Pills */}
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
              Semua
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

      {/* Grid */}
      {filteredList.length === 0 ? (
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
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((s) => (
            <InstallmentSavingCard
              key={s.id}
              saving={s}
              associatedWallet={s.walletId ? walletMap.get(s.walletId) : undefined}
              onEdit={handleEdit}
              onDeleted={loadData}
              onRefresh={loadData}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <InstallmentSavingFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        savingToEdit={savingToEdit}
        onSaved={loadData}
      />
    </div>
  );
};