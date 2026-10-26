import React from 'react';
import { Home, History, WalletCards, PiggyBank, Target, BarChart3, Settings, ShieldCheck, Sun, Moon } from 'lucide-react';
import type { NavTab } from '../../types';
import { useTheme } from '../../hooks/useTheme';

interface DesktopSidebarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenAddModal: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onChangeTab,
  onOpenAddModal,
}) => {
  const { theme, setTheme } = useTheme();

  const navItems = [
    { id: 'home' as NavTab, label: 'Beranda', icon: Home },
    { id: 'transactions' as NavTab, label: 'Riwayat Transaksi', icon: History },
    { id: 'savings' as NavTab, label: 'Target Tabungan', icon: PiggyBank },
    { id: 'budgets' as NavTab, label: 'Anggaran Bulanan', icon: Target },
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
        <p className="text-[11px] text-slate-400 dark:text-slate-600 px-2 leading-relaxed">
          DompetKu v1.0 • Lisensi MIT Bebas & Terbuka
        </p>
      </div>
    </aside>
  );
};
