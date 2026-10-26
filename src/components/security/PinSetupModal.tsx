import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { hashPin, generateSalt, verifyPin } from '../../security/crypto';
import { isBiometricAvailable, registerBiometric } from '../../security/webauthn';
import { db } from '../../db/database';
import { Fingerprint, AlertTriangle } from 'lucide-react';
import type { SecuritySettings } from '../../types';

interface PinSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const PinSetupModal: React.FC<PinSetupModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [security, setSecurity] = useState<SecuritySettings | null>(null);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [autoLockMinutes, setAutoLockMinutes] = useState(5);
  const [enableBiometric, setEnableBiometric] = useState(false);
  const [hasBiometricHardware, setHasBiometricHardware] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSec() {
      const settings = await db.getSettings();
      setSecurity(settings.security);
      setAutoLockMinutes(settings.security.autoLockMinutes);
      setEnableBiometric(settings.security.isBiometricEnabled);

      const available = await isBiometricAvailable();
      setHasBiometricHardware(available);

      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setError('');
    }
    if (isOpen) {
      loadSec();
    }
  }, [isOpen]);

  if (!security) return null;

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // If already enabled, verify current PIN
    if (security.isPinEnabled && security.pinHash && security.salt) {
      if (!currentPin) {
        setError('Masukkan PIN saat ini untuk verifikasi');
        return;
      }
      const isCurrentValid = await verifyPin(currentPin, security.pinHash, security.salt);
      if (!isCurrentValid) {
        setError('PIN saat ini tidak cocok');
        return;
      }
    }

    if (newPin.length < 4 || newPin.length > 6) {
      setError('PIN harus berupa 4 hingga 6 digit angka');
      return;
    }

    if (newPin !== confirmPin) {
      setError('Konfirmasi PIN baru tidak cocok');
      return;
    }

    setLoading(true);
    try {
      const salt = generateSalt(16);
      const pinHash = await hashPin(newPin, salt);

      let credentialId = security.biometricCredentialId;
      if (enableBiometric && hasBiometricHardware && !credentialId) {
        try {
          credentialId = await registerBiometric();
        } catch (bioErr: any) {
          console.warn('Biometric registration canceled or failed:', bioErr);
        }
      }

      await db.updateSettings({
        security: {
          isPinEnabled: true,
          pinHash,
          salt,
          isBiometricEnabled: enableBiometric && !!credentialId,
          biometricCredentialId: credentialId,
          autoLockMinutes,
          failedAttempts: 0,
          lockedUntil: null,
        },
      });

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleDisablePin = async () => {
    if (!currentPin) {
      setError('Masukkan PIN saat ini untuk menonaktifkan kunci');
      return;
    }
    if (security.pinHash && security.salt) {
      const isCurrentValid = await verifyPin(currentPin, security.pinHash, security.salt);
      if (!isCurrentValid) {
        setError('PIN tidak cocok');
        return;
      }
    }

    setLoading(true);
    try {
      await db.updateSettings({
        security: {
          isPinEnabled: false,
          pinHash: undefined,
          salt: undefined,
          isBiometricEnabled: false,
          biometricCredentialId: undefined,
          autoLockMinutes: 5,
          failedAttempts: 0,
          lockedUntil: null,
        },
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menonaktifkan PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={security.isPinEnabled ? 'Ubah Kunci Keamanan' : 'Aktifkan Kunci PIN'}
      maxWidth="sm"
    >
      <form onSubmit={handleSavePin} noValidate className="space-y-4">
        {/* Warning Alert */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle size={18} className="shrink-0 text-amber-500 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Penting:</strong> PIN dienkripsi dengan PBKDF2 dan disimpan secara lokal. Jika PIN lupa, data hanya dapat dipulihkan lewat file backup Anda.
          </p>
        </div>

        {/* Current PIN (if enabled) */}
        {security.isPinEnabled && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              PIN Saat Ini
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm tracking-widest focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        {/* New PIN */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {security.isPinEnabled ? 'PIN Baru (4-6 digit)' : 'Masukkan PIN (4-6 digit)'}
          </label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm tracking-widest focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Confirm New PIN */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Konfirmasi PIN
          </label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm tracking-widest focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Auto Lock Duration */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Kunci Otomatis Saat Idle
          </label>
          <select
            value={autoLockMinutes}
            onChange={(e) => setAutoLockMinutes(parseInt(e.target.value, 10))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value={0}>Segera saat aplikasi ditutup / diminimalkan</option>
            <option value={1}>Setelah 1 menit tidak aktif</option>
            <option value={5}>Setelah 5 menit tidak aktif (Standar)</option>
            <option value={15}>Setelah 15 menit tidak aktif</option>
            <option value={-1}>Jangan pernah kunci otomatis</option>
          </select>
        </div>

        {/* Biometrics Toggle if supported */}
        {hasBiometricHardware && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Fingerprint size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Buka dengan Sidik Jari / Face ID
                </p>
                <p className="text-[11px] text-slate-400">Gunakan biometrik perangkat (WebAuthn)</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableBiometric}
              onChange={(e) => setEnableBiometric(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </div>
        )}

        {error && <p className="text-xs font-medium text-rose-500">{error}</p>}

        {/* Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          {security.isPinEnabled ? (
            <button
              type="button"
              onClick={handleDisablePin}
              disabled={loading}
              className="px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
            >
              Nonaktifkan PIN
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm shadow-emerald-600/20 disabled:opacity-50 transition-all"
            >
              {loading ? 'Menyimpan...' : 'Simpan PIN'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
