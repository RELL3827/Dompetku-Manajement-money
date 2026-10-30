import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CurrencyInput } from '../common/CurrencyInput';
import { createNote, updateNote } from '../../db/services';
import type { FinancialNote, NoteTag, NoteChecklistItem } from '../../types';
import {
  Pin,
  Plus,
  Trash2,
  Calendar,
  Tag,
  CheckSquare,
  FileText,
  DollarSign,
  Check,
} from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteToEdit?: FinancialNote | null;
  onSaved?: () => void;
}

const CATEGORY_OPTIONS: Array<{ id: NoteTag; label: string; icon: string }> = [
  { id: 'shopping', label: 'Daftar Belanja', icon: '🛒' },
  { id: 'debt', label: 'Hutang / Piutang', icon: '🤝' },
  { id: 'budget', label: 'Rencana Anggaran', icon: '🎯' },
  { id: 'wishlist', label: 'Wishlist Impian', icon: '✨' },
  { id: 'general', label: 'Catatan Umum', icon: '📝' },
];

const COLOR_PALETTE = [
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Purple', hex: '#8b5cf6' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Teal', hex: '#14b8a6' },
];

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  noteToEdit,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteTag>('shopping');
  const [color, setColor] = useState('#10b981');
  const [isPinned, setIsPinned] = useState(false);
  const [estimatedAmount, setEstimatedAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [checklist, setChecklist] = useState<NoteChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newChecklistAmount, setNewChecklistAmount] = useState<number>(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (noteToEdit) {
      setTitle(noteToEdit.title);
      setContent(noteToEdit.content || '');
      setCategory(noteToEdit.category);
      setColor(noteToEdit.color || '#10b981');
      setIsPinned(noteToEdit.isPinned);
      setEstimatedAmount(noteToEdit.estimatedAmount || 0);
      setDueDate(noteToEdit.dueDate || '');
      setChecklist(noteToEdit.checklist || []);
    } else {
      setTitle('');
      setContent('');
      setCategory('shopping');
      setColor('#10b981');
      setIsPinned(false);
      setEstimatedAmount(0);
      setDueDate('');
      setChecklist([]);
    }
    setNewChecklistText('');
    setNewChecklistAmount(0);
    setError('');
  }, [noteToEdit, isOpen]);

  const handleAddChecklistItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem: NoteChecklistItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      text: newChecklistText.trim(),
      isDone: false,
      amount: newChecklistAmount > 0 ? newChecklistAmount : undefined,
    };

    const nextList = [...checklist, newItem];
    setChecklist(nextList);

    // Auto update estimated amount if items have amounts
    const sum = nextList.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    if (sum > 0) {
      setEstimatedAmount(sum);
    }

    setNewChecklistText('');
    setNewChecklistAmount(0);
  };

  const handleRemoveChecklistItem = (id: string) => {
    const nextList = checklist.filter((item) => item.id !== id);
    setChecklist(nextList);
    const sum = nextList.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    if (sum > 0) {
      setEstimatedAmount(sum);
    }
  };

  const handleToggleItemDone = (id: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, isDone: !item.isDone } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul catatan harus diisi');
      return;
    }

    setLoading(true);
    try {
      if (noteToEdit) {
        await updateNote(noteToEdit.id, {
          title: title.trim(),
          content: content.trim(),
          category,
          color,
          isPinned,
          checklist,
          estimatedAmount: estimatedAmount > 0 ? estimatedAmount : undefined,
          dueDate: dueDate || undefined,
        });
      } else {
        await createNote({
          title: title.trim(),
          content: content.trim(),
          category,
          color,
          isPinned,
          checklist,
          estimatedAmount: estimatedAmount > 0 ? estimatedAmount : undefined,
          dueDate: dueDate || undefined,
        });
      }

      onSaved?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan catatan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={noteToEdit ? 'Ubah Catatan Keuangan' : 'Buat Catatan Keuangan Baru'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        {/* Title & Pin Toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Judul Catatan *
            </label>
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isPinned
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 shadow-2xs'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <Pin size={12} className={isPinned ? 'fill-current text-amber-500' : ''} />
              <span>{isPinned ? 'Disematkan di Atas' : 'Sematkan'}</span>
            </button>
          </div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Belanja Bulanan Supermarket, Piutang Ahmad..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Category Tabs */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Tag size={13} />
            <span>Kategori Catatan</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCategory(opt.id)}
                className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
                  category === opt.id
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="text-base">{opt.icon}</span>
                <span className="truncate">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Warna Aksen
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  color === c.hex ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              >
                {color === c.hex && <Check size={14} className="text-white drop-shadow" />}
              </button>
            ))}
          </div>
        </div>

        {/* Estimated Amount & Due Date (Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <DollarSign size={13} className="text-emerald-500" />
              <span>Estimasi / Nominal (Opsional)</span>
            </label>
            <CurrencyInput
              value={estimatedAmount}
              onChange={setEstimatedAmount}
              placeholder="Rp 0"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar size={13} className="text-blue-500" />
              <span>Batas Waktu / Jatuh Tempo (Opsional)</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Content / Notes Textarea */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <FileText size={13} />
            <span>Keterangan / Rincian Catatan</span>
          </label>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis detail catatan, nomor rekening, alamat, instruksi belanja, atau pengingat penting..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Checklist Section */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CheckSquare size={14} className="text-emerald-500" />
              <span>Daftar Checklist ({checklist.filter((i) => i.isDone).length}/{checklist.length})</span>
            </label>
            {checklist.length > 0 && (
              <span className="text-[11px] text-slate-400">
                Total item: {checklist.length}
              </span>
            )}
          </div>

          {/* List of items */}
          {checklist.length > 0 && (
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <label className="flex items-center gap-2 cursor-pointer min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={item.isDone}
                      onChange={() => handleToggleItemDone(item.id)}
                      className="w-3.5 h-3.5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span
                      className={`truncate ${
                        item.isDone
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.amount && item.amount > 0 && (
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-200/60 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                        Rp {item.amount.toLocaleString('id-ID')}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Hapus item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add item input row */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddChecklistItem();
                }
              }}
              placeholder="Tambah item (mis: Beras 5kg, Telur...)"
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
            />
            <div className="w-28 sm:w-32">
              <CurrencyInput
                value={newChecklistAmount}
                onChange={setNewChecklistAmount}
                placeholder="Nominal"
              />
            </div>
            <button
              type="button"
              onClick={() => handleAddChecklistItem()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0 cursor-pointer"
              title="Tambah ke Checklist"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            {loading ? 'Menyimpan...' : noteToEdit ? 'Simpan Perubahan' : 'Buat Catatan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
