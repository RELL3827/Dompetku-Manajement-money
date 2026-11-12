import React, { useState } from 'react';
import { IconRenderer } from '../common/IconRenderer';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatRupiah } from '../../utils/currency';
import { deleteTransaction } from '../../db/services';
import type { Transaction, Category, Wallet } from '../../types';
import { Edit3, Trash2 } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  sourceWallet?: Wallet;
  destWallet?: Wallet;
  onEdit: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
  onDeleted?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  category,
  sourceWallet,
  destWallet,
  onEdit,
  onDelete,
  onDeleted,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isExpense = transaction.type === 'expense';
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';

  const iconName = isTransfer ? 'ArrowLeftRight' : category?.icon || 'Tag';
  const iconColor = isTransfer ? '#3b82f6' : category?.color || '#64748b';

  const title = isTransfer
    ? `Transfer: ${sourceWallet?.name || 'Dompet'} → ${destWallet?.name || 'Dompet'}`
    : category?.name || 'Lainnya';

  const handleDelete = async () => {
    try {
      await deleteTransaction(transaction.id);
      setShowConfirmDelete(false);
      onDeleted?.();
    } catch (err) {
      console.error('Gagal menghapus transaksi:', err);
    }
  };

  const handleTriggerDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(transaction);
    } else {
      setShowConfirmDelete(true);
    }
  };

  const handleTriggerEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(transaction);
  };

  return (
    <>
      <article
        onClick={() => onEdit(transaction)}
        className="ios-glass-card group relative flex items-center justify-between p-3 sm:p-4 rounded-2xl transition-all border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xs hover:shadow-md cursor-pointer select-none"
      >
        {/* Left: Icon & Details */}
        <div className="flex items-center gap-3 min-w-0 pr-2 flex-1">
          <div
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm border border-black/5 dark:border-white/10"
            style={{ backgroundColor: iconColor }}
          >
            <IconRenderer name={iconName} size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {title}
            </h4>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="px-1.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                {sourceWallet?.name || 'Dompet'}
              </span>
              {isTransfer && destWallet && (
                <span className="px-1.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[10px] font-semibold text-blue-600 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                  ke {destWallet.name}
                </span>
              )}
              {transaction.notes && (
                <span className="truncate max-w-[120px] sm:max-w-xs text-[11px] text-slate-400 dark:text-slate-500">
                  • {transaction.notes}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Amount & Direct Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="text-right">
            <p
              className={`text-xs sm:text-sm font-extrabold tracking-tight tabular-nums ${
                isIncome
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isExpense
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              {isIncome ? '+' : isExpense ? '-' : ''}
              {formatRupiah(transaction.amount)}
            </p>
          </div>

          {/* Action Buttons: Direct, Touch-friendly (min 38x38px), Zero-delay */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={handleTriggerEdit}
              aria-label="Ubah transaksi"
              title="Ubah Transaksi"
              className="ios-btn p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
            >
              <Edit3 size={15} />
            </button>
            <button
              type="button"
              onClick={handleTriggerDelete}
              aria-label="Hapus transaksi"
              title="Hapus Transaksi"
              className="ios-btn p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </article>

      {/* Fallback Confirm Delete Dialog if onDelete prop is not supplied */}
      {!onDelete && (
        <ConfirmDialog
          isOpen={showConfirmDelete}
          onClose={() => setShowConfirmDelete(false)}
          onConfirm={handleDelete}
          title="Hapus Transaksi"
          message={`Apakah Anda yakin ingin menghapus transaksi "${title}" sebesar ${formatRupiah(transaction.amount)}? Data yang dihapus tidak dapat dipulihkan.`}
          confirmLabel="Hapus Transaksi"
        />
      )}
    </>
  );
};
