import React, { useId } from 'react';
import { formatRupiahInput, parseRupiah } from '../../utils/currency';

interface CurrencyInputProps {
  value: number;
  onChange: (val: number) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  autoFocus?: boolean;
  required?: boolean;
  showQuickChips?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  label = 'Nominal (Rp)',
  error,
  placeholder = '0',
  autoFocus = false,
  required = false,
  showQuickChips = true,
}) => {
  const inputId = useId();
  const displayValue = value > 0 ? formatRupiahInput(value) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parseRupiah(raw);
    onChange(parsed);
  };

  const handleAddAmount = (add: number) => {
    onChange((value || 0) + add);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <span className="absolute left-3.5 text-base font-bold text-slate-400 dark:text-slate-500 select-none">
          Rp
        </span>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={`w-full pl-11 pr-4 py-3 text-lg font-bold rounded-xl border bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all ${
            error
              ? 'border-rose-400 focus:ring-rose-400/30'
              : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
          }`}
        />
      </div>

      {showQuickChips && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[10000, 20000, 50000, 100000, 500000].map((nominal) => (
            <button
              key={nominal}
              type="button"
              onClick={() => handleAddAmount(nominal)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-colors active:scale-95"
            >
              +{nominal >= 1000000 ? `${nominal / 1000000}jt` : `${nominal / 1000}rb`}
            </button>
          ))}
          {value > 0 && (
            <button
              type="button"
              onClick={() => onChange(0)}
              className="text-xs px-2 py-1 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
};
