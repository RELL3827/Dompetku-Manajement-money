import React, { useState } from 'react';
import {
  Home,
  History,
  Calendar,
  WalletCards,
  PiggyBank,
  Target,
  BarChart3,
  Settings,
  ShieldCheck,
  Sun,
  Moon,
  Download,
  Heart,
  FileText,
  Calculator,
  MessageSquare,
  Info,
} from 'lucide-react';
import type { NavTab } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { PwaInstallModal } from '../common/PwaInstallModal';
import { DonationModal } from '../common/DonationModal';

interface DesktopSidebarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenAddModal: () => void;
  onOpenAbout?: () => void;
  onOpenFeedback?: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onChangeTab,
  onOpenAddModal,
  onOpenAbout,
  onOpenFeedback,
}) => {
  const { theme, setTheme } = useTheme();
  const { isInstalled, isIOS, isAndroid, showGuideModal, setShowGuideModal, installApp } = usePwaInstall();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  const navItems = [
    { id: 'home' as NavTab, label: 'Beranda', icon: Home },
    { id: 'transactions' as NavTab, label: 'Riwayat Transaksi', icon: History },
    { id: 'calendar' as NavTab, label: 'Kalender Keuangan', icon: Calendar },
    { id: 'savings' as NavTab, label: 'Target Tabungan', icon: PiggyBank },
    { id: 'budgets' as NavTab, label: 'Anggaran 50/30/20', icon: Target },
    { id: 'notes' as NavTab, label: 'Catatan Keuangan', icon: FileText },
    { id: 'calculator' as NavTab, label: 'Kalkulator Cepat', icon: Calculator },
    { id: 'wallets' as NavTab, label: 'Kelola Dompet', icon: WalletCards },
    { id: 'analytics' as NavTab, label: 'Statistik & Analitik', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Pengaturan & Backup', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 p-4 justify-between transition-colors">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-bold text-xl">
            D
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">DompetKu</h2>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck size={12} /> 100% Offline
            </p>
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <span>+ Catat Transaksi</span>
        </button>

        {/* Nav Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-emerald-600 dark:text-emerald-400' : ''} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Theme toggle */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {/* PWA Install Button for Desktop */}
        {!isInstalled && (
          <button
            type="button"
            onClick={installApp}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-2xs cursor-pointer"
          >
            <Download size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>Instal ke Desktop</span>
          </button>
        )}

        <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Mode: <strong className="capitalize text-slate-800 dark:text-slate-200">{theme === 'light' ? 'Terang' : theme === 'dark' ? 'Gelap' : 'Sistem'}</strong></span>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
            title="Ganti Tema (Terang / Gelap)"
          >
            {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-700" />}
          </button>
        </div>

        <div className="pt-2 px-2 border-t border-slate-100/60 dark:border-slate-800/60 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={onOpenAbout}
              className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <Info size={12} />
              <span>Tentang DompetKu</span>
            </button>
            <button
              type="button"
              onClick={onOpenFeedback}
              className="text-slate-500 dark:text-slate-400 hover:text-amber-500 flex items-center gap-1 transition-colors"
            >
              <MessageSquare size={12} />
              <span>Feedback</span>
            </button>
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Dibuat oleh <strong className="font-semibold text-emerald-600 dark:text-emerald-400">Farel Rizky P</strong> • MIT
          </p>

          <button
            type="button"
            onClick={() => setIsDonationModalOpen(true)}
            className="w-full mt-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 hover:from-rose-500/20 hover:to-pink-500/20 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs"
          >
            <Heart size={13} className="fill-current text-rose-500 animate-pulse" />
            <span>Donasi Seikhlasnya</span>
          </button>
        </div>
      </div>

      {/* PWA Guide Modal */}
      <PwaInstallModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        isIOS={isIOS}
        isAndroid={isAndroid}
        onNativeInstall={installApp}
      />

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </aside>
  );
};
