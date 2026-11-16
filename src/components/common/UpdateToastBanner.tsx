import React from 'react';
import { usePwaUpdate } from '../../context/PwaUpdateContext';
import { Rocket, RefreshCw, X, ArrowUpRight } from 'lucide-react';

export const UpdateToastBanner: React.FC = () => {
  const {
    needRefresh,
    isPromptOpen,
    isUpdating,
    updateApp,
    openPrompt,
    dismissUpdatePrompt,
  } = usePwaUpdate();

  // If there's no update or the full modal is currently open, don't show the toast banner
  if (!needRefresh || isPromptOpen) {
    return null;
  }

  return (
    <aside
      aria-label="Pemberitahuan pembaruan aplikasi"
      className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-4 left-4 md:left-auto md:w-[400px] z-50 ios-glass-card shadow-2xl p-3 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300 ring-1 ring-emerald-500/30"
    >
      <div
        onClick={openPrompt}
        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') openPrompt();
        }}
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
          <Rocket size={19} className="animate-bounce" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
              Versi Baru Tersedia!
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Tap untuk update tanpa instal ulang
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          disabled={isUpdating}
          onClick={updateApp}
          className="ios-btn ios-btn-primary px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-60"
        >
          {isUpdating ? (
            <RefreshCw size={12} className="animate-spin" />
          ) : (
            <ArrowUpRight size={13} />
          )}
          <span>{isUpdating ? 'Memasang...' : 'Update'}</span>
        </button>

        <button
          type="button"
          onClick={dismissUpdatePrompt}
          aria-label="Tutup notifikasi pembaruan"
          className="ios-btn p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
};
