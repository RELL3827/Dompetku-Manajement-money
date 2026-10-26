import React, { useState } from 'react';
import { Smartphone, Download, X, ShieldCheck, Sparkles } from 'lucide-react';

interface PwaInstallBannerProps {
  isInstalled: boolean;
  onInstall: () => void;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ isInstalled, onInstall }) => {
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('pwa_banner_dismissed') === 'true';
  });

  if (isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  return (
    <div className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-700/20 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Decorative background circle */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={handleDismiss}
        title="Sembunyikan pesan ini"
        className="absolute top-3 right-3 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X size={16} />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 pr-6 sm:pr-0">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
            <Smartphone size={24} className="text-emerald-100 animate-bounce" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white flex items-center gap-1">
                <Sparkles size={11} /> PWA Siap Dipasang
              </span>
              <span className="text-[10px] text-emerald-100 font-medium hidden sm:inline flex items-center gap-1">
                <ShieldCheck size={11} /> 100% Offline & Privat
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Instal DompetKu ke Layar Utama
            </h3>

            <p className="text-xs text-emerald-100/90 leading-relaxed max-w-xl">
              Gunakan layaknya aplikasi native di Android, iPhone/iPad, atau Desktop tanpa bar browser. 
              Semua data tersimpan aman dan privat di IndexedDB perangkat Anda!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-center shrink-0">
          <button
            type="button"
            onClick={onInstall}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 active:bg-emerald-100 text-emerald-800 text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Download size={15} />
            <span>Tambahkan ke Layar Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};
