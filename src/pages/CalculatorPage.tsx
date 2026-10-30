import React from 'react';
import { FinancialCalculator } from '../components/calculator/FinancialCalculator';
import { Calculator, Lightbulb } from 'lucide-react';
import type { NavTab, TransactionType } from '../types';

interface CalculatorPageProps {
  onOpenTransactionModal?: (type?: TransactionType, defaultAmount?: number, defaultNotes?: string) => void;
  onNavigate?: (tab: NavTab) => void;
}

export const CalculatorPage: React.FC<CalculatorPageProps> = ({
  onOpenTransactionModal,
  onNavigate,
}) => {
  const handleUseAmount = (amount: number, defaultNotes?: string) => {
    if (onOpenTransactionModal) {
      onOpenTransactionModal('expense', amount, defaultNotes);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
      {/* Header bar */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Calculator className="text-emerald-500" size={20} />
          <span>Kalkulator & Alat Hitung Cepat</span>
        </h1>
        <p className="text-xs text-slate-500">
          Hitung cepat transaksi, rumus anggaran 50/30/20, potongan diskon & PPN, serta patungan tagihan
        </p>
      </div>

      {/* Main Calculator Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm max-w-2xl mx-auto">
        <FinancialCalculator
          onUseAmount={handleUseAmount}
          onNavigateToBudgets={() => onNavigate?.('budgets')}
        />
      </div>

      {/* Financial Quick Tips */}
      <div className="max-w-2xl mx-auto p-4 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300 space-y-2">
        <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-200">
          <Lightbulb size={16} className="text-amber-500 fill-amber-500" />
          <span>Tips Cerdas Alat Hitung DompetKu</span>
        </div>
        <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 list-disc list-inside leading-relaxed">
          <li>
            Gunakan tombol <strong>"000"</strong> pada kalkulator cepat untuk mengetik nominal ribuan dan jutaan Rupiah dalam sekali sentuh.
          </li>
          <li>
            Setelah menghitung belanjaan, tekan tombol <strong>"Gunakan Nominal Ini"</strong> untuk langsung membuat catatan transaksi tanpa mengetik ulang nominal.
          </li>
          <li>
            Gunakan fitur <strong>Bagi Tagihan (Split Bill)</strong> saat makan bersama rekan kerja atau teman untuk membagi biaya secara transparan dan menyalin pesan rincian ke WhatsApp.
          </li>
        </ul>
      </div>
    </div>
  );
};
