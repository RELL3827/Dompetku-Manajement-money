import React, { useState, useMemo } from 'react';
import { TransactionItem } from './TransactionItem';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { getRelativeDateLabel } from '../../utils/date';
import { formatRupiah } from '../../utils/currency';
import { deleteTransaction } from '../../db/services';
import type { Transaction, Category, Wallet } from '../../types';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  onEdit: (tx: Transaction) => void;
  onAddNew?: () => void;
  onDeleted?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  wallets,
  onEdit,
  onAddNew,
  onDeleted,
}) => {
  const [displayLimit, setDisplayLimit] = useState(25);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const walletMap = useMemo(() => new Map(wallets.map((w) => [w.id, w])), [wallets]);

  // Group transactions by date string
  const groupedByDate = useMemo(() => {
    const groups: { [dateStr: string]: Transaction[] } = {};

    transactions.forEach((tx) => {
      const d = tx.date;
      if (!groups[d]) groups[d] = [];
      groups[d].push(tx);
    });

    // Sort date keys descending
    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    return sortedDates.map((dateStr) => {
      const items = groups[dateStr];
      let dayIncome = 0;
      let dayExpense = 0;

      items.forEach((t) => {
        if (t.type === 'income') dayIncome += t.amount;
        if (t.type === 'expense') dayExpense += t.amount;
      });

      return {
        dateStr,
        label: getRelativeDateLabel(dateStr),
        items,
        dayIncome,
        dayExpense,
      };
    });
  }, [transactions]);

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      await deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error('Gagal menghapus transaksi:', err);
    }
  };

  const getTransactionTitle = (tx: Transaction | null) => {
    if (!tx) return '';
    if (tx.type === 'transfer') {
      const src = walletMap.get(tx.walletId)?.name || 'Dompet';
      const dst = tx.toWalletId ? walletMap.get(tx.toWalletId)?.name || 'Dompet' : 'Dompet';
      return `Transfer: ${src} → ${dst}`;
    }
    const cat = catMap.get(tx.categoryId);
    return cat?.name || 'Transaksi';
  };

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon="Receipt"
        title="Belum Ada Transaksi"
        description="Tidak ada catatan transaksi yang sesuai dengan filter pencarian Anda."
        actionLabel={onAddNew ? '+ Catat Transaksi' : undefined}
        onAction={onAddNew}
      />
    );
  }

  // Flatten limited items count
  let renderedCount = 0;

  return (
    <div className="space-y-6">
      {groupedByDate.map((group) => {
        if (renderedCount >= displayLimit) return null;

        const visibleItems = group.items.slice(0, Math.max(0, displayLimit - renderedCount));
        renderedCount += visibleItems.length;

        if (visibleItems.length === 0) return null;

        return (
          <div key={group.dateStr} className="space-y-2.5">
            {/* Date Group Header with Daily Summary (iOS 27 style) */}
            <div className="flex items-center justify-between px-2 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>{group.label}</span>
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px]">
                {group.dayIncome > 0 && (
                  <span className="ios-island-badge font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40">
                    +{formatRupiah(group.dayIncome)}
                  </span>
                )}
                {group.dayExpense > 0 && (
                  <span className="ios-island-badge font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/40">
                    -{formatRupiah(group.dayExpense)}
                  </span>
                )}
              </div>
            </div>

            {/* Transaction Items */}
            <div className="space-y-2">
              {visibleItems.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  category={catMap.get(tx.categoryId)}
                  sourceWallet={walletMap.get(tx.walletId)}
                  destWallet={tx.toWalletId ? walletMap.get(tx.toWalletId) : undefined}
                  onEdit={onEdit}
                  onDelete={(t) => setTransactionToDelete(t)}
                  onDeleted={onDeleted}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Load More Button for large transaction datasets */}
      {transactions.length > displayLimit && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setDisplayLimit((prev) => prev + 25)}
            className="ios-btn px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition-colors cursor-pointer"
          >
            Tampilkan Lebih Banyak ({transactions.length - displayLimit} tersisa)
          </button>
        </div>
      )}

      {/* Single centralized Confirm Dialog for Transaction Deletion */}
      <ConfirmDialog
        isOpen={transactionToDelete !== null}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Transaksi"
        message={
          transactionToDelete
            ? `Apakah Anda yakin ingin menghapus transaksi "${getTransactionTitle(transactionToDelete)}" sebesar ${formatRupiah(transactionToDelete.amount)}? Data yang dihapus tidak dapat dipulihkan.`
            : ''
        }
        confirmLabel="Ya, Hapus Transaksi"
      />
    </div>
  );
};
