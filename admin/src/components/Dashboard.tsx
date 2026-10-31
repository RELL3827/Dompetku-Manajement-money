import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Activity,
  Smartphone,
  Download,
  RefreshCw,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  TrendingUp,
  Clock,
  Layers,
  PieChart,
  Info,
  MessageSquare,
  Star,
  Trash2,
} from 'lucide-react';
import { fetchDashboardStats, logoutAdmin, downloadAggregateCsv, fetchFeedbacks, deleteFeedbackApi } from '../api';
import type { DashboardStats, FeedbackItem } from '../types';
import { MetricCard } from './MetricCard';
import { TimelineChart } from './charts/TimelineChart';
import { PlatformChart } from './charts/PlatformChart';
import { VersionChart } from './charts/VersionChart';

interface DashboardProps {
  onLogout: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, isDark, toggleTheme }) => {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (selectedPeriod = period) => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, fbList] = await Promise.all([
        fetchDashboardStats(selectedPeriod),
        fetchFeedbacks().catch(() => []),
      ]);
      setStats(data);
      setFeedbacks(fbList);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data dari server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (window.confirm('Hapus masukan feedback ini?')) {
      const ok = await deleteFeedbackApi(id);
      if (ok) {
        setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      }
    }
  };

  useEffect(() => {
    loadData(period);
  }, [period]);

  const handlePeriodChange = (p: '7d' | '30d' | '90d' | 'all') => {
    setPeriod(p);
  };

  const handleLogout = async () => {
    await logoutAdmin();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-500/20 text-lg">
              DK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  DompetKu Developer Dashboard
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  <ShieldCheck size={11} /> Zero-PII
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Statistik Pengguna Sukarela (Opt-In Telemetry)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Period Filter Buttons */}
            <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              {(['7d', '30d', '90d', 'all'] as const).map((p) => {
                const labels = {
                  '7d': '7 Hari',
                  '30d': '30 Hari',
                  '90d': '90 Hari',
                  all: 'Semua Waktu',
                };
                const active = period === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePeriodChange(p)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      active
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {labels[p]}
                  </button>
                );
              })}
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => loadData(period)}
              disabled={isLoading}
              title="Refresh Data"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={downloadAggregateCsv}
              title="Export Data Agregat ke CSV"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>CSV</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title="Ganti Tema Terang/Gelap"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              title="Keluar"
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Mobile Period Selector */}
        <div className="flex md:hidden px-4 pb-2.5 overflow-x-auto gap-1 text-xs">
          {(['7d', '30d', '90d', 'all'] as const).map((p) => {
            const labels = {
              '7d': '7 Hari',
              '30d': '30 Hari',
              '90d': '90 Hari',
              all: 'Semua',
            };
            const active = period === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handlePeriodChange(p)}
                className={`px-3 py-1 rounded-lg font-bold shrink-0 ${
                  active
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* MANDATORY PRIVACY CALLOUT BOX */}
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
          <Info size={18} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <p className="font-bold">Prinsip Privasi & Interpretasi Data:</p>
            <p className="text-amber-800 dark:text-amber-300 mt-0.5">
              Angka ini hanya mencerminkan pengguna yang mengaktifkan statistik (opt-in), jadi jumlah sebenarnya lebih besar daripada angka di dashboard ini. DompetKu tidak melacak pengguna yang tidak memberikan izin, tidak menyimpan alamat IP, dan tidak mengumpulkan catatan keuangan apa pun.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Instalasi Unik (All-time)"
            value={stats?.metrics.totalInstalls ?? 0}
            subtext="Perangkat sukarela opt-in"
            badge="Opt-in"
            icon={Users}
            color="emerald"
          />

          <MetricCard
            title="Pengguna Aktif Hari Ini (DAU)"
            value={stats?.metrics.dau ?? 0}
            subtext="Mengirim ping hari ini"
            badge="Hari Ini"
            icon={Activity}
            color="indigo"
          />

          <MetricCard
            title="Pengguna Aktif 7 Hari (WAU)"
            value={stats?.metrics.wau ?? 0}
            subtext="Aktif dalam 7 hari terakhir"
            badge="Mingguan"
            icon={TrendingUp}
            color="blue"
          />

          <MetricCard
            title="Pengguna Aktif 30 Hari (MAU)"
            value={stats?.metrics.mau ?? 0}
            subtext="Aktif dalam 30 hari terakhir"
            badge="Bulanan"
            icon={Calendar}
            color="purple"
          />
        </div>

        {/* Retention Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Retensi 7 Hari (D7 Retention)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  {stats?.metrics.retention7Days.percentage ?? 0}%
                </span>
                <span className="text-xs text-slate-400">
                  ({stats?.metrics.retention7Days.retained ?? 0} dari {stats?.metrics.retention7Days.eligible ?? 0} instalasi &ge; 7 hari)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Persentase pengguna yang masih aktif setidaknya 7 hari setelah pertama kali memasang aplikasi.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <Clock size={20} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Retensi 30 Hari (D30 Retention)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  {stats?.metrics.retention30Days.percentage ?? 0}%
                </span>
                <span className="text-xs text-slate-400">
                  ({stats?.metrics.retention30Days.retained ?? 0} dari {stats?.metrics.retention30Days.eligible ?? 0} instalasi &ge; 30 hari)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Persentase pengguna setia yang masih aktif setelah 30 hari pemakaian.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              <Clock size={20} />
            </div>
          </div>
        </div>

        {/* Main Timeline Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-500" />
                <span>Tren Pengguna Baru & Pengguna Aktif Harian</span>
              </h2>
              <p className="text-xs text-slate-400">
                Fluktuasi instalasi baru dan ping harian dalam rentang waktu yang dipilih
              </p>
            </div>
          </div>

          <TimelineChart
            newInstalls={stats?.charts.newInstallsTimeline || []}
            activeInstalls={stats?.charts.activeInstallsTimeline || []}
            isDark={isDark}
          />
        </div>

        {/* Secondary Charts: Platform & Versions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Distribution */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Smartphone size={16} className="text-blue-500" />
                <span>Distribusi Platform Pengguna</span>
              </h2>
              <p className="text-xs text-slate-400">
                Perbandingan sistem operasi: Android, iOS, Desktop, dan Web Browser
              </p>
            </div>

            <PlatformChart
              distribution={stats?.charts.platformDistribution || []}
              isDark={isDark}
            />
          </div>

          {/* Version Distribution */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PieChart size={16} className="text-purple-500" />
                <span>Distribusi Versi Aplikasi (Adopsi Update)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Memantau kecepatan pengguna memperbarui versi DompetKu terbaru
              </p>
            </div>

            <VersionChart
              distribution={stats?.charts.versionDistribution || []}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Detailed Timeline Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers size={16} className="text-indigo-500" />
                <span>Rangkuman Data Agregat Harian</span>
              </h2>
              <p className="text-xs text-slate-400">
                Tabel agregat tanggal tanpa data identitas individu
              </p>
            </div>
            <button
              type="button"
              onClick={downloadAggregateCsv}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 cursor-pointer"
            >
              <Download size={13} />
              <span>Unduh CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Tanggal</th>
                  <th className="py-2.5 px-4 font-bold">Instalasi Baru (Opt-in)</th>
                  <th className="py-2.5 px-4 font-bold">Pengguna Aktif (Ping Harian)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats?.charts.newInstallsTimeline && stats.charts.newInstallsTimeline.length > 0 ? (
                  stats.charts.newInstallsTimeline.slice(-15).reverse().map((item) => {
                    const activeMatch = stats.charts.activeInstallsTimeline.find((a) => a.date === item.date);
                    return (
                      <tr key={item.date} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                          {item.date}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                          +{item.count}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                          {activeMatch?.count ?? '-'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      Belum ada data agregat tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Feedback & Suggestions Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MessageSquare size={16} className="text-amber-500" />
                <span>Umpan Balik & Masukan Pengguna ({feedbacks.length})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Pesan, saran fitur, dan laporan dari pengguna aplikasi DompetKu
              </p>
            </div>

            {feedbacks.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span>
                    Rata-rata:{' '}
                    {(
                      feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
                    ).toFixed(1)}
                    /5
                  </span>
                </div>
              </div>
            )}
          </div>

          {feedbacks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              Belum ada umpan balik yang masuk dari pengguna.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2.5 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={13}
                            className={
                              s <= fb.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 dark:text-slate-600'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 tracking-wider">
                        {fb.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        {fb.created_at ? fb.created_at.slice(0, 10) : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteFeedback(fb.id)}
                        className="opacity-60 hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        title="Hapus feedback ini"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                    {fb.message}
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <div>
                      {fb.contact ? (
                        <span>Kontak: <strong className="text-slate-700 dark:text-slate-300">{fb.contact}</strong></span>
                      ) : (
                        <span className="italic">Anonim</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {fb.platform && (
                        <span className="capitalize px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 font-semibold">
                          {fb.platform}
                        </span>
                      )}
                      {fb.app_version && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 font-semibold">
                          v{fb.app_version}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

