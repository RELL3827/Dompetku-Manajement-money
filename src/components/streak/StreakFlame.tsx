import React from 'react';
import { triggerHaptic } from '../../utils/haptics';

interface StreakFlameProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  streakCount: number;
  isActiveToday?: boolean;
  isAtRisk?: boolean;
  showCount?: boolean;
  className?: string;
  onClick?: () => void;
}

export const StreakFlame: React.FC<StreakFlameProps> = ({
  size = 'md',
  streakCount,
  isActiveToday = false,
  isAtRisk = false,
  showCount = true,
  className = '',
  onClick,
}) => {
  const sizeMap = {
    sm: { container: 'w-8 h-8', svg: 22, text: 'text-[10px]' },
    md: { container: 'w-12 h-12', svg: 32, text: 'text-xs' },
    lg: { container: 'w-20 h-20', svg: 56, text: 'text-lg' },
    xl: { container: 'w-28 h-28', svg: 80, text: 'text-2xl' },
  }[size];

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      triggerHaptic('medium');
      onClick();
    }
  };

  const isDormant = streakCount === 0;

  return (
    <div
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center select-none ${
        onClick ? 'cursor-pointer group active:scale-95 transition-transform' : ''
      } ${className}`}
    >
      {/* Ambient Flame Glow aura */}
      <div
        className={`absolute inset-0 rounded-full blur-md transition-all duration-500 pointer-events-none ${
          isDormant
            ? 'bg-slate-400/10'
            : isActiveToday
            ? 'bg-gradient-to-t from-orange-600/40 via-amber-400/40 to-yellow-300/30 scale-125 animate-pulse'
            : isAtRisk
            ? 'bg-amber-500/30 scale-110 animate-ping opacity-60'
            : 'bg-orange-500/20'
        }`}
      />

      {/* Flame SVG Graphic */}
      <div
        className={`relative flex items-center justify-center ${sizeMap.container} ${
          isDormant
            ? 'opacity-40 grayscale'
            : isActiveToday
            ? 'flame-burning'
            : isAtRisk
            ? 'flame-flickering'
            : ''
        }`}
      >
        <svg
          viewBox="0 0 100 120"
          width={sizeMap.svg}
          height={sizeMap.svg}
          className="drop-shadow-[0_4px_12px_rgba(249,115,22,0.45)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Outer Flame Gradient */}
            <linearGradient id="flameOuter" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="45%" stopColor="#ea580c" />
              <stop offset="90%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Inner Flame Gradient */}
            <linearGradient id="flameInner" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="60%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>

            {/* Core Heart Gradient */}
            <linearGradient id="flameCore" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>

          {/* Outer Layer */}
          <path
            d="M50 0 C53 25 72 38 78 52 C86 69 82 89 68 104 C55 118 35 119 22 108 C8 95 6 74 14 58 C16 54 20 48 24 54 C26 57 27 63 30 65 C28 50 34 35 42 24 C45 20 48 10 50 0 Z"
            fill="url(#flameOuter)"
            className="flame-outer"
          />

          {/* Middle Radiant Tongue */}
          <path
            d="M50 30 C53 45 66 55 68 68 C71 80 64 94 54 100 C43 106 32 102 26 92 C20 82 24 70 30 62 C34 56 38 60 40 64 C39 52 44 42 50 30 Z"
            fill="url(#flameInner)"
            className="flame-inner"
          />

          {/* Hot Core Heart */}
          <path
            d="M50 60 C53 70 60 76 58 84 C56 90 51 96 46 96 C40 96 36 90 38 84 C39 80 43 78 44 74 C44 68 47 64 50 60 Z"
            fill="url(#flameCore)"
            className="flame-core"
          />
        </svg>

        {/* Small floating spark particles */}
        {!isDormant && (
          <>
            <span className="flame-spark flame-spark-1" />
            <span className="flame-spark flame-spark-2" />
            <span className="flame-spark flame-spark-3" />
          </>
        )}
      </div>

      {/* Streak Count Badge */}
      {showCount && (
        <span
          className={`absolute -bottom-1 -right-1 font-black tabular-nums px-1.5 py-0.5 rounded-full border shadow-sm leading-none ${sizeMap.text} ${
            isDormant
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
              : isActiveToday
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-white/60 dark:border-white/20'
              : isAtRisk
              ? 'bg-amber-500 text-slate-900 border-amber-300 animate-bounce'
              : 'bg-orange-600 text-white border-white/40'
          }`}
        >
          {streakCount}
        </span>
      )}
    </div>
  );
};
