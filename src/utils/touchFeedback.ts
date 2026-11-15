import { triggerHaptic } from './haptics';

/**
 * Initializes global touch & pointer feedback.
 * High performance characteristics:
 * - Uses a single passive event listener on `window` (zero scroll blocking).
 * - Animates only GPU-accelerated compositor properties (`transform`, `opacity`).
 * - Cleans up dynamically generated DOM nodes immediately upon animation end.
 * - Respects `prefers-reduced-motion`.
 */
export const initTouchFeedback = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handlePointerDown = (e: PointerEvent) => {
    // Only primary button clicks / touches
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Do not trigger if motion is reduced
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const target = (e.target as HTMLElement | null)?.closest(
      'button, a, [role="button"], .ios-btn, .liquid-btn, .btn-tactile, .btn-glow-emerald, .card-elevated, .liquid-card, .ios-glass-card, .touch-ripple-target'
    ) as HTMLElement | null;

    if (!target) return;

    // Check if target is disabled or explicitly excluded
    if (
      target.hasAttribute('disabled') ||
      target.getAttribute('aria-disabled') === 'true' ||
      target.dataset.noRipple === 'true'
    ) {
      return;
    }

    // Gentle tactile haptic tick for mobile
    triggerHaptic('light');

    // Calculate dimensions & tap coordinates
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.5;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'liquid-touch-ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    // Ensure target has relative positioning and hidden overflow for clean containment
    if (!target.classList.contains('touch-ripple-container')) {
      target.classList.add('touch-ripple-container');
    }

    target.appendChild(ripple);

    const cleanup = () => {
      ripple.remove();
    };

    ripple.addEventListener('animationend', cleanup, { once: true });
    setTimeout(cleanup, 550);
  };

  window.addEventListener('pointerdown', handlePointerDown, { passive: true });

  return () => {
    window.removeEventListener('pointerdown', handlePointerDown);
  };
};
