import React from 'react';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  progress?: number;
  isFullPage?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Memuat DompetKu...',
  subMessage = '100% Offline • Privasi Penuh',
  progress,
  isFullPage = true,
}) => {
  return (
    <div
      className={`${
        isFullPage ? 'fixed inset-0 z-50' : 'relative w-full py-16'
      } flex flex-col items-center justify-center bg-slate-50/90 dark:bg-[#070a12]/95 backdrop-blur-xl select-none transition-colors overflow-hidden`}
      role="status"
      aria-live="polite"
    >
      {/* Ambient background glow orbs */}
      <div
        className="absolute w-80 h-80 rounded-full pointer-events-none filter blur-3xl opacity-40 bg-radial from-emerald-500/30 via-emerald-600/10 to-transparent top-12 -right-10"
        aria-hidden="true"
      />
      <div
        className="absolute w-72 h-72 rounded-full pointer-events-none filter blur-3xl opacity-30 bg-radial from-blue-500/25 via-indigo-500/8 to-transparent bottom-12 -left-10"
        aria-hidden="true"
      />

      {/* Signature Liquid Glass Card */}
      <div className="relative z-10 flex flex-col items-center text-center p-7 sm:p-8 w-[88%] max-w-[335px] rounded-[2rem] bg-white/75 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/80 dark:border-white/15 shadow-2xl shadow-emerald-500/10 dark:shadow-black/60">
        {/* Emblem box with 3D liquid border and gentle float */}
        <div className="relative mb-3 group">
          <div
            className="absolute -inset-2.5 rounded-3xl bg-radial from-emerald-500/45 to-transparent filter blur-md animate-pulse opacity-75"
            aria-hidden="true"
          />
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500/25 to-emerald-950/45 border border-emerald-400/40 shadow-lg shadow-emerald-500/25 flex items-center justify-center backdrop-blur-md">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-11 h-11 text-emerald-400"
            >
              <rect
                x="5"
                y="10"
                width="38"
                height="28"
                rx="8"
                fill="url(#loading-em-grad)"
                stroke="rgba(255,255,255,0.45)"
                strokeWidth="1.75"
              />
              <path d="M5 18H43" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
              <path
                d="M28 21.5H39C40.6569 21.5 42 22.8431 42 24.5V27.5C42 29.1569 40.6569 30.5 39 30.5H28C25.5147 30.5 23.5 28.4853 23.5 26C23.5 23.5147 25.5147 21.5 28 21.5Z"
                fill="#047857"
                stroke="rgba(255,255,255,0.45)"
                strokeWidth="1.5"
              />
              <circle cx="30.5" cy="26" r="2.2" fill="#34d399" />
              <path d="M37 7L38 10L41 11L38 12L37 15L36 12L33 11L36 10L37 7Z" fill="#34d399" />
              <defs>
                <linearGradient
                  id="loading-em-grad"
                  x1="5"
                  y1="10"
                  x2="43"
                  y2="38"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#10b981" />
                  <stop offset="0.5" stopColor="#059669" />
                  <stop offset="1" stopColor="#047857" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Edition Tag */}
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 mb-2">
          ✨ Liquid Glass Edition
        </span>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 mb-1">
          Dompet<span className="text-emerald-500">Ku</span>
        </h2>
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
          {message}
        </p>

        {/* Liquid Glass Progress Track */}
        <div className="w-full h-2.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-full overflow-hidden relative border border-slate-300/40 dark:border-white/10 shadow-inner mb-2">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.7)] transition-all duration-300 relative overflow-hidden"
            style={{ width: `${progress !== undefined ? Math.min(100, Math.max(0, progress)) : 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[splash-shimmer_1.5s_infinite]" />
          </div>
        </div>

        {/* Percentage or Step */}
        {progress !== undefined && (
          <div className="flex justify-between items-center w-full text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mb-3 px-1">
            <span>{Math.round(progress)}%</span>
            <span className="text-[10px] text-slate-400 font-semibold">
              {progress >= 100 ? 'Siap!' : 'Memproses...'}
            </span>
          </div>
        )}

        {/* Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold tracking-wide mt-1">
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>{subMessage}</span>
        </div>
      </div>
    </div>
  );
};
