import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getFilteredTransactions } from '../db/services';
import { TransactionList } from '../components/transaction/TransactionList';
import { useDebounce } from '../hooks/useDebounce';
import { getPeriodDateRange, toLocalISODate } from '../utils/date';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import type {
  Transaction,
  TransactionFilters,
  TransactionType,
  PeriodFilter,
  SortOrder,
  Wallet,
  Category,
} from '../types';

interface TransactionsPageProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenAddModal,
  onEditTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [walletFilter, setWalletFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState(toLocalISODate());
  const [minAmount, setMinAmount] = useState<number | undefined>(undefined);
  const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder>('date_desc');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 250);

  // Live queries for wallets & categories
  const wallets = useLiveQuery(() => db.wallets.toArray()) || [];
  const categories = useLiveQuery(() => db.categories.toArray()) || [];
  const allTxTrigger = useLiveQuery(() => db.transactions.toArray());

  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

  // Construct query filters
  useEffect(() => {
    async function fetchFiltered() {
      let startDate: string | undefined;
      let endDate: string | undefined;

      if (periodFilter === 'custom') {
        startDate = customStartDate || undefined;
        endDate = customEndDate || undefined;
      } else if (periodFilter !== 'all') {
        const range = getPeriodDateRange(periodFilter);
        startDate = range.startDate;
        endDate = range.endDate;
      }

      const filters: TransactionFilters = {
        searchQuery: debouncedSearch,
        type: typeFilter,
        walletId: walletFilter,
        categoryId: categoryFilter,
        period: periodFilter,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        sort: sortOrder,
      };

      const results = await getFilteredTransactions(filters);
      setFilteredTransactions(results);
    }

    fetchFiltered();
  }, [
    debouncedSearch,
    typeFilter,
    walletFilter,
    categoryFilter,
    periodFilter,
    customStartDate,
    customEndDate,
    minAmount,
    maxAmount,
    sortOrder,
    allTxTrigger,
  ]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== 'all') count++;
    if (walletFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (periodFilter !== 'all') count++;
    if (minAmount || maxAmount) count++;
    if (sortOrder !== 'date_desc') count++;
    return count;
  }, [typeFilter, walletFilter, categoryFilter, periodFilter, minAmount, maxAmount, sortOrder]);

  const handleResetFilters = () => {
    setTypeFilter('all');
    setWalletFilter('all');
    setCategoryFilter('all');
    setPeriodFilter('all');
    setCustomStartDate('');
    setCustomEndDate(toLocalISODate());
    setMinAmount(undefined);
    setMaxAmount(undefined);
    setSortOrder('date_desc');
    setSearchQuery('');
  };

  return (
    <div className="space-y-4 pb-24 md:pb-8 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Riwayat Transaksi
          </h1>
          <p className="text-xs text-slate-500">
            Ditemukan {filteredTransactions.length} transaksi
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
            activeFilterCount > 0
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search size={16} className="absolute left-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari transaksi berdasarkan catatan atau keterangan..."
          className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500 shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Hapus kata kunci pencarian"
            className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Quick Type Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(['all', 'expense', 'income', 'transfer'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              typeFilter === t
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {t === 'all'
              ? 'Semua'
              : t === 'expense'
              ? 'Pengeluaran'
              : t === 'income'
              ? 'Pemasukan'
              : 'Transfer'}
          </button>
        ))}
      </div>

      {/* Expanded Filter Panel */}
      {showFilterDrawer && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Filter size={14} /> Filter Lengkap
            </span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-rose-500 hover:underline"
              >
                Reset Semua
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Dompet Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Dompet
              </label>
              <select
                value={walletFilter}
                onChange={(e) => setWalletFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">Semua Dompet</option>
                {wallets.map((w: Wallet) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Kategori Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Kategori
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((c: Category) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type === 'income' ? 'Masuk' : 'Keluar'})
                  </option>
                ))}
              </select>
            </div>

            {/* Periode Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Periode Waktu
              </label>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">Semua Waktu</option>
                <option value="this_week">Minggu Ini</option>
                <option value="this_month">Bulan Ini</option>
                <option value="last_3_months">3 Bulan Terakhir</option>
                <option value="this_year">Tahun Ini</option>
                <option value="custom">Rentang Tanggal Kustom</option>
              </select>
            </div>

            {/* Urutan (Sort) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Urutkan Berdasarkan
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="date_desc">Tanggal Terbaru</option>
                <option value="date_asc">Tanggal Terlama</option>
                <option value="amount_desc">Nominal Tertinggi</option>
                <option value="amount_asc">Nominal Terendah</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range if selected */}
          {periodFilter === 'custom' && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Mulai Tanggal</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Sampai Tanggal</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction List */}
      <TransactionList
        transactions={filteredTransactions}
        categories={categories}
        wallets={wallets}
        onEdit={onEditTransaction}
        onAddNew={onOpenAddModal}
      />
    </div>
  );
};
