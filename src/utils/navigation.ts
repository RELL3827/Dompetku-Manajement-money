import type { NavTab } from '../types';

export const TAB_ORDER: NavTab[] = [
  'home',
  'transactions',
  'calendar',
  'notes',
  'calculator',
  'budgets',
  'savings',
  'wallets',
  'analytics',
  'settings',
];

/**
 * Transitions to a new tab using the native View Transitions API with directional slide
 * types ('forward' | 'backward') per modern-web-guidance directional-navigation-transitions.
 * Falls back immediately to direct state update when unsupported.
 */
export const navigateWithTransition = (
  newTab: NavTab,
  setCurrentTab: (tab: NavTab) => void,
  currentTab: NavTab
): void => {
  if (newTab === currentTab) return;

  const oldIndex = TAB_ORDER.indexOf(currentTab);
  const newIndex = TAB_ORDER.indexOf(newTab);
  const direction = newIndex >= oldIndex ? 'forward' : 'backward';

  // Feature detect View Transitions API
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    try {
      // Modern directional view transition with types
      (document as unknown as {
        startViewTransition: (options: { update: () => void; types?: string[] }) => void;
      }).startViewTransition({
        update: () => {
          setCurrentTab(newTab);
        },
        types: [direction],
      });
      return;
    } catch {
      // Fallback for standard startViewTransition without types support
      try {
        (document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(() => {
          setCurrentTab(newTab);
        });
        return;
      } catch {
        setCurrentTab(newTab);
        return;
      }
    }
  }

  // Baseline fallback
  setCurrentTab(newTab);
};
