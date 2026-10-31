import React, { useState } from 'react';
import { Lock, Shield, Eye, EyeOff, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { loginAdmin } from '../api';

interface LoginPageProps {
  onLoginSuccess: () => void;
  isDark?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    const res = await loginAdmin(password);
    setIsLoading(false);

    if (res.success) {
      onLoginSuccess();
    } else {
      setErrorMessage(res.message || 'Password salah.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
        {/* Header Icon */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
            <Shield size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            DompetKu Developer Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dashboard statistik anonim berbasis opt-in dengan prinsip Zero-PII
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Password Administrator
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password admin..."
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Password diverifikasi dengan hash Bcrypt di server internal.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center space-y-1">
          <p className="font-semibold text-slate-500 dark:text-slate-400">Jaminan Privasi Pengguna:</p>
          <p>Server tidak mencatat alamat IP. Seluruh data agregat murni berasal dari pengguna yang memilih opt-in.</p>
        </div>
      </div>
    </div>
  );
};
