import React, { useRef, useEffect } from 'react';
import type { NavTab } from '../../types';
import { RealisticIcon } from '../common/RealisticIcon';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Beranda', iconName: 'Home' },
    { id: 'transactions' as NavTab, label: 'Riwayat', iconName: 'History' },
    { id: 'calendar' as NavTab, label: 'Kalender', iconName: 'Calendar' },
    { id: 'notes' as NavTab, label: 'Catatan', iconName: 'FileText' },
    { id: 'calculator' as NavTab, label: 'Kalkulator', iconName: 'Calculator' },
    { id: 'budgets' as NavTab, label: 'Anggaran', iconName: 'Target' },
    { id: 'savings' as NavTab, label: 'Tabungan', iconName: 'PiggyBank' },
    { id: 'wallets' as NavTab, label: 'Dompet', iconName: 'Wallet' },
    { id: 'analytics' as NavTab, label: 'Statistik', iconName: 'BarChart3' },
    { id: 'settings' as NavTab, label: 'Setelan', iconName: 'Settings' },
  ];

  const activeRef = useRef<HTMLButtonElement | null>(null);

  // Auto scroll active tab into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeTab]);

  return (
    <nav
      aria-label="Navigasi bawah"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 pb-[env(safe-area-inset-bottom)] shadow-lg transition-colors"
    >
      <div className="flex items-center overflow-x-auto scrollbar-none h-16 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              ref={isActive ? activeRef : null}
              type="button"
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] flex-1 py-1 transition-all cursor-pointer shrink-0 active:scale-90 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 opacity-70 hover:opacity-100'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-emerald-500/10 dark:bg-emerald-500/20 scale-110 drop-shadow-xs' : ''
                }`}
              >
                <RealisticIcon name={tab.iconName} size={20} />
              </div>
              <span className="text-[9px] tracking-tight truncate max-w-full px-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
