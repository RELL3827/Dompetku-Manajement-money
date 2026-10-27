import React from 'react';
import { Bar } from 'react-chartjs-2';
import './chartConfig';
import { formatRupiah } from '../../utils/currency';

interface IncomeExpenseBarProps {
  monthlyData: Array<{
    monthKey: string;
    label: string;
    income: number;
    expense: number;
    net: number;
  }>;
}

export const IncomeExpenseBar: React.FC<IncomeExpenseBarProps> = ({ monthlyData }) => {
  const chartData = {
    labels: monthlyData.map((d) => d.label),
    datasets: [
      {
        label: 'Pemasukan',
        data: monthlyData.map((d) => d.income),
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: 'Pengeluaran',
        data: monthlyData.map((d) => d.expense),
        backgroundColor: '#f43f5e',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          font: { size: 11 },
          color: '#94a3b8',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.dataset.label}: ${formatRupiah(context.raw || 0)}`,
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
            if (value >= 1000000) return `${value / 1000000}jt`;
            if (value >= 1000) return `${value / 1000}rb`;
            return value;
          },
        },
      },
    },
  };

  const chartKey = monthlyData.map((d) => `${d.monthKey}-${d.income}-${d.expense}`).join('_');

  return (
    <div className="h-64 w-full">
      <Bar key={chartKey} data={chartData} options={chartOptions} />
    </div>
  );
};
