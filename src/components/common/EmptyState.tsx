import React from 'react';
import { RealisticIcon } from './RealisticIcon';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'PiggyBank',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-slate-50/60 dark:bg-slate-900/40 border border-dashed border-slate-200/90 dark:border-slate-800 shadow-2xs">
      <div className="p-4 rounded-3xl bg-white/90 dark:bg-slate-800/80 mb-3.5 shadow-md border border-slate-100 dark:border-slate-700/60">
        <RealisticIcon name={icon} size={42} />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn-glow-emerald mt-4 px-5 py-2.5 text-xs font-bold rounded-xl shadow-md cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
