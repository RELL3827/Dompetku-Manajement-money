import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { CurrencyInput } from '../common/CurrencyInput';
import { Sparkles, Check, Percent, Clock } from 'lucide-react';
import { formatRupiah } from '../../utils/currency';

interface InstallmentSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToNewInstallment?: (data: {
    name: string;
    totalAmount: number;
    monthlyAmount: number;
    totalMonths: number;
    interestRate: number;
  }) => void;
}

const TENOR_PRESETS = [3, 6, 12, 18, 24, 36, 48, 60];

export const InstallmentSimulatorModal: React.FC<InstallmentSimulatorModalProps> = ({
  isOpen,
  onClose,
  onApplyToNewInstallment,
}) => {
  const [productName, setProductName] = useState('Barang Impian');
  const [itemPrice, setItemPrice] = useState<number>(10000000);
  const [downPayment, setDownPayment] = useState<number>(1000000);
  const [tenorMonths, setTenorMonths] = useState<number>(12);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(6); // 6% per tahun
  const [interestType, setInterestType] = useState<'flat' | 'zero'>('flat');

  // Calculation
  const simulation = useMemo(() => {
    const principal = Math.max(0, itemPrice - downPayment);
    if (principal <= 0 || tenorMonths <= 0) {
      return {
        principal: 0,
        monthlyPrincipal: 0,
        monthlyInterest: 0,
        monthlyInstallment: 0,
        totalInterest: 0,
        totalPayment: 0,
      };
    }

    if (interestType === 'zero') {
      const monthly = Math.round(principal / tenorMonths);
      return {
        principal,
        monthlyPrincipal: monthly,
        monthlyInterest: 0,
        monthlyInstallment: monthly,
        totalInterest: 0,
        totalPayment: principal,
      };
    }

    // Flat interest rate calculation:
    // Total interest = Principal * (Rate / 100) * (tenor / 12)
    const years = tenorMonths / 12;
    const totalInterest = Math.round(principal * (annualInterestRate / 100) * years);
    const totalPayment = principal + totalInterest;
    const monthlyInstallment = Math.round(totalPayment / tenorMonths);
    const monthlyPrincipal = Math.round(principal / tenorMonths);
    const monthlyInterest = monthlyInstallment - monthlyPrincipal;

    return {
      principal,
      monthlyPrincipal,
      monthlyInterest,
      monthlyInstallment,
      totalInterest,
      totalPayment,
    };
  }, [itemPrice, downPayment, tenorMonths, annualInterestRate, interestType]);

  const handleApply = () => {
    if (onApplyToNewInstallment) {
      onApplyToNewInstallment({
        name: productName.trim() || 'Cicilan Baru',
        totalAmount: simulation.totalPayment,
        monthlyAmount: simulation.monthlyInstallment,
        totalMonths: tenorMonths,
        interestRate: interestType === 'zero' ? 0 : annualInterestRate,
      });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulasi & Kalkulator Kredit Cicilan"
    >
      <div className="space-y-4">
        {/* Preset Type (Flat vs 0%) */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setInterestType('flat')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              interestType === 'flat'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Bunga Standar (Flat)
          </button>
          <button
            type="button"
            onClick={() => setInterestType('zero')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              interestType === 'zero'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Cicilan 0% Bebas Bunga
          </button>
        </div>

        {/* Input Nama Barang */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nama Barang / Pinjaman
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Contoh: iPhone 16, Motor Vario, Laptop"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Harga Barang & DP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <CurrencyInput
              label="Harga Barang (Rp) *"
              value={itemPrice}
              onChange={setItemPrice}
              placeholder="0"
              required
            />
          </div>
          <div>
            <CurrencyInput
              label="Uang Muka / DP (Rp)"
              value={downPayment}
              onChange={setDownPayment}
              placeholder="0"
            />
          </div>
        </div>

        {/* Tenor Preset Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-slate-400" />
              <span>Tenor Cicilan: <strong>{tenorMonths} Bulan</strong></span>
            </span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TENOR_PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTenorMonths(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  tenorMonths === t
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {t} Bln
              </button>
            ))}
          </div>
        </div>

        {/* Bunga input if flat */}
        {interestType === 'flat' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Percent size={13} className="text-slate-400" />
                <span>Suku Bunga per Tahun</span>
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {annualInterestRate}% / thn
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="35"
              step="0.5"
              value={annualInterestRate}
              onChange={(e) => setAnnualInterestRate(parseFloat(e.target.value) || 0)}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        )}

        {/* HASIL SIMULASI HERO CARD */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs text-emerald-100">
            <span className="font-semibold flex items-center gap-1">
              <Sparkles size={13} /> Estimasi Cicilan per Bulan
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
              Tenor {tenorMonths}x
            </span>
          </div>

          <div>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {formatRupiah(simulation.monthlyInstallment)}
              <span className="text-xs font-normal text-emerald-200"> / bulan</span>
            </p>
          </div>

          <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] text-emerald-100/90">
            <div>
              <span className="text-white/60 block text-[10px]">Pokok Pinjaman:</span>
              <span className="font-bold">{formatRupiah(simulation.principal)}</span>
            </div>
            <div>
              <span className="text-white/60 block text-[10px]">Total Bunga:</span>
              <span className="font-bold">{formatRupiah(simulation.totalInterest)}</span>
            </div>
            <div>
              <span className="text-white/60 block text-[10px]">Total Pembayaran:</span>
              <span className="font-bold">{formatRupiah(simulation.totalPayment)}</span>
            </div>
            <div>
              <span className="text-white/60 block text-[10px]">Status Bunga:</span>
              <span className="font-bold text-emerald-300">
                {interestType === 'zero' ? 'Bunga 0%' : `${annualInterestRate}% Flat/thn`}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Tutup
          </button>
          {onApplyToNewInstallment && (
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Gunakan Hasil ke Cicilan</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};