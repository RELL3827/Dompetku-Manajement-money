import { useEffect, useState } from 'react';
import { lockManager } from '../security/lockManager';

export function useAuthLock() {
  const [isLocked, setIsLocked] = useState<boolean>(lockManager.getIsLocked());

  useEffect(() => {
    lockManager.init();
    const unsubscribe = lockManager.subscribe((locked) => {
      setIsLocked(locked);
    });
    return unsubscribe;
  }, []);

  return {
    isLocked,
    lock: () => lockManager.lock(),
    unlockWithPin: (pin: string) => lockManager.attemptUnlockPin(pin),
    unlockWithBiometric: () => lockManager.attemptUnlockBiometric(),
  };
}
