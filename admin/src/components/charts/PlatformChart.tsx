import React from 'react';
import { Bar } from 'react-chartjs-2';
import './chartSetup';
import type { DistributionItem } from '../../types';

interface PlatformChartProps {
  distribution: DistributionItem[];
  isDark?: boolean;
}

export const PlatformChart: React.FC<PlatformChartProps> = ({ distribution, isDark }) => {
  const labels = distribution.map((d) => d.name.toUpperCase());
  const values = distribution.map((d) => d.count);

  const colors = [
    '#10b981', // Android (emerald)
    '#3b82f6', // iOS (blue)
    '#8b5cf6', // Desktop (purple)
    '#f59e0b', // Web (amber)
  ];

  const data = {
    labels: labels.length > 0 ? labels : ['Belum Ada'],
    datasets: [
      {
        label: 'Jumlah Pengguna',
        data: values.length > 0 ? values : [0],
        backgroundColor: colors.slice(0, Math.max(labels.length, 1)),
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#0f172a',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          afterLabel: (context: any) => {
            const item = distribution[context.dataIndex];
            return item ? `Persentase: ${item.percentage}%` : '';
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { size: 11, weight: 'bold' as const },
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
    <div className="w-full h-64">
      {distribution.length === 0 ? (
        <div className="h-full flex items-center justify-center text-sm text-slate-400">
          Belum ada data platform.
        </div>
      ) : (
        <Bar data={data} options={options} />
      )}
    </div>
  );
};

