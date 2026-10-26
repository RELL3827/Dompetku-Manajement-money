import React, { useState } from 'react';
import { CurrencyInput } from '../common/CurrencyInput';
import { saveWallet } from '../../db/services';
import { db } from '../../db/database';
import { hashPin, generateSalt } from '../../security/crypto';
import { requestPersistentStorage } from '../../utils/pwa';
import { ShieldCheck, Wallet, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import type { WalletType } from '../../types';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  // Step 2: First Wallet
  const [walletName, setWalletName] = useState('Dompet Utama');
  const [walletType, setWalletType] = useState<WalletType>('cash');
  const [initialBalance, setInitialBalance] = useState(0);

  // Step 3: Optional PIN
  const [enablePin, setEnablePin] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNextStep1 = () => {
    // Request persistent storage in background
    requestPersistentStorage();
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!walletName.trim()) {
      setError('Masukkan nama dompet');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleFinish = async () => {
    setError('');
    if (enablePin) {
      if (pin.length < 4 || pin.length > 6) {
        setError('PIN harus 4-6 digit angka');
        return;
      }
      if (pin !== confirmPin) {
        setError('Konfirmasi PIN tidak cocok');
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Create the user's customized first wallet
      await saveWallet({
        name: walletName.trim(),
        type: walletType,
        icon: walletType === 'bank' ? 'Landmark' : walletType === 'ewallet' ? 'Smartphone' : 'Banknote',
        color: '#10b981',
        initialBalance,
      });

      // 2. Set PIN if requested
      let securityUpdate: any = { isPinEnabled: false };
      if (enablePin) {
        const salt = generateSalt(16);
        const pinHash = await hashPin(pin, salt);
        securityUpdate = {
          isPinEnabled: true,
          pinHash,
          salt,
          autoLockMinutes: 5,
        };
      }

      // 3. Mark onboarding completed
      const cur = await db.getSettings();
      await db.updateSettings({
        ...cur,
        hasCompletedOnboarding: true,
        security: {
          ...cur.security,
          ...securityUpdate,
        },
      });

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Gagal menyelesaikan onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-emerald-600'
                    : s < step
                    ? 'w-4 bg-emerald-400'
                    : 'w-4 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-400">Langkah {step} dari 3</span>
        </div>

        {/* Step 1: Welcome & Privacy */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Selamat Datang di DompetKu
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Aplikasi keuangan pribadi mandiri yang 100% menghormati privasi Anda.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">100% Offline di Perangkat</p>
                  <p className="text-slate-500">Data tersimpan di IndexedDB browser Anda. Tidak ada server eksternal.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Tanpa Iklan, Tanpa Akun</p>
                  <p className="text-slate-500">Tidak perlu daftar akun, tidak ada analitik atau pelacak pihak ketiga.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextStep1}
              className="w-full mt-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
            >
              <span>Mulai Siapkan Dompet</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: First Wallet Setup */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet size={30} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Buat Dompet Pertama Anda
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Dompet bisa berupa uang tunai di saku, rekening bank, atau e-wallet.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Dompet
                </label>
                <input
                  type="text"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="Contoh: Dompet Utama, BCA, GoPay"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jenis Dompet
                </label>
                <select
                  value={walletType}
                  onChange={(e) => setWalletType(e.target.value as WalletType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="cash">Uang Tunai</option>
                  <option value="bank">Rekening Bank</option>
                  <option value="ewallet">E-Wallet</option>
                </select>
              </div>

              <CurrencyInput
                value={initialBalance}
                onChange={setInitialBalance}
                label="Saldo Awal Saat Ini"
                placeholder="0"
                showQuickChips={false}
              />
            </div>

            {error && <p className="text-xs text-rose-500">{error}</p>}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleNextStep2}
                className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <span>Lanjut</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Security & Finish */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Lock size={30} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Amankan Aplikasi (Opsional)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Kunci aplikasi dengan PIN agar catatan keuangan Anda tetap privat.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enablePin}
                  onChange={(e) => setEnablePin(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Aktifkan Kunci PIN Sekarang
                </span>
              </label>

              {enablePin && (
                <div className="space-y-3 pl-2 border-l-2 border-emerald-500">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Buat PIN (4-6 digit)
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs tracking-widest focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ulangi PIN
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs tracking-widest focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-xs text-rose-500">{error}</p>}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Selesai & Buka DompetKu'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
