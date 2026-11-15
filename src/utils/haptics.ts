/**
 * Ultra-lightweight haptic feedback helper using navigator.vibrate.
 * 100% zero-dependency, safe in all environments (browser, PWA, WebView).
 * Runs silently if unsupported or disabled.
 */
export const triggerHaptic = (
  style: 'light' | 'medium' | 'selection' | 'success' | 'warning' = 'light'
): void => {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      if (style === 'light') {
        navigator.vibrate(8);
      } else if (style === 'selection') {
        navigator.vibrate(5);
      } else if (style === 'medium') {
        navigator.vibrate(15);
      } else if (style === 'success') {
        navigator.vibrate([10, 30, 15]);
      } else if (style === 'warning') {
        navigator.vibrate([20, 40, 20]);
      }
    }
  } catch {
    // Graceful fallback: silent no-op
  }
};
