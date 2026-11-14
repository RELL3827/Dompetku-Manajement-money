import React, { useState } from 'react';
import { Modal } from './Modal';
import { Coffee, Download, Copy, Check, Sparkles, Smartphone } from 'lucide-react';
import qrisImg from '../../assets/qris-donasi.jpg';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const nmid = 'ID1026588112551';

  const handleCopyNMID = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(nmid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Traktir Kopi Pengembang ☕" maxWidth="md">
      <div className="space-y-4 text-xs">
        {/* Warm Intro Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-emerald-950/30 border border-amber-200/80 dark:border-amber-900/40 text-slate-800 dark:text-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
            <Coffee size={18} className="text-amber-600 dark:text-amber-400" />
            <span>Traktir Secangkir Kopi untuk Pengembang</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Halo! Aplikasi <strong>DompetKu</strong> ini dibuat dan dirawat oleh <strong>Farel Rizky P</strong> dengan komitmen <strong>100% gratis, tanpa iklan, dan tanpa memungut biaya langganan</strong>.
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Jika aplikasi ini bermanfaat dalam membantu Anda menata keuangan harian, traktiran secangkir kopi sangat berarti untuk menyemangati penambahan fitur baru dan operasional aplikasi. Terima kasih banyak atas apresiasi Anda! ☕❤️
          </p>
        </div>

        {/* QRIS Card Container */}
        <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <Sparkles size={13} />
            <span>QRIS Standar Pembayaran Nasional</span>
          </div>

          {/* QR Code Image Display */}
          <div className="relative group max-w-[260px] sm:max-w-[280px] rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-white p-2 shadow-md">
            <img
              src={qrisImg}
              alt="QRIS Traktir Kopi RellAppstore - Farel Rizky P"
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>

          {/* Merchant & NMID Details */}
          <div className="w-full space-y-1.5 pt-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Merchant:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">RellAppstore</span>
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">NMID:</span>
              <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-semibold text-[11px]">
                {nmid}
              </code>
              <button
                type="button"
                onClick={handleCopyNMID}
                className="ios-btn inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium transition-colors cursor-pointer"
                title="Salin NMID"
              >
                {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* Supported Providers List */}
          <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed flex items-center justify-center gap-1.5">
            <Smartphone size={13} className="shrink-0 text-slate-400" />
            <span>Mendukung: BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay, LinkAja, dan seluruh m-Banking QRIS</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <a
            href="/qris-donasi.jpg"
            download="QRIS-Traktir-Kopi-DompetKu-FarelRizkyP.jpg"
            className="ios-btn w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>Simpan QRIS Traktir Kopi</span>
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="ios-btn w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer text-center"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
