import React, { useState } from 'react';
import { IconRenderer } from '../common/IconRenderer';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatRupiah } from '../../utils/currency';
import { toggleArchiveWallet, deleteWallet, type WalletBalanceInfo } from '../../db/services';
import { Edit3, Archive, ArchiveRestore, Trash2, MoreVertical } from 'lucide-react';
import type { Wallet } from '../../types';

interface WalletCardProps {
  walletInfo: WalletBalanceInfo;
  onEdit: (wallet: Wallet) => void;
  onUpdated: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ walletInfo, onEdit, onUpdated }) => {
  const { wallet, balance, totalIncome, totalExpense } = walletInfo;
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

  const handleToggleArchive = async () => {
    await toggleArchiveWallet(wallet.id, !wallet.isArchived);
    setShowMenu(false);
    onUpdated();
  };

  const handleDelete = async () => {
    const res = await deleteWallet(wallet.id);
    if (!res.success) {
      setDeleteErrorMessage(res.message || 'Gagal menghapus dompet');
    } else {
      setShowConfirmDelete(false);
      onUpdated();
    }
  };

  return (
    <>
      <div
        className={`relative p-4 rounded-2xl border transition-all ${
          wallet.isArchived
            ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
              style={{ backgroundColor: wallet.color }}
            >
              <IconRenderer name={wallet.icon} size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {wallet.name}
                </h3>
                {wallet.isArchived && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Arsip
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 capitalize">
                {wallet.type === 'cash'
                  ? 'Uang Tunai'
                  : wallet.type === 'bank'
                  ? 'Rekening Bank'
                  : wallet.type === 'ewallet'
                  ? 'E-Wallet'
                  : wallet.type === 'investment'
                  ? 'Investasi'
                  : 'Lainnya'}
              </p>
            </div>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Menu dompet"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 z-30">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(wallet);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Edit3 size={14} className="text-blue-500" />
                    <span>Ubah Dompet</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleArchive}
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    {wallet.isArchived ? (
                      <>
                        <ArchiveRestore size={14} className="text-emerald-500" />
                        <span>Buka Arsip</span>
                      </>
                    ) : (
                      <>
                        <Archive size={14} className="text-amber-500" />
                        <span>Arsipkan</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setDeleteErrorMessage('');
                      setShowConfirmDelete(true);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    <span>Hapus</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Balance Display */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400">Saldo Saat Ini</span>
          <p
            className={`text-lg font-bold tracking-tight ${
              balance >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatRupiah(balance)}
          </p>

          <div className="flex items-center justify-between mt-2 pt-2 text-[11px] text-slate-500 border-t border-dashed border-slate-100 dark:border-slate-800/60">
            <span>Masuk: +{formatRupiah(totalIncome)}</span>
            <span>Keluar: -{formatRupiah(totalExpense)}</span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setDeleteErrorMessage('');
        }}
        onConfirm={handleDelete}
        title="Hapus Dompet"
        message={
          deleteErrorMessage ||
          `Apakah Anda yakin ingin menghapus dompet "${wallet.name}"? Catatan: Jika dompet sudah memiliki transaksi, sistem akan meminta Anda mengarsipkannya agar pembukuan tidak rusak.`
        }
        confirmLabel="Ya, Hapus"
      />
    </>
  );
};
