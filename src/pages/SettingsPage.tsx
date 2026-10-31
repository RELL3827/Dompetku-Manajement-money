import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { restoreAllData, resetAllData } from '../db/services';
import {
  exportBackupToJson,
  exportTransactionsToCsv,
  parseBackupFile,
} from '../utils/exportImport';
import {
  isStoragePersisted,
  requestPersistentStorage,
  getStorageEstimate,
} from '../utils/pwa';
import { PinSetupModal } from '../components/security/PinSetupModal';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { formatIndonesianDate } from '../utils/date';
import {
  Sun,
  Moon,
  Laptop,
  Shield,
  Download,
  Upload,
  FileSpreadsheet,
  HardDrive,
  Lock,
  Trash2,
  CheckCircle2,
  FileKey,
  ShieldCheck,
  Smartphone,
  Info,
  Heart,
  Rocket,
  RefreshCw,
  Sparkles,
  Activity,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import type { BackupData, ThemeMode, NavTab } from '../types';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { usePwaUpdate } from '../context/PwaUpdateContext';
import { APP_VERSION, APP_RELEASE_DATE } from '../utils/version';
import { PwaInstallModal } from '../components/common/PwaInstallModal';
import { DonationModal } from '../components/common/DonationModal';
import {
  isStatsFeatureAvailable,
  isStatsOptInEnabled,
  enableStatsOptIn,
  disableStatsOptIn,
  deleteMyStatsData,
  getExamplePayload,
  sendDailyPingIfDue,
  getLastPingDate,
  getCurrentInstallId,
  STATS_ENDPOINT,
  getActiveStatsEndpoint,
  setCustomStatsEndpoint,
} from '../telemetry/optInStats';

interface SettingsPageProps {
  onOpenAbout?: () => void;
  onOpenFeedback?: () => void;
  onOpenDonation?: () => void;
  onNavigate?: (tab: NavTab) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onOpenAbout,
  onOpenFeedback,
  onOpenDonation,
  onNavigate,
}) => {
  const { theme, setTheme } = useTheme();
  const {
    needRefresh,
    isChecking,
    isUpdating,
    checkResult,
    checkForUpdates,
    updateApp,
  } = usePwaUpdate();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [isStoragePersistedState, setIsStoragePersistedState] = useState(false);
  const [storageUsage, setStorageUsage] = useState({ usedBytes: 0, quotaBytes: 0, percentage: 0 });
  const { isInstalled, isIOS, isAndroid, showGuideModal, setShowGuideModal, installApp } = usePwaInstall();

  // Anonymous Opt-in Telemetry State
  const [isStatsOptIn, setIsStatsOptIn] = useState(() => isStatsOptInEnabled());
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isDeletingStats, setIsDeletingStats] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState(() => getActiveStatsEndpoint());
  const [isEditingEndpoint, setIsEditingEndpoint] = useState(false);
  const [endpointInput, setEndpointInput] = useState(() => getActiveStatsEndpoint());

  // Export password dialog state
  const [isExportPasswordModalOpen, setIsExportPasswordModalOpen] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [useEncryption, setUseEncryption] = useState(false);

  // Import file & restore state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedBackupData, setSelectedBackupData] = useState<BackupData | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoreMode, setRestoreMode] = useState<'overwrite' | 'merge'>('merge');
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
  const [pendingEncryptedFile, setPendingEncryptedFile] = useState<File | null>(null);
  const [decryptPassword, setDecryptPassword] = useState('');
  const [decryptError, setDecryptError] = useState('');

  // Reset confirmation
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reactive settings
  const settingsRecord = useLiveQuery(() => db.settings.get('app_settings'));
  const settings = settingsRecord?.value;

  useEffect(() => {
    async function checkStorage() {
      const persisted = await isStoragePersisted();
      setIsStoragePersistedState(persisted);
      const est = await getStorageEstimate();
      setStorageUsage(est);
    }
    checkStorage();
  }, [settingsRecord]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleStats = async (enabled: boolean) => {
    if (enabled) {
      enableStatsOptIn();
      setIsStatsOptIn(true);
      showToast('Mengaktifkan statistik & menghubungkan ke server...');
      const pingRes = await sendDailyPingIfDue(true);
      if (pingRes.success) {
        showToast('✅ ' + pingRes.message);
      } else {
        showToast('⚠️ ' + pingRes.message);
      }
    } else {
      disableStatsOptIn();
      setIsStatsOptIn(false);
      showToast('Statistik anonim dinonaktifkan. Data lokal telah dihapus.');
    }
  };

  const handleSendManualPing = async () => {
    showToast('Mengirim ping ke server...');
    const pingRes = await sendDailyPingIfDue(true);
    if (pingRes.success) {
      showToast('✅ ' + pingRes.message);
    } else {
      showToast('⚠️ ' + pingRes.message);
    }
  };

  const handleDeleteStatsFromServer = async () => {
    setIsDeletingStats(true);
    const res = await deleteMyStatsData();
    setIsDeletingStats(false);
    setIsStatsOptIn(false);
    showToast(res.message);
  };

  const handleRequestStorage = async () => {
    const ok = await requestPersistentStorage();
    setIsStoragePersistedState(ok);
    if (ok) {
      showToast('Izin penyimpanan permanen berhasil diaktifkan.');
    } else {
      showToast('Izin penyimpanan otomatis dikelola oleh browser.');
    }
  };

  // Export handler
  const handleExportClick = () => {
    setIsExportPasswordModalOpen(true);
    setExportPassword('');
    setUseEncryption(false);
  };

  const handleConfirmExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExportPasswordModalOpen(false);
    await exportBackupToJson(useEncryption ? exportPassword : undefined);
    showToast(
      useEncryption
        ? 'File backup terenkripsi password berhasil di-download.'
        : 'File backup JSON berhasil di-download.'
    );
  };

  // CSV Export handler
  const handleExportCsv = async () => {
    await exportTransactionsToCsv();
    showToast('File CSV berhasil diunduh untuk Excel.');
  };

  // Import handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    const parsed = await parseBackupFile(file);

    if (parsed.isEncrypted) {
      setPendingEncryptedFile(file);
      setDecryptPassword('');
      setDecryptError('');
      setIsPasswordPromptOpen(true);
      return;
    }

    if (parsed.success && parsed.data) {
      setSelectedBackupData(parsed.data);
      setIsRestoreModalOpen(true);
    } else {
      alert(parsed.error || 'Gagal membaca file backup');
    }
  };

  const handleDecryptAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingEncryptedFile) return;

    setDecryptError('');
    const res = await parseBackupFile(pendingEncryptedFile, decryptPassword);

    if (res.success && res.data) {
      setIsPasswordPromptOpen(false);
      setSelectedBackupData(res.data);
      setIsRestoreModalOpen(true);
    } else {
      setDecryptError(res.error || 'Password salah!');
    }
  };

  const handleConfirmRestore = async () => {
    if (!selectedBackupData) return;

    try {
      const { added, updated } = await restoreAllData(selectedBackupData, restoreMode);
      setIsRestoreModalOpen(false);
      setSelectedBackupData(null);
      showToast(
        restoreMode === 'overwrite'
          ? `Data berhasil ditimpa! (${added} catatan dimasukkan)`
          : `Data berhasil digabungkan! (${added} baru, ${updated} diperbarui)`
      );
    } catch (err: any) {
      alert(`Gagal memulihkan data: ${err.message}`);
    }
  };

  const handleResetApp = async () => {
    await resetAllData();
    setIsResetConfirmOpen(false);
    showToast('Seluruh data berhasil di-reset ke pengaturan awal.');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Pengaturan & Privasi
        </h1>
        <p className="text-xs text-slate-500">
          Kelola keamanan, tema, cadangan data, dan hak akses offline Anda
        </p>
      </div>

      {/* Theme Settings */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Sun size={16} className="text-amber-500" />
          <span>Tema Tampilan</span>
        </h2>
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          {[
            { id: 'light' as ThemeMode, label: 'Terang', icon: Sun },
            { id: 'dark' as ThemeMode, label: 'Gelap', icon: Moon },
            { id: 'system' as ThemeMode, label: 'Sistem', icon: Laptop },
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = theme === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setTheme(mode.id)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <Icon size={14} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Security & PIN Lock */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Shield size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Kunci PIN & Biometrik
              </h2>
              <p className="text-xs text-slate-400">
                {settings?.security?.isPinEnabled
                  ? 'Kunci aplikasi sedang aktif'
                  : 'Aplikasi saat ini tidak terkunci'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPinModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            {settings?.security?.isPinEnabled ? 'Kelola PIN' : 'Pasang PIN'}
          </button>
        </div>

        {settings?.security?.isPinEnabled && (
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-slate-100 dark:border-slate-800 text-slate-500">
            <div>
              <span className="text-slate-400">Kunci Otomatis:</span>{' '}
              <strong className="text-slate-700 dark:text-slate-300">
                {settings.security.autoLockMinutes === 0
                  ? 'Segera'
                  : settings.security.autoLockMinutes === -1
                  ? 'Mati'
                  : `${settings.security.autoLockMinutes} menit`}
              </strong>
            </div>
            <div>
              <span className="text-slate-400">Biometrik:</span>{' '}
              <strong className="text-slate-700 dark:text-slate-300">
                {settings.security.isBiometricEnabled ? 'Aktif' : 'Nonaktif'}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Backup & Restore Data */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Download size={16} className="text-blue-500" />
            <span>Cadangan & Pemulihan (Backup & Restore)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Simpan data keuangan Anda secara aman di komputer atau HP Anda
          </p>
        </div>

        {settings?.lastBackupDate && (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
            <span>
              Backup terakhir dibuat pada: <strong>{formatIndonesianDate(settings.lastBackupDate, 'full')}</strong>
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Download JSON Backup */}
          <button
            type="button"
            onClick={handleExportClick}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex flex-col items-center justify-center text-center gap-1.5 transition-all active:scale-95"
          >
            <FileKey size={20} className="text-emerald-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Download Backup JSON
            </span>
            <span className="text-[10px] text-slate-400">Opsi enkripsi password</span>
          </button>

          {/* Restore JSON Backup */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex flex-col items-center justify-center text-center gap-1.5 transition-all active:scale-95"
          >
            <Upload size={20} className="text-blue-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Pulihkan dari JSON
            </span>
            <span className="text-[10px] text-slate-400">Timpa atau gabungkan</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Export CSV for Excel */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex flex-col items-center justify-center text-center gap-1.5 transition-all active:scale-95"
          >
            <FileSpreadsheet size={20} className="text-teal-500" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Ekspor ke Excel (CSV)
            </span>
            <span className="text-[10px] text-slate-400">Format UTF-8 rapi</span>
          </button>
        </div>
      </div>

      {/* PWA Update / Pembaruan Aplikasi */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket size={17} className="text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Pembaruan Aplikasi (Update PWA)
            </h2>
          </div>
          {needRefresh ? (
            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
              <Sparkles size={12} /> Versi Baru Tersedia!
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-md flex items-center gap-1">
              <CheckCircle2 size={12} /> Versi Terbaru
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs gap-2">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Versi Aplikasi Saat Ini
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {APP_VERSION} ({APP_RELEASE_DATE})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              disabled={isChecking || isUpdating}
              onClick={async () => {
                const res = await checkForUpdates();
                showToast(res.message);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={isChecking ? 'animate-spin' : ''} />
              <span>{isChecking ? 'Mengecek...' : 'Cek Pembaruan'}</span>
            </button>

            {needRefresh && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={updateApp}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? <RefreshCw size={13} className="animate-spin" /> : <Rocket size={13} />}
                <span>{isUpdating ? 'Memasang...' : 'Update Sekarang'}</span>
              </button>
            )}
          </div>
        </div>

        {checkResult && (
          <div
            className={`p-2.5 rounded-xl text-xs font-medium ${
              needRefresh
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
            }`}
          >
            {checkResult}
          </div>
        )}

        <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1">
          <p className="font-bold flex items-center gap-1">
            <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Pembaruan Bebas Khawatir Tanpa Kehilangan Data:</span>
          </p>
          <p className="leading-relaxed text-slate-600 dark:text-slate-400">
            Aplikasi memperbarui file cache service worker secara instan di latar belakang. Anda tidak perlu menguninstall atau memasang ulang aplikasi dari awal di Android, iOS, maupun Desktop. Seluruh saldo dompet, pos anggaran, catatan, dan riwayat transaksi di IndexedDB tetap aman 100%.
          </p>
        </div>
      </div>

      {/* PWA / Layar Utama Status & Install */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Instal Aplikasi (Layar Utama)
            </h2>
          </div>
          {isInstalled ? (
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-md flex items-center gap-1">
              <CheckCircle2 size={12} /> Terpasang di Perangkat
            </span>
          ) : (
            <button
              type="button"
              onClick={installApp}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download size={13} />
              <span>Instal Sekarang</span>
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Tambahkan DompetKu ke Layar Utama smartphone (Android/iOS) atau Desktop PC/Laptop untuk membukanya langsung layaknya aplikasi native tanpa bar browser, 100% offline, dan bebas kuota. Semua data tersimpan aman dan privat di IndexedDB perangkat Anda.
        </p>

        {!isInstalled && (
          <div className="pt-1">
            <button
              type="button"
              onClick={installApp}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Download size={14} />
              <span>Tambahkan ke Layar Utama</span>
            </button>
          </div>
        )}
      </div>

      {/* Storage & PWA Persistence */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Penyimpanan Lokal IndexedDB
            </h2>
          </div>
          {isStoragePersistedState ? (
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-md">
              Terlindungi Permanen
            </span>
          ) : (
            <button
              type="button"
              onClick={handleRequestStorage}
              className="text-xs font-semibold text-amber-600 hover:underline"
            >
              Minta Izin Permanen
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Semua catatan keuangan Anda disimpan murni di IndexedDB browser perangkat ini. Jika izin penyimpanan permanen diaktifkan, browser tidak akan menghapus data meski memori penyimpanan perangkat menipis.
        </p>

        {storageUsage.quotaBytes > 0 && (
          <div className="pt-2 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>Pemakaian Memori:</span>
            <span>
              {(storageUsage.usedBytes / 1024).toFixed(1)} KB dari {(storageUsage.quotaBytes / (1024 * 1024 * 1024)).toFixed(1)} GB kuota
            </span>
          </div>
        )}
      </div>

      {/* Privacy Policy & About */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Jaminan Privasi & Transparansi
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsPrivacyModalOpen(true)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Baca Kebijakan Privasi
          </button>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          DompetKu tidak menggunakan pelacak (Google Analytics, Sentry, Firebase), tidak ada iklan, dan tidak ada server database. Aplikasi ini sepenuhnya open-source dengan Lisensi MIT.
        </p>
      </div>

      {/* Optional Anonymous Opt-In Telemetry (Only visible if VITE_STATS_ENDPOINT is defined) */}
      {isStatsFeatureAvailable() && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-teal-500" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Statistik Pengguna Anonim (Opt-In)
              </h2>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                isStatsOptIn
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {isStatsOptIn ? 'Aktif (Opt-in)' : 'Mati (Default)'}
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Bantu pengembang (Farel Rizky P) mengetahui perkiraan jumlah pengguna DompetKu tanpa mengorbankan privasi. Fitur ini bersifat sukarela dan <strong>default-nya MATI</strong>. Server tidak menyimpan alamat IP, tidak ada pelacak pihak ketiga, dan tidak ada catatan keuangan apa pun yang dikirim.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Kirim Ping Harian Anonim
              </p>
              <p className="text-[11px] text-slate-400">
                Maksimal 1x sehari mengirim ID acak perangkat, versi, platform, dan tanggal.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isStatsOptIn}
                onChange={(e) => handleToggleStats(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Active Target Server Indicator & Custom Endpoint for iOS/LAN */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400">
              <div className="truncate pr-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Server Target: </span>
                <code className="text-teal-600 dark:text-teal-400 font-mono text-[10px]">{activeEndpoint || '(Belum diset)'}</code>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingEndpoint((v) => !v)}
                className="text-teal-600 dark:text-teal-400 hover:underline font-semibold shrink-0 cursor-pointer"
              >
                {isEditingEndpoint ? 'Tutup' : 'Ubah URL Server'}
              </button>
            </div>

            {isEditingEndpoint && (
              <div className="p-3 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 space-y-2">
                <label className="block text-[11px] font-semibold text-teal-900 dark:text-teal-300">
                  Ubah Alamat Server Statistik / Telemetri:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={endpointInput}
                    onChange={(e) => setEndpointInput(e.target.value)}
                    placeholder="Contoh: http://192.168.101.2:4000"
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-teal-300 dark:border-teal-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCustomStatsEndpoint(endpointInput);
                      const updated = getActiveStatsEndpoint();
                      setActiveEndpoint(updated);
                      setIsEditingEndpoint(false);
                      showToast(`Server diperbarui ke: ${updated}`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomStatsEndpoint('');
                      const updated = getActiveStatsEndpoint();
                      setEndpointInput(updated);
                      setActiveEndpoint(updated);
                      setIsEditingEndpoint(false);
                      showToast('Server dikembalikan ke default otomatis.');
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                  💡 Di perangkat iOS (iPhone / iPad), pastikan menggunakan IP komputer Anda (misal <code>http://192.168.101.2:4000</code>), bukan <code>localhost</code>.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsStatsModalOpen(true)}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Info size={13} />
              <span>Lihat Detail Transparansi & Contoh Payload JSON</span>
            </button>

            {isStatsOptIn && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendManualPing}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Kirim ping sekarang untuk menguji koneksi ke server"
                >
                  <RefreshCw size={11} />
                  <span>Kirim Ping (Test)</span>
                </button>
                <button
                  type="button"
                  disabled={isDeletingStats}
                  onClick={handleDeleteStatsFromServer}
                  className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  <span>{isDeletingStats ? 'Menghapus...' : 'Hapus Data Saya'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* App & Developer Information */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Info size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Informasi Aplikasi & Pengembang
            </h2>
            <p className="text-xs text-slate-400">
              Tentang pembuat dan lisensi aplikasi DompetKu
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Pembuat Aplikasi
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Farel Rizky P
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                Author
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Pengembang & Perancang DompetKu
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Versi & Lisensi
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                DompetKu v{APP_VERSION}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                MIT License
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              100% Offline-First PWA • Open Source
            </p>
          </div>
        </div>

        {/* Buttons for About, Feedback & Calendar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {onOpenAbout && (
            <button
              type="button"
              onClick={onOpenAbout}
              className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Info size={16} />
              <span>Tentang DompetKu</span>
            </button>
          )}

          {onOpenFeedback && (
            <button
              type="button"
              onClick={onOpenFeedback}
              className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <MessageSquare size={16} />
              <span>Beri Umpan Balik</span>
            </button>
          )}

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('calendar')}
              className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Calendar size={16} />
              <span>Buka Kalender</span>
            </button>
          )}
        </div>

        {/* Donation Callout Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 border border-rose-500/20 dark:border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0 shadow-sm mt-0.5">
              <Heart size={18} className="fill-current animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>Dukung Pengembang (Donasi Seikhlasnya)</span>
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                DompetKu 100% gratis tanpa iklan. Dukung kelangsungan aplikasi dan traktir kopi pengembang (Farel Rizky P) via QRIS RellAppstore.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => (onOpenDonation ? onOpenDonation() : setIsDonationModalOpen(true))}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 active:scale-95 text-white text-xs font-bold shrink-0 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Heart size={14} className="fill-current" />
            <span>Lihat QRIS Donasi</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Reset App */}
      <div className="p-5 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-3">
        <h2 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
          <Trash2 size={16} />
          <span>Zona Berbahaya</span>
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-rose-600/80 dark:text-rose-400/80 leading-relaxed max-w-md">
            Hapus seluruh catatan transaksi, dompet, anggaran, dan pengaturan kembali ke kondisi awal.
          </p>
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 shadow-xs active:scale-95 transition-all"
          >
            Reset Seluruh Data
          </button>
        </div>
      </div>

      {/* Modal PIN Setup */}
      <PinSetupModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSaved={() => showToast('Pengaturan PIN berhasil diperbarui.')}
      />

      {/* Modal Export with Password Option */}
      <Modal
        isOpen={isExportPasswordModalOpen}
        onClose={() => setIsExportPasswordModalOpen(false)}
        title="Download Backup Data"
        maxWidth="sm"
      >
        <form onSubmit={handleConfirmExport} noValidate className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Pilih apakah Anda ingin mengenkripsi file backup ini dengan password untuk perlindungan ekstra.
          </p>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={useEncryption}
              onChange={(e) => setUseEncryption(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Enkripsi Backup dengan Password (AES-GCM)
            </span>
          </label>

          {useEncryption && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password Enkripsi
              </label>
              <input
                type="password"
                required
                value={exportPassword}
                onChange={(e) => setExportPassword(e.target.value)}
                placeholder="Masukkan password kuat..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                Catat password ini! File tidak bisa dibuka tanpa password yang benar.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsExportPasswordModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
            >
              Download File Sekarang
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Password Prompt for Decryption during Import */}
      <Modal
        isOpen={isPasswordPromptOpen}
        onClose={() => setIsPasswordPromptOpen(false)}
        title="File Backup Terenkripsi"
        maxWidth="sm"
      >
        <form onSubmit={handleDecryptAndProceed} noValidate className="space-y-4">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-xs text-blue-700 dark:text-blue-300">
            <Lock size={18} className="shrink-0" />
            <p>File ini dilindungi enkripsi AES-GCM. Masukkan password yang digunakan saat ekspor.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password Backup
            </label>
            <input
              type="password"
              required
              autoFocus
              value={decryptPassword}
              onChange={(e) => setDecryptPassword(e.target.value)}
              placeholder="Masukkan password..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-emerald-500"
            />
            {decryptError && <p className="text-xs text-rose-500 mt-1">{decryptError}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPasswordPromptOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
            >
              Buka & Lanjutkan
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Choose Restore Mode (Timpa vs Gabungkan) */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="Konfirmasi Pemulihan Data"
        maxWidth="sm"
      >
        <div className="space-y-4">
          {selectedBackupData && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <p>
                <strong>Isi File:</strong> {selectedBackupData.transactions.length} transaksi,{' '}
                {selectedBackupData.wallets.length} dompet, {selectedBackupData.categories.length} kategori.
              </p>
              <p className="text-slate-400">
                Tanggal Ekspor: {formatIndonesianDate(selectedBackupData.exportDate, 'full')}
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Pilih Metode Pemulihan:
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  restoreMode === 'merge'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="restoreMode"
                  checked={restoreMode === 'merge'}
                  onChange={() => setRestoreMode('merge')}
                  className="mt-0.5 text-emerald-600"
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Gabungkan Data (Disarankan)
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Tambahkan transaksi dari backup tanpa menghapus transaksi yang sudah ada di perangkat.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  restoreMode === 'overwrite'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="restoreMode"
                  checked={restoreMode === 'overwrite'}
                  onChange={() => setRestoreMode('overwrite')}
                  className="mt-0.5 text-rose-600"
                />
                <div className="text-xs">
                  <p className="font-bold text-rose-700 dark:text-rose-400">
                    Timpa Seluruh Data
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Hapus semua data saat ini dan gantikan dengan data persis seperti di file backup.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRestoreModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmRestore}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
            >
              Mulai Pulihkan Data
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Privacy Policy */}
      <Modal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title="Kebijakan Privasi & Transparansi 100%"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
            <p className="font-bold">Prinsip Zero-Telemetry & Zero-Server</p>
            <p className="text-[11px] mt-0.5">
              DompetKu dibangun dengan komitmen bahwa privasi finansial adalah hak mutlak setiap individu.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">1. Tidak Ada Data yang Keluar dari Perangkat</h3>
            <p>
              Seluruh catatan pemasukan, pengeluaran, saldo dompet, dan anggaran bulanan disimpan 100% secara lokal pada penyimpanan IndexedDB di perangkat Anda. Tidak ada server backend, tidak ada sinkronisasi cloud tersembunyi.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">2. Tanpa Pelacak Pihak Ketiga & Tanpa Iklan</h3>
            <p>
              Aplikasi ini 100% offline dan tidak menyertakan script analitik pihak ketiga apa pun (tidak ada Google Analytics, Firebase, Sentry, Mixpanel, atau Facebook SDK). Statistik jumlah pengguna bersifat opsional (opt-in), default-nya MATI, dan hanya mengirim 4 parameter anonim tanpa IP jika Anda aktifkan sendiri.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">3. Enkripsi Lokal Kuat</h3>
            <p>
              Kunci PIN Anda di-hash menggunakan algoritma standar industri PBKDF2 (100.000 iterasi) dengan salt unik via Web Crypto API. Cadangan data dapat dienkripsi secara mandiri menggunakan AES-GCM 256-bit.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">4. Lisensi Bebas & Terbuka (Open Source MIT)</h3>
            <p>
              Kode sumber aplikasi ini bersifat open-source di bawah lisensi MIT. Anda bebas mengaudit kode, membuat salinan, dan menjalankannya secara lokal tanpa batas.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(false)}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetApp}
        title="Reset Seluruh Data Aplikasi"
        message="PERINGATAN: Tindakan ini akan menghapus semua catatan transaksi, dompet, dan anggaran di perangkat ini secara permanen. Pastikan Anda sudah membuat file backup jika masih membutuhkan data tersebut!"
        confirmLabel="Hapus Semua Data"
      />

      {/* PWA Guide Modal */}
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

      {/* Modal Transparansi Statistik Anonim */}
      <Modal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        title="Detail Transparansi Statistik (Opt-In)"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300">
            <p className="font-bold">Contoh Persis Payload JSON yang Dikirim:</p>
            <p className="text-[11px] mt-0.5">
              Berikut adalah bentuk data yang dikirim via HTTP POST ke server maksimal 1 kali sehari HANYA jika Anda mengaktifkan fitur ini:
            </p>
            <div className="mt-2 pt-2 border-t border-teal-200/60 dark:border-teal-800/60 text-[10px] space-y-0.5 text-teal-900 dark:text-teal-200">
              <p><strong>Target Server:</strong> <code>{STATS_ENDPOINT || '(Belum dikonfigurasi)'}</code></p>
              <p><strong>ID Perangkat Anda:</strong> <code>{getCurrentInstallId() || '(Belum dibuat)'}</code></p>
              <p><strong>Tanggal Terakhir Ping:</strong> <code>{getLastPingDate() || '(Belum pernah)'}</code></p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto shadow-inner">
            <pre>
              {JSON.stringify(getExamplePayload(), null, 2)}
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-100">Penjelasan Field:</h4>
            <ul className="list-disc pl-5 space-y-1.5 text-[11px]">
              <li>
                <strong>install_id</strong>: Kode acak UUID v4 yang dibuat murni di perangkat Anda. Kode ini tidak terhubung ke nomor HP, email, nama, maupun serial perangkat fisik, dan langsung dihapus saat fitur dimatikan.
              </li>
              <li>
                <strong>app_version</strong>: Versi rilis aplikasi saat ini untuk memantau keberhasilan pembaruan PWA.
              </li>
              <li>
                <strong>platform</strong>: Klasifikasi kasar sistem operasi (<code>android</code>, <code>ios</code>, <code>desktop</code>, atau <code>web</code>) tanpa merk atau model perangkat.
              </li>
              <li>
                <strong>date</strong>: Tanggal kalender (YYYY-MM-DD) saat ping dikirim, tanpa jam/menit dan tanpa lokasi geografis/negara.
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 space-y-1">
            <p className="font-bold text-xs">Jaminan Mutlak:</p>
            <p className="text-[11px]">
              Alamat IP Anda <strong>TIDAK PERNAH DISIMPAN</strong> oleh server backend. Tidak ada catatan keuangan, transaksi, nominal saldo, atau nama dompet yang dikirim keluar perangkat.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => setIsStatsModalOpen(false)}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer"
            >
              Tutup Dialog
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
