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
import { addInstallment, updateInstallment } from '../../db/services';
import { db } from '../../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Installment } from '../../types';
import { formatRupiah } from '../../utils/currency';

interface InstallmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  installmentToEdit?: Installment | null;
  initialPreset?: {
    name: string;
    totalAmount: number;
    monthlyAmount: number;
    totalMonths: number;
    interestRate: number;
  } | null;
}

const CATEGORY_OPTIONS = [
  'Elektronik',
  'Kendaraan',
  'Properti / KPR',
  'Gadget',
  'Paylater',
  'Pinjaman Bank',
  'Pendidikan',
  'Lainnya',
];

const PRESET_IDEAS = [
  'Cicilan Motor Vario',
  'Cicilan iPhone 16',
  'Shopee Paylater',
  'KPR Rumah BTN',
  'Laptop Kerja',
  'Kartu Kredit BCA',
];

const TENOR_CHIPS = [3, 6, 12, 24, 36, 48, 60];

export const InstallmentFormModal: React.FC<InstallmentFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  installmentToEdit,
  initialPreset,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Elektronik');
  const [totalAmount, setTotalAmount] = useState<number>(12000000);
  const [monthlyAmount, setMonthlyAmount] = useState<number>(1000000);
  const [totalMonths, setTotalMonths] = useState<number>(12);
  const [paidMonths, setPaidMonths] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [dueDay, setDueDay] = useState<number>(25);
  const [walletId, setWalletId] = useState('');
  const [interestRate, setInterestRate] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const wallets = useLiveQuery(() => db.wallets.filter((w) => !w.isArchived).toArray()) || [];

  useEffect(() => {
    if (installmentToEdit && isOpen) {
      setName(installmentToEdit.name);
      setCategory(installmentToEdit.category || 'Elektronik');
      setTotalAmount(installmentToEdit.totalAmount);
      setMonthlyAmount(installmentToEdit.monthlyAmount);
      setTotalMonths(installmentToEdit.totalMonths);
      setPaidMonths(installmentToEdit.paidMonths);
      setStartDate(installmentToEdit.startDate);
      setDueDay(installmentToEdit.dueDay);
      setWalletId(installmentToEdit.walletId || '');
      setInterestRate(installmentToEdit.interestRate || 0);
      setNotes(installmentToEdit.notes || '');
    } else if (initialPreset && isOpen) {
      setName(initialPreset.name);
      setCategory('Elektronik');
      setTotalAmount(initialPreset.totalAmount);
      setMonthlyAmount(initialPreset.monthlyAmount);
      setTotalMonths(initialPreset.totalMonths);
      setPaidMonths(0);
      setStartDate(new Date().toISOString().slice(0, 10));
      setDueDay(25);
      setWalletId('');
      setInterestRate(initialPreset.interestRate || 0);
      setNotes('');
    } else if (isOpen) {
      setName('');
      setCategory('Elektronik');
      setTotalAmount(12000000);
      setMonthlyAmount(1000000);
      setTotalMonths(12);
      setPaidMonths(0);
      setStartDate(new Date().toISOString().slice(0, 10));
      setDueDay(25);
      setWalletId('');
      setInterestRate(0);
      setNotes('');
    }
    setError('');
  }, [installmentToEdit, initialPreset, isOpen]);

  // Sync calculations
  const handleTotalAmountChange = (val: number) => {
    setTotalAmount(val);
    if (totalMonths > 0) {
      setMonthlyAmount(Math.round(val / totalMonths));
    }
  };

  const handleMonthlyAmountChange = (val: number) => {
    setMonthlyAmount(val);
    if (totalMonths > 0) {
      setTotalAmount(val * totalMonths);
    }
  };

  const handleTenorChange = (months: number) => {
    setTotalMonths(months);
    if (months > 0 && totalAmount > 0) {
      setMonthlyAmount(Math.round(totalAmount / months));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama cicilan wajib diisi.');
      return;
    }
    if (totalAmount <= 0) {
      setError('Total hutang / harga kredit harus lebih dari Rp 0.');
      return;
    }
    if (monthlyAmount <= 0) {
      setError('Nominal cicilan per bulan harus lebih dari Rp 0.');
      return;
    }
    if (totalMonths <= 0) {
      setError('Tenor harus minimal 1 bulan.');
      return;
    }
    if (dueDay < 1 || dueDay > 31) {
      setError('Tanggal jatuh tempo harus antara 1 sampai 31.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (installmentToEdit) {
        await updateInstallment(installmentToEdit.id, {
          name: name.trim(),
          category,
          totalAmount,
          monthlyAmount,
          totalMonths,
          startDate,
          dueDay,
          walletId: walletId || undefined,
          interestRate: interestRate || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        await addInstallment({
          name: name.trim(),
          category,
          totalAmount,
          monthlyAmount,
          totalMonths,
          paidMonths,
          initialPaidMonths: paidMonths,
          startDate: startDate || new Date().toISOString().slice(0, 10),
          dueDay,
          walletId: walletId || undefined,
          interestRate: interestRate || undefined,
          notes: notes.trim() || undefined,
        });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan data cicilan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={installmentToEdit ? 'Ubah Data Cicilan' : 'Tambah Cicilan / Tagihan Rutin'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Preset Ideas */}
        {!installmentToEdit && (
          <div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
              <Sparkles size={12} className="text-amber-500" />
              <span>Contoh Cicilan Cepat:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_IDEAS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => setName(idea)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                    name === idea
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

        {/* Nama Cicilan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nama Cicilan / Tagihan *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Cicilan Motor Vario, iPhone 16 Pro, Shopee Paylater"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Kategori Cicilan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Tag size={13} className="text-slate-400" />
            <span>Kategori Tagihan</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`text-[11px] px-3 py-1.5 rounded-xl border transition-all ${
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

        {/* Tenor Quick Chips */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Clock size={13} className="text-slate-400" />
            <span>Tenor (Jumlah Bulan): <strong>{totalMonths} Bulan</strong></span>
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {TENOR_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleTenorChange(chip)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  totalMonths === chip
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
                max="360"
                value={totalMonths || ''}
                onChange={(e) => handleTenorChange(parseInt(e.target.value, 10) || 1)}
                className="w-16 px-2 py-1 text-xs font-bold text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
              <span className="text-xs text-slate-400">bln</span>
            </div>
          </div>
        </div>

        {/* Total Pinjaman & Cicilan Per Bulan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <CurrencyInput
              label="Total Harga / Pokok Kredit (Rp) *"
              value={totalAmount}
              onChange={handleTotalAmountChange}
              placeholder="0"
              required
            />
          </div>
          <div>
            <CurrencyInput
              label="Cicilan Per Bulan (Rp) *"
              value={monthlyAmount}
              onChange={handleMonthlyAmountChange}
              placeholder="0"
              required
            />
          </div>
        </div>

        {/* Tanggal Mulai & Tanggal Jatuh Tempo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              <span>Tanggal Mulai Cicilan</span>
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
              Tanggal Jatuh Tempo Tiap Bulan (1 - 31) *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="31"
                required
                value={dueDay}
                onChange={(e) => setDueDay(Math.min(31, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-400 shrink-0">Tiap bln</span>
            </div>
          </div>
        </div>

        {/* Sudah Berjalan Sebelumnya (Hanya saat create baru) */}
        {!installmentToEdit && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Cicilan Sudah Berjalan Sebelumnya?
              </label>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                {paidMonths} dari {totalMonths} bulan lunas
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Jika ini cicilan lama yang dipindahkan ke aplikasi, masukkan berapa bulan yang sudah Anda lunasi sebelumnya.
            </p>
            <input
              type="range"
              min="0"
              max={totalMonths}
              value={paidMonths}
              onChange={(e) => setPaidMonths(parseInt(e.target.value, 10) || 0)}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        )}

        {/* Dompet Default & Catatan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <WalletIcon size={13} className="text-slate-400" />
              <span>Dompet Pembayaran (Opsional)</span>
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="">-- Tanpa Dompet Default --</option>
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
              placeholder="Contoh: No. Kontrak 12345, Bunga 0%"
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
            {loading ? 'Menyimpan...' : installmentToEdit ? 'Simpan Perubahan' : '+ Tambah Cicilan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};