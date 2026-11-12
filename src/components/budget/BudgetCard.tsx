import React, { useState } from 'react';
import { IconRenderer } from '../common/IconRenderer';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatRupiah } from '../../utils/currency';
import { deleteBudget, getCategoryBudgetGroup, type BudgetStatusInfo } from '../../db/services';
import { AlertCircle, AlertTriangle, CheckCircle2, Edit3, Trash2 } from 'lucide-react';
import type { Budget } from '../../types';

interface BudgetCardProps {
  budgetInfo: BudgetStatusInfo;
  onEdit: (budget: Budget) => void;
  onDeleted: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budgetInfo, onEdit, onDeleted }) => {
  const { category, monthlyLimit, spent, percentage, remaining, safeDaily, status, budget } =
    budgetInfo;

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Determine progress bar color and alert styling
  let barColor = 'bg-emerald-500';
  let badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400';
  let statusText = 'Aman';
  let StatusIcon = CheckCircle2;

  if (status === 'danger') {
    barColor = 'bg-rose-500';
    badgeColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400';
    statusText = `Melebihi Anggaran (${Math.round(percentage)}%)`;
    StatusIcon = AlertCircle;
  } else if (status === 'warning') {
    barColor = 'bg-amber-500';
    badgeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400';
    statusText = `Mendekati Batas (${Math.round(percentage)}%)`;
    StatusIcon = AlertTriangle;
  }

  const handleDelete = async () => {
    await deleteBudget(budget.id);
    onDeleted();
  };

  return (
    <>
      <article className="card-elevated p-5 space-y-3.5 relative">
        {/* Header: Category & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm border border-black/5 dark:border-white/10"
              style={{ backgroundColor: category.color }}
            >
              <IconRenderer name={category.icon} size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{category.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  getCategoryBudgetGroup(category) === 'needs'
                    ? 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/40'
                    : getCategoryBudgetGroup(category) === 'wants'
                    ? 'bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/40'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40'
                }`}>
                  {getCategoryBudgetGroup(category) === 'needs'
                    ? '50% Kebutuhan'
                    : getCategoryBudgetGroup(category) === 'wants'
                    ? '30% Keinginan'
                    : '20% Tabungan'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(budget)}
              aria-label="Ubah anggaran"
              className="p-1.5 rounded-xl text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Edit3 size={15} />
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              aria-label="Hapus anggaran"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Numbers & Progress */}
        <div>
          <div className="flex items-baseline justify-between text-xs mb-1.5">
            <span className="font-extrabold text-slate-800 dark:text-slate-200 tabular-nums">
              {formatRupiah(spent)}
              <span className="text-[11px] font-normal text-slate-400">
                {' '}
                / {formatRupiah(monthlyLimit)}
              </span>
            </span>
            <span className="text-[11px] font-extrabold text-slate-500">
              {Math.min(999, Math.round(percentage))}%
            </span>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 shadow-sm ${barColor}`}
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
        </div>

        {/* Status Badge & Safe Daily Allowance */}
        <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${badgeColor}`}>
            <StatusIcon size={12} />
            <span>{statusText}</span>
          </div>

          <div className="text-right">
            {remaining > 0 ? (
              <p className="text-[11px] text-slate-500">
                Sisa: <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatRupiah(remaining)}</span>
                <span className="text-[10px] text-slate-400 tabular-nums"> (~{formatRupiah(safeDaily)}/hari)</span>
              </p>
            ) : (
              <p className="text-[11px] font-bold text-rose-500 tabular-nums">
                Melebihi {formatRupiah(Math.abs(remaining))}
              </p>
            )}
          </div>
        </div>
      </article>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Anggaran"
        message={`Apakah Anda yakin ingin menghapus anggaran untuk kategori "${category.name}"? Transaksi pengeluaran Anda tidak akan terhapus.`}
        confirmLabel="Hapus Anggaran"
      />
    </>
  );
};
