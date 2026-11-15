import { useEffect, useRef } from 'react';
import type { NavTab } from '../types';
import { TAB_ORDER, navigateWithTransition } from '../utils/navigation';
import { triggerHaptic } from '../utils/haptics';

interface UseSwipeNavigationOptions {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  enabled?: boolean;
}

/**
 * High-performance mobile swipe navigation gesture hook.
 *
 * Characteristics:
 * - Uses 100% passive listeners so vertical scrolling remains instantaneous and stutter-free.
 * - Disregards interactive sub-components (inputs, textareas, selects, modals, horizontal scrollers).
 * - Enforces minimum distance and horizontal-to-vertical dominance ratio to prevent accidental triggers.
 */
export const useSwipeNavigation = ({
  currentTab,
  onChangeTab,
  enabled = true,
}: UseSwipeNavigationOptions): void => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleTouchStart = (e: TouchEvent) => {
      // Ignore multi-touch (pinch/zoom)
      if (e.touches.length !== 1) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Do NOT intercept interactive controls or horizontally scrollable containers
      if (
        target.closest('input, textarea, select, [contenteditable="true"]') ||
        target.closest('.overflow-x-auto, [role="dialog"], .modal-dialog-box, .no-swipe, [data-no-swipe="true"]')
      ) {
        touchStartRef.current = null;
        return;
      }

      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length !== 1) return;

      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      const elapsed = Date.now() - touchStartRef.current.time;

      touchStartRef.current = null;

      // Swipe gesture criteria:
      // 1. Gesture completed in under 450ms (quick flick/swipe)
      // 2. Horizontal distance at least 60px
      // 3. Clear horizontal dominance (horizontal delta must be at least 1.6x vertical delta)
      if (
        elapsed < 450 &&
        Math.abs(deltaX) >= 60 &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.6
      ) {
        const currentIndex = TAB_ORDER.indexOf(currentTab);
        if (currentIndex === -1) return;

        if (deltaX < 0) {
          // Swipe Left -> Next Tab
          if (currentIndex < TAB_ORDER.length - 1) {
            const nextTab = TAB_ORDER[currentIndex + 1];
            triggerHaptic('selection');
            navigateWithTransition(nextTab, onChangeTab, currentTab);
          }
        } else {
          // Swipe Right -> Previous Tab
          if (currentIndex > 0) {
            const prevTab = TAB_ORDER[currentIndex - 1];
            triggerHaptic('selection');
            navigateWithTransition(prevTab, onChangeTab, currentTab);
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentTab, onChangeTab, enabled]);
};
