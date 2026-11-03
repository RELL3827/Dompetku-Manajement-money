import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CurrencyInput } from '../common/CurrencyInput';
import {
  Calendar,
  Sparkles,
  Wallet as WalletIcon,
  Tag,
  Clock,
} from 'lucide-react';
import { addInstallmentSaving, updateInstallmentSaving } from '../../db/services';
import { db } from '../../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import type { InstallmentSaving, InstallmentFrequency } from '../../types';
import { formatRupiah } from '../../utils/currency';

interface InstallmentSavingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  savingToEdit?: InstallmentSaving | null;
}

const CATEGORY_OPTIONS = [
  'Ibadah & Qurban',
  'Elektronik',
  'Kendaraan',
  'Liburan',
  'Dana Darurat',
  'Gadget',
  'Pendidikan',
  'Lainnya',
];

const PRESET_IDEAS = [
  'Tabungan Qurban',
  'Nabung Beli iPhone',
  'Cicil Dana Darurat',
  'Nabung Liburan Bareng',
  'Tabungan Emas Batangan',
  'Tabungan Mudik Lebaran',
];

const TENOR_CHIPS = [3, 6, 10, 12, 24, 36, 52];

export const InstallmentSavingFormModal: React.FC<InstallmentSavingFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  savingToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Ibadah & Qurban');
  const [frequency, setFrequency] = useState<InstallmentFrequency>('monthly');
  const [targetAmount, setTargetAmount] = useState<number>(6000000);
  const [installmentAmount, setInstallmentAmount] = useState<number>(500000);
  const [totalInstallments, setTotalInstallments] = useState<number>(12);
  const [paidInstallments, setPaidInstallments] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [dueDay, setDueDay] = useState<number>(25);
  const [walletId, setWalletId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const wallets = useLiveQuery(() => db.wallets.filter((w) => !w.isArchived).toArray()) || [];

  useEffect(() => {
    if (savingToEdit && isOpen) {
      setTitle(savingToEdit.title);
      setCategory(savingToEdit.category || 'Ibadah & Qurban');
      setFrequency(savingToEdit.frequency || 'monthly');
      setTargetAmount(savingToEdit.targetAmount);
      setInstallmentAmount(savingToEdit.installmentAmount);
      setTotalInstallments(savingToEdit.totalInstallments);
      setPaidInstallments(savingToEdit.paidInstallments);
      setStartDate(savingToEdit.startDate);
      setTargetDate(savingToEdit.targetDate || '');
      setDueDay(savingToEdit.dueDay || 25);
      setWalletId(savingToEdit.walletId || '');
      setNotes(savingToEdit.notes || '');
    } else if (isOpen) {
      setTitle('');
      setCategory('Ibadah & Qurban');
      setFrequency('monthly');
      setTargetAmount(6000000);
      setInstallmentAmount(500000);
      setTotalInstallments(12);
      setPaidInstallments(0);
      setStartDate(new Date().toISOString().slice(0, 10));
      setTargetDate('');
      setDueDay(25);
      setWalletId('');
      setNotes('');
    }
    setError('');
  }, [savingToEdit, isOpen]);

  // Sync calculations
  const handleTargetAmountChange = (val: number) => {
    setTargetAmount(val);
    if (totalInstallments > 0) {
      setInstallmentAmount(Math.round(val / totalInstallments));
    }
  };

  const handleInstallmentAmountChange = (val: number) => {
    setInstallmentAmount(val);
    if (totalInstallments > 0) {
      setTargetAmount(val * totalInstallments);
    }
  };

  const handleTenorChange = (tenor: number) => {
    setTotalInstallments(tenor);
    if (tenor > 0 && targetAmount > 0) {
      setInstallmentAmount(Math.round(targetAmount / tenor));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Nama tabungan cicilan wajib diisi.');
      return;
    }
    if (targetAmount <= 0) {
      setError('Target total tabungan harus lebih dari Rp 0.');
      return;
    }
    if (installmentAmount <= 0) {
      setError('Nominal per cicilan harus lebih dari Rp 0.');
      return;
    }
    if (totalInstallments <= 0) {
      setError('Jumlah kali cicilan harus minimal 1 kali.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (savingToEdit) {
        await updateInstallmentSaving(savingToEdit.id, {
          title: title.trim(),
          category,
          frequency,
          targetAmount,
          installmentAmount,
          totalInstallments,
          startDate,
          targetDate: targetDate || undefined,
          dueDay: dueDay || undefined,
          walletId: walletId || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        await addInstallmentSaving({
          title: title.trim(),
          category,
          frequency,
          targetAmount,
          installmentAmount,
          totalInstallments,
          initialPaidInstallments: paidInstallments,
          startDate: startDate || new Date().toISOString().slice(0, 10),
          targetDate: targetDate || undefined,
          dueDay: dueDay || undefined,
          walletId: walletId || undefined,
          notes: notes.trim() || undefined,
        });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan tabungan cicilan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={savingToEdit ? 'Ubah Tabungan Cicilan' : 'Buat Tabungan Cicilan (Berkala)'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Preset Ideas */}
        {!savingToEdit && (
          <div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
              <Sparkles size={12} className="text-amber-500" />
              <span>Ide Rencana Tabungan Cicilan:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_IDEAS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => setTitle(idea)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                    title === idea
                      ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nama Tabungan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nama Tabungan Cicilan *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Tabungan Qurban, Nabung Beli iPhone, Liburan"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          />
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Tag size={13} className="text-slate-400" />
            <span>Kategori</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-[11px] px-3 py-1 rounded-xl border transition-all ${
                  category === cat
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Frekuensi Menabung */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Frekuensi Cicilan Menabung
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'monthly' as InstallmentFrequency, label: 'Bulanan' },
              { id: 'weekly' as InstallmentFrequency, label: 'Mingguan' },
              { id: 'daily' as InstallmentFrequency, label: 'Harian' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFrequency(f.id)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  frequency === f.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tenor / Jumlah Kali Cicilan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Clock size={13} className="text-slate-400" />
            <span>Jumlah Kali Cicilan: <strong>{totalInstallments}x Setoran</strong></span>
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {TENOR_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleTenorChange(chip)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  totalInstallments === chip
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {chip}x
              </button>
            ))}
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-[11px] text-slate-400">Kustom:</span>
              <input
                type="number"
                min="1"
                max="365"
                value={totalInstallments || ''}
                onChange={(e) => handleTenorChange(parseInt(e.target.value, 10) || 1)}
                className="w-16 px-2 py-1 text-xs font-bold text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
              <span className="text-xs text-slate-400">kali</span>
            </div>
          </div>
        </div>

        {/* Target Total & Nominal Per Cicilan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <CurrencyInput
              label="Target Total Tabungan (Rp) *"
              value={targetAmount}
              onChange={handleTargetAmountChange}
              placeholder="0"
              required
            />
          </div>
          <div>
            <CurrencyInput
              label={`Nominal per Cicilan (${frequency === 'monthly' ? 'Bulan' : frequency === 'weekly' ? 'Minggu' : 'Hari'}) *`}
              value={installmentAmount}
              onChange={handleInstallmentAmountChange}
              placeholder="0"
              required
            />
          </div>
        </div>

        {/* Tanggal Mulai & Tanggal Target Selesai */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              <span>Tanggal Mulai Menabung</span>
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tanggal Target Selesai (Opsional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Tanggal Rutin Setor per Bulan (Jika Bulanan) */}
        {frequency === 'monthly' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tanggal Rutin Setor Tiap Bulan (1 - 31)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(Math.min(31, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-400 shrink-0">Tiap bulan</span>
            </div>
          </div>
        )}

        {/* Sudah Pernah Menabung Sebelumnya? (Hanya saat create baru) */}
        {!savingToEdit && (
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Sudah Menabung Berapa Kali Sebelumnya?
              </label>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                {paidInstallments} dari {totalInstallments} cicilan lunas ({formatRupiah(paidInstallments * installmentAmount)})
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Jika ini tabungan berjalan yang dipindahkan ke aplikasi, masukkan berapa kali cicilan yang sudah Anda setor sebelumnya.
            </p>
            <input
              type="range"
              min="0"
              max={totalInstallments}
              value={paidInstallments}
              onChange={(e) => setPaidInstallments(parseInt(e.target.value, 10) || 0)}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        )}

        {/* Dompet Penyimpanan Dana & Catatan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <WalletIcon size={13} className="text-slate-400" />
              <span>Dompet Penyimpanan Dana (Opsional)</span>
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="">-- Tanpa Dompet Khusus --</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({formatRupiah(w.initialBalance)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Demi qurban Idul Adha tahun ini"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : savingToEdit ? 'Simpan Perubahan' : '+ Buat Tabungan Cicilan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};