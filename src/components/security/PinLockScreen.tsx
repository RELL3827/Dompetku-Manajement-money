import React, { useState, useEffect } from 'react';
import { useAuthLock } from '../../hooks/useAuthLock';
import { isBiometricAvailable } from '../../security/webauthn';
import { db } from '../../db/database';
import { Lock, Fingerprint, Delete, AlertCircle, ShieldAlert } from 'lucide-react';

export const PinLockScreen: React.FC = () => {
  const { isLocked, unlockWithPin, unlockWithBiometric } = useAuthLock();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isBiometricConfigured, setIsBiometricConfigured] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState<number | null>(null);

  useEffect(() => {
    async function checkBio() {
      const settings = await db.getSettings();
      const hasHardware = await isBiometricAvailable();
      setIsBiometricConfigured(
        settings.security.isBiometricEnabled && !!settings.security.biometricCredentialId && hasHardware
      );
    }
    if (isLocked) {
      setPin('');
      setError('');
      checkBio();
    }
  }, [isLocked]);

  // Handle countdown timer if locked out
  useEffect(() => {
    if (!lockoutRemaining || lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (!prev || prev <= 1) {
          setError('');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  // Handle hardware keyboard typing
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (lockoutRemaining) return;

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        handleConfirmPin(pin);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, pin, lockoutRemaining]);

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');
      if (nextPin.length >= 4) {
        handleConfirmPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleConfirmPin = async (candidatePin: string) => {
    if (candidatePin.length < 4) return;
    const res = await unlockWithPin(candidatePin);
    if (!res.success) {
      setError(res.error || 'PIN salah!');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPin('');
      if (res.lockoutRemaining) {
        setLockoutRemaining(res.lockoutRemaining);
      }
    }
  };

  const handleBiometricClick = async () => {
    setError('');
    const res = await unlockWithBiometric();
    if (!res.success) {
      setError(res.error || 'Verifikasi biometrik gagal.');
    }
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-6 text-white select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="pt-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-xl mb-4">
          <Lock size={32} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">DompetKu Terkunci</h1>
        <p className="text-xs text-slate-400 mt-1">Masukkan PIN untuk membuka aplikasi</p>

        {/* PIN Dots display */}
        <div className={`flex items-center gap-4 mt-8 ${isShaking ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border transition-all ${
                idx < pin.length
                  ? 'bg-emerald-400 border-emerald-400 scale-110 shadow-sm shadow-emerald-400/50'
                  : 'border-slate-700 bg-slate-900'
              }`}
            />
          ))}
        </div>

        {/* Error or Lockout notification */}
        {error && (
          <div className="flex items-center gap-1.5 mt-4 text-xs text-rose-400 bg-rose-950/60 border border-rose-900/60 px-3 py-1.5 rounded-xl animate-in fade-in">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {lockoutRemaining && (
          <p className="text-xs text-amber-400 mt-2">
            Silakan tunggu {lockoutRemaining} detik...
          </p>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs space-y-3 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              disabled={!!lockoutRemaining}
              onClick={() => handleDigit(String(num))}
              className="h-16 rounded-2xl bg-slate-900/80 hover:bg-slate-800 active:bg-slate-700 border border-slate-800 text-2xl font-semibold flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
            >
              {num}
            </button>
          ))}

          {/* Biometric Trigger or Empty */}
          {isBiometricConfigured ? (
            <button
              type="button"
              disabled={!!lockoutRemaining}
              onClick={handleBiometricClick}
              aria-label="Buka dengan sidik jari atau biometrik"
              className="h-16 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/40 active:bg-emerald-900/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
            >
              <Fingerprint size={28} />
            </button>
          ) : (
            <div className="h-16" />
          )}

          {/* 0 */}
          <button
            type="button"
            disabled={!!lockoutRemaining}
            onClick={() => handleDigit('0')}
            className="h-16 rounded-2xl bg-slate-900/80 hover:bg-slate-800 active:bg-slate-700 border border-slate-800 text-2xl font-semibold flex items-center justify-center transition-all active:scale-95 disabled:opacity-30"
          >
            0
          </button>

          {/* Backspace */}
          <button
            type="button"
            disabled={pin.length === 0}
            onClick={handleBackspace}
            aria-label="Hapus digit"
            className="h-16 rounded-2xl bg-slate-900/50 hover:bg-slate-800 active:bg-slate-700 border border-slate-800/60 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-20"
          >
            <Delete size={22} />
          </button>
        </div>

        {/* Clear warning banner */}
        <div className="pt-4 flex items-start gap-2 text-[11px] text-slate-500 text-center justify-center">
          <ShieldAlert size={14} className="shrink-0 text-slate-500 mt-0.5" />
          <p>
            Jika PIN lupa, data hanya dapat dipulihkan lewat file backup lokal Anda.
          </p>
        </div>
      </div>
    </div>
  );
};
