import React, { useState, useMemo } from 'react';
import { TransactionItem } from './TransactionItem';
import { EmptyState } from '../common/EmptyState';
import { getRelativeDateLabel } from '../../utils/date';
import { formatRupiah } from '../../utils/currency';
import type { Transaction, Category, Wallet } from '../../types';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  onEdit: (tx: Transaction) => void;
  onAddNew?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  wallets,
  onEdit,
  onAddNew,
}) => {
  const [displayLimit, setDisplayLimit] = useState(25);

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

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon="Receipt"
        title="Belum Ada Transaksi"
        description="Tidak ada catatan transaksi yang sesuai dengan filter pencarian Anda."
        actionLabel={onAddNew ? "+ Catat Transaksi" : undefined}
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
          <div key={group.dateStr} className="space-y-2">
            {/* Date Group Header with Daily Summary */}
            <div className="flex items-center justify-between px-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {group.label}
              </span>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                {group.dayIncome > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    +{formatRupiah(group.dayIncome)}
                  </span>
                )}
                {group.dayExpense > 0 && (
                  <span className="text-rose-500 dark:text-rose-400 font-medium">
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
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-colors"
          >
            Tampilkan Lebih Banyak ({transactions.length - displayLimit} tersisa)
          </button>
        </div>
      )}
    </div>
  );
};
