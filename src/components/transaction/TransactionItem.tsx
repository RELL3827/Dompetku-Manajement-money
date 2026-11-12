import React, { useState } from 'react';
import { IconRenderer } from '../common/IconRenderer';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatRupiah } from '../../utils/currency';
import { deleteTransaction } from '../../db/services';
import type { Transaction, Category, Wallet } from '../../types';
import { Edit3, Trash2, MoreVertical } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  sourceWallet?: Wallet;
  destWallet?: Wallet;
  onEdit: (tx: Transaction) => void;
  onDeleted?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  category,
  sourceWallet,
  destWallet,
  onEdit,
  onDeleted,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isExpense = transaction.type === 'expense';
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';

  const iconName = isTransfer ? 'ArrowLeftRight' : category?.icon || 'Tag';
  const iconColor = isTransfer ? '#3b82f6' : category?.color || '#64748b';

  const title = isTransfer
    ? `Transfer: ${sourceWallet?.name || 'Dompet'} → ${destWallet?.name || 'Dompet'}`
    : category?.name || 'Lainnya';

  const handleDelete = async () => {
    await deleteTransaction(transaction.id);
    if (onDeleted) onDeleted();
  };

  return (
    <>
      <article className="btn-tactile card-elevated group relative flex items-center justify-between p-3.5 transition-all">
        {/* Left: Icon & Details */}
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm border border-black/5 dark:border-white/10"
            style={{ backgroundColor: iconColor }}
          >
            <IconRenderer name={iconName} size={22} />
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                {sourceWallet?.name || 'Dompet'}
              </span>
              {transaction.notes && (
                <span className="truncate max-w-[140px] sm:max-w-xs text-[11px] text-slate-400 dark:text-slate-500">
                  • {transaction.notes}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Amount & Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <p
              className={`text-sm font-extrabold tracking-tight tabular-nums ${
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

          {/* Action Menu button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Menu aksi transaksi"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-32 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(transaction);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 size={14} className="text-blue-500" />
                    <span>Ubah</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowConfirmDelete(true);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Hapus</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </article>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Transaksi"
        message={`Apakah Anda yakin ingin menghapus transaksi "${title}" sebesar ${formatRupiah(transaction.amount)}? Data yang dihapus tidak dapat dipulihkan.`}
        confirmLabel="Hapus Transaksi"
      />
    </>
  );
};
