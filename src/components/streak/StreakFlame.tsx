import React, { useId } from 'react';
import { triggerHaptic } from '../../utils/haptics';
import { getStreakTier, type StreakTierConfig } from '../../utils/streak';

interface StreakFlameProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  streakCount: number;
  tier?: StreakTierConfig;
  isActiveToday?: boolean;
  isAtRisk?: boolean;
  showCount?: boolean;
  showCrown?: boolean;
  className?: string;
  onClick?: () => void;
}

export const StreakFlame: React.FC<StreakFlameProps> = ({
  size = 'md',
  streakCount,
  tier: propTier,
  isActiveToday = false,
  isAtRisk = false,
  showCount = true,
  showCrown = true,
  className = '',
  onClick,
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const tier = propTier || getStreakTier(streakCount);

  const sizeMap = {
    sm: { container: 'w-8 h-8', svg: 22, text: 'text-[9px]', crown: 'text-[8px] -top-2' },
    md: { container: 'w-12 h-12', svg: 32, text: 'text-xs', crown: 'text-[9px] -top-2.5' },
    lg: { container: 'w-20 h-20', svg: 56, text: 'text-base', crown: 'text-xs -top-3.5' },
    xl: { container: 'w-28 h-28', svg: 80, text: 'text-xl', crown: 'text-sm -top-4' },
  }[size];

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      triggerHaptic('medium');
      onClick();
    }
  };

  const isDormant = streakCount === 0;
  const isCosmic = tier.key === 'cosmic-365';
  const isCelestial = tier.key === 'celestial-1000';

  const outerGradId = `flameOuter-${uniqueId}-${tier.key}`;
  const innerGradId = `flameInner-${uniqueId}-${tier.key}`;
  const coreGradId = `flameCore-${uniqueId}-${tier.key}`;

  return (
    <div
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center select-none ${
        onClick ? 'cursor-pointer group active:scale-95 transition-transform' : ''
      } ${className}`}
    >
      {/* Celestial Solar Halo (Tier 1000 Hari) */}
      {isCelestial && !isDormant && (
        <div
          className="absolute inset-0 scale-140 rounded-full border-2 border-dashed border-amber-300/80 celestial-halo pointer-events-none"
          style={{ boxShadow: '0 0 25px rgba(251, 191, 36, 0.7)' }}
        />
      )}

      {/* Ambient Flame Glow aura */}
      <div
        className={`absolute inset-0 rounded-full blur-md transition-all duration-500 pointer-events-none ${
          isDormant
            ? 'bg-slate-400/10'
            : isActiveToday
            ? 'scale-130 animate-pulse'
            : isAtRisk
            ? 'scale-110 animate-ping opacity-60'
            : 'scale-100 opacity-40'
        }`}
        style={{
          backgroundColor: isDormant ? undefined : tier.colors.glow,
        }}
      />

      {/* Floating Crown Badge (e.g. 👑 100, 👑 365, 🏆 1000) */}
      {showCrown && tier.crownText && !isDormant && (
        <div
          className={`absolute ${sizeMap.crown} z-20 px-1.5 py-0.2 rounded-full font-black tracking-tight leading-none shadow-md border animate-bounce ${
            isCelestial
              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-900 border-yellow-100 ring-2 ring-yellow-400/50'
              : isCosmic
              ? 'bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-amber-400 text-white border-white/60'
              : 'bg-gradient-to-r from-rose-500 to-amber-400 text-white border-white/40'
          }`}
        >
          {tier.crownText}
        </div>
      )}

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
          className="transition-transform duration-300 group-hover:scale-105"
          style={{
            filter: isDormant ? undefined : `drop-shadow(0 4px 14px ${tier.colors.glow})`,
          }}
        >
          <defs>
            {/* Outer Flame Gradient */}
            <linearGradient id={outerGradId} x1="0%" y1="100%" x2="0%" y2="0%">
              {isCosmic ? (
                <>
                  <stop offset="0%" stopColor="#c026d3" />
                  <stop offset="35%" stopColor="#2563eb" />
                  <stop offset="70%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </>
              ) : isCelestial ? (
                <>
                  <stop offset="0%" stopColor="#c2410c" />
                  <stop offset="40%" stopColor="#ea580c" />
                  <stop offset="85%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#ffffff" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor={tier.colors.outer} />
                  <stop offset="60%" stopColor={tier.colors.middle} />
                  <stop offset="100%" stopColor={tier.colors.core} />
                </>
              )}
            </linearGradient>

            {/* Inner Flame Gradient */}
            <linearGradient id={innerGradId} x1="0%" y1="100%" x2="0%" y2="0%">
              {isCosmic ? (
                <>
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ffffff" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor={tier.colors.middle} />
                  <stop offset="60%" stopColor={tier.colors.core} />
                  <stop offset="100%" stopColor="#ffffff" />
                </>
              )}
            </linearGradient>

            {/* Core Heart Gradient */}
            <linearGradient id={coreGradId} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={tier.colors.middle} />
              <stop offset="50%" stopColor={tier.colors.core} />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>

          {/* Outer Layer */}
          <path
            d="M50 0 C53 25 72 38 78 52 C86 69 82 89 68 104 C55 118 35 119 22 108 C8 95 6 74 14 58 C16 54 20 48 24 54 C26 57 27 63 30 65 C28 50 34 35 42 24 C45 20 48 10 50 0 Z"
            fill={`url(#${outerGradId})`}
            className="flame-outer"
          />

          {/* Middle Radiant Tongue */}
          <path
            d="M50 30 C53 45 66 55 68 68 C71 80 64 94 54 100 C43 106 32 102 26 92 C20 82 24 70 30 62 C34 56 38 60 40 64 C39 52 44 42 50 30 Z"
            fill={`url(#${innerGradId})`}
            className="flame-inner"
          />

          {/* Hot Core Heart */}
          <path
            d="M50 60 C53 70 60 76 58 84 C56 90 51 96 46 96 C40 96 36 90 38 84 C39 80 43 78 44 74 C44 68 47 64 50 60 Z"
            fill={`url(#${coreGradId})`}
            className="flame-core"
          />
        </svg>

        {/* Floating Spark Particles */}
        {!isDormant && (
          <>
            <span
              className="flame-spark flame-spark-1"
              style={{
                backgroundColor: tier.colors.spark,
                boxShadow: `0 0 8px ${tier.colors.spark}`,
              }}
            />
            <span
              className="flame-spark flame-spark-2"
              style={{
                backgroundColor: tier.colors.spark,
                boxShadow: `0 0 8px ${tier.colors.spark}`,
              }}
            />
            <span
              className="flame-spark flame-spark-3"
              style={{
                backgroundColor: tier.colors.spark,
                boxShadow: `0 0 8px ${tier.colors.spark}`,
              }}
            />
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
              ? 'text-white border-white/60 dark:border-white/20'
              : isAtRisk
              ? 'bg-amber-500 text-slate-900 border-amber-300 animate-bounce'
              : 'text-white border-white/40'
          }`}
          style={{
            backgroundColor: isDormant || isAtRisk ? undefined : tier.colors.middle,
          }}
        >
          {streakCount}
        </span>
      )}
    </div>
  );
};
