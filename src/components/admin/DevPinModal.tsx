import React, { useState } from 'react';
import { ShieldAlert, KeyRound, X, ArrowRight } from 'lucide-react';

interface DevPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DevPinModal: React.FC<DevPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default Dev PIN: 3827 (from RELL3827) or 1945 or 0000
    if (pin === '3827' || pin === '1945' || pin === '0000') {
      setError('');
      setPin('');
      onSuccess();
    } else {
      setError('PIN Pengembang salah! Masukkan PIN yang valid.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <KeyRound size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
              Area Khusus Pengembang
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Verifikasi PIN Developer
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Masukkan PIN Developer untuk membuka Panel Admin & statistik total pengguna DompetKu.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              autoFocus
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (error) setError('');
              }}
              placeholder="Masukkan PIN (Default: 3827)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center text-sm font-bold tracking-widest text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            {error && (
              <p className="text-[11px] text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                <ShieldAlert size={12} />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
            <span>PIN Pengembang bawaan: <strong>3827</strong> (atau 1945)</span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Buka Panel</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
