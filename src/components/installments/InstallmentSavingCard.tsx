import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  MoreVertical,
  Edit2,
  Trash2,
  Share2,
  ChevronDown,
  ChevronUp,
  Clock,
  Undo2,
} from 'lucide-react';
import { RealisticIcon } from '../common/RealisticIcon';
import type { InstallmentSaving, Wallet } from '../../types';
import { formatRupiah } from '../../utils/currency';
import { deleteInstallmentSaving, toggleInstallmentSavingDeposit } from '../../db/services';
import { DepositInstallmentModal } from './DepositInstallmentModal';

interface InstallmentSavingCardProps {
  saving: InstallmentSaving;
  associatedWallet?: Wallet;
  onEdit: (saving: InstallmentSaving) => void;
  onDeleted?: () => void;
  onRefresh?: () => void;
}

export const InstallmentSavingCard: React.FC<InstallmentSavingCardProps> = ({
  saving,
  associatedWallet,
  onEdit,
  onDeleted,
  onRefresh,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [targetIndex, setTargetIndex] = useState(1);
  const [copied, setCopied] = useState(false);

  const percentage = saving.targetAmount > 0
    ? Math.min(100, (saving.currentAmount / saving.targetAmount) * 100)
    : 0;

  const remainingInstallments = Math.max(0, saving.totalInstallments - saving.paidInstallments);
  const remainingAmount = Math.max(0, saving.targetAmount - saving.currentAmount);

  const nextUnpaidDeposit = saving.deposits.find((d) => !d.isPaid);
  const nextIndex = nextUnpaidDeposit ? nextUnpaidDeposit.installmentIndex : saving.totalInstallments;

  const handleOpenDepositNext = () => {
    setTargetIndex(nextIndex);
    setIsDepositModalOpen(true);
  };

  const handleOpenDepositSpecific = (idx: number) => {
    setTargetIndex(idx);
    setIsDepositModalOpen(true);
  };

  // Quick 1-click toggle
  const handleQuickToggle = async (idx: number, isPaid: boolean) => {
    if (isPaid) {
      if (window.confirm(`Batalkan status setoran cicilan ke-${idx}?`)) {
        await toggleInstallmentSavingDeposit(saving.id, idx);
        onRefresh?.();
      }
    } else {
      // Open modal to confirm or pick wallet
      setTargetIndex(idx);
      setIsDepositModalOpen(true);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Yakin ingin menghapus tabungan cicilan "${saving.title}"?`)) {
      await deleteInstallmentSaving(saving.id);
      onDeleted?.();
    }
  };

  const getShareText = () => {
    const lines = [
      `🎯 *UPDATE TABUNGAN CICILAN: ${saving.title.toUpperCase()}*`,
      `🏷️ Kategori: ${saving.category}`,
      `💰 Target Total: ${formatRupiah(saving.targetAmount)}`,
      `💵 Terkumpul: ${formatRupiah(saving.currentAmount)} (${Math.round(percentage)}%)`,
      `⏳ Progres: Cicilan ke-${saving.paidInstallments} dari ${saving.totalInstallments} (${remainingInstallments} cicilan lagi)`,
      `📌 Sisa yang harus ditabung: ${formatRupiah(remainingAmount)}`,
      saving.dueDay ? `📅 Jadwal Rutin: Tanggal ${saving.dueDay} tiap bulan` : '',
      saving.targetDate ? `🎯 Target Selesai: ${saving.targetDate}` : '',
      '',
      'Semangat menabung secara disiplin! 💪🚀',
      'Dikelola mandiri & 100% offline via DompetKu',
    ];
    return lines.filter(Boolean).join('\n');
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
    <article className="card-elevated p-5 space-y-4 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-center shadow-xs shrink-0">
            <RealisticIcon name="Coins" size={28} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {saving.title}
              </h3>
              {saving.isCompleted && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                  Tercapai 🎉
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                {formatRupiah(saving.installmentAmount)} / {saving.frequency === 'weekly' ? 'minggu' : saving.frequency === 'daily' ? 'hari' : 'bulan'}
              </span>
              <span>•</span>
              <span className="font-semibold">{saving.totalInstallments}x Cicilan</span>
              <span>•</span>
              <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-md text-slate-600 dark:text-slate-300 font-medium">
                {saving.category}
              </span>
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
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <MoreVertical size={16} />
          </button>

          {isMenuOpen && (
            <div
              className="absolute right-0 top-8 w-44 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 shadow-xl py-1 z-20 text-xs animate-in fade-in zoom-in-95 duration-100"
              onClick={() => setIsMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => onEdit(saving)}
                className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-medium cursor-pointer"
              >
                <Edit2 size={13} />
                <span>Ubah Tabungan</span>
              </button>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full px-3 py-2 text-left text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-medium cursor-pointer"
              >
                <Share2 size={13} />
                <span>Bagikan ke WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-medium cursor-pointer"
              >
                <span>{copied ? 'Tersalin!' : 'Salin Teks Ringkasan'}</span>
              </button>
              <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
              <button
                type="button"
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Hapus Tabungan</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action & Schedule Banner */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          {saving.dueDay ? (
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <Calendar size={13} className="text-emerald-500" />
              <span>Rutin tgl {saving.dueDay} tiap bln</span>
            </span>
          ) : saving.targetDate ? (
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-slate-400" />
              <span>Target: {saving.targetDate}</span>
            </span>
          ) : (
            <span className="text-slate-400">Cicilan setoran berkala</span>
          )}
        </div>

        {!saving.isCompleted && (
          <button
            type="button"
            onClick={handleOpenDepositNext}
            className="btn-glow-emerald px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <CheckCircle2 size={14} />
            <span>Setor Cicilan ke-{nextIndex}</span>
          </button>
        )}
      </div>

      {/* Progress Numbers & Bar */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Terkumpul
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatRupiah(saving.currentAmount)}
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {' '}/ {formatRupiah(saving.targetAmount)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              {saving.paidInstallments} / {saving.totalInstallments} Cicilan
            </span>
            <span className="text-[11px] text-slate-400 block">
              {Math.round(percentage)}% ({remainingInstallments} cicilan lagi)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-sm"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Expandable Checklist Breakdown (per animate-to-intrinsic-sizes) */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="btn-tactile w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-1.5 px-1 rounded-xl cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>Ceklist Setoran Cicilan ({saving.paidInstallments}/{saving.totalInstallments})</span>
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className={`accordion-intrinsic ${isExpanded ? 'is-open' : ''}`}>
          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
            {saving.deposits.map((dep) => {
              return (
                <label
                  key={dep.id || dep.installmentIndex}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs transition-all min-h-[48px] cursor-pointer select-none ${
                    dep.isPaid
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300/80 dark:border-emerald-800/60 text-slate-900 dark:text-slate-100 shadow-2xs'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={dep.isPaid}
                      onChange={() => handleQuickToggle(dep.installmentIndex, dep.isPaid)}
                      aria-label={`Cicilan ke-${dep.installmentIndex}`}
                      className="checkbox-tactile shrink-0"
                    />

                    <div>
                      <span className="font-bold">Cicilan ke-{dep.installmentIndex}</span>
                      <span className="text-[10px] text-slate-400 block">
                        {dep.isPaid
                          ? `Disetor: ${dep.paidAt || 'Tercatat'}${dep.notes ? ` • ${dep.notes}` : ''}`
                          : 'Belum disetor'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs tabular-nums">
                      {formatRupiah(dep.amount)}
                    </span>

                    {dep.isPaid ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuickToggle(dep.installmentIndex, true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Batal setor"
                      >
                        <Undo2 size={13} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenDepositSpecific(dep.installmentIndex);
                        }}
                        className="btn-glow-emerald px-2.5 py-1 rounded-lg text-white font-bold text-[10px] cursor-pointer"
                      >
                        Setor
                      </button>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <DepositInstallmentModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        saving={saving}
        installmentIndex={targetIndex}
        onSuccess={() => onRefresh?.()}
      />
    </article>
  );
};