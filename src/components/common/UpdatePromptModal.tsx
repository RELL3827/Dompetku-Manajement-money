import React from 'react';
import { usePwaUpdate } from '../../context/PwaUpdateContext';
import { APP_VERSION, APP_RELEASE_DATE, LATEST_RELEASE_NOTES } from '../../utils/version';
import {
  Rocket,
  ShieldCheck,
  RefreshCw,
  X,
  Sparkles,
  Zap,
} from 'lucide-react';

export const UpdatePromptModal: React.FC = () => {
  const {
    needRefresh,
    isPromptOpen,
    isUpdating,
    updateApp,
    dismissUpdatePrompt,
  } = usePwaUpdate();

  if (!isPromptOpen || !needRefresh) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-modal-title"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Decorative Gradient Banner */}
        <div className="relative p-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

          {/* Close button */}
          {!isUpdating && (
            <button
              type="button"
              onClick={dismissUpdatePrompt}
              aria-label="Tutup pemberitahuan"
              className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Rocket size={24} className="animate-bounce" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-xs mb-1">
                <Sparkles size={11} />
                <span>Pembaruan Siap Dipasang</span>
              </div>
              <h2 id="update-modal-title" className="text-lg font-bold text-white tracking-tight">
                Versi Baru DompetKu Tersedia!
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Version & Date Card */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Target Pembaruan
              </span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                {APP_VERSION}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Tanggal Rilis
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {APP_RELEASE_DATE}
              </span>
            </div>
          </div>

          {/* Zero Data Loss Guarantee */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Data Keuangan Anda 100% Aman</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800/90 dark:text-emerald-300/90">
              Tidak perlu meng-uninstall atau memasang ulang aplikasi! Semua catatan transaksi, saldo dompet, anggaran, dan catatan Anda tetap utuh tersimpan di perangkat (IndexedDB).
            </p>
          </div>

          {/* What's New List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={12} className="text-amber-500" />
              <span>Apa yang baru di versi ini?</span>
            </span>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {LATEST_RELEASE_NOTES.map((note, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <span className="text-sm shrink-0">{note.icon || '✨'}</span>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {note.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      {note.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              disabled={isUpdating}
              onClick={updateApp}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Memasang & Memuat Ulang...</span>
                </>
              ) : (
                <>
                  <Rocket size={15} />
                  <span>Update Sekarang (1-Klik)</span>
                </>
              )}
            </button>

            {!isUpdating && (
              <button
                type="button"
                onClick={dismissUpdatePrompt}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Nanti Saja
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
