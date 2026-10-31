import React from 'react';
import { Line } from 'react-chartjs-2';
import './chartSetup';
import type { StatsTimelineItem } from '../../types';

interface TimelineChartProps {
  newInstalls: StatsTimelineItem[];
  activeInstalls: StatsTimelineItem[];
  isDark?: boolean;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ newInstalls, activeInstalls, isDark }) => {
  // Merge distinct sorted dates
  const dateSet = new Set<string>();
  newInstalls.forEach((i) => dateSet.add(i.date));
  activeInstalls.forEach((i) => dateSet.add(i.date));
  const sortedDates = Array.from(dateSet).sort();

  const newMap = new Map(newInstalls.map((i) => [i.date, i.count]));
  const activeMap = new Map(activeInstalls.map((i) => [i.date, i.count]));

  const data = {
    labels: sortedDates.map((d) => {
      const parts = d.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
      }
      return d;
    }),
    datasets: [
      {
        label: 'Instalasi Baru (Opt-in)',
        data: sortedDates.map((d) => newMap.get(d) || 0),
        borderColor: '#10b981', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.35,
        fill: true,
        pointRadius: sortedDates.length > 30 ? 2 : 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Pengguna Aktif (DAU)',
        data: sortedDates.map((d) => activeMap.get(d) || 0),
        borderColor: '#6366f1', // indigo-500
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        tension: 0.35,
        fill: true,
        pointRadius: sortedDates.length > 30 ? 2 : 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#cbd5e1' : '#334155',
          font: { size: 12, weight: 'bold' as const },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#0f172a',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { size: 11 },
          maxTicksLimit: 12,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { size: 11 },
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="w-full h-72">
      {sortedDates.length === 0 ? (
        <div className="h-full flex items-center justify-center text-sm text-slate-400">
          Belum ada data ping tercatat dalam periode ini.
        </div>
      ) : (
        <Line data={data} options={options} />
      )}
    </div>
  );
};

