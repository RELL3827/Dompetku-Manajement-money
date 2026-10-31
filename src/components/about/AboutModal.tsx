import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import {
  ShieldCheck,
  Heart,
  RefreshCw,
  MessageSquare,
  Lock,
  EyeOff,
} from 'lucide-react';
import { APP_VERSION } from '../../utils/version';
import { usePwaUpdate } from '../../context/PwaUpdateContext';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback?: () => void;
  onOpenDonation?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onOpenFeedback,
  onOpenDonation,
}) => {
  const { isChecking, checkForUpdates, checkResult, needRefresh, updateApp } = usePwaUpdate();
  const [activeTab, setActiveTab] = useState<'about' | 'features' | 'privacy'>('about');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tentang Aplikasi DompetKu">
      <div className="space-y-5">
        {/* Hero Header */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white text-center relative overflow-hidden shadow-md shadow-emerald-700/15">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mx-auto flex items-center justify-center font-extrabold text-2xl text-white shadow-inner mb-3">
            D
          </div>
          <h2 className="text-xl font-black tracking-tight">DompetKu</h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto">
            Aplikasi Manajemen Keuangan Pribadi Offline-First, Aman & Peduli Privasi
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 pt-3 border-t border-white/10 text-[11px]">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 font-bold">
              Versi {APP_VERSION}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 font-semibold flex items-center gap-1">
              <ShieldCheck size={13} /> 100% Offline
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 font-semibold">
              Lisensi MIT
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Tentang
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'features'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Fitur Utama
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Privasi & Keamanan
          </button>
        </div>

        {/* Tab 1: Tentang */}
        {activeTab === 'about' && (
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 leading-relaxed">
              <p>
                <strong>DompetKu</strong> diciptakan untuk menjawab keresahan terhadap aplikasi keuangan modern yang sering kali mewajibkan login akun, menaruh data transaksi sensitif di server pihak ketiga, atau menyisipkan iklan yang mengganggu.
              </p>
              <p className="mt-2">
                Di DompetKu, <strong>seluruh data keuangan Anda 100% milik Anda sendiri</strong> dan tersimpan eksklusif di dalam memori perangkat Anda (IndexedDB lokal).
              </p>
            </div>

            {/* Author card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Pengembang & Pembuat
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Farel Rizky P
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Lead Developer & Creator (@RELL3827)
                  </p>
                </div>
                <a
                  href="https://github.com/RELL3827/Dompetku-Manajement-money"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-[11px] flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </a>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                Teknologi yang Digunakan
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                React 19 • TypeScript • Vite PWA • Dexie.js (IndexedDB) • Tailwind CSS • Chart.js • Lucide Icons • Web Crypto PBKDF2 & AES-GCM
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Fitur Utama */}
        {activeTab === 'features' && (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {[
              {
                title: '📅 Kalender Keuangan & Agenda',
                desc: 'Tandai jadwal gajian, rencana liburan, dan jatuh tempo tagihan bulanan langsung di kalender interaktif.',
              },
              {
                title: '💳 Manajemen Multi-Dompet',
                desc: 'Pantau saldo gabungan dari uang tunai, bank, e-wallet, hingga transfer antar dompet tanpa biaya tersembunyi.',
              },
              {
                title: '🎯 Anggaran Cerdas 50/30/20',
                desc: 'Alokasikan pengeluaran otomatis ke Kebutuhan (50%), Keinginan (30%), dan Tabungan (20%).',
              },
              {
                title: '🐷 Target Tabungan (Celengan Impian)',
                desc: 'Rencanakan impian Anda dengan target dana, tanggal pencapaian, dan pantau progres tabungan.',
              },
              {
                title: '📝 Catatan Keuangan & Checklist',
                desc: 'Buat catatan belanja, rencana anggaran, dan checklist dengan perhitungan total instan.',
              },
              {
                title: '🧮 Kalkulator Cepat & Simulasi Finansial',
                desc: 'Hitung pengeluaran cepat dan langsung masukkan hasilnya menjadi transaksi nyata.',
              },
              {
                title: '📊 Analisis Arus Kas & Grafik',
                desc: 'Visualisasikan tren pengeluaran, perbandingan pemasukan bulanan, dan komposisi kategori.',
              },
              {
                title: '🔐 Kunci PIN & Enkripsi Ekspor',
                desc: 'Lindungi privasi aplikasi dengan PIN/Biometrik dan enkripsi backup file dengan kata sandi.',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80"
              >
                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {f.title}
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Privasi & Keamanan */}
        {activeTab === 'privacy' && (
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <h5 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck size={16} /> 1. Tidak Ada Data yang Keluar dari Perangkat
              </h5>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                Semua saldo, mutasi, kategori, dan catatan disimpan di memori lokal peramban (IndexedDB). Tidak ada server cloud yang menyimpan catatan keuangan Anda.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <EyeOff size={16} className="text-slate-400" /> 2. Tanpa Pelacak Pihak Ketiga & Tanpa Iklan
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Aplikasi ini murni bersih dari script pihak ketiga, SDK periklanan, dan analitik eksternal.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Lock size={16} className="text-slate-400" /> 3. Enkripsi Lokal Kuat
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Saat mengekspor backup, Anda dapat memasang kata sandi yang dienkripsi menggunakan standar militer AES-256 PBKDF2.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          {/* Update Checker Bar */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <RefreshCw
                size={16}
                className={`text-emerald-600 dark:text-emerald-400 ${
                  isChecking ? 'animate-spin' : ''
                }`}
              />
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                {checkResult || 'Aplikasi siap digunakan secara offline'}
              </span>
            </div>

            {needRefresh ? (
              <button
                type="button"
                onClick={updateApp}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] shadow-xs active:scale-95"
              >
                Update Sekarang
              </button>
            ) : (
              <button
                type="button"
                disabled={isChecking}
                onClick={checkForUpdates}
                className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 font-semibold text-[11px] hover:underline"
              >
                {isChecking ? 'Memeriksa...' : 'Cek Update'}
              </button>
            )}
          </div>

          {/* Quick Actions (Feedback & Donasi) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFeedback?.();
              }}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <MessageSquare size={14} className="text-amber-500" />
              <span>Beri Umpan Balik</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDonation?.();
              }}
              className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Heart size={14} className="text-rose-500 fill-rose-500" />
              <span>Donasi Pengembang</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
