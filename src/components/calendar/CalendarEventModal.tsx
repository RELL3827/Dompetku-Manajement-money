import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CurrencyInput } from '../common/CurrencyInput';
import {
  Coins,
  Palmtree,
  Receipt,
  ShoppingBag,
  Tag,
  Trash2,
  Sparkles,
} from 'lucide-react';
import type { CalendarEvent, CalendarEventType } from '../../types';
import { addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '../../db/services';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  eventToEdit?: CalendarEvent | null;
  onSaved?: () => void;
}

const EVENT_TYPES: Array<{
  id: CalendarEventType;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  darkBgColor: string;
  textColor: string;
}> = [
  {
    id: 'gajian',
    label: 'Gajian',
    icon: Coins,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    darkBgColor: 'dark:bg-emerald-950/60',
    textColor: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    id: 'liburan',
    label: 'Liburan',
    icon: Palmtree,
    color: 'amber',
    bgColor: 'bg-amber-50',
    darkBgColor: 'dark:bg-amber-950/60',
    textColor: 'text-amber-700 dark:text-amber-300',
  },
  {
    id: 'tagihan',
    label: 'Tagihan',
    icon: Receipt,
    color: 'rose',
    bgColor: 'bg-rose-50',
    darkBgColor: 'dark:bg-rose-950/60',
    textColor: 'text-rose-700 dark:text-rose-300',
  },
  {
    id: 'belanja',
    label: 'Belanja',
    icon: ShoppingBag,
    color: 'purple',
    bgColor: 'bg-purple-50',
    darkBgColor: 'dark:bg-purple-950/60',
    textColor: 'text-purple-700 dark:text-purple-300',
  },
  {
    id: 'lainnya',
    label: 'Lainnya',
    icon: Tag,
    color: 'blue',
    bgColor: 'bg-blue-50',
    darkBgColor: 'dark:bg-blue-950/60',
    textColor: 'text-blue-700 dark:text-blue-300',
  },
];

const PRESETS: Record<CalendarEventType, string[]> = {
  gajian: ['Gaji Pokok Bulanan', 'Bonus & THR', 'Uang Freelance', 'Pendapatan Usaha'],
  liburan: ['Libur Akhir Tahun', 'Cuti Bersama', 'Weekend Getaway', 'Wisata Keluarga'],
  tagihan: ['Tagihan Listrik PLN', 'Wi-Fi / Internet', 'BPJS Kesehatan', 'Sewa / Kos', 'Cicilan / Paylater'],
  belanja: ['Belanja Bulanan Supermarket', 'Restock Kebutuhan Rumah', 'Beli Perlengkapan'],
  lainnya: ['Ulang Tahun / Kado', 'Jadwal Nabung Rutin', 'Pajak Kendaraan'],
};

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  eventToEdit,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEventType>('gajian');
  const [date, setDate] = useState(() => initialDate || new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        setTitle(eventToEdit.title);
        setType(eventToEdit.type);
        setDate(eventToEdit.date);
        setAmount(eventToEdit.amount || 0);
        setNotes(eventToEdit.notes || '');
        setIsDone(Boolean(eventToEdit.isDone));
      } else {
        setTitle('');
        setType('gajian');
        setDate(initialDate || new Date().toISOString().slice(0, 10));
        setAmount(0);
        setNotes('');
        setIsDone(false);
      }
      setError(null);
    }
  }, [isOpen, eventToEdit, initialDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul agenda tidak boleh kosong.');
      return;
    }
    if (!date) {
      setError('Tanggal agenda wajib dipilih.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (eventToEdit) {
        await updateCalendarEvent(eventToEdit.id, {
          title: title.trim(),
          type,
          date,
          amount: amount > 0 ? amount : undefined,
          notes: notes.trim() || undefined,
          isDone,
        });
      } else {
        await addCalendarEvent({
          title: title.trim(),
          type,
          date,
          amount: amount > 0 ? amount : undefined,
          notes: notes.trim() || undefined,
          isDone,
        });
      }

      onSaved?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan agenda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!eventToEdit) return;
    if (window.confirm('Yakin ingin menghapus tanda agenda ini?')) {
      try {
        await deleteCalendarEvent(eventToEdit.id);
        onSaved?.();
        onClose();
      } catch (err: any) {
        setError('Gagal menghapus agenda.');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={eventToEdit ? 'Ubah Agenda Kalender' : 'Tandai Tanggal di Kalender'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Tipe Agenda Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Jenis Penanda
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {EVENT_TYPES.map((t) => {
              const Icon = t.icon;
              const isSelected = type === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setType(t.id);
                    if (!title && PRESETS[t.id].length > 0) {
                      setTitle(PRESETS[t.id][0]);
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? `${t.bgColor} ${t.darkBgColor} ${t.textColor} border-emerald-500 shadow-xs ring-2 ring-emerald-500/20 font-bold scale-[1.02]`
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={18} className="mb-1" />
                  <span className="text-[11px]">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preset suggestions */}
        <div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
            <Sparkles size={12} className="text-amber-500" />
            <span>Pilihan Cepat:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS[type].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTitle(preset)}
                className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                  title === preset
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Judul Agenda */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Judul Agenda *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Gajian Kantor, Liburan Bali, Tagihan Wi-Fi"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Tanggal & Estimasi Nominal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tanggal *
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <CurrencyInput
              label="Estimasi Nominal (Opsional)"
              value={amount}
              onChange={setAmount}
              placeholder="0 (jika ada nominal)"
              showQuickChips={false}
            />
          </div>
        </div>

        {/* Catatan Tambahan */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tambahkan catatan khusus, rincian lokasi, no referensi, dll..."
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Selesai / Terbayar (Checklist) */}
        {eventToEdit && (
          <label className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={isDone}
              onChange={(e) => setIsDone(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Tandai sebagai sudah selesai / sudah terbayar
            </span>
          </label>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {eventToEdit ? (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Trash2 size={15} />
              <span>Hapus</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : eventToEdit ? 'Simpan Perubahan' : '+ Tambah ke Kalender'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
