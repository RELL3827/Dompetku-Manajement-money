import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CurrencyInput } from '../common/CurrencyInput';
import { CheckCircle2, User } from 'lucide-react';
import type { SharedSavingMember } from '../../types';
import { formatRupiah } from '../../utils/currency';

interface MemberPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: SharedSavingMember | null;
  savingTitle: string;
  onSavePayment: (memberId: string, amount: number, notes?: string) => Promise<void>;
}

export const MemberPaymentModal: React.FC<MemberPaymentModalProps> = ({
  isOpen,
  onClose,
  member,
  savingTitle,
  onSavePayment,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (member && isOpen) {
      setAmount(member.currentAmount > 0 ? member.currentAmount : member.targetAmount);
      setNotes(member.notes || '');
    }
  }, [member, isOpen]);

  if (!member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSavePayment(member.id, amount, notes.trim() || undefined);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetFull = () => {
    setAmount(member.targetAmount);
  };

  const handleSetZero = () => {
    setAmount(0);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Iuran / Pembayaran Anggota"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info header */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
              <User size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {member.name}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {savingTitle}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Iuran</span>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatRupiah(member.targetAmount)}
            </span>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSetFull}
            className="flex-1 py-1.5 px-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition-colors"
          >
            Lunas ({formatRupiah(member.targetAmount)})
          </button>
          <button
            type="button"
            onClick={handleSetZero}
            className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Belum Bayar (Rp 0)
          </button>
        </div>

        {/* Currency Input */}
        <div>
          <CurrencyInput
            label="Nominal yang Disetor (Rp)"
            value={amount}
            onChange={setAmount}
            placeholder="0"
            showQuickChips={false}
          />
          {amount >= member.targetAmount && member.targetAmount > 0 && (
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 size={13} /> Status otomatis: Lunas
            </p>
          )}
          {amount > 0 && amount < member.targetAmount && (
            <p className="text-[11px] text-amber-600 font-semibold mt-1">
              Sisa kekurangan: {formatRupiah(member.targetAmount - amount)}
            </p>
          )}
        </div>

        {/* Catatan / Keterangan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Catatan / Metode Transfer (Opsional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Transfer BCA, Cash, Titip Farel"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Pembayaran'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
