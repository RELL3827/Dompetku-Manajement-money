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
} from 'lucide-react';
import type { BackupData, ThemeMode } from '../types';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isStoragePersistedState, setIsStoragePersistedState] = useState(false);
  const [storageUsage, setStorageUsage] = useState({ usedBytes: 0, quotaBytes: 0, percentage: 0 });

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
            <h3 className="font-bold text-slate-800 dark:text-slate-100">2. Tanpa Pelacak & Tanpa Iklan</h3>
            <p>
              Aplikasi ini tidak menyertakan script analitik apa pun: tidak ada Google Analytics, Firebase, Sentry, Mixpanel, atau iklan jaringan pihak ketiga. Content-Security-Policy (CSP) aplikasi dikonfigurasi ketat agar browser memblokir koneksi jaringan keluar yang tidak sah.
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
    </div>
  );
};
