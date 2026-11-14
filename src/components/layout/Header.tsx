import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, Lock, HardDrive, Download, Rocket, Coffee } from 'lucide-react';
import { RealisticIcon } from '../common/RealisticIcon';
import { isStoragePersisted, requestPersistentStorage } from '../../utils/pwa';
import { useAuthLock } from '../../hooks/useAuthLock';
import { db } from '../../db/database';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { usePwaUpdate } from '../../context/PwaUpdateContext';
import { PwaInstallModal } from '../common/PwaInstallModal';
import { DonationModal } from '../common/DonationModal';
import { APP_VERSION } from '../../utils/version';

interface HeaderProps {
  onOpenSettings?: () => void;
  onOpenCalculator?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenCalculator }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPersisted, setIsPersisted] = useState(false);
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const { lock } = useAuthLock();
  const { isInstalled, isIOS, isAndroid, showGuideModal, setShowGuideModal, installApp } = usePwaInstall();
  const { needRefresh, openPrompt } = usePwaUpdate();

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
    <header className="sticky top-0 z-30 ios-glass-header transition-colors">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-400/20 to-emerald-500/25 border border-emerald-500/30 flex items-center justify-center shadow-xs backdrop-blur-md">
            <RealisticIcon name="Wallet" size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                DompetKu
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300 border border-emerald-500/25 backdrop-blur-md shadow-xs">
                Liquid Glass Edition
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              <RealisticIcon name="ShieldCheck" size={12} />
              <span>Privat & Terenkripsi Lokal</span>
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
              className="ios-btn hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50/90 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60 rounded-xl hover:bg-amber-100"
            >
              <HardDrive size={13} />
              <span>Amankan Storage</span>
            </button>
          ) : (
            <span
              title="Penyimpanan lokal terlindungi browser"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full border border-emerald-200/50 dark:border-emerald-800/40"
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
              className="ios-btn flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50/90 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl"
            >
              <Download size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Instal App</span>
            </button>
          )}

          {/* Update Available Prompt Button */}
          {needRefresh && (
            <button
              type="button"
              onClick={openPrompt}
              title="Versi baru DompetKu siap dipasang! Klik untuk update"
              className="ios-btn ios-btn-primary flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl animate-pulse cursor-pointer shadow-md"
            >
              <Rocket size={13} />
              <span>Update v{APP_VERSION}</span>
            </button>
          )}

          {/* Offline/Online badge */}
          <div
            className={`ios-island-badge ${
              !isOnline
                ? '!bg-slate-100 !text-slate-700 !border-slate-200 dark:!bg-slate-800 dark:!text-slate-300 dark:!border-slate-700'
                : ''
            }`}
            title={!isOnline ? 'Aplikasi berjalan dalam mode offline tanpa koneksi' : 'Koneksi aktif (semua data tetap 100% offline di perangkat)'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${!isOnline ? 'bg-slate-400' : 'bg-emerald-500 animate-ping'}`} />
            {!isOnline ? <WifiOff size={12} /> : <Wifi size={12} />}
            <span>{!isOnline ? 'Offline' : 'Lokal Aktif'}</span>
          </div>

          {/* Quick Calculator Button */}
          {onOpenCalculator && (
            <button
              type="button"
              onClick={onOpenCalculator}
              title="Kalkulator & Alat Hitung Cepat"
              className="ios-btn flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl cursor-pointer"
            >
              <RealisticIcon name="Calculator" size={15} />
              <span className="hidden sm:inline">Kalkulator</span>
            </button>
          )}

          {/* Traktir Kopi Button */}
          <button
            type="button"
            onClick={() => setIsDonationModalOpen(true)}
            title="Traktir Pengembang Kopi ☕"
            className="ios-btn flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50/80 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/40 border border-amber-200/80 dark:border-amber-900/60 rounded-xl cursor-pointer"
          >
            <Coffee size={15} />
            <span className="hidden sm:inline">Traktir Kopi</span>
          </button>

          {/* Quick Lock Button if PIN is set */}
          {isPinEnabled && (
            <button
              type="button"
              onClick={lock}
              title="Kunci Aplikasi Sekarang"
              aria-label="Kunci aplikasi"
              className="ios-btn p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-50/70 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
            >
              <Lock size={17} />
            </button>
          )}

          {/* Settings Shortcut Button */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              title="Pengaturan Aplikasi"
              aria-label="Pengaturan"
              className="ios-btn p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-50/70 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
            >
              <RealisticIcon name="Settings" size={18} />
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

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </header>
  );
};
