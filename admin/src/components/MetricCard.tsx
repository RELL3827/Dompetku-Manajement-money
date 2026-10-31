import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  badge?: string;
  icon: LucideIcon;
  color: 'emerald' | 'indigo' | 'blue' | 'amber' | 'rose' | 'purple';
}

const colorMap = {
  emerald: {
    bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
  },
  indigo: {
    bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300',
  },
  blue: {
    bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
  },
  amber: {
    bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
  },
  rose: {
    bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300',
  },
  purple: {
    bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  badge,
  icon: Icon,
  color,
}) => {
  const c = colorMap[color];

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl border ${c.bg}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
          </span>
          {badge && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.badge}`}>
              {badge}
            </span>
          )}
        </div>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
};
