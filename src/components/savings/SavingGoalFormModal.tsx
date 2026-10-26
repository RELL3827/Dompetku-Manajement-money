import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CurrencyInput } from '../common/CurrencyInput';
import { IconRenderer, AVAILABLE_COLORS } from '../common/IconRenderer';
import { saveSavingGoal } from '../../db/services';
import { db } from '../../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import type { SavingGoal, Wallet } from '../../types';

interface SavingGoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  goalToEdit?: SavingGoal | null;
}

export const AVAILABLE_SAVINGS_ICONS = [
  'PiggyBank',
  'Target',
  'Trophy',
  'Coins',
  'Landmark',
  'Laptop',
  'Car',
  'Home',
  'Plane',
  'Heart',
  'Gift',
  'GraduationCap',
  'Smartphone',
  'Shield',
  'Sparkles',
];

export const SavingGoalFormModal: React.FC<SavingGoalFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  goalToEdit,
}) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [targetDate, setTargetDate] = useState('');
  const [walletId, setWalletId] = useState('');
  const [icon, setIcon] = useState('PiggyBank');
  const [color, setColor] = useState('#10b981');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const wallets = useLiveQuery(() => db.wallets.filter((w) => !w.isArchived).toArray()) || [];

  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name);
      setTargetAmount(goalToEdit.targetAmount);
      setCurrentAmount(goalToEdit.currentAmount);
      setTargetDate(goalToEdit.targetDate || '');
      setWalletId(goalToEdit.walletId || '');
      setIcon(goalToEdit.icon);
      setColor(goalToEdit.color);
      setNotes(goalToEdit.notes || '');
    } else {
      setName('');
      setTargetAmount(5000000);
      setCurrentAmount(0);
      setTargetDate('');
      setWalletId('');
      setIcon('PiggyBank');
      setColor('#10b981');
      setNotes('');
    }
    setError('');
  }, [goalToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama target tabungan tidak boleh kosong');
      return;
    }
    if (!targetAmount || targetAmount <= 0) {
      setError('Masukkan target nominal tabungan');
      return;
    }

    setLoading(true);
    try {
      await saveSavingGoal({
        id: goalToEdit?.id,
        name: name.trim(),
        targetAmount,
        currentAmount,
        targetDate: targetDate || undefined,
        walletId: walletId || undefined,
        icon,
        color,
        notes: notes.trim() || undefined,
      });

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan target tabungan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Ubah Target Tabungan' : 'Buat Target Tabungan Baru'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nama Target Tabungan
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Contoh: Dana Darurat 6 Bulan, Beli Laptop, Liburan Jepang"
            maxLength={40}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Target Amount & Current Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CurrencyInput
            value={targetAmount}
            onChange={(val) => {
              setTargetAmount(val);
              setError('');
            }}
            label="Target Nominal (Rp)"
            showQuickChips={false}
          />

          <CurrencyInput
            value={currentAmount}
            onChange={setCurrentAmount}
            label="Saldo Awal Terkumpul (Rp)"
            showQuickChips={false}
          />
        </div>

        {/* Target Date & Associated Wallet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tenggat Waktu Target (Opsional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Simpan di Dompet (Opsional)
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="">Tidak terhubung ke dompet spesifik</option>
              {wallets.map((w: Wallet) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Icon & Color Preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: color }}
          >
            <IconRenderer name={icon} size={20} />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {name.trim() || 'Nama Target Tabungan'}
            </span>
            <p className="text-slate-400">Pilih ikon dan warna sesuai tujuan Anda</p>
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Pilih Ikon Target
          </label>
          <div className="grid grid-cols-5 gap-2 p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
            {AVAILABLE_SAVINGS_ICONS.map((iconName) => (
              <button
                key={iconName}
                type="button"
                onClick={() => setIcon(iconName)}
                className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                  icon === iconName
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <IconRenderer name={iconName} size={20} />
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Pilih Warna
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform active:scale-90 ${
                  color === c ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-slate-100 scale-110' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Catatan / Motivasi (Opsional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Demi masa depan bebas hutang!"
            maxLength={100}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        {error && <p className="text-xs font-medium text-rose-500">{error}</p>}

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
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm shadow-emerald-600/20 disabled:opacity-50 transition-all"
          >
            {loading ? 'Menyimpan...' : 'Simpan Target'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
