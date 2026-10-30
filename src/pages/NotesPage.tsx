import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { deleteNote, togglePinNote, toggleChecklistItem } from '../db/services';
import type { FinancialNote, NoteTag, TransactionType } from '../types';
import { NoteCard } from '../components/notes/NoteCard';
import { NoteModal } from '../components/notes/NoteModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { formatRupiah } from '../utils/currency';
import {
  FileText,
  Plus,
  Search,
  Pin,
  ShoppingCart,
  HandCoins,
  Sparkles,
  StickyNote,
} from 'lucide-react';

interface NotesPageProps {
  onOpenTransactionModal?: (type?: TransactionType, defaultAmount?: number, defaultNotes?: string) => void;
}

export const NotesPage: React.FC<NotesPageProps> = ({ onOpenTransactionModal }) => {
  const [activeCategory, setActiveCategory] = useState<NoteTag | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<FinancialNote | null>(null);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  // Live query for real-time reactivity
  const allNotes = useLiveQuery(() => db.notes.toArray()) || [];

  // Filter notes
  const filteredNotes = useMemo(() => {
    let list = [...allNotes];

    if (activeCategory !== 'all') {
      list = list.filter((n) => n.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.checklist?.some((item) => item.text.toLowerCase().includes(q))
      );
    }

    // Sort: Pinned first, then newest updated
    return list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [allNotes, activeCategory, searchQuery]);

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.isPinned), [filteredNotes]);
  const otherNotes = useMemo(() => filteredNotes.filter((n) => !n.isPinned), [filteredNotes]);

  // Statistics calculation
  const stats = useMemo(() => {
    const shoppingCount = allNotes.filter((n) => n.category === 'shopping').length;
    const debtNotes = allNotes.filter((n) => n.category === 'debt');
    const totalDebtAmount = debtNotes.reduce((sum, n) => sum + (n.estimatedAmount || 0), 0);
    const wishlistNotes = allNotes.filter((n) => n.category === 'wishlist');
    const totalWishlistAmount = wishlistNotes.reduce((sum, n) => sum + (n.estimatedAmount || 0), 0);

    return {
      total: allNotes.length,
      shoppingCount,
      debtCount: debtNotes.length,
      totalDebtAmount,
      wishlistCount: wishlistNotes.length,
      totalWishlistAmount,
    };
  }, [allNotes]);

  const handleCreateNew = () => {
    setNoteToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (note: FinancialNote) => {
    setNoteToEdit(note);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteNoteId(id);
  };

  const confirmDelete = async () => {
    if (deleteNoteId) {
      await deleteNote(deleteNoteId);
      setDeleteNoteId(null);
    }
  };

  const handleTogglePin = async (id: string) => {
    await togglePinNote(id);
  };

  const handleToggleChecklist = async (noteId: string, itemId: string) => {
    await toggleChecklistItem(noteId, itemId);
  };

  const handleConvertToTransaction = (amount: number, title: string) => {
    if (onOpenTransactionModal) {
      onOpenTransactionModal('expense', amount, title);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="text-emerald-500" size={20} />
            <span>Catatan Keuangan</span>
          </h1>
          <p className="text-xs text-slate-500">
            Daftar belanja, hutang/piutang, wishlist, dan memo pengingat finansial offline
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus size={15} />
          <span>Buat Catatan</span>
        </button>
      </div>

      {/* KPI / Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <StickyNote size={16} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Total Catatan</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{stats.total} Catatan</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <ShoppingCart size={16} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Daftar Belanja</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{stats.shoppingCount} Memo</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <HandCoins size={16} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Hutang/Piutang</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {stats.totalDebtAmount > 0 ? formatRupiah(stats.totalDebtAmount) : `${stats.debtCount} Catatan`}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Wishlist Impian</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {stats.totalWishlistAmount > 0 ? formatRupiah(stats.totalWishlistAmount) : `${stats.wishlistCount} Item`}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Category Chips */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul, rincian, atau item checklist..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-2xs transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all' as const, label: 'Semua', icon: '📋' },
            { id: 'shopping' as NoteTag, label: 'Daftar Belanja', icon: '🛒' },
            { id: 'debt' as NoteTag, label: 'Hutang / Piutang', icon: '🤝' },
            { id: 'wishlist' as NoteTag, label: 'Wishlist Impian', icon: '✨' },
            { id: 'budget' as NoteTag, label: 'Rencana Anggaran', icon: '🎯' },
            { id: 'general' as NoteTag, label: 'Catatan Umum', icon: '📝' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Pin size={14} className="fill-current" />
            <span>Disematkan ({pinnedNotes.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
                onToggleChecklistItem={handleToggleChecklist}
                onConvertToTransaction={handleConvertToTransaction}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Notes List */}
      <div className="space-y-3">
        {pinnedNotes.length > 0 && otherNotes.length > 0 && (
          <div className="text-xs font-bold text-slate-500">
            Semua Catatan ({otherNotes.length})
          </div>
        )}

        {filteredNotes.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shadow-inner">
              📝
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {searchQuery || activeCategory !== 'all'
                  ? 'Catatan Tidak Ditemukan'
                  : 'Belum Ada Catatan Keuangan'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery || activeCategory !== 'all'
                  ? 'Coba ganti kata kunci pencarian atau ubah filter kategori di atas.'
                  : 'Gunakan catatan untuk membuat daftar belanja mingguan, mencatat piutang teman, atau rencana anggaran belanja.'}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleCreateNew}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                + Buat Catatan Pertama
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(pinnedNotes.length > 0 ? otherNotes : filteredNotes).map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
                onToggleChecklistItem={handleToggleChecklist}
                onConvertToTransaction={handleConvertToTransaction}
              />
            ))}
          </div>
        )}
      </div>

      {/* Note Form Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        noteToEdit={noteToEdit}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteNoteId !== null}
        onClose={() => setDeleteNoteId(null)}
        onConfirm={confirmDelete}
        title="Hapus Catatan Ini?"
        message="Catatan yang dihapus tidak dapat dipulihkan kembali. Apakah Anda yakin ingin menghapusnya?"
        confirmLabel="Hapus Catatan"
      />
    </div>
  );
};
