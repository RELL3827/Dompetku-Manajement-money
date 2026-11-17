import React from 'react';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  isFullPage?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Memuat DompetKu...',
  subMessage = '100% Offline • Privasi Penuh',
  isFullPage = true,
}) => {
  return (
    <div
      className={`${
        isFullPage ? 'fixed inset-0 z-50' : 'relative w-full py-16'
      } flex flex-col items-center justify-center bg-slate-50/90 dark:bg-[#070a12]/90 backdrop-blur-xl select-none transition-colors overflow-hidden`}
      role="status"
      aria-live="polite"
    >
      {/* Ambient background glow orbs */}
      <div
        className="absolute w-72 h-72 rounded-full pointer-events-none filter blur-2xl opacity-40 bg-radial from-emerald-500/25 via-emerald-600/10 to-transparent top-1/4"
        aria-hidden="true"
      />
      <div
        className="absolute w-60 h-60 rounded-full pointer-events-none filter blur-2xl opacity-30 bg-radial from-blue-500/20 via-indigo-500/5 to-transparent bottom-1/4"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-xs">
        {/* Emblem box with 3D liquid border and gentle float */}
        <div className="relative mb-4 group">
          <div
            className="absolute -inset-2 rounded-3xl bg-radial from-emerald-500/40 to-transparent filter blur-md animate-pulse opacity-70"
            aria-hidden="true"
          />
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500/25 to-emerald-950/40 border border-emerald-400/35 shadow-lg shadow-emerald-500/20 flex items-center justify-center backdrop-blur-md">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-11 h-11 text-emerald-400 transition-transform duration-700"
            >
              <rect
                x="5"
                y="10"
                width="38"
                height="28"
                rx="8"
                fill="url(#loading-em-grad)"
                stroke="rgba(255,255,255,0.4)"
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

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Dompet<span className="text-emerald-500">Ku</span>
        </h2>
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 mb-4">
          {message}
        </p>

        {/* Shimmer loading track */}
        <div className="w-32 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative mb-4">
          <div className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full animate-[splash-shimmer_1.4s_infinite]" />
        </div>

        {/* Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold tracking-wide">
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
