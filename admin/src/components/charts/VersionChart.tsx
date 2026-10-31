import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import './chartSetup';
import type { DistributionItem } from '../../types';

interface VersionChartProps {
  distribution: DistributionItem[];
  isDark?: boolean;
}

export const VersionChart: React.FC<VersionChartProps> = ({ distribution, isDark }) => {
  const labels = distribution.map((d) => `v${d.name}`);
  const values = distribution.map((d) => d.count);

  const colors = [
    '#059669', // emerald-600
    '#2563eb', // blue-600
    '#7c3aed', // violet-600
    '#db2777', // pink-600
    '#d97706', // amber-600
  ];

  const data = {
    labels: labels.length > 0 ? labels : ['Belum Ada'],
    datasets: [
      {
        data: values.length > 0 ? values : [1],
        backgroundColor: colors.slice(0, Math.max(labels.length, 1)),
        borderWidth: 2,
        borderColor: isDark ? '#0f172a' : '#ffffff',
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: isDark ? '#cbd5e1' : '#334155',
          font: { size: 11 },
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
        callbacks: {
          afterLabel: (context: any) => {
            const item = distribution[context.dataIndex];
            return item ? `Porsi: ${item.percentage}% (${item.count} pengguna)` : '';
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-64 flex items-center justify-center">
      {distribution.length === 0 ? (
        <div className="text-sm text-slate-400">Belum ada data versi.</div>
      ) : (
        <Doughnut data={data} options={options} />
      )}
    </div>
  );
};

