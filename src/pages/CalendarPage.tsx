import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Coins,
  Palmtree,
  Receipt,
  ShoppingBag,
  Tag,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  ArrowDownLeft,
  Edit2,
  Trash2,
} from 'lucide-react';
import type { CalendarEvent, CalendarEventType, Transaction } from '../types';
import { CalendarEventModal } from '../components/calendar/CalendarEventModal';
import { toggleCalendarEventDone, deleteCalendarEvent } from '../db/services';
import { formatRupiah } from '../utils/currency';
import { formatIndonesianDate } from '../utils/date';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

interface CalendarPageProps {
  onOpenTransactionModal?: (type?: 'income' | 'expense' | 'transfer') => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ onOpenTransactionModal }) => {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toISOString().slice(0, 10), [today]);

  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string>(() => todayStr);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);

  // Live query all events & transactions
  const allEvents = useLiveQuery(() => db.calendarEvents.toArray()) || [];
  const allTransactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const allCategories = useLiveQuery(() => db.categories.toArray()) || [];

  const catMap = useMemo(() => new Map(allCategories.map((c) => [c.id, c])), [allCategories]);

  // Group events by date string (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of allEvents) {
      const list = map.get(ev.date) || [];
      list.push(ev);
      map.set(ev.date, list);
    }
    return map;
  }, [allEvents]);

  // Group transactions by date string
  const txByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of allTransactions) {
      const list = map.get(tx.date) || [];
      list.push(tx);
      map.set(tx.date, list);
    }
    return map;
  }, [allTransactions]);

  // Navigate Months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(todayStr);
  };

  // Calendar Grid Calculation
  const calendarDays = useMemo(() => {
    // First day of current month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    // Day of week: 0=Sun, 1=Mon, ..., 6=Sat
    // Convert to Monday=0, Sunday=6
    let startingDay = firstDayOfMonth.getDay() - 1;
    if (startingDay === -1) startingDay = 6;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Previous month padding days
    for (let i = startingDay - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr: dStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr: dStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr: dStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
      });
    }

    return days;
  }, [currentYear, currentMonth, todayStr]);

  // Monthly Summary Stats
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthEvents = useMemo(() => {
    return allEvents.filter((ev) => ev.date.startsWith(monthPrefix));
  }, [allEvents, monthPrefix]);

  const monthGajianCount = monthEvents.filter((e) => e.type === 'gajian').length;
  const monthLiburanCount = monthEvents.filter((e) => e.type === 'liburan').length;
  const monthTagihanSum = monthEvents
    .filter((e) => e.type === 'tagihan' && e.amount)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  // Selected Date Data
  const selectedEvents = eventsByDate.get(selectedDate) || [];
  const selectedTransactions = txByDate.get(selectedDate) || [];

  const selectedTxIncome = selectedTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const selectedTxExpense = selectedTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const getEventBadge = (type: CalendarEventType) => {
    switch (type) {
      case 'gajian':
        return {
          label: 'Gajian',
          icon: Coins,
          bg: 'bg-emerald-500',
          lightBg: 'bg-emerald-50 dark:bg-emerald-950/60',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800',
        };
      case 'liburan':
        return {
          label: 'Liburan',
          icon: Palmtree,
          bg: 'bg-amber-500',
          lightBg: 'bg-amber-50 dark:bg-amber-950/60',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-800',
        };
      case 'tagihan':
        return {
          label: 'Tagihan',
          icon: Receipt,
          bg: 'bg-rose-500',
          lightBg: 'bg-rose-50 dark:bg-rose-950/60',
          text: 'text-rose-700 dark:text-rose-300',
          border: 'border-rose-200 dark:border-rose-900/60',
        };
      case 'belanja':
        return {
          label: 'Belanja',
          icon: ShoppingBag,
          bg: 'bg-purple-500',
          lightBg: 'bg-purple-50 dark:bg-purple-950/60',
          text: 'text-purple-700 dark:text-purple-300',
          border: 'border-purple-200 dark:border-purple-800',
        };
      default:
        return {
          label: 'Agenda',
          icon: Tag,
          bg: 'bg-blue-500',
          lightBg: 'bg-blue-50 dark:bg-blue-950/60',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800',
        };
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-500/20">
              <CalendarIcon size={22} />
            </div>
            <span>Kalender Keuangan & Agenda</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tandai jadwal gajian, rencana liburan, jatuh tempo tagihan, dan pantau pengeluaran harian Anda.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEventToEdit(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus size={16} />
          <span>Tandai Tanggal</span>
        </button>
      </div>

      {/* Monthly Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Coins size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Jadwal Gajian Bulan Ini
            </span>
            <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              {monthGajianCount > 0 ? `${monthGajianCount} Jadwal Terdaftar` : 'Belum Ditandai'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Palmtree size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Rencana Liburan / Cuti
            </span>
            <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              {monthLiburanCount > 0 ? `${monthLiburanCount} Agenda Liburan` : 'Belum Ada Liburan'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Receipt size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Estimasi Tagihan Bulan Ini
            </span>
            <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
              {monthTagihanSum > 0 ? formatRupiah(monthTagihanSum) : 'Rp 0'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Calendar Box */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        {/* Month Navigation Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <button
              type="button"
              onClick={handleGoToday}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              Hari Ini
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Bulan sebelumnya"
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Bulan berikutnya"
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Day Name Headers */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {DAY_NAMES.map((name, idx) => (
            <div
              key={name}
              className={`text-[11px] font-bold py-1.5 ${
                idx >= 5 ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((day) => {
            const isSelected = day.dateStr === selectedDate;
            const events = eventsByDate.get(day.dateStr) || [];
            const txs = txByDate.get(day.dateStr) || [];

            const hasGajian = events.some((e) => e.type === 'gajian');
            const hasLiburan = events.some((e) => e.type === 'liburan');
            const hasTagihan = events.some((e) => e.type === 'tagihan');
            const hasOther = events.some((e) => e.type === 'belanja' || e.type === 'lainnya');
            const hasTx = txs.length > 0;

            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => setSelectedDate(day.dateStr)}
                className={`min-h-[64px] sm:min-h-[82px] p-1.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : day.isCurrentMonth
                    ? 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900/60'
                    : 'border-transparent text-slate-300 dark:text-slate-600 bg-slate-50/40 dark:bg-slate-900/20 opacity-40'
                }`}
              >
                {/* Day Header with Number */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      day.isToday
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isSelected
                        ? 'text-emerald-700 dark:text-emerald-300 font-extrabold'
                        : day.isCurrentMonth
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  {/* Transaction indicator dot */}
                  {hasTx && (
                    <span
                      title={`${txs.length} Transaksi`}
                      className="w-1.5 h-1.5 rounded-full bg-blue-500"
                    />
                  )}
                </div>

                {/* Event Markers / Badges */}
                <div className="space-y-0.5 w-full mt-1">
                  {events.slice(0, 2).map((ev) => {
                    const badge = getEventBadge(ev.type);
                    return (
                      <div
                        key={ev.id}
                        className={`text-[9px] px-1 py-0.5 rounded truncate font-medium flex items-center gap-0.5 ${badge.lightBg} ${badge.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.bg}`} />
                        <span className="truncate">{ev.title}</span>
                      </div>
                    );
                  })}
                  {events.length > 2 && (
                    <div className="text-[8px] text-slate-400 font-semibold px-1">
                      +{events.length - 2} lagi
                    </div>
                  )}

                  {/* Visual dots if no space */}
                  {events.length === 0 && (
                    <div className="h-4 flex items-center gap-1">
                      {hasGajian && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                      {hasLiburan && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                      {hasTagihan && <span className="w-2 h-2 rounded-full bg-rose-500" />}
                      {hasOther && <span className="w-2 h-2 rounded-full bg-purple-500" />}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Keterangan:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Gajian</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Liburan / Cuti</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Tagihan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Belanja / Lainnya</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Catatan Transaksi</span>
          </div>
        </div>
      </div>

      {/* Detail Section for Selected Date */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Rincian Tanggal Terpilih
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarIcon size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span>{formatIndonesianDate(selectedDate)}</span>
              {selectedDate === todayStr && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold">
                  Hari Ini
                </span>
              )}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEventToEdit(null);
                setIsModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              <Plus size={14} />
              <span>Tambah Penanda</span>
            </button>
            {onOpenTransactionModal && (
              <button
                type="button"
                onClick={() => onOpenTransactionModal('expense')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <span>+ Catat Transaksi</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. Agenda Penanda (Gajian, Liburan, Tagihan) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Agenda & Penanda Khusus ({selectedEvents.length})
            </h4>
          </div>

          {selectedEvents.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Belum ada penanda di tanggal ini.
              </p>
              <div className="flex justify-center gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEventToEdit(null);
                    setIsModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  + Tandai Gajian / Liburan / Tagihan
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedEvents.map((ev) => {
                const badge = getEventBadge(ev.type);
                return (
                  <div
                    key={ev.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      ev.isDone
                        ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-70'
                        : `${badge.lightBg} ${badge.border}`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleCalendarEventDone(ev.id)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                          title={ev.isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
                        >
                          {ev.isDone ? (
                            <CheckCircle2 size={18} className="text-emerald-600" />
                          ) : (
                            <Circle size={18} />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                ev.type === 'gajian'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : ev.type === 'liburan'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : ev.type === 'tagihan'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              }`}
                            >
                              {badge.label}
                            </span>
                            <span
                              className={`text-sm font-bold ${
                                ev.isDone
                                  ? 'line-through text-slate-500'
                                  : 'text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              {ev.title}
                            </span>
                          </div>

                          {ev.amount && ev.amount > 0 && (
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                              {formatRupiah(ev.amount)}
                            </p>
                          )}

                          {ev.notes && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                              {ev.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEventToEdit(ev);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCalendarEvent(ev.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Catatan Transaksi Riil pada Tanggal Terpilih */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Transaksi Riil pada Tanggal Ini ({selectedTransactions.length})
            </h4>

            {(selectedTxIncome > 0 || selectedTxExpense > 0) && (
              <div className="flex items-center gap-2 text-xs">
                {selectedTxIncome > 0 && (
                  <span className="text-emerald-600 font-bold">
                    +{formatRupiah(selectedTxIncome)}
                  </span>
                )}
                {selectedTxExpense > 0 && (
                  <span className="text-rose-600 font-bold">
                    -{formatRupiah(selectedTxExpense)}
                  </span>
                )}
              </div>
            )}
          </div>

          {selectedTransactions.length === 0 ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400">
              Tidak ada riwayat transaksi pengeluaran/pemasukan pada tanggal ini.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedTransactions.map((tx) => {
                const cat = catMap.get(tx.categoryId);
                const isIncome = tx.type === 'income';
                const isTransfer = tx.type === 'transfer';

                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isIncome
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : isTransfer
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft size={16} />
                        ) : isTransfer ? (
                          <ArrowUpRight size={16} />
                        ) : (
                          <ArrowUpRight size={16} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {cat ? cat.name : isTransfer ? 'Transfer Antar Dompet' : 'Transaksi'}
                        </p>
                        {tx.notes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {tx.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`font-bold shrink-0 ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isTransfer
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : isTransfer ? '' : '-'}
                      {formatRupiah(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Calendar Event Modal */}
      <CalendarEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialDate={selectedDate}
        eventToEdit={eventToEdit}
      />
    </div>
  );
};
