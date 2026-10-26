import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CurrencyInput } from '../common/CurrencyInput';
import { IconRenderer } from '../common/IconRenderer';
import { saveBudget, getCategories } from '../../db/services';
import type { Budget, Category } from '../../types';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  budgetToEdit?: Budget | null;
}

export const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  budgetToEdit,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchExpenseCats() {
      const cats = await getCategories('expense');
      setCategories(cats);
      if (budgetToEdit) {
        setCategoryId(budgetToEdit.categoryId);
        setMonthlyLimit(budgetToEdit.monthlyLimit);
      } else if (cats.length > 0) {
        setCategoryId(cats[0].id);
        setMonthlyLimit(1000000);
      }
    }
    if (isOpen) {
      fetchExpenseCats();
      setError('');
    }
  }, [isOpen, budgetToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setError('Pilih kategori untuk anggaran ini');
      return;
    }
    if (!monthlyLimit || monthlyLimit <= 0) {
      setError('Masukkan batas anggaran yang lebih besar dari 0');
      return;
    }

    setLoading(true);
    try {
      await saveBudget({
        id: budgetToEdit?.id,
        categoryId,
        monthlyLimit,
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan anggaran');
    } finally {
      setLoading(false);
    }
  };

  const selectedCat = categories.find((c) => c.id === categoryId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budgetToEdit ? 'Ubah Batas Anggaran' : 'Atur Anggaran Bulanan'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Category Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Kategori Pengeluaran
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
            {categories.map((c) => {
              const isSelected = categoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`p-2.5 rounded-xl flex items-center gap-2 border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: c.color }}
                  >
                    <IconRenderer name={c.icon} size={15} />
                  </div>
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Category Tag */}
        {selectedCat && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Anggaran untuk:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {selectedCat.name}
            </span>
          </div>
        )}

        {/* Monthly Limit Input */}
        <CurrencyInput
          value={monthlyLimit}
          onChange={(val) => {
            setMonthlyLimit(val);
            setError('');
          }}
          label="Batas Maksimal per Bulan (Rp)"
          error={error}
        />

        <p className="text-[11px] text-slate-400 leading-relaxed">
          💡 Anggaran ini otomatis berulang setiap bulan baru tanpa perlu diatur ulang.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm shadow-emerald-600/20 disabled:opacity-50 transition-all"
          >
            {loading ? 'Menyimpan...' : 'Simpan Anggaran'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
