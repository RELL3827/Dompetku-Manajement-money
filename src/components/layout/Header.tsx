import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, ShieldCheck, Lock, HardDrive, Download } from 'lucide-react';
import { isStoragePersisted, requestPersistentStorage } from '../../utils/pwa';
import { useAuthLock } from '../../hooks/useAuthLock';
import { db } from '../../db/database';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { PwaInstallModal } from '../common/PwaInstallModal';

interface HeaderProps {
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPersisted, setIsPersisted] = useState(false);
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const { lock } = useAuthLock();
  const { isInstalled, isIOS, isAndroid, showGuideModal, setShowGuideModal, installApp } = usePwaInstall();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    async function checkPersist() {
      const persisted = await isStoragePersisted();
      setIsPersisted(persisted);

      const settings = await db.getSettings();
      setIsPinEnabled(settings.security.isPinEnabled);
    }
    checkPersist();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRequestStorage = async () => {
    const granted = await requestPersistentStorage();
    setIsPersisted(granted);
    if (granted) {
      alert('Penyimpanan lokal berhasil diamankan! Browser tidak akan menghapus data keuangan Anda.');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-bold text-lg">
            D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                DompetKu
              </h1>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                100% Offline
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ShieldCheck size={11} className="text-emerald-500" />
              Privat & Terenkripsi Lokal
            </p>
          </div>
        </div>

        {/* Action badges & Lock */}
        <div className="flex items-center gap-2">
          {/* Storage persistence indicator */}
          {!isPersisted ? (
            <button
              type="button"
              onClick={handleRequestStorage}
              title="Aktifkan izin penyimpanan permanen agar data aman"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <HardDrive size={13} />
              <span>Amankan Storage</span>
            </button>
          ) : (
            <span
              title="Penyimpanan lokal terlindungi browser"
              className="hidden sm:flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-lg"
            >
              <HardDrive size={12} />
              <span>Storage Aman</span>
            </span>
          )}

          {/* PWA Install Button */}
          {!isInstalled && (
            <button
              type="button"
              onClick={installApp}
              title="Tambahkan DompetKu ke Layar Utama"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-all active:scale-95 shadow-2xs"
            >
              <Download size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Instal App</span>
            </button>
          )}

          {/* Offline/Online badge */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              !isOnline
                ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}
            title={!isOnline ? 'Aplikasi berjalan dalam mode offline tanpa koneksi' : 'Koneksi aktif (semua data tetap 100% offline di perangkat)'}
          >
            {!isOnline ? <WifiOff size={13} /> : <Wifi size={13} />}
            <span className="text-[11px]">{!isOnline ? 'Offline' : 'Lokal Aktif'}</span>
          </div>

          {/* Quick Lock Button if PIN is set */}
          {isPinEnabled && (
            <button
              type="button"
              onClick={lock}
              title="Kunci Aplikasi Sekarang"
              aria-label="Kunci aplikasi"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Lock size={17} />
            </button>
          )}
        </div>
      </div>

      {/* PWA Install Modal */}
      <PwaInstallModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        isIOS={isIOS}
        isAndroid={isAndroid}
        onNativeInstall={installApp}
      />
    </header>
  );
};
