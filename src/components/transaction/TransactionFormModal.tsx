import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CurrencyInput } from '../common/CurrencyInput';
import { IconRenderer } from '../common/IconRenderer';
import { CategoryFormModal } from './CategoryFormModal';
import { saveTransaction } from '../../db/services';
import { toLocalISODate } from '../../utils/date';
import { db } from '../../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Transaction, TransactionType } from '../../types';
import { Plus, ArrowLeftRight, TrendingDown, TrendingUp } from 'lucide-react';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  transactionToEdit?: Transaction | null;
  defaultType?: TransactionType;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  transactionToEdit,
  defaultType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(transactionToEdit?.type || defaultType);
  const [amount, setAmount] = useState<number>(transactionToEdit?.amount || 0);
  const [categoryId, setCategoryId] = useState<string>(transactionToEdit?.categoryId || '');
  const [walletId, setWalletId] = useState<string>(transactionToEdit?.walletId || '');
  const [toWalletId, setToWalletId] = useState<string>(transactionToEdit?.toWalletId || '');
  const [date, setDate] = useState<string>(transactionToEdit?.date || toLocalISODate());
  const [notes, setNotes] = useState<string>(transactionToEdit?.notes || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Live queries for wallets and categories
  const wallets = useLiveQuery(() => db.wallets.filter((w) => !w.isArchived).toArray()) || [];
  const categories = useLiveQuery(() => db.categories.toArray()) || [];

  // Filter categories by active transaction type
  const availableCategories = categories.filter((c) => c.type === (type === 'income' ? 'income' : 'expense'));

  // Reset or fill form on open/edit
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(transactionToEdit.amount);
      setCategoryId(transactionToEdit.categoryId);
      setWalletId(transactionToEdit.walletId);
      setToWalletId(transactionToEdit.toWalletId || '');
      setDate(transactionToEdit.date);
      setNotes(transactionToEdit.notes || '');
    } else {
      setType(defaultType);
      setAmount(0);
      setDate(toLocalISODate());
      setNotes('');
      setError('');
    }
  }, [transactionToEdit, defaultType, isOpen]);

  // Set default wallet and category if empty
  useEffect(() => {
    if (!walletId && wallets.length > 0) {
      setWalletId(wallets[0].id);
    }
    if (type === 'transfer' && !toWalletId && wallets.length > 1) {
      const other = wallets.find((w) => w.id !== walletId);
      if (other) setToWalletId(other.id);
    }
  }, [wallets, walletId, toWalletId, type]);

  useEffect(() => {
    if (type !== 'transfer' && availableCategories.length > 0 && !availableCategories.some((c) => c.id === categoryId)) {
      setCategoryId(availableCategories[0].id);
    }
  }, [type, availableCategories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Masukkan nominal transaksi yang valid');
      return;
    }
    if (!walletId) {
      setError('Pilih dompet sumber');
      return;
    }
    if (type === 'transfer') {
      if (!toWalletId) {
        setError('Pilih dompet tujuan transfer');
        return;
      }
      if (walletId === toWalletId) {
        setError('Dompet asal dan dompet tujuan tidak boleh sama');
        return;
      }
    } else if (!categoryId) {
      setError('Pilih kategori transaksi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await saveTransaction({
        id: transactionToEdit?.id,
        amount,
        type,
        categoryId: type === 'transfer' ? 'transfer' : categoryId,
        walletId,
        toWalletId: type === 'transfer' ? toWalletId : undefined,
        date,
        notes,
      });

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan transaksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={transactionToEdit ? 'Ubah Transaksi' : 'Catat Transaksi'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Type Tabs: Pengeluaran, Pemasukan, Transfer */}
          <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                type === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <TrendingDown size={14} />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                type === 'income'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <TrendingUp size={14} />
              <span>Pemasukan</span>
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                type === 'transfer'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <ArrowLeftRight size={14} />
              <span>Transfer</span>
            </button>
          </div>

          {/* Currency Input with auto Rupiah format */}
          <CurrencyInput
            value={amount}
            onChange={(val) => {
              setAmount(val);
              setError('');
            }}
            label={`Nominal ${type === 'expense' ? 'Pengeluaran' : type === 'income' ? 'Pemasukan' : 'Transfer'}`}
            autoFocus={!transactionToEdit}
            error={error}
          />

          {/* Category Selector (Hidden if Transfer) */}
          {type !== 'transfer' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kategori {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                >
                  <Plus size={13} />
                  <span>Kategori Baru</span>
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
                {availableCategories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`p-2.5 rounded-xl flex flex-col items-center text-center gap-1.5 border transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-sm scale-98'
                          : 'border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: cat.color }}
                      >
                        <IconRenderer name={cat.icon} size={16} />
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wallet Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {type === 'transfer' ? 'Dari Dompet (Asal)' : 'Pilih Dompet'}
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {type === 'transfer' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ke Dompet (Tujuan)
                </label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Pilih dompet tujuan...</option>
                  {wallets
                    .filter((w) => w.id !== walletId)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {type === 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Transfer
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Makan siang nasi padang, bayar listrik..."
              maxLength={150}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? 'Menyimpan...' : transactionToEdit ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Embedded Sub-Modal to quickly create Category without leaving flow */}
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        defaultType={type === 'income' ? 'income' : 'expense'}
        onSaved={() => {
          // Categories will update reactively via useLiveQuery
        }}
      />
    </>
  );
};
