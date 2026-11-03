import React, { useState } from 'react';
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  Circle,
  MoreVertical,
  Edit2,
  Trash2,
  Share2,
  ChevronDown,
  ChevronUp,
  Clock,
  Undo2,
} from 'lucide-react';
import type { Installment, Wallet } from '../../types';
import { formatRupiah } from '../../utils/currency';
import { deleteInstallment, unpayInstallmentMonth } from '../../db/services';
import { PayInstallmentModal } from './PayInstallmentModal';

interface InstallmentCardProps {
  installment: Installment;
  associatedWallet?: Wallet;
  onEdit: (inst: Installment) => void;
  onDeleted?: () => void;
  onRefresh?: () => void;
}

export const InstallmentCard: React.FC<InstallmentCardProps> = ({
  installment,
  associatedWallet,
  onEdit,
  onDeleted,
  onRefresh,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [targetMonthIndex, setTargetMonthIndex] = useState(1);
  const [copied, setCopied] = useState(false);

  const percentage = installment.totalMonths > 0
    ? Math.min(100, (installment.paidMonths / installment.totalMonths) * 100)
    : 0;

  const remainingMonths = Math.max(0, installment.totalMonths - installment.paidMonths);
  const remainingAmount = Math.max(
    0,
    installment.totalAmount - installment.paidMonths * installment.monthlyAmount
  );

  // Status jatuh tempo bulan ini
  const today = new Date();
  const currentDay = today.getDate();
  const dueDay = installment.dueDay;

  // Cek apakah bulan ini sudah terbayar
  const currentMonthYearStr = today.toISOString().slice(0, 7); // YYYY-MM
  const isCurrentMonthPaid = installment.payments.some(
    (p) => p.paidAt.startsWith(currentMonthYearStr)
  ) || installment.isCompleted;

  let dueBadgeText = '';
  let dueBadgeStyle = '';

  if (installment.isCompleted) {
    dueBadgeText = 'Lunas Sepenuhnya 🎉';
    dueBadgeStyle = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
  } else if (isCurrentMonthPaid) {
    dueBadgeText = 'Bulan Ini Sudah Lunas ✅';
    dueBadgeStyle = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
  } else if (currentDay > dueDay) {
    dueBadgeText = `Lewat Jatuh Tempo (Tgl ${dueDay}) ⚠️`;
    dueBadgeStyle = 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse';
  } else if (currentDay === dueDay) {
    dueBadgeText = 'Hari Ini Jatuh Tempo! 🚨';
    dueBadgeStyle = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-extrabold';
  } else {
    const diff = dueDay - currentDay;
    dueBadgeText = `Jatuh Tempo ${diff} Hari Lagi (Tgl ${dueDay})`;
    dueBadgeStyle = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
  }

  const handleOpenPayNext = () => {
    setTargetMonthIndex(installment.paidMonths + 1);
    setIsPayModalOpen(true);
  };

  const handleOpenPaySpecific = (m: number) => {
    setTargetMonthIndex(m);
    setIsPayModalOpen(true);
  };

  const handleUndoPayment = async (monthIndex: number) => {
    if (window.confirm(`Batalkan pembayaran cicilan bulan ke-${monthIndex}?`)) {
      await unpayInstallmentMonth(installment.id, monthIndex);
      onRefresh?.();
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Yakin ingin menghapus data cicilan "${installment.name}"?`)) {
      await deleteInstallment(installment.id);
      onDeleted?.();
    }
  };

  const getShareText = () => {
    const lines = [
      `💳 *RINCIAN CICILAN: ${installment.name.toUpperCase()}*`,
      `🏷️ Kategori: ${installment.category}`,
      `💰 Tagihan: ${formatRupiah(installment.monthlyAmount)} / bulan`,
      `⏳ Progres: Bulan ke-${installment.paidMonths} dari ${installment.totalMonths} (${Math.round(percentage)}%)`,
      `💵 Sisa Hutang: ${formatRupiah(remainingAmount)} (${remainingMonths} bulan lagi)`,
      `📅 Jatuh Tempo: Tanggal ${installment.dueDay} tiap bulan`,
      `📌 Status: ${dueBadgeText}`,
      '',
      'Dikelola rapi via DompetKu 100% Offline 🚀',
    ];
    return lines.join('\n');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition-all relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <CreditCard size={20} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {installment.name}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {installment.category}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                {formatRupiah(installment.monthlyAmount)} / bln
              </span>
              <span>•</span>
              <span>Tenor: {installment.totalMonths} bln</span>
              {associatedWallet && (
                <>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {associatedWallet.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical size={16} />
          </button>

          {isMenuOpen && (
            <div
              className="absolute right-0 top-8 w-44 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl py-1 z-20 text-xs animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setIsMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => onEdit(installment)}
                className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-medium"
              >
                <Edit2 size={13} />
                <span>Ubah Cicilan</span>
              </button>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full px-3 py-2 text-left text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-medium"
              >
                <Share2 size={13} />
                <span>Bagikan ke WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-medium"
              >
                <span>{copied ? 'Tersalin!' : 'Salin Teks Ringkasan'}</span>
              </button>
              <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
              <button
                type="button"
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium"
              >
                <Trash2 size={13} />
                <span>Hapus Cicilan</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Due Date Banner */}
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl inline-flex items-center gap-1.5 ${dueBadgeStyle}`}>
          <Clock size={12} />
          <span>{dueBadgeText}</span>
        </span>

        {!installment.isCompleted && (
          <button
            type="button"
            onClick={handleOpenPayNext}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-xs shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1"
          >
            <CheckCircle2 size={13} />
            <span>Bayar Bln ke-{installment.paidMonths + 1}</span>
          </button>
        )}
      </div>

      {/* Progress Numbers & Bar */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Sisa Hutang
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {formatRupiah(remainingAmount)}
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {' '}/ {formatRupiah(installment.totalAmount)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
              {installment.paidMonths} / {installment.totalMonths} Bulan
            </span>
            <span className="text-[11px] text-slate-400 block">
              {Math.round(percentage)}% terbayar ({remainingMonths} bln tersisa)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Expandable Monthly Timeline */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 py-1"
        >
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            <span>Daftar Pembayaran Semua Bulan ({installment.paidMonths}/{installment.totalMonths})</span>
          </span>
          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-1.5 max-h-60 overflow-y-auto pr-1 animate-in fade-in duration-150">
            {Array.from({ length: installment.totalMonths }, (_, idx) => {
              const monthIdx = idx + 1;
              const payment = installment.payments.find((p) => p.monthIndex === monthIdx);
              const isPaid = Boolean(payment);

              return (
                <div
                  key={monthIdx}
                  className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    isPaid
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/50 text-slate-800 dark:text-slate-200'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isPaid ? (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    ) : (
                      <Circle size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold">Bulan ke-{monthIdx}</span>
                      <span className="text-[10px] text-slate-400 block">
                        {isPaid
                          ? `Lunas: ${payment?.paidAt || 'Tercatat'}${payment?.notes ? ` • ${payment.notes}` : ''}`
                          : `Jatuh tempo Tgl ${dueDay}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[11px]">
                      {formatRupiah(payment ? payment.amount : installment.monthlyAmount)}
                    </span>

                    {isPaid ? (
                      <button
                        type="button"
                        onClick={() => handleUndoPayment(monthIdx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Batalkan pembayaran bulan ini"
                      >
                        <Undo2 size={13} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenPaySpecific(monthIdx)}
                        className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-all"
                      >
                        Bayar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pay Modal */}
      <PayInstallmentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        installment={installment}
        monthIndexToPay={targetMonthIndex}
        onPaid={() => onRefresh?.()}
      />
    </div>
  );
};