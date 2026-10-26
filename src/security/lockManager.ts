import { db } from '../db/database';
import { verifyPin } from './crypto';
import { verifyBiometric } from './webauthn';

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds

type LockStateListener = (isLocked: boolean) => void;

class LockManager {
  private isLocked = false;
  private lastActiveTimestamp = Date.now();
  private listeners: Set<LockStateListener> = new Set();
  private autoLockMinutes = 5;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    const settings = await db.getSettings();
    this.autoLockMinutes = settings.security.autoLockMinutes;

    if (settings.security.isPinEnabled) {
      // If PIN is enabled, lock upon opening
      this.isLocked = true;
      this.notify();
    }

    // Activity listeners
    const resetTimer = () => {
      this.lastActiveTimestamp = Date.now();
    };

    window.addEventListener('mousemove', resetTimer, { passive: true });
    window.addEventListener('keydown', resetTimer, { passive: true });
    window.addEventListener('touchstart', resetTimer, { passive: true });

    // Document visibility listener for auto-lock when app is minimized or hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.lastActiveTimestamp = Date.now();
      } else if (document.visibilityState === 'visible') {
        this.checkIdleLock();
      }
    });

    // Background interval check for idle time
    setInterval(() => {
      this.checkIdleLock();
    }, 10000);
  }

  subscribe(listener: LockStateListener): () => void {
    this.listeners.add(listener);
    listener(this.isLocked);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.isLocked));
  }

  private async checkIdleLock() {
    if (this.isLocked || this.autoLockMinutes < 0) return;

    const settings = await db.getSettings();
    if (!settings.security.isPinEnabled) return;

    const idleMinutes = (Date.now() - this.lastActiveTimestamp) / (1000 * 60);
    if (idleMinutes >= settings.security.autoLockMinutes) {
      this.lock();
    }
  }

  lock() {
    this.isLocked = true;
    this.notify();
  }

  unlock() {
    this.isLocked = false;
    this.lastActiveTimestamp = Date.now();
    this.notify();
  }

  getIsLocked(): boolean {
    return this.isLocked;
  }

  /**
   * Attempt to unlock with PIN
   */
  async attemptUnlockPin(pin: string): Promise<{ success: boolean; error?: string; lockoutRemaining?: number }> {
    const settings = await db.getSettings();
    const sec = settings.security;

    if (!sec.isPinEnabled || !sec.pinHash || !sec.salt) {
      this.unlock();
      return { success: true };
    }

    // Check lockout timer
    const now = Date.now();
    if (sec.lockedUntil && sec.lockedUntil > now) {
      const remainingSec = Math.ceil((sec.lockedUntil - now) / 1000);
      return {
        success: false,
        error: `Terlalu banyak percobaan salah. Tunggu ${remainingSec} detik.`,
        lockoutRemaining: remainingSec,
      };
    }

    const isValid = await verifyPin(pin, sec.pinHash, sec.salt);

    if (isValid) {
      // Reset failed attempts
      await db.updateSettings({
        security: {
          ...sec,
          failedAttempts: 0,
          lockedUntil: null,
        },
      });
      this.unlock();
      return { success: true };
    } else {
      const failed = sec.failedAttempts + 1;
      let lockedUntil: number | null = null;
      let error = `PIN salah. Sisa percobaan: ${MAX_FAILED_ATTEMPTS - failed}`;

      if (failed >= MAX_FAILED_ATTEMPTS) {
        lockedUntil = now + LOCKOUT_DURATION_MS;
        error = `Terlalu banyak percobaan salah. Terkunci selama 30 detik.`;
      }

      await db.updateSettings({
        security: {
          ...sec,
          failedAttempts: failed >= MAX_FAILED_ATTEMPTS ? 0 : failed,
          lockedUntil,
        },
      });

      return {
        success: false,
        error,
        lockoutRemaining: lockedUntil ? 30 : undefined,
      };
    }
  }

  /**
   * Attempt to unlock with WebAuthn Biometrics
   */
  async attemptUnlockBiometric(): Promise<{ success: boolean; error?: string }> {
    const settings = await db.getSettings();
    const sec = settings.security;

    if (!sec.isPinEnabled || !sec.isBiometricEnabled || !sec.biometricCredentialId) {
      return { success: false, error: 'Biometrik belum dikonfigurasi.' };
    }

    const ok = await verifyBiometric(sec.biometricCredentialId);
    if (ok) {
      await db.updateSettings({
        security: {
          ...sec,
          failedAttempts: 0,
          lockedUntil: null,
        },
      });
      this.unlock();
      return { success: true };
    }

    return { success: false, error: 'Verifikasi biometrik gagal.' };
  }
}

export const lockManager = new LockManager();
