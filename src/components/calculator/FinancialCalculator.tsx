import React, { useState, useMemo, useEffect } from 'react';
import { formatRupiah } from '../../utils/currency';
import { CurrencyInput } from '../common/CurrencyInput';
import { evaluateMathExpression } from '../../utils/calculator';
import {
  Calculator as CalcIcon,
  Percent,
  PieChart,
  Users,
  Copy,
  Check,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';

interface FinancialCalculatorProps {
  onUseAmount?: (amount: number, defaultNotes?: string) => void;
  onNavigateToBudgets?: () => void;
}

type CalculatorMode = 'standard' | 'budget503020' | 'discountTax' | 'splitBill';

export const FinancialCalculator: React.FC<FinancialCalculatorProps> = ({
  onUseAmount,
  onNavigateToBudgets,
}) => {
  const [mode, setMode] = useState<CalculatorMode>('standard');

  // ----------------------------------------------------
  // 1. STANDARD CALCULATOR STATE
  // ----------------------------------------------------
  const [expression, setExpression] = useState('0');
  const [history, setHistory] = useState<Array<{ expr: string; result: number }>>([]);

  const calculatedResult = useMemo(() => evaluateMathExpression(expression), [expression]);

  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setExpression('0');
      return;
    }

    if (val === '⌫') {
      if (expression.length <= 1) {
        setExpression('0');
      } else {
        setExpression(expression.slice(0, -1));
      }
      return;
    }

    if (val === '=') {
      const res = evaluateMathExpression(expression);
      if (expression !== '0') {
        setHistory((prev) => [{ expr: expression, result: res }, ...prev.slice(0, 9)]);
      }
      setExpression(String(res));
      return;
    }

    if (val === '( )') {
      const openCount = (expression.match(/\(/g) || []).length;
      const closeCount = (expression.match(/\)/g) || []).length;
      const lastChar = expression.slice(-1);

      if (openCount > closeCount && !['+', '-', '×', '÷', '(', '%'].includes(lastChar)) {
        setExpression((prev) => prev + ')');
      } else {
        if (expression === '0') {
          setExpression('(');
        } else if (['+', '-', '×', '÷', '('].includes(lastChar)) {
          setExpression((prev) => prev + '(');
        } else {
          setExpression((prev) => prev + '×(');
        }
      }
      return;
    }

    if (val === '000') {
      if (expression === '0') return;
      const lastChar = expression.slice(-1);
      if (['+', '-', '×', '÷', '('].includes(lastChar)) {
        setExpression((prev) => prev + '0');
      } else {
        setExpression((prev) => prev + '000');
      }
      return;
    }

    // Replace operator if preceding character is already an operator
    if (['+', '-', '×', '÷'].includes(val)) {
      const lastChar = expression.slice(-1);
      if (['+', '-', '×', '÷'].includes(lastChar)) {
        setExpression(expression.slice(0, -1) + val);
        return;
      }
      setExpression((prev) => prev + val);
      return;
    }

    // Numbers & %
    if (expression === '0' && !['+', '-', '×', '÷', '%'].includes(val)) {
      setExpression(val);
    } else {
      setExpression((prev) => prev + val);
    }
  };

  // Keyboard shortcut listener for standard calculator
  useEffect(() => {
    if (mode !== 'standard') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleKeypadPress(e.key);
      } else if (e.key === '+') {
        handleKeypadPress('+');
      } else if (e.key === '-') {
        handleKeypadPress('-');
      } else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
        handleKeypadPress('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleKeypadPress('÷');
      } else if (e.key === '%') {
        handleKeypadPress('%');
      } else if (e.key === '(' || e.key === ')') {
        handleKeypadPress('( )');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleKeypadPress('=');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKeypadPress('⌫');
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleKeypadPress('C');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, expression]);

  // ----------------------------------------------------
  // 2. 50/30/20 QUICK BUDGET STATE
  // ----------------------------------------------------
  const [incomeInput, setIncomeInput] = useState<number>(5000000);
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, lastDayOfMonth - now.getDate() + 1);

  const budgetNeeds = Math.round(incomeInput * 0.5);
  const budgetWants = Math.round(incomeInput * 0.3);
  const budgetSavings = Math.round(incomeInput * 0.2);
  const dailySafeNeeds = Math.round(budgetNeeds / daysRemaining);

  // ----------------------------------------------------
  // 3. DISCOUNT & TAX STATE
  // ----------------------------------------------------
  const [originalPrice, setOriginalPrice] = useState<number>(100000);
  const [discountPercent, setDiscountPercent] = useState<number>(20);
  const [taxPercent, setTaxPercent] = useState<number>(11); // PPN 11%

  const discountAmount = Math.round((originalPrice * discountPercent) / 100);
  const afterDiscount = Math.max(0, originalPrice - discountAmount);
  const taxAmount = Math.round((afterDiscount * taxPercent) / 100);
  const finalPrice = afterDiscount + taxAmount;

  // ----------------------------------------------------
  // 4. SPLIT BILL STATE
  // ----------------------------------------------------
  const [billTotal, setBillTotal] = useState<number>(240000);
  const [peopleCount, setPeopleCount] = useState<number>(4);
  const [serviceFeePercent, setServiceFeePercent] = useState<number>(5);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [rounding, setRounding] = useState<number>(500); // round up to 500
  const [copiedSplit, setCopiedSplit] = useState(false);

  const serviceAmount = Math.round((billTotal * serviceFeePercent) / 100);
  const totalWithExtra = billTotal + serviceAmount + tipAmount;
  const rawPerPerson = peopleCount > 0 ? totalWithExtra / peopleCount : 0;
  const perPerson = rounding > 0 ? Math.ceil(rawPerPerson / rounding) * rounding : Math.round(rawPerPerson);

  const handleCopySplitText = () => {
    const text = `Halo! Total tagihan kita ${formatRupiah(totalWithExtra)} dibagi ${peopleCount} orang = ${formatRupiah(perPerson)} per orang ya. Terima kasih! 🙏`;
    navigator.clipboard?.writeText(text);
    setCopiedSplit(true);
    setTimeout(() => setCopiedSplit(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto scrollbar-none text-xs">
        {[
          { id: 'standard' as CalculatorMode, label: 'Kalkulator Cepat', icon: CalcIcon },
          { id: 'budget503020' as CalculatorMode, label: 'Alokasi 50/30/20', icon: PieChart },
          { id: 'discountTax' as CalculatorMode, label: 'Diskon & PPN', icon: Percent },
          { id: 'splitBill' as CalculatorMode, label: 'Bagi Tagihan (Split)', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: STANDARD FINANCIAL CALCULATOR */}
      {/* ---------------------------------------------------- */}
      {mode === 'standard' && (
        <div className="space-y-4">
          {/* Display screen */}
          <div className="p-4 rounded-3xl bg-slate-900 text-white shadow-inner flex flex-col justify-end items-end space-y-1">
            <div className="text-xs text-slate-400 font-mono tracking-wider overflow-x-auto max-w-full">
              {expression || '0'}
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-400 font-mono overflow-x-auto max-w-full">
              {formatRupiah(calculatedResult)}
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { val: 'C', label: 'C', cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-500/20' },
              { val: '⌫', label: '⌫', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold' },
              { val: '%', label: '%', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold' },
              { val: '÷', label: '÷', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/20' },

              { val: '7', label: '7', cls: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100' },
              { val: '8', label: '8', cls: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100' },
              { val: '9', label: '9', cls: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100' },
              { val: '×', label: '×', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/20' },

              { val: '4', label: '4', cls: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100' },
              { val: '5', label: '5', cls: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100' },
              { val: '6', label: '6', cls: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100' },
              { val: '-', label: '-', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/20' },

              { val: '1', label: '1', cls: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100' },
              { val: '2', label: '2', cls: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100' },
              { val: '3', label: '3', cls: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100' },
              { val: '+', label: '+', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/20' },

              { val: '( )', label: '( )', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium' },
              { val: '0', label: '0', cls: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100' },
              { val: '000', label: '000', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold' },
              { val: '=', label: '=', cls: 'bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-sm' },
            ].map((btn) => (
              <button
                key={btn.val}
                type="button"
                onClick={() => handleKeypadPress(btn.val)}
                className={`py-3 sm:py-3.5 rounded-2xl text-base font-semibold transition-all active:scale-95 cursor-pointer border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center ${btn.cls}`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Quick CTA to record as Transaction */}
          {calculatedResult > 0 && onUseAmount && (
            <button
              type="button"
              onClick={() => onUseAmount(calculatedResult, `Hitungan kalkulator: ${expression}`)}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <PlusCircle size={16} />
              <span>Gunakan {formatRupiah(calculatedResult)} untuk Catat Transaksi</span>
            </button>
          )}

          {/* History tape */}
          {history.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block">Riwayat Hitungan Terakhir:</span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {history.map((h, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setExpression(String(h.result))}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-left shrink-0 text-xs transition-colors cursor-pointer"
                  >
                    <div className="text-[10px] text-slate-400">{h.expr}</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{formatRupiah(h.result)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: 50/30/20 QUICK BUDGET CALCULATOR */}
      {/* ---------------------------------------------------- */}
      {mode === 'budget503020' && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Masukkan Pemasukan / Gaji Bulanan Anda:
            </label>
            <CurrencyInput value={incomeInput} onChange={setIncomeInput} placeholder="Rp 0" />
          </div>

          {/* Allocation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                50% Kebutuhan Pokok (Needs)
              </span>
              <div className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                {formatRupiah(budgetNeeds)}
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                Pangan, sewa, tagihan listrik/air, kesehatan, transportasi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                30% Keinginan (Wants)
              </span>
              <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {formatRupiah(budgetWants)}
              </div>
              <p className="text-[10px] text-blue-700 dark:text-blue-300">
                Hiburan, nongkrong, belanja gaya hidup, hobi, rekreasi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                20% Tabungan (Savings)
              </span>
              <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                {formatRupiah(budgetSavings)}
              </div>
              <p className="text-[10px] text-purple-700 dark:text-purple-300">
                Dana darurat, tabungan impian, investasi masa depan.
              </p>
            </div>
          </div>

          {/* Daily spending safe insight */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <div>
              <span className="font-bold block">Batas Belanja Kebutuhan Harian Aman:</span>
              <span className="text-[11px] text-amber-700 dark:text-amber-400">
                Tersisa {daysRemaining} hari di bulan ini
              </span>
            </div>
            <div className="text-base font-extrabold text-amber-600 dark:text-amber-400">
              {formatRupiah(dailySafeNeeds)} / hari
            </div>
          </div>

          {onNavigateToBudgets && (
            <button
              type="button"
              onClick={onNavigateToBudgets}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Buka Menu Anggaran Lengkap</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: DISCOUNT & TAX (PPN) CALCULATOR */}
      {/* ---------------------------------------------------- */}
      {mode === 'discountTax' && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Harga Asli Barang / Tagihan:
            </label>
            <CurrencyInput value={originalPrice} onChange={setOriginalPrice} placeholder="Rp 0" />
          </div>

          {/* Preset Diskon Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Diskon (%):</span>
              <span className="text-emerald-600 font-bold">{discountPercent}%</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[0, 10, 20, 30, 50, 70].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDiscountPercent(pct)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    discountPercent === pct
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {pct === 0 ? 'Tanpa Diskon' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Pajak PPN Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Pajak / PPN (%):</span>
              <span className="text-blue-600 font-bold">{taxPercent}%</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { val: 0, label: '0%' },
                { val: 11, label: 'PPN 11%' },
                { val: 12, label: 'PPN 12%' },
                { val: 5, label: 'Service 5%' },
                { val: 10, label: 'Pajak Resto 10%' },
              ].map((t) => (
                <button
                  key={t.val}
                  type="button"
                  onClick={() => setTaxPercent(t.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    taxPercent === t.val
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calculation Summary Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>Harga Asli:</span>
              <span>{formatRupiah(originalPrice)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 font-medium">
                <span>Hemat Diskon ({discountPercent}%):</span>
                <span>- {formatRupiah(discountAmount)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Pajak ({taxPercent}%):</span>
                <span>+ {formatRupiah(taxAmount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-bold text-sm text-slate-900 dark:text-slate-100">
              <span>Total Akhir Bayar:</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-base">
                {formatRupiah(finalPrice)}
              </span>
            </div>
          </div>

          {onUseAmount && finalPrice > 0 && (
            <button
              type="button"
              onClick={() => onUseAmount(finalPrice, `Belanja (Diskon ${discountPercent}%, Pajak ${taxPercent}%)`)}
              className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <PlusCircle size={15} />
              <span>Catat Pengeluaran {formatRupiah(finalPrice)}</span>
            </button>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: SPLIT BILL (BAGI TAGIHAN) */}
      {/* ---------------------------------------------------- */}
      {mode === 'splitBill' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Total Tagihan:
              </label>
              <CurrencyInput value={billTotal} onChange={setBillTotal} placeholder="Rp 0" />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jumlah Orang:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <div className="flex items-center gap-1 shrink-0">
                  {[2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPeopleCount(n)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        peopleCount === n
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Optional Service / Tip */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-500">Service/Pajak (%):</label>
              <input
                type="number"
                min={0}
                value={serviceFeePercent}
                onChange={(e) => setServiceFeePercent(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-500">Tip Tambahan:</label>
              <CurrencyInput value={tipAmount} onChange={setTipAmount} placeholder="Rp 0" />
            </div>
          </div>

          {/* Rounding option */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-500">Pembulatan Nominal:</label>
            <div className="flex gap-2">
              {[
                { label: 'Pas (Rp 0)', value: 0 },
                { label: 'Rp 500', value: 500 },
                { label: 'Rp 1.000', value: 1000 },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRounding(opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    rounding === opt.value
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Split Result Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md space-y-3">
            <div className="flex items-center justify-between text-xs text-emerald-100">
              <span>Bagi Rata ({peopleCount} Orang)</span>
              <span>Total: {formatRupiah(totalWithExtra)}</span>
            </div>

            <div className="text-center py-1">
              <span className="text-[11px] uppercase font-bold text-emerald-200 tracking-wider block">
                Masing-Masing Bayar:
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {formatRupiah(perPerson)}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-white/20">
              <button
                type="button"
                onClick={handleCopySplitText}
                className="flex-1 py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSplit ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedSplit ? 'Teks Tersalin!' : 'Salin Pesan Tagihan'}</span>
              </button>

              {onUseAmount && (
                <button
                  type="button"
                  onClick={() => onUseAmount(perPerson, `Patungan tagihan (${peopleCount} orang)`)}
                  className="flex-1 py-2 px-3 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <PlusCircle size={14} />
                  <span>Catat Bagian Saya</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
