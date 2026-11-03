import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CurrencyInput } from '../common/CurrencyInput';
import { CheckCircle2, Wallet as WalletIcon, Calendar } from 'lucide-react';
import { payInstallmentMonth } from '../../db/services';
import { db } from '../../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Installment } from '../../types';
import { formatRupiah } from '../../utils/currency';

interface PayInstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  installment: Installment | null;
  monthIndexToPay: number;
  onPaid: () => void;
}

export const PayInstallmentModal: React.FC<PayInstallmentModalProps> = ({
  isOpen,
  onClose,
  installment,
  monthIndexToPay,
  onPaid,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [paidDate, setPaidDate] = useState<string>('');
  const [deductWallet, setDeductWallet] = useState<boolean>(true);
  const [walletId, setWalletId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const wallets = useLiveQuery(() => db.wallets.filter((w) => !w.isArchived).toArray()) || [];

  useEffect(() => {
    if (installment && isOpen) {
      setAmount(installment.monthlyAmount);
      setPaidDate(new Date().toISOString().slice(0, 10));
      setDeductWallet(Boolean(installment.walletId) || wallets.length > 0);
      setWalletId(installment.walletId || (wallets[0]?.id ?? ''));
      setNotes(`Bayar cicilan ke-${monthIndexToPay}`);
      setError('');
    }
  }, [installment, monthIndexToPay, isOpen, wallets.length]);

  if (!installment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Nominal pembayaran harus lebih besar dari Rp 0.');
      return;
    }
    if (deductWallet && !walletId) {
      setError('Pilih dompet yang akan dipotong saldonya.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await payInstallmentMonth(installment.id, monthIndexToPay, {
        amount,
        notes: notes.trim() || undefined,
        paidAt: paidDate,
        deductWallet,
        walletId: deductWallet ? walletId : undefined,
      });

      onPaid();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal memproses pembayaran cicilan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bayar Cicilan Bulan ke-${monthIndexToPay}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Info Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Nama Cicilan
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {installment.name}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Tagihan Normal
            </span>
            <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatRupiah(installment.monthlyAmount)}
            </p>
          </div>
        </div>

        {/* Nominal input */}
        <div>
          <CurrencyInput
            label="Nominal yang Dibayarkan (Rp) *"
            value={amount}
            onChange={(val) => setAmount(val)}
            placeholder="0"
            required
          />
        </div>

        {/* Tanggal Bayar */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Calendar size={13} className="text-slate-400" />
            <span>Tanggal Pembayaran</span>
          </label>
          <input
            type="date"
            required
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Auto deduct wallet toggle */}
        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <WalletIcon size={16} className="text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  Potong Saldo Dompet Otomatis
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Otomatis catat pengeluaran di DompetKu
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={deductWallet}
              onChange={(e) => setDeductWallet(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
          </label>

          {deductWallet && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Pilih Sumber Dompet
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatRupiah(w.initialBalance)})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Catatan / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Catatan Tambahan (Opsional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: No. referensi transfer, lewat ATM, dsb."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Buttons */}
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
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle2 size={15} />
            <span>{isSubmitting ? 'Memproses...' : 'Konfirmasi Pembayaran'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};