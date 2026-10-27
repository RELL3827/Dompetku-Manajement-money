import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getAllWalletBalances, type WalletBalanceInfo } from '../db/services';
import { WalletCard } from '../components/wallet/WalletCard';
import { WalletFormModal } from '../components/wallet/WalletFormModal';
import { EmptyState } from '../components/common/EmptyState';
import { formatRupiah } from '../utils/currency';
import { Plus, WalletCards, ArrowLeftRight, Archive } from 'lucide-react';
import type { Wallet, TransactionType } from '../types';

interface WalletsPageProps {
  onOpenTransactionModal: (type?: TransactionType) => void;
}

export const WalletsPage: React.FC<WalletsPageProps> = ({ onOpenTransactionModal }) => {
  const [walletBalances, setWalletBalances] = useState<WalletBalanceInfo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [walletToEdit, setWalletToEdit] = useState<Wallet | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const txTrigger = useLiveQuery(() => db.transactions.toArray());
  const walletTrigger = useLiveQuery(() => db.wallets.toArray());

  const loadWallets = async () => {
    const all = await getAllWalletBalances();
    setWalletBalances(all);
  };

  useEffect(() => {
    loadWallets();
  }, [txTrigger, walletTrigger]);

  const activeWallets = walletBalances.filter((w) => !w.wallet.isArchived);
  const archivedWallets = walletBalances.filter((w) => w.wallet.isArchived);

  const totalActiveBalance = activeWallets.reduce((sum, w) => sum + w.balance, 0);

  const handleOpenAdd = () => {
    setWalletToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (w: Wallet) => {
    setWalletToEdit(w);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Kelola Dompet
          </h1>
          <p className="text-xs text-slate-500">
            {activeWallets.length} dompet aktif terdaftar
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeWallets.length >= 2 && (
            <button
              type="button"
              onClick={() => onOpenTransactionModal('transfer')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              <ArrowLeftRight size={14} />
              <span className="hidden sm:inline">Transfer Antar Dompet</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus size={15} />
            <span>Tambah Dompet</span>
          </button>
        </div>
      </div>

      {/* Aggregate Balance Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-400">Total Saldo Seluruh Dompet</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {formatRupiah(totalActiveBalance)}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <WalletCards size={24} />
        </div>
      </div>

      {/* Active Wallets Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 px-1">
          Dompet Aktif
        </h2>

        {activeWallets.length === 0 ? (
          <EmptyState
            icon="Wallet"
            title="Belum Ada Dompet"
            description="Tambahkan dompet pertama Anda untuk mulai mencatat keuangan."
            actionLabel="+ Tambah Dompet Baru"
            onAction={handleOpenAdd}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeWallets.map((wb) => (
              <WalletCard
                key={wb.wallet.id}
                walletInfo={wb}
                onEdit={handleEdit}
                onUpdated={loadWallets}
              />
            ))}
          </div>
        )}
      </div>

      {/* Archived Wallets Section */}
      {archivedWallets.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <Archive size={14} />
            <span>Dompet Diarsipkan ({archivedWallets.length})</span>
            <span className="text-[10px] text-slate-400">
              {showArchived ? 'Sembunyikan' : 'Tampilkan'}
            </span>
          </button>

          {showArchived && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in">
              {archivedWallets.map((wb) => (
                <WalletCard
                  key={wb.wallet.id}
                  walletInfo={wb}
                  onEdit={handleEdit}
                  onUpdated={loadWallets}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Wallet Form Modal */}
      <WalletFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        walletToEdit={walletToEdit}
        onSaved={loadWallets}
      />
    </div>
  );
};
