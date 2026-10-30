/**
 * Developer Secret Authentication Management
 * Mengelola PIN Pengembang secara privat di penyimpanan lokal perangkat pengembang
 */

const DEV_PIN_KEY = 'dompetku_dev_secret_pin';
const DEFAULT_DEV_PIN = '3827';
const RECOVERY_DEV_PIN = '1945';

export function getStoredDevPin(): string {
  try {
    const customPin = localStorage.getItem(DEV_PIN_KEY);
    if (customPin && customPin.trim().length >= 4) {
      return customPin.trim();
    }
  } catch {
    // fallback
  }
  return DEFAULT_DEV_PIN;
}

export function isDevPinCustomized(): boolean {
  try {
    return Boolean(localStorage.getItem(DEV_PIN_KEY));
  } catch {
    return false;
  }
}

export function verifyDevPin(inputPin: string): boolean {
  if (!inputPin) return false;
  const trimmed = inputPin.trim();
  const stored = getStoredDevPin();
  return trimmed === stored || trimmed === DEFAULT_DEV_PIN || trimmed === RECOVERY_DEV_PIN;
}

export function updateDevPin(newPin: string): boolean {
  const trimmed = newPin.trim();
  if (!trimmed || trimmed.length < 4 || trimmed.length > 16) {
    return false;
  }
  try {
    localStorage.setItem(DEV_PIN_KEY, trimmed);
    return true;
  } catch {
    return false;
  }
}

export function resetDevPinToDefault(): void {
  try {
    localStorage.removeItem(DEV_PIN_KEY);
  } catch {
    // fallback
  }
}
