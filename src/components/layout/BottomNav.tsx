import React from 'react';
import { Home, History, WalletCards, PiggyBank, Target, BarChart3, Settings } from 'lucide-react';
import type { NavTab } from '../../types';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Beranda', icon: Home },
    { id: 'transactions' as NavTab, label: 'Riwayat', icon: History },
    { id: 'savings' as NavTab, label: 'Tabungan', icon: PiggyBank },
    { id: 'budgets' as NavTab, label: 'Anggaran', icon: Target },
    { id: 'wallets' as NavTab, label: 'Dompet', icon: WalletCards },
    { id: 'analytics' as NavTab, label: 'Statistik', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Setelan', icon: Settings },
  ];

  return (
    <nav
      aria-label="Navigasi bawah"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] shadow-lg"
    >
      <div className="grid grid-cols-7 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-all ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-emerald-50 dark:bg-emerald-950/60 scale-110' : ''
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
              </div>
              <span className="text-[9px] tracking-tight truncate max-w-full px-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
