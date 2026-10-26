import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import './chartConfig';
import { formatRupiah } from '../../utils/currency';

interface CategoryExpensePieProps {
  data: {
    total: number;
    items: Array<{ name: string; color: string; amount: number; percentage: number }>;
  };
}

export const CategoryExpensePie: React.FC<CategoryExpensePieProps> = ({ data }) => {
  if (data.items.length === 0 || data.total === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
        <p className="text-xs">Belum ada pengeluaran pada periode ini</p>
      </div>
    );
  }

  const chartData = {
    labels: data.items.map((i) => i.name),
    datasets: [
      {
        data: data.items.map((i) => i.amount),
        backgroundColor: data.items.map((i) => i.color),
        borderColor: 'transparent',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            const pct = Math.round((val / data.total) * 100);
            return ` ${context.label}: ${formatRupiah(val)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Chart container with centered total */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0">
        <Doughnut data={chartData} options={chartOptions} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Total Keluar
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
            {formatRupiah(data.total)}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="w-full space-y-2 max-h-56 overflow-y-auto pr-1">
        {data.items.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs py-1">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                {item.name}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {formatRupiah(item.amount)}
              </span>
              <span className="text-[10px] text-slate-400 ml-1.5">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
