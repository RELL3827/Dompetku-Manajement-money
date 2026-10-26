import React, { useState } from 'react';
import { IconRenderer } from '../common/IconRenderer';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatRupiah } from '../../utils/currency';
import { formatIndonesianDate } from '../../utils/date';
import { deleteSavingGoal } from '../../db/services';
import type { SavingGoal, Wallet } from '../../types';
import {
  CheckCircle2,
  Calendar,
  PlusCircle,
  MinusCircle,
  MoreVertical,
  Edit3,
  Trash2,
  Trophy,
} from 'lucide-react';

interface SavingGoalCardProps {
  goal: SavingGoal;
  associatedWallet?: Wallet;
  onEdit: (goal: SavingGoal) => void;
  onDeposit: (goal: SavingGoal) => void;
  onWithdraw: (goal: SavingGoal) => void;
  onDeleted: () => void;
}

export const SavingGoalCard: React.FC<SavingGoalCardProps> = ({
  goal,
  associatedWallet,
  onEdit,
  onDeposit,
  onWithdraw,
  onDeleted,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const isCompleted = goal.isCompleted || percentage >= 100;
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  // Calculate days remaining if targetDate is provided
  let daysRemaining: number | null = null;
  let recommendedMonthly: number | null = null;

  if (goal.targetDate && !isCompleted) {
    const now = new Date();
    const target = new Date(goal.targetDate);
    const diffTime = target.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (daysRemaining > 0) {
      const months = Math.max(1, daysRemaining / 30);
      recommendedMonthly = Math.ceil(remaining / months);
    }
  }

  const handleDelete = async () => {
    await deleteSavingGoal(goal.id);
    onDeleted();
  };

  return (
    <>
      <div className="relative p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
        {/* Top: Icon, Title, and Actions Menu */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
              style={{ backgroundColor: goal.color }}
            >
              <IconRenderer name={goal.icon} size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                  {goal.name}
                </h3>
                {isCompleted && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 flex items-center gap-1">
                    <Trophy size={11} /> Tercapai!
                  </span>
                )}
              </div>
              {goal.notes ? (
                <p className="text-xs text-slate-400 truncate mt-0.5">{goal.notes}</p>
              ) : associatedWallet ? (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Disimpan di: <span className="font-medium">{associatedWallet.name}</span>
                </p>
              ) : null}
            </div>
          </div>

          {/* Action Menu */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Menu tabungan"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(goal);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Edit3 size={14} className="text-blue-500" />
                    <span>Ubah Target</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowConfirmDelete(true);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    <span>Hapus Target</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Progress & Numbers */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between text-xs">
            <div>
              <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {formatRupiah(goal.currentAmount)}
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                {' '}
                / {formatRupiah(goal.targetAmount)}
              </span>
            </div>
            <span
              className={`text-xs font-bold ${
                isCompleted
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {Math.min(999, Math.round(percentage))}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>

          {/* Remaining or Target Date info */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            {!isCompleted ? (
              <span>
                Sisa: <strong className="text-slate-700 dark:text-slate-300">{formatRupiah(remaining)}</strong>
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> Selamat! Target tercapai
              </span>
            )}

            {goal.targetDate && (
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar size={12} />
                {daysRemaining !== null && daysRemaining > 0
                  ? `${daysRemaining} hari lagi`
                  : daysRemaining !== null && daysRemaining <= 0
                  ? 'Tenggat tercapai'
                  : formatIndonesianDate(goal.targetDate, 'short')}
              </span>
            )}
          </div>

          {recommendedMonthly && !isCompleted && (
            <p className="text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-2 py-1 rounded-lg">
              💡 Nabung sekitar <strong>{formatRupiah(recommendedMonthly)}/bulan</strong> untuk tepat waktu.
            </p>
          )}
        </div>

        {/* Bottom Actions: Nabung (Setor) & Tarik */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onDeposit(goal)}
            className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <PlusCircle size={15} />
            <span>Nabung</span>
          </button>

          <button
            type="button"
            onClick={() => onWithdraw(goal)}
            disabled={goal.currentAmount <= 0}
            className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MinusCircle size={15} />
            <span>Tarik Dana</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Target Tabungan"
        message={`Apakah Anda yakin ingin menghapus target tabungan "${goal.name}"? Saldo dompet Anda tidak akan berkurang atau bertambah.`}
        confirmLabel="Hapus Target"
      />
    </>
  );
};
