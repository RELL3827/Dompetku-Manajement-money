import React from 'react';
import { Modal } from './Modal';
import {
  Smartphone,
  Share,
  PlusSquare,
  Monitor,
  CheckCircle2,
  ShieldCheck,
  WifiOff,
  MoreVertical,
} from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
  isAndroid: boolean;
  onNativeInstall?: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({
  isOpen,
  onClose,
  isIOS,
  isAndroid,
  onNativeInstall,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Instal DompetKu ke Layar Utama"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Value Proposition Hero */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
            <Smartphone size={16} />
            <span>Jadikan Aplikasi Layar Penuh (Native PWA)</span>
          </div>
          <p className="leading-relaxed">
            Dengan menambahkan <strong>DompetKu</strong> ke Layar Utama, aplikasi akan berjalan mulus tanpa bar browser, 
            <strong> 100% bisa dibuka offline</strong> meski tanpa sinyal, dan data tetap tersimpan privat di perangkat Anda.
          </p>
          <div className="flex flex-wrap gap-3 pt-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={13} /> Tanpa App Store / Play Store
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <WifiOff size={13} /> Akses Offline Instan
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={13} /> 100% Privat Lokal
            </span>
          </div>
        </div>

        {/* Instructions by Platform */}
        {isIOS ? (
          /* iOS Safari Guide */
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Petunjuk untuk iPhone / iPad (Safari):</span>
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Ketuk tombol Bagikan (Share)
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                    Ikon kotak berpanah ke atas <Share size={13} className="text-blue-500 inline" /> di bilah bawah browser Safari Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Pilih "Tambahkan ke Layar Utama"
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                    Gulir ke bawah menu lalu ketuk opsi <PlusSquare size={13} className="text-emerald-500 inline" /> <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Ketuk "Tambah" (Add)
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Ketuk tombol di pojok kanan atas. Ikon DompetKu akan muncul di layar beranda ponsel Anda!
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : isAndroid ? (
          /* Android Chrome / Browser Guide */
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Petunjuk untuk Android (Chrome / Edge):
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Buka Menu Browser
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                    Ketuk ikon titik tiga <MoreVertical size={13} className="text-slate-500 inline" /> di pojok kanan atas browser Chrome/Edge.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Pilih "Instal Aplikasi" atau "Tambahkan ke Layar Utama"
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Browser akan memunculkan dialog konfirmasi instalasi otomatis.
                  </p>
                </div>
              </div>
            </div>

            {onNativeInstall && (
              <button
                type="button"
                onClick={onNativeInstall}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Smartphone size={16} />
                <span>Instal Aplikasi Sekarang</span>
              </button>
            )}
          </div>
        ) : (
          /* Desktop (Chrome / Edge / Windows / Mac) Guide */
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Monitor size={15} />
              <span>Petunjuk untuk Laptop / PC (Chrome & Edge):</span>
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Cari Ikon Instal di Address Bar
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Di ujung kanan kolom URL/alamat browser Anda, cari ikon komputer kecil berpanah ke bawah atau tombol <strong>"Install DompetKu"</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Klik "Instal"
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Aplikasi akan terbuka di jendela tersendiri tanpa bar browser dan otomatis dibuatkan shortcut di Desktop & Start Menu.
                  </p>
                </div>
              </div>
            </div>

            {onNativeInstall && (
              <button
                type="button"
                onClick={onNativeInstall}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Monitor size={16} />
                <span>Klik untuk Munculkan Dialog Instal</span>
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Mengerti, Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
