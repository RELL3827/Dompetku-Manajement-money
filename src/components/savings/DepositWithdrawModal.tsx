import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CurrencyInput } from '../common/CurrencyInput';
import { depositToSavingGoal, withdrawFromSavingGoal } from '../../db/services';
import { db } from '../../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { formatRupiah } from '../../utils/currency';
import type { SavingGoal, Wallet } from '../../types';
import { PlusCircle, MinusCircle, Wallet as WalletIcon } from 'lucide-react';

interface DepositWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal: SavingGoal | null;
  defaultMode?: 'deposit' | 'withdraw';
}

export const DepositWithdrawModal: React.FC<DepositWithdrawModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  goal,
  defaultMode = 'deposit',
}) => {
  const [mode, setMode] = useState<'deposit' | 'withdraw'>(defaultMode);
  const [amount, setAmount] = useState(0);
  const [walletId, setWalletId] = useState('');
  const [notes, setNotes] = useState('');
  const [syncWithWallet, setSyncWithWallet] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const wallets = useLiveQuery(() => db.wallets.filter((w) => !w.isArchived).toArray()) || [];

  useEffect(() => {
    setMode(defaultMode);
    setAmount(0);
    setNotes('');
    setError('');
    if (goal?.walletId) {
      setWalletId(goal.walletId);
    } else if (wallets.length > 0) {
      setWalletId(wallets[0].id);
    }
  }, [defaultMode, goal, isOpen, wallets]);

  if (!goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Masukkan nominal yang valid');
      return;
    }

    if (mode === 'withdraw' && amount > goal.currentAmount) {
      setError(`Nominal penarikan melebihi saldo tabungan saat ini (${formatRupiah(goal.currentAmount)})`);
      return;
    }

    setLoading(true);
    try {
      const selectedWallet = syncWithWallet && walletId ? walletId : undefined;

      if (mode === 'deposit') {
        await depositToSavingGoal(goal.id, amount, selectedWallet, notes);
      } else {
        await withdrawFromSavingGoal(goal.id, amount, selectedWallet, notes);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'deposit' ? `Nabung ke "${goal.name}"` : `Tarik Dana "${goal.name}"`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Mode Toggle: Nabung vs Tarik */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('deposit');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'deposit'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <PlusCircle size={15} />
            <span>Nabung (Setor)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('withdraw');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'withdraw'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <MinusCircle size={15} />
            <span>Tarik Dana</span>
          </button>
        </div>

        {/* Current Balance in this goal */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
          <span className="text-slate-500">Saldo Tabungan Saat Ini:</span>
          <span className="font-bold text-slate-800 dark:text-slate-100">
            {formatRupiah(goal.currentAmount)}
          </span>
        </div>

        {/* Amount Input */}
        <CurrencyInput
          value={amount}
          onChange={(val) => {
            setAmount(val);
            setError('');
          }}
          label={`Nominal ${mode === 'deposit' ? 'yang Ingin Ditabung' : 'yang Ingin Ditarik'}`}
          autoFocus
          error={error}
        />

        {/* Wallet Selection & Sync */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={syncWithWallet}
              onChange={(e) => setSyncWithWallet(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span>
              {mode === 'deposit'
                ? 'Potong saldo dari dompet saya'
                : 'Masukkan dana ke dompet saya'}
            </span>
          </label>

          {syncWithWallet && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                {mode === 'deposit' ? 'Pilih Dompet Sumber:' : 'Pilih Dompet Penerima:'}
              </label>
              <div className="relative">
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                >
                  {wallets.map((w: Wallet) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                <WalletIcon size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>
          )}
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Catatan (Opsional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Dari sisa belanja, THR, bonus..."
            maxLength={80}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-sm disabled:opacity-50 transition-all ${
              mode === 'deposit'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
            }`}
          >
            {loading ? 'Menyimpan...' : mode === 'deposit' ? 'Nabung Sekarang' : 'Tarik Sekarang'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
