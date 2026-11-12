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
      return false;
    }
    setShowConfirmDelete(false);
    onUpdated();
    return true;
  };

  const handleConfirmAction = async () => {
    if (deleteErrorMessage) {
      await handleToggleArchive();
      setShowConfirmDelete(false);
      setDeleteErrorMessage('');
      return true;
    }
    return await handleDelete();
  };

  return (
    <>
      <article
        className={`card-elevated relative p-5 transition-all ${
          wallet.isArchived
            ? 'opacity-60 bg-slate-50/60 dark:bg-slate-900/40'
            : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md border border-black/5 dark:border-white/10"
              style={{ backgroundColor: wallet.color }}
            >
              <IconRenderer name={wallet.icon} size={24} />
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
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-36 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(wallet);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 size={14} className="text-blue-500" />
                    <span>Ubah Dompet</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleArchive}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
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

        {/* Balance Display */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400">Saldo Saat Ini</span>
          <p
            className={`text-xl font-extrabold tracking-tight tabular-nums mt-0.5 ${
              balance >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatRupiah(balance)}
          </p>

          <div className="flex items-center justify-between mt-2.5 pt-2 text-[11px] text-slate-500 border-t border-dashed border-slate-100 dark:border-slate-800/60 tabular-nums">
            <span>Masuk: +{formatRupiah(totalIncome)}</span>
            <span>Keluar: -{formatRupiah(totalExpense)}</span>
          </div>
        </div>
      </article>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setDeleteErrorMessage('');
        }}
        onConfirm={handleConfirmAction}
        title={deleteErrorMessage ? 'Perhatian: Riwayat Transaksi Ada' : 'Hapus Dompet'}
        message={
          deleteErrorMessage ||
          `Apakah Anda yakin ingin menghapus dompet "${wallet.name}"? Catatan: Jika dompet sudah memiliki transaksi, sistem akan meminta Anda mengarsipkannya agar pembukuan tidak rusak.`
        }
        confirmLabel={deleteErrorMessage ? 'Arsipkan Saja' : 'Ya, Hapus'}
        isDestructive={!deleteErrorMessage}
      />
    </>
  );
};
