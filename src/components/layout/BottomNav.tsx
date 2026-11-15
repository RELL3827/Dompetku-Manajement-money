import React, { useRef, useEffect } from 'react';
import type { NavTab } from '../../types';
import { RealisticIcon } from '../common/RealisticIcon';
import { triggerHaptic } from '../../utils/haptics';

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
      aria-label="Navigasi bawah iOS"
      className="md:hidden fixed bottom-3 left-3 right-3 z-30 max-w-lg mx-auto ios-glass-dock pb-[env(safe-area-inset-bottom)] transition-all"
    >
      <div className="flex items-center overflow-x-auto scrollbar-none h-[62px] px-1.5 gap-0.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              ref={isActive ? activeRef : null}
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                onChangeTab(tab.id);
              }}
              className={`ios-btn flex flex-col items-center justify-center gap-0.5 min-w-[58px] flex-1 py-1 transition-all cursor-pointer shrink-0 rounded-2xl ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 opacity-75 hover:opacity-100'
              }`}
            >
              <div
                className={`p-1.5 rounded-2xl transition-all duration-300 transform ${
                  isActive
                    ? 'bg-gradient-to-tr from-emerald-500/20 via-teal-400/25 to-emerald-500/30 scale-115 shadow-xs ring-1 ring-emerald-500/40 backdrop-blur-md animate-tab-pop'
                    : 'hover:bg-slate-500/10 hover:scale-105 active:scale-95'
                }`}
              >
                <RealisticIcon name={tab.iconName} size={21} />
              </div>
              <span className="text-[9px] font-semibold tracking-tight truncate max-w-full px-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
