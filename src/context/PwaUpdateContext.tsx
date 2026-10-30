import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface PwaUpdateContextType {
  needRefresh: boolean;
  offlineReady: boolean;
  isChecking: boolean;
  isUpdating: boolean;
  isPromptOpen: boolean;
  checkResult: string | null;
  lastCheckTime: Date | null;
  checkForUpdates: () => Promise<{ updated: boolean; message: string }>;
  updateApp: () => Promise<void>;
  dismissUpdatePrompt: () => void;
  openPrompt: () => void;
  closePrompt: () => void;
}

const PwaUpdateContext = createContext<PwaUpdateContextType | undefined>(undefined);

export const PwaUpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      if (r) {
        setSwRegistration(r);
        // Periodic check every 60 minutes if online
        const intervalId = setInterval(() => {
          if (navigator.onLine) {
            r.update().catch(() => {});
          }
        }, 60 * 60 * 1000);

        return () => clearInterval(intervalId);
      }
    },
    onRegisterError(error) {
      console.warn('[PWA] Service Worker registration failed:', error);
    },
  });

  // Automatically open the update prompt when a new version is detected
  useEffect(() => {
    if (needRefresh) {
      setIsPromptOpen(true);
    }
  }, [needRefresh]);

  // Check on focus / tab activation
  useEffect(() => {
    const handleFocus = () => {
      if (navigator.onLine && swRegistration) {
        swRegistration.update().catch(() => {});
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleFocus);
    };
  }, [swRegistration]);

  const checkForUpdates = useCallback(async (): Promise<{ updated: boolean; message: string }> => {
    setIsChecking(true);
    setCheckResult(null);

    if (!navigator.onLine) {
      setIsChecking(false);
      const msg = 'Perangkat sedang offline. Sambungkan internet untuk mengecek pembaruan.';
      setCheckResult(msg);
      return { updated: false, message: msg };
    }

    if (!('serviceWorker' in navigator)) {
      setIsChecking(false);
      const msg = 'Browser tidak mendukung Service Worker.';
      setCheckResult(msg);
      return { updated: false, message: msg };
    }

    try {
      const reg = swRegistration || (await navigator.serviceWorker.getRegistration());
      if (reg) {
        setSwRegistration(reg);

        // If a waiting worker is already present
        if (reg.waiting) {
          setNeedRefresh(true);
          setIsPromptOpen(true);
          setIsChecking(false);
          const msg = 'Pembaruan versi baru tersedia dan siap dipasang!';
          setCheckResult(msg);
          return { updated: true, message: msg };
        }

        // Trigger update check with the server
        await reg.update();
        setLastCheckTime(new Date());

        // Check if waiting appeared immediately after update
        if (reg.waiting) {
          setNeedRefresh(true);
          setIsPromptOpen(true);
          setIsChecking(false);
          const msg = 'Pembaruan versi baru tersedia dan siap dipasang!';
          setCheckResult(msg);
          return { updated: true, message: msg };
        }

        // Wait a short moment for installing state if detected
        return await new Promise<{ updated: boolean; message: string }>((resolve) => {
          let hasFound = false;

          const timer = setTimeout(() => {
            if (!hasFound) {
              setIsChecking(false);
              const msg = 'Aplikasi DompetKu Anda sudah versi terbaru!';
              setCheckResult(msg);
              resolve({ updated: false, message: msg });
            }
          }, 1800);

          reg.onupdatefound = () => {
            const installing = reg.installing;
            if (installing) {
              installing.onstatechange = () => {
                if (installing.state === 'installed') {
                  hasFound = true;
                  clearTimeout(timer);
                  setNeedRefresh(true);
                  setIsPromptOpen(true);
                  setIsChecking(false);
                  const msg = 'Pembaruan baru siap dipasang!';
                  setCheckResult(msg);
                  resolve({ updated: true, message: msg });
                }
              };
            }
          };
        });
      } else {
        setIsChecking(false);
        const msg = 'Aplikasi DompetKu Anda sudah versi terbaru!';
        setCheckResult(msg);
        return { updated: false, message: msg };
      }
    } catch (err) {
      console.warn('Update check failed:', err);
      setIsChecking(false);
      const msg = 'Gagal memeriksa pembaruan. Silakan periksa koneksi internet Anda.';
      setCheckResult(msg);
      return { updated: false, message: msg };
    }
  }, [swRegistration, setNeedRefresh]);

  const updateApp = useCallback(async () => {
    setIsUpdating(true);
    try {
      // Execute skipWaiting and clientsClaim
      await updateServiceWorker(true);
    } catch (err) {
      console.warn('Service worker update failed, reloading page...', err);
      window.location.reload();
    }
  }, [updateServiceWorker]);

  const dismissUpdatePrompt = useCallback(() => {
    setIsPromptOpen(false);
  }, []);

  const openPrompt = useCallback(() => {
    setIsPromptOpen(true);
  }, []);

  const closePrompt = useCallback(() => {
    setIsPromptOpen(false);
    if (offlineReady) {
      setOfflineReady(false);
    }
  }, [offlineReady, setOfflineReady]);

  return (
    <PwaUpdateContext.Provider
      value={{
        needRefresh,
        offlineReady,
        isChecking,
        isUpdating,
        isPromptOpen,
        checkResult,
        lastCheckTime,
        checkForUpdates,
        updateApp,
        dismissUpdatePrompt,
        openPrompt,
        closePrompt,
      }}
    >
      {children}
    </PwaUpdateContext.Provider>
  );
};

export const usePwaUpdate = () => {
  const context = useContext(PwaUpdateContext);
  if (!context) {
    throw new Error('usePwaUpdate must be used within a PwaUpdateProvider');
  }
  return context;
};
