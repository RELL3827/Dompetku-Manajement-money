import React, { useId } from 'react';
import * as LucideIcons from 'lucide-react';

export interface RealisticIconProps {
  name: string;
  size?: number;
  className?: string;
  title?: string;
  color?: string;
}

/**
 * RealisticIcon renders dimensional, layered 3D-style SVG icons with multi-stop gradients,
 * specular highlights, and realistic depth per modern-web-guidance `icons` best practices.
 * Uses React.useId() to isolate SVG <defs> gradient IDs across multiple instances.
 */
export const RealisticIcon: React.FC<RealisticIconProps> = ({
  name,
  size = 24,
  className = '',
  title,
  color,
}) => {
  const uid = useId().replace(/:/g, '');
  const ariaProps = title
    ? { role: 'img' as const, 'aria-label': title }
    : { 'aria-hidden': true as const };

  switch (name) {
    case 'Home':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-roof`} x1="8" y1="6" x2="40" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id={`${uid}-wall`} x1="10" y1="18" x2="38" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id={`${uid}-door`} x1="20" y1="27" x2="28" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <ellipse cx="24" cy="43" rx="15" ry="2.5" fill="rgba(15,23,42,0.16)" />
          <path d="M10 22L24 10L38 22V39C38 40.6569 36.6569 42 35 42H13C11.3431 42 10 40.6569 10 39V22Z" fill={`url(#${uid}-wall)`} />
          <path d="M20 29C20 27.3431 21.3431 26 23 26H25C26.6569 26 28 27.3431 28 29V42H20V29Z" fill={`url(#${uid}-door)`} />
          <circle cx="26" cy="34" r="1.2" fill="#fde68a" />
          <path d="M5 23L22.6 7.4C23.4 6.7 24.6 6.7 25.4 7.4L43 23C43.8 23.7 43.3 25 42.2 25H39L24 11.7L9 25H5.8C4.7 25 4.2 23.7 5 23Z" fill={`url(#${uid}-roof)`} />
          <path d="M24 7.2L41.5 22.8" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
          <rect x="13" y="25" width="4.5" height="4.5" rx="1" fill="#bae6fd" stroke="#94a3b8" strokeWidth="0.6" />
          <rect x="30.5" y="25" width="4.5" height="4.5" rx="1" fill="#bae6fd" stroke="#94a3b8" strokeWidth="0.6" />
        </svg>
      );

    case 'Wallet':
    case 'WalletCards':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-card`} x1="12" y1="8" x2="36" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id={`${uid}-leather`} x1="6" y1="14" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="55%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>
            <linearGradient id={`${uid}-flap`} x1="28" y1="22" x2="43" y2="33" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <ellipse cx="24" cy="43" rx="16" ry="2.4" fill="rgba(15,23,42,0.18)" />
          <rect x="11" y="9" width="26" height="16" rx="3" transform="rotate(-6 11 9)" fill={`url(#${uid}-card)`} />
          <rect x="14" y="13" width="6" height="4" rx="1" transform="rotate(-6 14 13)" fill="rgba(255,255,255,0.6)" />
          <rect x="6" y="15" width="35" height="26" rx="6" fill={`url(#${uid}-leather)`} />
          <rect x="7" y="16" width="33" height="24" rx="5" stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="2.5 2.5" />
          <path d="M7 18C7 16.3431 8.34315 15 10 15H38C39.6569 15 41 16.3431 41 18V20H7V18Z" fill="rgba(255,255,255,0.16)" />
          <rect x="27" y="23" width="16" height="10" rx="5" fill={`url(#${uid}-flap)`} stroke="rgba(255,255,255,0.28)" strokeWidth="0.9" />
          <circle cx="32.5" cy="28" r="2.6" fill="#fef08a" stroke="#b45309" strokeWidth="0.8" />
          <circle cx="31.8" cy="27.3" r="0.8" fill="#ffffff" />
        </svg>
      );

    case 'PiggyBank':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <radialGradient id={`${uid}-pig`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 20) rotate(50) scale(24)">
              <stop offset="0%" stopColor="#fbcfe8" />
              <stop offset="55%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#be185d" />
            </radialGradient>
            <linearGradient id={`${uid}-coin`} x1="20" y1="4" x2="28" y2="14" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <ellipse cx="24" cy="43" rx="14" ry="2.2" fill="rgba(15,23,42,0.15)" />
          {/* Coin dropping in */}
          <circle cx="24" cy="9" r="5" fill={`url(#${uid}-coin)`} stroke="#b45309" strokeWidth="0.8" />
          <path d="M22.5 7.5C23.5 6.8 25 7 25.5 7.8" stroke="rgba(255,255,255,0.75)" strokeWidth="1" strokeLinecap="round" />
          {/* Legs */}
          <rect x="13" y="34" width="5" height="7.5" rx="2.5" fill="#db2777" />
          <rect x="28" y="34" width="5" height="7.5" rx="2.5" fill="#db2777" />
          {/* Ear */}
          <path d="M31 15L36 10L37.5 17.5Z" fill="#ec4899" />
          {/* Tail */}
          <path d="M8 26C5 24.5 5 20.5 8 21.5" stroke="#ec4899" strokeWidth="2.2" strokeLinecap="round" />
          {/* Body */}
          <ellipse cx="23.5" cy="26.5" rx="15" ry="11.5" fill={`url(#${uid}-pig)`} />
          {/* Snout */}
          <ellipse cx="38.5" cy="27.5" rx="4.2" ry="5" fill="#f472b6" stroke="#be185d" strokeWidth="0.7" />
          <circle cx="38" cy="26.2" r="0.9" fill="#831843" />
          <circle cx="39.8" cy="28" r="0.9" fill="#831843" />
          {/* Coin Slot */}
          <rect x="19" y="16" width="9" height="2" rx="1" fill="#831843" />
          {/* Gloss highlight */}
          <ellipse cx="18.5" cy="21" rx="6" ry="2.3" transform="rotate(-14 18.5 21)" fill="rgba(255,255,255,0.38)" />
          {/* Eye */}
          <circle cx="31.5" cy="22.5" r="1.6" fill="#0f172a" />
          <circle cx="32" cy="22" r="0.55" fill="#ffffff" />
        </svg>
      );

    case 'Coins':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-gold1`} x1="8" y1="10" x2="34" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id={`${uid}-gold2`} x1="16" y1="16" x2="40" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="60%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
          </defs>
          <ellipse cx="24" cy="43.5" rx="16" ry="2.2" fill="rgba(15,23,42,0.16)" />
          {/* Back Stack */}
          <path d="M8 29V34C8 36.76 13.82 39 21 39C28.18 39 34 36.76 34 34V29" fill="#b45309" />
          <ellipse cx="21" cy="29" rx="13" ry="5" fill={`url(#${uid}-gold1)`} stroke="#fbbf24" strokeWidth="0.8" />
          <path d="M8 22V27C8 29.76 13.82 32 21 32C28.18 32 34 29.76 34 27V22" fill="#d97706" />
          <ellipse cx="21" cy="22" rx="13" ry="5" fill={`url(#${uid}-gold1)`} stroke="#fde047" strokeWidth="0.8" />
          <path d="M8 15V20C8 22.76 13.82 25 21 25C28.18 25 34 22.76 34 20V15" fill="#d97706" />
          <ellipse cx="21" cy="15" rx="13" ry="5" fill={`url(#${uid}-gold2)`} stroke="#fef08a" strokeWidth="1" />
          <ellipse cx="21" cy="15" rx="9.5" ry="3.2" stroke="#b45309" strokeOpacity="0.35" strokeWidth="1" />
          {/* Front Coin */}
          <circle cx="32" cy="31" r="9.5" fill={`url(#${uid}-gold2)`} stroke="#fef08a" strokeWidth="1.2" />
          <circle cx="32" cy="31" r="7" stroke="#b45309" strokeOpacity="0.4" strokeWidth="1" />
          <path d="M32 27V35M30 29C30 28 31 27.5 32 27.5C33.2 27.5 34 28.2 34 29C34 30.2 30 30.5 30 32C30 33 31 33.6 32.2 33.6C33.3 33.6 34 33 34 32.2" stroke="#92400e" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M26 26C27.5 23.8 30.2 23 32.8 23.3" stroke="rgba(255,255,255,0.8)" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    case 'Banknote':
    case 'DollarSign':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-note1`} x1="6" y1="14" x2="42" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="55%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id={`${uid}-band`} x1="20" y1="15" x2="28" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <ellipse cx="24" cy="42" rx="16" ry="2.2" fill="rgba(15,23,42,0.16)" />
          <rect x="6" y="18" width="36" height="20" rx="3.5" fill="#065f46" />
          <rect x="6" y="14" width="36" height="20" rx="3.5" fill={`url(#${uid}-note1)`} stroke="#6ee7b7" strokeWidth="1" />
          <rect x="9.5" y="17.5" width="29" height="13" rx="2" stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeDasharray="2 1.5" />
          <rect x="20" y="13.8" width="8" height="20.4" rx="1" fill={`url(#${uid}-band)`} />
          <circle cx="24" cy="24" r="3.8" fill="#fef08a" stroke="#b45309" strokeWidth="0.9" />
          <path d="M12 20L15 20M33 28L36 28" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'Users':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-u1`} x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id={`${uid}-u2`} x1="6" y1="14" x2="22" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id={`${uid}-u3`} x1="26" y1="14" x2="42" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <ellipse cx="24" cy="43" rx="16" ry="2.2" fill="rgba(15,23,42,0.16)" />
          {/* Left Person */}
          <circle cx="13" cy="19" r="5" fill={`url(#${uid}-u2)`} />
          <path d="M5 35C5 30.5817 8.58172 27 13 27C15.8 27 18.2 28.4 19.6 30.5V36H5V35Z" fill={`url(#${uid}-u2)`} />
          {/* Right Person */}
          <circle cx="35" cy="19" r="5" fill={`url(#${uid}-u3)`} />
          <path d="M28.4 30.5C29.8 28.4 32.2 27 35 27C39.4183 27 43 30.5817 43 35V36H28.4V30.5Z" fill={`url(#${uid}-u3)`} />
          {/* Center Person */}
          <circle cx="24" cy="15.5" r="6.2" fill={`url(#${uid}-u1)`} stroke="#ffffff" strokeWidth="1.5" />
          <path d="M13.5 36.5C13.5 30.701 18.201 26 24 26C29.799 26 34.5 30.701 34.5 36.5V39C34.5 39.8 33.8 40.5 33 40.5H15C14.2 40.5 13.5 39.8 13.5 39V36.5Z" fill={`url(#${uid}-u1)`} stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="22" cy="13.5" r="1.5" fill="rgba(255,255,255,0.45)" />
        </svg>
      );

    case 'TrendingUp':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-bg`} x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#d1fae5" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>
            <linearGradient id={`${uid}-arr`} x1="10" y1="34" x2="39" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <rect x="6" y="6" width="36" height="36" rx="11" fill={`url(#${uid}-bg)`} />
          <path d="M10 35L19 25L26 30L37 15" stroke={`url(#${uid}-arr)`} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M29 14H38V23" stroke={`url(#${uid}-arr)`} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 10H28" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'TrendingDown':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-bg`} x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffe4e6" />
              <stop offset="100%" stopColor="#fda4af" />
            </linearGradient>
            <linearGradient id={`${uid}-arr`} x1="10" y1="14" x2="39" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
          </defs>
          <rect x="6" y="6" width="36" height="36" rx="11" fill={`url(#${uid}-bg)`} />
          <path d="M10 15L19 24L26 19L37 33" stroke={`url(#${uid}-arr)`} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M29 34H38V25" stroke={`url(#${uid}-arr)`} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 10H28" stroke="rgba(255,255,255,0.65)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'ArrowLeftRight':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-bg`} x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>
            <linearGradient id={`${uid}-a1`} x1="10" y1="14" x2="38" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id={`${uid}-a2`} x1="38" y1="34" x2="10" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect x="6" y="6" width="36" height="36" rx="11" fill={`url(#${uid}-bg)`} />
          <path d="M12 18H35M35 18L29 12M35 18L29 24" stroke={`url(#${uid}-a1)`} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M36 30H13M13 30L19 24M13 30L19 36" stroke={`url(#${uid}-a2)`} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'Calendar':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-top`} x1="8" y1="8" x2="40" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id={`${uid}-page`} x1="8" y1="18" x2="40" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>
          <ellipse cx="24" cy="43.5" rx="15" ry="2" fill="rgba(15,23,42,0.16)" />
          <rect x="8" y="11" width="32" height="30" rx="6" fill={`url(#${uid}-page)`} stroke="#cbd5e1" strokeWidth="1" />
          <path d="M8 17C8 13.6863 10.6863 11 14 11H34C37.3137 11 40 13.6863 40 17V20H8V17Z" fill={`url(#${uid}-top)`} />
          <rect x="14.5" y="6.5" width="3.5" height="7.5" rx="1.75" fill="#475569" stroke="#e2e8f0" strokeWidth="0.8" />
          <rect x="30" y="6.5" width="3.5" height="7.5" rx="1.75" fill="#475569" stroke="#e2e8f0" strokeWidth="0.8" />
          <rect x="13.5" y="24.5" width="5" height="4.5" rx="1" fill="#94a3b8" />
          <rect x="21.5" y="24.5" width="5" height="4.5" rx="1" fill="#10b981" />
          <rect x="29.5" y="24.5" width="5" height="4.5" rx="1" fill="#94a3b8" />
          <rect x="13.5" y="31.5" width="5" height="4.5" rx="1" fill="#f59e0b" />
          <rect x="21.5" y="31.5" width="5" height="4.5" rx="1" fill="#94a3b8" />
          <rect x="29.5" y="31.5" width="5" height="4.5" rx="1" fill="#94a3b8" />
        </svg>
      );

    case 'Calculator':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-body`} x1="10" y1="6" x2="38" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id={`${uid}-lcd`} x1="14" y1="10" x2="34" y2="18" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <ellipse cx="24" cy="43.5" rx="12" ry="2" fill="rgba(15,23,42,0.18)" />
          <rect x="10" y="6" width="28" height="36" rx="5.5" fill={`url(#${uid}-body)`} stroke="#64748b" strokeWidth="1" />
          <rect x="13.5" y="10" width="21" height="8" rx="2" fill={`url(#${uid}-lcd)`} />
          <circle cx="16.5" cy="23.5" r="2.2" fill="#e2e8f0" />
          <circle cx="24" cy="23.5" r="2.2" fill="#e2e8f0" />
          <circle cx="31.5" cy="23.5" r="2.2" fill="#f59e0b" />
          <circle cx="16.5" cy="29.5" r="2.2" fill="#e2e8f0" />
          <circle cx="24" cy="29.5" r="2.2" fill="#e2e8f0" />
          <circle cx="31.5" cy="29.5" r="2.2" fill="#f59e0b" />
          <circle cx="16.5" cy="35.5" r="2.2" fill="#e2e8f0" />
          <circle cx="24" cy="35.5" r="2.2" fill="#e2e8f0" />
          <circle cx="31.5" cy="35.5" r="2.2" fill="#10b981" />
        </svg>
      );

    case 'FileText':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-paper`} x1="10" y1="6" x2="38" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id={`${uid}-clip`} x1="18" y1="4" x2="30" y2="11" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <ellipse cx="24" cy="43.5" rx="13" ry="2" fill="rgba(15,23,42,0.16)" />
          <rect x="10" y="8" width="28" height="34" rx="4.5" fill={`url(#${uid}-paper)`} stroke="#cbd5e1" strokeWidth="1" />
          <rect x="18" y="5" width="12" height="5.5" rx="2.5" fill={`url(#${uid}-clip)`} />
          <rect x="15" y="16" width="18" height="2.6" rx="1.3" fill="#10b981" />
          <rect x="15" y="22" width="18" height="2.4" rx="1.2" fill="#94a3b8" />
          <rect x="15" y="27.5" width="14" height="2.4" rx="1.2" fill="#94a3b8" />
          <rect x="15" y="33" width="10" height="2.4" rx="1.2" fill="#cbd5e1" />
        </svg>
      );

    case 'Target':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-ring`} x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>
          <ellipse cx="24" cy="43.5" rx="14" ry="2" fill="rgba(15,23,42,0.16)" />
          <circle cx="24" cy="24" r="17" fill={`url(#${uid}-ring)`} />
          <circle cx="24" cy="24" r="12" fill="#ffffff" />
          <circle cx="24" cy="24" r="7.5" fill={`url(#${uid}-ring)`} />
          <circle cx="24" cy="24" r="3" fill="#fbbf24" />
          {/* Dart */}
          <path d="M24 24L39 9" stroke="#334155" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M35 9H39V13" fill="#10b981" stroke="#059669" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );

    case 'BarChart3':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-b1`} x1="10" y1="24" x2="17" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id={`${uid}-b2`} x1="20" y1="12" x2="28" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id={`${uid}-b3`} x1="31" y1="18" x2="38" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <ellipse cx="24" cy="43" rx="16" ry="2" fill="rgba(15,23,42,0.14)" />
          <rect x="9" y="23" width="8" height="17" rx="3" fill={`url(#${uid}-b1)`} />
          <rect x="20" y="10" width="8" height="30" rx="3" fill={`url(#${uid}-b2)`} />
          <rect x="31" y="17" width="8" height="23" rx="3" fill={`url(#${uid}-b3)`} />
          <rect x="7" y="39.5" width="34" height="2.5" rx="1.25" fill="#cbd5e1" />
        </svg>
      );

    case 'History':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-rim`} x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          <ellipse cx="24" cy="43.5" rx="14" ry="2" fill="rgba(15,23,42,0.15)" />
          <circle cx="24" cy="24" r="16.5" fill="#ffffff" stroke={`url(#${uid}-rim)`} strokeWidth="4" />
          <path d="M24 14V24L31 28" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24" cy="24" r="2.2" fill="#3b82f6" />
        </svg>
      );

    case 'Settings':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-gear`} x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
          <path
            d="M21.4 7.5C21.7 6.1 22.9 5 24.3 5H24.7C26.1 5 27.3 6.1 27.6 7.5L28.1 10.1C29.3 10.5 30.4 11 31.4 11.7L33.7 10.4C34.9 9.7 36.4 10 37.3 11L37.6 11.3C38.6 12.2 38.8 13.8 38.1 15L36.8 17.3C37.5 18.3 38 19.4 38.4 20.6L41 21.1C42.4 21.4 43.5 22.6 43.5 24V24.4C43.5 25.8 42.4 27 41 27.3L38.4 27.8C38 29 37.5 30.1 36.8 31.1L38.1 33.4C38.8 34.6 38.6 36.2 37.6 37.1L37.3 37.4C36.4 38.4 34.9 38.7 33.7 38L31.4 36.7C30.4 37.4 29.3 37.9 28.1 38.3L27.6 40.9C27.3 42.3 26.1 43.4 24.7 43.4H24.3C22.9 43.4 21.7 42.3 21.4 40.9L20.9 38.3C19.7 37.9 18.6 37.4 17.6 36.7L15.3 38C14.1 38.7 12.6 38.4 11.7 37.4L11.4 37.1C10.4 36.2 10.2 34.6 10.9 33.4L12.2 31.1C11.5 30.1 11 29 10.6 27.8L8 27.3C6.6 27 5.5 25.8 5.5 24.4V24C5.5 22.6 6.6 21.4 8 21.1L10.6 20.6C11 19.4 11.5 18.3 12.2 17.3L10.9 15C10.2 13.8 10.4 12.2 11.4 11.3L11.7 11C12.6 10 14.1 9.7 15.3 10.4L17.6 11.7C18.6 11 19.7 10.5 20.9 10.1L21.4 7.5Z"
            fill={`url(#${uid}-gear)`}
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="1"
          />
          <circle cx="24.5" cy="24.2" r="7.5" fill="#f8fafc" stroke="#475569" strokeWidth="2.5" />
          <circle cx="24.5" cy="24.2" r="3" fill="#10b981" />
        </svg>
      );

    case 'Heart':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <radialGradient id={`${uid}-heart`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(18 16) rotate(45) scale(28)">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </radialGradient>
          </defs>
          <path
            d="M24 41.5C24 41.5 7 30.8 7 18.2C7 12.4 11.6 8 17 8C20.4 8 23.1 9.9 24 12.3C24.9 9.9 27.6 8 31 8C36.4 8 41 12.4 41 18.2C41 30.8 24 41.5 24 41.5Z"
            fill={`url(#${uid}-heart)`}
          />
          <ellipse cx="15.5" cy="14.5" rx="3.8" ry="2" transform="rotate(-30 15.5 14.5)" fill="rgba(255,255,255,0.45)" />
        </svg>
      );

    case 'ShieldCheck':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-shield`} x1="10" y1="6" x2="38" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <path
            d="M24 6L39 11.5V22.5C39 32.5 32.4 40.3 24 43C15.6 40.3 9 32.5 9 22.5V11.5L24 6Z"
            fill={`url(#${uid}-shield)`}
            stroke="#a7f3d0"
            strokeWidth="1.2"
          />
          <path d="M17.5 24L22 28.5L31 19" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'CreditCard':
    case 'Landmark':
    case 'Building2':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-cc`} x1="6" y1="12" x2="42" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#3730a3" />
            </linearGradient>
            <linearGradient id={`${uid}-chip`} x1="11" y1="20" x2="18" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <ellipse cx="24" cy="41.5" rx="16" ry="2" fill="rgba(15,23,42,0.16)" />
          <rect x="6" y="12" width="36" height="25" rx="4.5" fill={`url(#${uid}-cc)`} stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
          <rect x="6" y="17" width="36" height="4.5" fill="rgba(15,23,42,0.4)" />
          <rect x="11" y="25" width="7" height="5.5" rx="1.2" fill={`url(#${uid}-chip)`} />
          <rect x="22" y="28" width="14" height="2.2" rx="1.1" fill="rgba(255,255,255,0.6)" />
        </svg>
      );

    case 'Trophy':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-cup`} x1="14" y1="7" x2="34" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <path d="M14 10H9C9 17 11.5 21 15.5 22M34 10H39C39 17 36.5 21 32.5 22" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
          <path d="M14 8H34V18C34 24.5 29.5 29 24 29C18.5 29 14 24.5 14 18V8Z" fill={`url(#${uid}-cup)`} />
          <rect x="22" y="29" width="4" height="7" fill="#d97706" />
          <rect x="16" y="36" width="16" height="5" rx="2" fill="#475569" />
          <path d="M24 13L25.5 16.5L29 17L26.3 19.4L27 23L24 21.2L21 23L21.7 19.4L19 17L22.5 16.5L24 13Z" fill="#ffffff" fillOpacity="0.85" />
        </svg>
      );

    case 'Utensils':
    case 'Coffee':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-plate`} x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="100%" stopColor="#fdba74" />
            </linearGradient>
            <linearGradient id={`${uid}-steel`} x1="14" y1="12" x2="34" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="24" r="18" fill={`url(#${uid}-plate)`} />
          <path d="M17 13V22C17 24 18.5 25 20 25V35M14 13V20M20 13V20" stroke={`url(#${uid}-steel)`} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M30 13V35M30 13C33 13 34 18 30 22" stroke={`url(#${uid}-steel)`} strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );

    case 'Car':
    case 'Fuel':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-car`} x1="8" y1="16" x2="40" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <path d="M11 23L15.5 14H32.5L37 23H11Z" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
          <rect x="7" y="22" width="34" height="11" rx="4.5" fill={`url(#${uid}-car)`} />
          <circle cx="15" cy="34" r="4" fill="#1e293b" stroke="#e2e8f0" strokeWidth="1.5" />
          <circle cx="33" cy="34" r="4" fill="#1e293b" stroke="#e2e8f0" strokeWidth="1.5" />
          <rect x="10" y="25" width="4" height="2.5" rx="1" fill="#fef08a" />
          <rect x="34" y="25" width="4" height="2.5" rx="1" fill="#fef08a" />
        </svg>
      );

    case 'ShoppingBag':
    case 'Store':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-bag`} x1="10" y1="14" x2="38" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
          </defs>
          <path d="M17 16V12C17 8.68629 19.6863 6 23 6H25C28.3137 6 31 8.68629 31 12V16" stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round" />
          <path d="M9 16H39L41 38C41.2 40.2 39.5 42 37.3 42H10.7C8.5 42 6.8 40.2 7 38L9 16Z" fill={`url(#${uid}-bag)`} />
          <path d="M13 20H35" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'Receipt':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-rcp`} x1="11" y1="7" x2="37" y2="41" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>
          <path d="M11 8H37V41L33 38L29 41L24 38L19 41L15 38L11 41V8Z" fill={`url(#${uid}-rcp)`} stroke="#cbd5e1" strokeWidth="1.2" />
          <rect x="16" y="14" width="16" height="2.6" rx="1.3" fill="#f59e0b" />
          <rect x="16" y="20" width="16" height="2" rx="1" fill="#94a3b8" />
          <rect x="16" y="25" width="11" height="2" rx="1" fill="#94a3b8" />
          <rect x="16" y="30" width="16" height="2.4" rx="1.2" fill="#10b981" />
        </svg>
      );

    case 'Gamepad2':
    case 'Film':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-pad`} x1="6" y1="14" x2="42" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#be185d" />
            </linearGradient>
          </defs>
          <rect x="6" y="15" width="36" height="20" rx="10" fill={`url(#${uid}-pad)`} />
          <path d="M15 22V28M12 25H18" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="31" cy="22.5" r="1.8" fill="#fef08a" />
          <circle cx="34.5" cy="26" r="1.8" fill="#6ee7b7" />
        </svg>
      );

    case 'HeartPulse':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-med`} x1="8" y1="10" x2="40" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>
          <rect x="8" y="10" width="32" height="28" rx="7" fill={`url(#${uid}-med)`} />
          <rect x="21.5" y="16" width="5" height="16" rx="1.5" fill="#ffffff" />
          <rect x="16" y="21.5" width="16" height="5" rx="1.5" fill="#ffffff" />
        </svg>
      );

    case 'GraduationCap':
    case 'BookOpen':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-cap`} x1="8" y1="12" x2="40" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>
          </defs>
          <path d="M24 10L42 18.5L24 27L6 18.5L24 10Z" fill={`url(#${uid}-cap)`} />
          <path d="M14 23V32C14 35 18.5 37 24 37C29.5 37 34 35 34 32V23" fill="#1d4ed8" />
          <path d="M39 20V31" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="39" cy="32" r="2" fill="#fbbf24" />
        </svg>
      );

    case 'Plane':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-sky`} x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <rect x="6" y="6" width="36" height="36" rx="12" fill={`url(#${uid}-sky)`} />
          <path d="M36 13L11 23L20 26.5L32 16L22.5 28L26 37L36 13Z" fill="#ffffff" />
        </svg>
      );

    case 'Sparkles':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-spk`} x1="10" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <path d="M24 6L27.5 18.5L40 22L27.5 25.5L24 38L20.5 25.5L8 22L20.5 18.5L24 6Z" fill={`url(#${uid}-spk)`} />
          <path d="M37 7L38.3 11.7L43 13L38.3 14.3L37 19L35.7 14.3L31 13L35.7 11.7L37 7Z" fill="#fde047" />
        </svg>
      );

    case 'Smartphone':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-scr`} x1="15" y1="10" x2="33" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <rect x="13" y="6" width="22" height="36" rx="4.5" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
          <rect x="15.5" y="9.5" width="17" height="27" rx="2" fill={`url(#${uid}-scr)`} />
          <circle cx="24" cy="39.2" r="1.4" fill="#94a3b8" />
        </svg>
      );

    case 'Gift':
    case 'HandHeart':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...ariaProps}>
          <defs>
            <linearGradient id={`${uid}-box`} x1="9" y1="16" x2="39" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>
          <rect x="9" y="20" width="30" height="21" rx="3.5" fill={`url(#${uid}-box)`} />
          <rect x="7" y="15" width="34" height="6" rx="2" fill="#f43f5e" />
          <rect x="21.5" y="15" width="5" height="26" fill="#fde047" />
          <path d="M24 15C20 15 15 12 17 9C19 6 23 11 24 15ZM24 15C28 15 33 12 31 9C29 6 25 11 24 15Z" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    default: {
      // @ts-ignore dynamic index into Lucide icons
      const LucideIcon = (LucideIcons as Record<string, any>)[name] || LucideIcons.HelpCircle;
      return <LucideIcon size={size} className={className} color={color} />;
    }
  }
};
