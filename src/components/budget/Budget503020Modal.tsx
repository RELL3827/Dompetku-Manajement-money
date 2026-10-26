import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CurrencyInput } from '../common/CurrencyInput';
import { formatRupiah } from '../../utils/currency';
import { apply503020Budgets, getBudget503020Summary } from '../../db/services';
import { Sparkles, ShieldCheck, HeartHandshake, PiggyBank, Check } from 'lucide-react';

interface Budget503020ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialIncome?: number;
}

export const Budget503020Modal: React.FC<Budget503020ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialIncome = 0,
}) => {
  const [income, setIncome] = useState(initialIncome || 5000000);
  const [actualIncomeThisMonth, setActualIncomeThisMonth] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCurrent() {
      try {
        const summary = await getBudget503020Summary();
        setActualIncomeThisMonth(summary.currentMonthIncome);
        if (summary.incomeBase && summary.incomeBase > 0) {
          setIncome(summary.incomeBase);
        }
      } catch (err) {
        console.error('Failed to load 50/30/20 summary for modal', err);
      }
    }
    if (isOpen) {
      loadCurrent();
    }
  }, [isOpen]);

  const needs50 = Math.round(income * 0.5);
  const wants30 = Math.round(income * 0.3);
  const savings20 = Math.round(income * 0.2);

  const quickIncomeChips = [3000000, 5000000, 7500000, 10000000, 15000000, 20000000];

  const handleApply = async () => {
    if (!income || income <= 0) {
      setError('Masukkan estimasi pendapatan bulanan');
      return;
    }
    setIsApplying(true);
    try {
      await apply503020Budgets(income);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Gagal menerapkan anggaran 50/30/20');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Atur Anggaran Metode 50/30/20"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Intro Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
            <Sparkles size={16} />
            <span>Kaidah Keuangan 50 / 30 / 20</span>
          </div>
          <p className="leading-relaxed">
            Metode legendaris dari Elizabeth Warren untuk mencapai kemerdekaan finansial: 
            <strong> 50%</strong> untuk Kebutuhan Pokok, <strong>30%</strong> untuk Keinginan, dan <strong>20%</strong> untuk Tabungan/Investasi.
          </p>
        </div>

        {/* Input Income */}
        <div className="space-y-2">
          <CurrencyInput
            value={income}
            onChange={(val) => {
              setIncome(val);
              setError('');
            }}
            label="Penghasilan / Pemasukan Bulanan Bersih (Rp)"
            placeholder="0"
            showQuickChips={false}
            error={error}
          />

          {/* Quick Shortcuts */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Pilihan cepat:</span>
              {actualIncomeThisMonth > 0 && (
                <button
                  type="button"
                  onClick={() => setIncome(actualIncomeThisMonth)}
                  className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Gunakan pemasukan riil bulan ini ({formatRupiah(actualIncomeThisMonth)})
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickIncomeChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setIncome(chip)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    income === chip
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {formatRupiah(chip)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Pillars Preview */}
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Pratinjau Alokasi Dana per Bulan
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 50% Needs */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <ShieldCheck size={16} />
                  50% Kebutuhan
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                  Needs
                </span>
              </div>
              <p className="text-base font-extrabold text-blue-900 dark:text-blue-100">
                {formatRupiah(needs50)}
              </p>
              <p className="text-[11px] text-blue-600/80 dark:text-blue-300/70 leading-snug">
                Makan, transportasi, listrik, air, sewa rumah, belanja dapur, kesehatan, pendidikan.
              </p>
            </div>

            {/* 30% Wants */}
            <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <HeartHandshake size={16} />
                  30% Keinginan
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                  Wants
                </span>
              </div>
              <p className="text-base font-extrabold text-purple-900 dark:text-purple-100">
                {formatRupiah(wants30)}
              </p>
              <p className="text-[11px] text-purple-600/80 dark:text-purple-300/70 leading-snug">
                Hiburan, liburan, jajan kafe, hobi, belanja non-pokok, langganan digital.
              </p>
            </div>

            {/* 20% Savings */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <PiggyBank size={16} />
                  20% Tabungan
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                  Savings
                </span>
              </div>
              <p className="text-base font-extrabold text-emerald-900 dark:text-emerald-100">
                {formatRupiah(savings20)}
              </p>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-300/70 leading-snug">
                Dana darurat, target impian (celengan), investasi masa depan, pelunasan utang.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={isApplying || income <= 0}
            onClick={handleApply}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {isApplying ? (
              <span>Menerapkan...</span>
            ) : (
              <>
                <Check size={16} />
                <span>Terapkan Template 50/30/20 ke Anggaran</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
