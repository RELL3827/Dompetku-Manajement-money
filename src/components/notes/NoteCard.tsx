import React from 'react';
import type { FinancialNote } from '../../types';
import { formatIndonesianDate, toLocalISODate } from '../../utils/date';
import { formatRupiah } from '../../utils/currency';
import {
  Pin,
  CheckSquare,
  Edit2,
  Trash2,
  Clock,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';

interface NoteCardProps {
  note: FinancialNote;
  onEdit: (note: FinancialNote) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleChecklistItem: (noteId: string, itemId: string) => void;
  onConvertToTransaction?: (amount: number, noteText: string) => void;
}

const CATEGORY_META: Record<string, { label: string; icon: string; bg: string }> = {
  shopping: { label: 'Daftar Belanja', icon: '🛒', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
  debt: { label: 'Hutang / Piutang', icon: '🤝', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  budget: { label: 'Rencana Anggaran', icon: '🎯', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  wishlist: { label: 'Wishlist Impian', icon: '✨', bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' },
  general: { label: 'Catatan Umum', icon: '📝', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
};

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleChecklistItem,
  onConvertToTransaction,
}) => {
  const meta = CATEGORY_META[note.category] || CATEGORY_META.general;
  const today = toLocalISODate();

  const totalChecklist = note.checklist?.length || 0;
  const doneChecklist = note.checklist?.filter((i) => i.isDone).length || 0;
  const checklistPercentage = totalChecklist > 0 ? Math.round((doneChecklist / totalChecklist) * 100) : 0;

  // Due date status
  let dueDateStatus: 'overdue' | 'today' | 'upcoming' | null = null;
  if (note.dueDate) {
    if (note.dueDate < today) {
      dueDateStatus = 'overdue';
    } else if (note.dueDate === today) {
      dueDateStatus = 'today';
    } else {
      dueDateStatus = 'upcoming';
    }
  }

  return (
    <div
      className={`relative group rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
        note.isPinned
          ? 'border-amber-400/60 dark:border-amber-500/40 ring-1 ring-amber-400/20'
          : 'border-slate-200/80 dark:border-slate-800'
      }`}
    >
      {/* Top Color Accent Line */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: note.color || '#10b981' }}
      />

      <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
        {/* Header: Category Badge + Pinned + Action buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${meta.bg}`}
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onTogglePin(note.id)}
                title={note.isPinned ? 'Lepas Sematan' : 'Sematkan ke Atas'}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  note.isPinned
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                <Pin size={14} className={note.isPinned ? 'fill-current' : ''} />
              </button>

              <button
                type="button"
                onClick={() => onEdit(note)}
                title="Ubah Catatan"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Edit2 size={13} />
              </button>

              <button
                type="button"
                onClick={() => onDelete(note.id)}
                title="Hapus Catatan"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug">
            {note.title}
          </h3>

          {/* Content / Notes text */}
          {note.content && (
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line line-clamp-3">
              {note.content}
            </p>
          )}
        </div>

        {/* Due Date & Amount Badges */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            {note.estimatedAmount && note.estimatedAmount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                <span>Estimasi:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(note.estimatedAmount)}
                </span>
              </span>
            ) : null}

            {note.dueDate && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold ${
                  dueDateStatus === 'overdue'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                    : dueDateStatus === 'today'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                }`}
              >
                {dueDateStatus === 'overdue' ? (
                  <AlertCircle size={12} />
                ) : (
                  <Clock size={12} />
                )}
                <span>
                  {dueDateStatus === 'overdue'
                    ? `Terlewat (${formatIndonesianDate(note.dueDate, 'short')})`
                    : dueDateStatus === 'today'
                    ? 'Jatuh Tempo Hari Ini'
                    : `Batas: ${formatIndonesianDate(note.dueDate, 'short')}`}
                </span>
              </span>
            )}
          </div>

          {/* Checklist Preview */}
          {totalChecklist > 0 && (
            <div className="space-y-1.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckSquare size={13} className="text-emerald-500" />
                  <span>Checklist ({doneChecklist}/{totalChecklist})</span>
                </span>
                <span>{checklistPercentage}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${checklistPercentage}%` }}
                />
              </div>

              {/* First 3 checklist items */}
              <div className="space-y-1 pt-1">
                {note.checklist?.slice(0, 3).map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center justify-between gap-2 text-[11px] cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-700/40 p-1 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={item.isDone}
                        onChange={() => onToggleChecklistItem(note.id, item.id)}
                        className="w-3 h-3 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span
                        className={`truncate ${
                          item.isDone ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                    {item.amount && item.amount > 0 ? (
                      <span className="text-[10px] text-slate-500 shrink-0 font-medium">
                        {formatRupiah(item.amount)}
                      </span>
                    ) : null}
                  </label>
                ))}

                {totalChecklist > 3 && (
                  <button
                    type="button"
                    onClick={() => onEdit(note)}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline block pt-0.5"
                  >
                    + {totalChecklist - 3} item lainnya...
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA: Convert to Transaction if has amount */}
        {onConvertToTransaction && (note.estimatedAmount && note.estimatedAmount > 0) ? (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => onConvertToTransaction(note.estimatedAmount || 0, note.title)}
              className="w-full py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle size={13} />
              <span>Jadikan Transaksi Riil ({formatRupiah(note.estimatedAmount)})</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
