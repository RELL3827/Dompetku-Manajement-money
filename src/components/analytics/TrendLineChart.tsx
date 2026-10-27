import React from 'react';
import { Line } from 'react-chartjs-2';
import './chartConfig';
import { formatRupiah } from '../../utils/currency';

interface TrendLineChartProps {
  trendData: Array<{
    monthKey: string;
    label: string;
    income: number;
    expense: number;
    net: number;
  }>;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({ trendData }) => {
  const chartData = {
    labels: trendData.map((d) => d.label),
    datasets: [
      {
        label: 'Surplus / Arus Kas Bersih',
        data: trendData.map((d) => d.net),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#3b82f6',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` Selisih Bersih: ${formatRupiah(context.raw || 0)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#94a3b8' },
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: {
          font: { size: 10 },
          color: '#94a3b8',
          callback: (value: any) => {
            if (Math.abs(value) >= 1000000) return `${value / 1000000}jt`;
            if (Math.abs(value) >= 1000) return `${value / 1000}rb`;
            return value;
          },
        },
      },
    },
  };

  const chartKey = trendData.map((d) => `${d.monthKey}-${d.net}`).join('_');

  return (
    <div className="h-64 w-full">
      <Line key={chartKey} data={chartData} options={chartOptions} />
    </div>
  );
};
