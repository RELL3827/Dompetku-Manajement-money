import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { fetchAdminStats, testManualPing, type AdminStatsResponse } from '../../utils/telemetry';
import { formatIndonesianDate } from '../../utils/date';
import { APP_VERSION } from '../../utils/version';
import {
  Users,
  Smartphone,
  Laptop,
  Apple,
  RefreshCw,
  HardDrive,
  Database,
  Lock,
  X,
  Zap,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  KeyRound,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  verifyDevPin,
  updateDevPin,
  resetDevPinToDefault,
  isDevPinCustomized,
} from '../../security/devAuth';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLockDev?: () => void;
}

type AdminTab = 'users' | 'database' | 'system' | 'security' | 'guide';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose, onLockDev }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Developer PIN modification state
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState<string | null>(null);
  const [pinErrorMsg, setPinErrorMsg] = useState<string | null>(null);
  const [isCustomPin, setIsCustomPin] = useState(false);

  // Local database counts
  const [localDbCounts, setLocalDbCounts] = useState({
    transactions: 0,
    wallets: 0,
    budgets: 0,
    savings: 0,
    notes: 0,
    categories: 0,
  });

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminStats();
      setStats(res);
    } catch {
      // Handled in fetchAdminStats
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocalDb = async () => {
    try {
      const [txCount, walletCount, budgetCount, savingsCount, notesCount, catCount] = await Promise.all([
        db.transactions.count(),
        db.wallets.count(),
        db.budgets.count(),
        db.savings.count(),
        db.notes.count(),
        db.categories.count(),
      ]);
      setLocalDbCounts({
        transactions: txCount,
        wallets: walletCount,
        budgets: budgetCount,
        savings: savingsCount,
        notes: notesCount,
        categories: catCount,
      });
    } catch (err) {
      console.warn('Failed to inspect local DB:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStats();
      loadLocalDb();
      setIsCustomPin(isDevPinCustomized());
      setPinSuccessMsg(null);
      setPinErrorMsg(null);
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
    }
  }, [isOpen]);

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinSuccessMsg(null);
    setPinErrorMsg(null);

    if (!verifyDevPin(currentPinInput)) {
      setPinErrorMsg('PIN Pengembang saat ini tidak valid.');
      return;
    }

    if (newPinInput.trim().length < 4) {
      setPinErrorMsg('PIN Baru minimal 4 karakter/angka.');
      return;
    }

    if (newPinInput.trim() !== confirmPinInput.trim()) {
      setPinErrorMsg('Konfirmasi PIN Baru tidak cocok.');
      return;
    }

    const ok = updateDevPin(newPinInput.trim());
    if (ok) {
      setIsCustomPin(true);
      setPinSuccessMsg('PIN Developer berhasil diperbarui! Simpan PIN baru ini untuk akses berikutnya.');
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
    } else {
      setPinErrorMsg('Gagal memperbarui PIN.');
    }
  };

  const handleResetPin = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan PIN Pengembang ke default awal?')) {
      resetDevPinToDefault();
      setIsCustomPin(false);
      setPinSuccessMsg('PIN Pengembang berhasil dikembalikan ke default.');
      setPinErrorMsg(null);
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
    }
  };

  const handleRunTestPing = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testManualPing();
      setTestResult(res.message);
      // Reload stats after test ping
      await loadStats();
    } catch (err: any) {
      setTestResult(`Gagal: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  const totalUsers = stats?.metrics?.totalUsers || 1;
  const activeToday = stats?.metrics?.activeToday || 1;
  const devices = stats?.metrics?.devices;
  const percentages = stats?.metrics?.devices?.percentage || { android: 60, ios: 25, desktop: 15 };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Zap size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                  DEV CONSOLE
                </span>
                <span className="text-xs text-slate-400">
                  Pengembang: <strong>Farel Rizky P</strong>
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Admin Panel & Metrik Pengguna
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={loadStats}
              disabled={isLoading}
              title="Refresh Data Statistik"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Kunci & Tutup Admin Panel"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
          {[
            { id: 'users', label: 'Statistik Pengguna', icon: Users },
            { id: 'database', label: 'Inspektur Database', icon: Database },
            { id: 'system', label: 'Diagnostik Sistem', icon: HardDrive },
            { id: 'security', label: 'Keamanan & PIN Dev', icon: KeyRound },
            { id: 'guide', label: 'Panduan Dev', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* TAB 1: USERS METRICS */}
          {activeTab === 'users' && (
            <div className="space-y-5">
              {/* Top Big Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Total Users */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg space-y-2">
                  <div className="flex items-center justify-between text-emerald-100">
                    <span className="font-semibold text-xs">Total Pengguna Terpasang</span>
                    <Users size={20} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                      {totalUsers.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs text-emerald-100 font-medium">Instalasi</span>
                  </div>
                  <p className="text-[11px] text-emerald-100/90 leading-tight">
                    Jumlah unik perangkat yang telah membuka dan memasang DompetKu
                  </p>
                </div>

                {/* Active Today */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg space-y-2">
                  <div className="flex items-center justify-between text-indigo-100">
                    <span className="font-semibold text-xs">Pengguna Aktif Hari Ini</span>
                    <Activity size={20} />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                      {activeToday.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs text-indigo-100 font-medium">Pengguna</span>
                  </div>
                  <p className="text-[11px] text-indigo-100/90 leading-tight">
                    Perangkat yang membuka aplikasi hari ini ({formatIndonesianDate(new Date().toISOString(), 'short')})
                  </p>
                </div>
              </div>

              {/* Device Distribution Card */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone size={16} className="text-indigo-500" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">
                      Distribusi Perangkat Pengguna
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Estimasi Berdasarkan User-Agent
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Android */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Smartphone size={13} className="text-emerald-500" />
                        <span>Android</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {devices?.android || 0} user ({percentages.android}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${percentages.android}%` }}
                      />
                    </div>
                  </div>

                  {/* iOS */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Apple size={13} className="text-slate-600 dark:text-slate-300" />
                        <span>iPhone / iPad (iOS)</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {devices?.ios || 0} user ({percentages.ios}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${percentages.ios}%` }}
                      />
                    </div>
                  </div>

                  {/* Desktop */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Laptop size={13} className="text-teal-500" />
                        <span>PC / Laptop / Mac</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {devices?.desktop || 0} user ({percentages.desktop}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-teal-500 transition-all duration-500"
                        style={{ width: `${percentages.desktop}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Serverless Ping Test & Status */}
              <div className="p-4 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-950 dark:text-indigo-200">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span>Endpoint Serverless: /api/stats & /api/ping</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Koneksi API: {stats?.status === 'online' ? '🟢 Terhubung Langsung' : '🟡 Offline / Cached'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isTesting}
                  onClick={handleRunTestPing}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Activity size={13} className={isTesting ? 'animate-pulse' : ''} />
                  <span>{isTesting ? 'Menguji...' : 'Uji Ping Serverless'}</span>
                </button>
              </div>

              {testResult && (
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                  <strong>Hasil Uji:</strong> {testResult}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DATABASE INSPECTOR */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs mb-1">
                  Pemeriksa Data Lokal (IndexedDB Dexie v3)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Data yang tertera di bawah adalah catatan di perangkat yang sedang Anda gunakan saat ini:
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Transaksi</span>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                    {localDbCounts.transactions}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Dompet / Akun</span>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                    {localDbCounts.wallets}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Pos Anggaran</span>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                    {localDbCounts.budgets}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Celengan Tabungan</span>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                    {localDbCounts.savings}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Catatan Finansial</span>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                    {localDbCounts.notes}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Kategori Transaksi</span>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                    {localDbCounts.categories}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM DIAGNOSTICS */}
          {activeTab === 'system' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                  Diagnostik Lingkungan Perangkat & PWA
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Versi Aplikasi:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{APP_VERSION}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Mode Tampilan:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {window.matchMedia('(display-mode: standalone)').matches ? 'PWA Standalone (Layar Utama)' : 'Browser Tab'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Koneksi Perangkat:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {navigator.onLine ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Resolusi Layar:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {window.innerWidth} x {window.innerHeight} px
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEVELOPER PIN SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
                <KeyRound size={20} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-xs">Pengaturan PIN Pengembang (Privat)</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    PIN ini digunakan untuk membuka Admin Panel & metrik pengguna. Anda dapat mengubahnya kapan saja sesuai keinginan Anda. Data PIN tersimpan privat di perangkat Anda.
                  </p>
                </div>
              </div>

              {/* Status Badge Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Status PIN Dev</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isCustomPin ? 'PIN Khusus Aktif (Kustom)' : 'PIN Standar Bawaan'}
                  </span>
                </div>
                {isCustomPin ? (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                    <ShieldCheck size={12} />
                    <span>Terkunci PIN Kustom</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 flex items-center gap-1">
                    <KeyRound size={12} />
                    <span>PIN Default</span>
                  </span>
                )}
              </div>

              {/* Change PIN Form */}
              <form onSubmit={handleChangePin} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-3.5">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                  Ganti PIN Pengembang Baru
                </h4>

                {pinSuccessMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                    <Check size={14} className="shrink-0" />
                    <span>{pinSuccessMsg}</span>
                  </div>
                )}

                {pinErrorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5 border border-rose-200 dark:border-rose-800">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{pinErrorMsg}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    PIN Pengembang Saat Ini:
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    required
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value)}
                    placeholder="Masukkan PIN saat ini..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      PIN Baru (Minimal 4 Karakter):
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      required
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="Masukkan PIN baru..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Konfirmasi PIN Baru:
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      required
                      value={confirmPinInput}
                      onChange={(e) => setConfirmPinInput(e.target.value)}
                      placeholder="Ulangi PIN baru..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {isCustomPin ? (
                    <button
                      type="button"
                      onClick={handleResetPin}
                      className="text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium cursor-pointer"
                    >
                      Reset ke PIN Default
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Simpan PIN Baru</span>
                  </button>
                </div>
              </form>

              {/* Quick Lock Action */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Kunci Akses Pengembang
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Kunci sesi pengembang ini sekarang agar meminta PIN kembali.
                  </p>
                </div>
                {onLockDev && (
                  <button
                    type="button"
                    onClick={() => {
                      onLockDev();
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Kunci Sekarang
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DEVELOPER GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200 space-y-1">
                <p className="font-bold text-xs flex items-center gap-1.5">
                  <Lock size={14} />
                  <span>Kerahasiaan & Keamanan Akses Panel</span>
                </p>
                <p className="text-[11px]">
                  Admin Panel ini sepenuhnya rahasia dan dilindungi PIN Developer Anda. Akses diaktifkan melalui gestur rahasia 7 ketukan cepat pada label versi aplikasi di menu Pengaturan. Pengguna umum tidak dapat melihat maupun mengakses konsol ini.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                  Cara Kerja Perhitungan User (Zero-PII Counter):
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-500">
                  <li>Setiap kali perangkat baru membuka DompetKu untuk pertama kali, sistem mengirimkan ping instalasi anonim ke <code>/api/ping</code>.</li>
                  <li>Setelah terhitung 1x, flag disimpan di <code>localStorage</code> sehingga perangkat tersebut tidak akan terhitung ganda.</li>
                  <li>Tidak ada IP address, nama, lokasi presisi, email, atau catatan keuangan yang dicatat. Murni agregat angka hitung.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                  Integrasi Database Pribadi (Opsional):
                </h4>
                <p className="text-[11px] text-slate-500">
                  Secara default, counter menggunakan Cloud Counter API gratis. Jika Anda ingin menghubungkan ke Upstash Redis pribadi Anda di Vercel:
                  <br />
                  1. Buat Upstash Redis Database gratis di <code>console.upstash.com</code>
                  <br />
                  2. Tambahkan Environment Variable di Vercel: <code>KV_REST_API_URL</code> dan <code>KV_REST_API_TOKEN</code>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck size={13} className="text-indigo-500" />
            <span>Sesi Pengembang Rahasia Aktif</span>
          </div>

          <div className="flex items-center gap-2">
            {onLockDev && (
              <button
                type="button"
                onClick={onLockDev}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Kunci sesi agar memerlukan 7 ketukan + PIN kembali"
              >
                <Lock size={13} />
                <span>Kunci Sesi Dev</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Tutup Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
