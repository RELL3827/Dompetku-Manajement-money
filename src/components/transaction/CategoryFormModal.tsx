import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { IconRenderer, AVAILABLE_CATEGORY_ICONS, AVAILABLE_COLORS } from '../common/IconRenderer';
import { saveCategory } from '../../db/services';
import type { Category, BudgetGroup503020 } from '../../types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  categoryToEdit?: Category | null;
  defaultType?: 'income' | 'expense';
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  categoryToEdit,
  defaultType = 'expense',
}) => {
  const [name, setName] = useState(categoryToEdit?.name || '');
  const [type, setType] = useState<'income' | 'expense'>(categoryToEdit?.type || defaultType);
  const [icon, setIcon] = useState(categoryToEdit?.icon || 'Tag');
  const [color, setColor] = useState(categoryToEdit?.color || '#10b981');
  const [budgetGroup, setBudgetGroup] = useState<BudgetGroup503020>(categoryToEdit?.budgetGroup || 'needs');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync state when editing
  React.useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setType(categoryToEdit.type);
      setIcon(categoryToEdit.icon);
      setColor(categoryToEdit.color);
      setBudgetGroup(categoryToEdit.budgetGroup || 'needs');
    } else {
      setName('');
      setType(defaultType);
      setIcon('Tag');
      setColor('#10b981');
      setBudgetGroup('needs');
    }
    setError('');
  }, [categoryToEdit, defaultType, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama kategori tidak boleh kosong');
      return;
    }

    setLoading(true);
    try {
      await saveCategory({
        id: categoryToEdit?.id,
        name: name.trim(),
        type,
        icon,
        color,
        budgetGroup: type === 'expense' ? budgetGroup : undefined,
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan kategori');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? 'Ubah Kategori' : 'Tambah Kategori Baru'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Type toggle */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              type === 'expense'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              type === 'income'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Pemasukan
          </button>
        </div>

        {/* Category Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nama Kategori
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Kopi, Langganan, Hobi"
            maxLength={30}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
          />
          {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        </div>

        {/* 50/30/20 Group Selector for Expenses */}
        {type === 'expense' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Kelompok Pola 50/30/20
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBudgetGroup('needs')}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  budgetGroup === 'needs'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800'
                }`}
              >
                <span>🛒 50% Kebutuhan</span>
              </button>
              <button
                type="button"
                onClick={() => setBudgetGroup('wants')}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                  budgetGroup === 'wants'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800'
                }`}
              >
                <span>🎉 30% Keinginan</span>
              </button>
            </div>
          </div>
        )}

        {/* Selected Preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: color }}
          >
            <IconRenderer name={icon} size={20} />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {name.trim() || 'Nama Kategori'}
            </span>
            <p className="text-slate-400">
              {type === 'expense' ? 'Kategori Pengeluaran' : 'Kategori Pemasukan'}
            </p>
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Pilih Ikon
          </label>
          <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
            {AVAILABLE_CATEGORY_ICONS.map((iconName) => (
              <button
                key={iconName}
                type="button"
                onClick={() => setIcon(iconName)}
                className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                  icon === iconName
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <IconRenderer name={iconName} size={18} />
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Pilih Warna
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform active:scale-90 ${
                  color === c ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-slate-100 scale-110' : ''
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

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
            {loading ? 'Menyimpan...' : 'Simpan Kategori'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
