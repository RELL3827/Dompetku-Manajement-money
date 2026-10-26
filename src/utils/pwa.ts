/**
 * PWA & Persistent Storage Utilities
 */

export async function isStoragePersisted(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
    try {
      return await navigator.storage.persisted();
    } catch {
      return false;
    }
  }
  return false;
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      return await navigator.storage.persist();
    } catch (err) {
      console.warn('Failed to request persistent storage:', err);
      return false;
    }
  }
  return false;
}

export async function getStorageEstimate(): Promise<{ usedBytes: number; quotaBytes: number; percentage: number }> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const { usage, quota } = await navigator.storage.estimate();
      const used = usage || 0;
      const total = quota || 1;
      return {
        usedBytes: used,
        quotaBytes: total,
        percentage: Math.min(100, Math.round((used / total) * 100)),
      };
    } catch {
      // Fallback
    }
  }
  return { usedBytes: 0, quotaBytes: 0, percentage: 0 };
}
