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
      className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-40 bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-xl p-3.5 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300 ring-1 ring-emerald-500/20"
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
        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Rocket size={18} className="animate-pulse" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              Pembaruan Tersedia!
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Klik untuk update tanpa instal ulang
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          disabled={isUpdating}
          onClick={updateApp}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-60"
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
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
};
