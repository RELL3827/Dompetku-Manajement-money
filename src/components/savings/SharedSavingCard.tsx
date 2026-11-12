import React, { useState } from 'react';
import {
  MoreVertical,
  Edit2,
  Trash2,
  Share2,
  Calendar,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { RealisticIcon } from '../common/RealisticIcon';
import type { SharedSaving, SharedSavingMember, Wallet } from '../../types';
import { formatRupiah } from '../../utils/currency';
import {
  toggleSharedSavingMemberPaid,
  updateSharedSavingMemberContribution,
  deleteSharedSaving,
} from '../../db/services';
import { MemberPaymentModal } from './MemberPaymentModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface SharedSavingCardProps {
  saving: SharedSaving;
  associatedWallet?: Wallet;
  onEdit: (saving: SharedSaving) => void;
  onDeleted?: () => void;
}

export const SharedSavingCard: React.FC<SharedSavingCardProps> = ({
  saving,
  associatedWallet,
  onEdit,
  onDeleted,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedMemberForPayment, setSelectedMemberForPayment] = useState<SharedSavingMember | null>(null);
  const [copied, setCopied] = useState(false);

  const percentage = saving.targetAmount > 0
    ? Math.min(100, (saving.currentAmount / saving.targetAmount) * 100)
    : 0;

  const paidMembersCount = saving.members.filter((m) => m.isPaid || m.currentAmount >= m.targetAmount).length;
  const isAllPaid = paidMembersCount === saving.members.length && saving.members.length > 0;

  // Toggle member checklist
  const handleToggleMember = async (memberId: string) => {
    await toggleSharedSavingMemberPaid(saving.id, memberId);
  };

  // Custom member payment
  const handleSaveMemberPayment = async (memberId: string, amount: number, notes?: string) => {
    await updateSharedSavingMemberContribution(saving.id, memberId, amount, notes);
  };

  // Delete
  const handleDelete = async () => {
    await deleteSharedSaving(saving.id);
    onDeleted?.();
  };

  // WhatsApp Share Message Formatter
  const getShareText = () => {
    const lines = [
      `📋 *UPDATE NABUNG BERSAMA: ${saving.title.toUpperCase()}*`,
      `💰 Target: ${formatRupiah(saving.targetAmount)}`,
      `💵 Terkumpul: ${formatRupiah(saving.currentAmount)} (${Math.round(percentage)}%)`,
      saving.targetDate ? `📅 Tenggat: ${saving.targetDate}` : '',
      '',
      `*Status Iuran Anggota (${paidMembersCount}/${saving.members.length}):*`,
    ];

    saving.members.forEach((m) => {
      if (m.isPaid || m.currentAmount >= m.targetAmount) {
        lines.push(`✅ *${m.name}*: ${formatRupiah(m.currentAmount)} (LUNAS)`);
      } else if (m.currentAmount > 0) {
        lines.push(`⏳ *${m.name}*: ${formatRupiah(m.currentAmount)} / ${formatRupiah(m.targetAmount)} (Kurang: ${formatRupiah(m.targetAmount - m.currentAmount)})`);
      } else {
        lines.push(`❌ *${m.name}*: Belum Bayar (Target: ${formatRupiah(m.targetAmount)})`);
      }
    });

    lines.push('', 'Dikelola transparan & aman via DompetKu 100% Offline 🚀');
    return lines.filter(Boolean).join('\n');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <article className="card-elevated p-5 space-y-4 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-900/40 flex items-center justify-center shadow-xs shrink-0">
            <RealisticIcon name="Users" size={28} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {saving.title}
              </h3>
              {(saving.isCompleted || isAllPaid) && (
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                  Tercapai 🎉
                </span>
              )}
            </div>

            {saving.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {saving.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
              {saving.targetDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>Target: {saving.targetDate}</span>
                </span>
              )}
              {associatedWallet && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CreditCard size={12} />
                  <span>{associatedWallet.name}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Menu */}
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
                <span>Kirim ke WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleCopyText}
                className="w-full px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-medium cursor-pointer"
              >
                <span>{copied ? 'Tersalin!' : 'Salin Teks Rincian'}</span>
              </button>
              <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowConfirmDelete(true);
                }}
                className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Hapus Tabungan</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress & Numbers */}
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
              {Math.round(percentage)}%
            </span>
            <span className="text-[11px] text-slate-400 block">
              {paidMembersCount} dari {saving.members.length} anggota lunas
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

      {/* Checklist Anggota Interaktif */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck size={14} className="text-emerald-500" />
            <span>Ceklist Pembayaran Anggota</span>
          </span>
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="btn-tactile text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Share2 size={11} />
            <span>Kirim WA</span>
          </button>
        </div>

        <div className="space-y-2">
          {saving.members.map((member) => {
            const isMemberPaid = member.isPaid || member.currentAmount >= member.targetAmount;

            return (
              <label
                key={member.id}
                className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 min-h-[48px] cursor-pointer select-none ${
                  isMemberPaid
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300/80 dark:border-emerald-800/60 shadow-2xs'
                    : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Custom Accessible Checkbox & Member info */}
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={isMemberPaid}
                    onChange={() => handleToggleMember(member.id)}
                    aria-label={`Tandai pembayaran ${member.name}`}
                    className="checkbox-tactile shrink-0"
                  />

                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold truncate ${
                        isMemberPaid
                          ? 'text-slate-900 dark:text-slate-100'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {member.name}
                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <span className="tabular-nums">Target: {formatRupiah(member.targetAmount)}</span>
                      {member.notes && (
                        <>
                          <span>•</span>
                          <span className="truncate">{member.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Custom Amount trigger */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                        isMemberPaid
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : member.currentAmount > 0
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {isMemberPaid
                        ? 'Lunas'
                        : member.currentAmount > 0
                        ? `Masuk ${formatRupiah(member.currentAmount)}`
                        : 'Belum Bayar'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedMemberForPayment(member);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Ubah nominal disetor / catatan"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Member Custom Payment Modal */}
      <MemberPaymentModal
        isOpen={Boolean(selectedMemberForPayment)}
        onClose={() => setSelectedMemberForPayment(null)}
        member={selectedMemberForPayment}
        savingTitle={saving.title}
        onSavePayment={handleSaveMemberPayment}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Tabungan Bersama"
        message={`Apakah Anda yakin ingin menghapus tabungan bersama "${saving.title}"? Seluruh data iuran anggota pada target ini akan dihapus permanen.`}
        confirmLabel="Ya, Hapus Tabungan"
      />
    </article>
  );
};
