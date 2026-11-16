import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Download,
  MessageSquare,
  Info,
  Plus,
  Coffee,
} from 'lucide-react';
import type { NavTab } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { PwaInstallModal } from '../common/PwaInstallModal';
import { DonationModal } from '../common/DonationModal';
import { RealisticIcon } from '../common/RealisticIcon';
import { useStreak } from '../../hooks/useStreak';

interface DesktopSidebarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenAddModal: () => void;
  onOpenAbout?: () => void;
  onOpenFeedback?: () => void;
  onOpenStreak?: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onChangeTab,
  onOpenAddModal,
  onOpenAbout,
  onOpenFeedback,
  onOpenStreak,
}) => {
  const streak = useStreak();
  const { theme, setTheme } = useTheme();
  const { isInstalled, isIOS, isAndroid, showGuideModal, setShowGuideModal, installApp } = usePwaInstall();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  const navItems = [
    { id: 'home' as NavTab, label: 'Beranda', iconName: 'Home' },
    { id: 'transactions' as NavTab, label: 'Riwayat Transaksi', iconName: 'History' },
    { id: 'calendar' as NavTab, label: 'Kalender Keuangan', iconName: 'Calendar' },
    { id: 'savings' as NavTab, label: 'Target Tabungan', iconName: 'PiggyBank' },
    { id: 'budgets' as NavTab, label: 'Anggaran 50/30/20', iconName: 'Target' },
    { id: 'notes' as NavTab, label: 'Catatan Keuangan', iconName: 'FileText' },
    { id: 'calculator' as NavTab, label: 'Kalkulator Cepat', iconName: 'Calculator' },
    { id: 'wallets' as NavTab, label: 'Kelola Dompet', iconName: 'Wallet' },
    { id: 'analytics' as NavTab, label: 'Statistik & Analitik', iconName: 'BarChart3' },
    { id: 'settings' as NavTab, label: 'Pengaturan & Backup', iconName: 'Settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 h-screen sticky top-0 p-4 justify-between transition-colors shadow-xs">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500/15 via-teal-400/15 to-emerald-500/20 border border-emerald-500/25 flex items-center justify-center shadow-sm">
            <RealisticIcon name="Wallet" size={28} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">DompetKu</h2>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <RealisticIcon name="ShieldCheck" size={12} /> 100% Offline
            </p>
          </div>
        </div>

        {/* Streak Api Banner */}
        {onOpenStreak && (
          <div
            onClick={onOpenStreak}
            className={`p-3 rounded-2xl border transition-all cursor-pointer group shadow-2xs ${
              streak.isRecordedToday
                ? 'bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-emerald-500/10 border-orange-500/25 hover:border-orange-500/40'
                : streak.currentStreak > 0
                ? 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 border-amber-500/35 hover:border-amber-500/50'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-orange-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                  streak.isRecordedToday
                    ? 'bg-gradient-to-tr from-orange-500 to-amber-400 text-white shadow-xs'
                    : 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
                }`}>
                  🔥
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
                    <span>{streak.currentStreak} Hari Streak</span>
                  </p>
                  <p className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                    {streak.isRecordedToday ? 'Api Menyala Hari Ini 🔥' : 'Catat Hari Ini! ⏳'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-orange-500 transition-colors">
                Detail →
              </span>
            </div>
          </div>
        )}

        {/* Quick Add Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          className="ios-btn ios-btn-primary w-full py-2.5 px-4 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Plus size={16} strokeWidth={2.6} />
          <span>Catat Transaksi</span>
        </button>

        {/* Nav Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                className={`ios-btn w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300 font-extrabold border border-emerald-500/30 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-500/10 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-xs' : 'opacity-80 group-hover:opacity-100 group-hover:scale-105'}`}>
                  <RealisticIcon name={item.iconName} size={20} />
                </span>
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
            className="btn-tactile w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
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
            className="btn-tactile p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
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
              className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Info size={12} />
              <span>Tentang DompetKu</span>
            </button>
            <button
              type="button"
              onClick={onOpenFeedback}
              className="text-slate-500 dark:text-slate-400 hover:text-amber-500 flex items-center gap-1 transition-colors cursor-pointer"
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
            className="ios-btn w-full mt-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/15 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Coffee size={14} />
            <span>Traktir Kopi</span>
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
