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
  const { category, monthlyLimit, spent, percentage, remaining, safeDaily, daysRemaining, status, budget } =
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
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3">
        {/* Header: Category & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ backgroundColor: category.color }}
            >
              <IconRenderer name={category.icon} size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{category.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                  getCategoryBudgetGroup(category) === 'needs'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : getCategoryBudgetGroup(category) === 'wants'
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit3 size={15} />
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              aria-label="Hapus anggaran"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Numbers & Progress */}
        <div>
          <div className="flex items-baseline justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatRupiah(spent)}
              <span className="text-[11px] font-normal text-slate-400">
                {' '}
                / {formatRupiah(monthlyLimit)}
              </span>
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              {Math.min(999, Math.round(percentage))}%
            </span>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
        </div>

        {/* Status Badge & Safe Daily Allowance */}
        <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${badgeColor}`}>
            <StatusIcon size={12} />
            <span>{statusText}</span>
          </div>

          <div className="text-right">
            {remaining > 0 ? (
              <p className="text-[11px] text-slate-500">
                Sisa: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatRupiah(remaining)}</span>
                <span className="text-[10px] text-slate-400"> (~{formatRupiah(safeDaily)}/hari untuk {daysRemaining} hari)</span>
              </p>
            ) : (
              <p className="text-[11px] font-semibold text-rose-500">
                Melebihi {formatRupiah(Math.abs(remaining))}
              </p>
            )}
          </div>
        </div>
      </div>

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
