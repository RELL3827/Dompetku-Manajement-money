import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CurrencyInput } from '../common/CurrencyInput';
import { Plus, Trash2, Split, Sparkles } from 'lucide-react';
import { addSharedSaving, updateSharedSaving } from '../../db/services';
import { db } from '../../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import type { SharedSaving, SharedSavingMember } from '../../types';
import { formatRupiah } from '../../utils/currency';

interface SharedSavingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  savingToEdit?: SharedSaving | null;
}

const PRESET_IDEAS = [
  'Liburan Bareng ke Bali',
  'Patungan Kado Pernikahan',
  'Kas Bulanan Komunitas',
  'Arisan Sahabat',
  'Beli Perlengkapan Bersama',
  'Qurban Bersama',
];

export const SharedSavingFormModal: React.FC<SharedSavingFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  savingToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState(2000000);
  const [targetDate, setTargetDate] = useState('');
  const [walletId, setWalletId] = useState('');
  const [splitEqually, setSplitEqually] = useState(true);
  const [members, setMembers] = useState<Array<{ id: string; name: string; targetAmount: number }>>([
    { id: '1', name: 'Saya', targetAmount: 1000000 },
    { id: '2', name: 'Teman 1', targetAmount: 1000000 },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const wallets = useLiveQuery(() => db.wallets.filter((w) => !w.isArchived).toArray()) || [];

  useEffect(() => {
    if (savingToEdit && isOpen) {
      setTitle(savingToEdit.title);
      setDescription(savingToEdit.description || '');
      setTargetAmount(savingToEdit.targetAmount);
      setTargetDate(savingToEdit.targetDate || '');
      setWalletId(savingToEdit.walletId || '');
      setMembers(
        savingToEdit.members.map((m) => ({
          id: m.id,
          name: m.name,
          targetAmount: m.targetAmount,
        }))
      );
      setSplitEqually(false);
    } else if (isOpen) {
      setTitle('');
      setDescription('');
      setTargetAmount(2000000);
      setTargetDate('');
      setWalletId('');
      setSplitEqually(true);
      setMembers([
        { id: `mem_${Date.now()}_1`, name: 'Saya', targetAmount: 1000000 },
        { id: `mem_${Date.now()}_2`, name: 'Teman 1', targetAmount: 1000000 },
      ]);
    }
    setError('');
  }, [savingToEdit, isOpen]);

  // If split equally is active, recalculate per member target
  const handleRecalculateEqually = (total: number, memList: Array<{ id: string; name: string; targetAmount: number }>) => {
    if (memList.length === 0) return memList;
    const perPerson = Math.round(total / memList.length);
    return memList.map((m) => ({
      ...m,
      targetAmount: perPerson,
    }));
  };

  const handleTargetTotalChange = (val: number) => {
    setTargetAmount(val);
    if (splitEqually) {
      setMembers((prev) => handleRecalculateEqually(val, prev));
    }
  };

  const handleAddMember = () => {
    const newMemberNumber = members.length + 1;
    const newId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const updated = [
      ...members,
      {
        id: newId,
        name: `Anggota ${newMemberNumber}`,
        targetAmount: splitEqually ? Math.round(targetAmount / (members.length + 1)) : 0,
      },
    ];

    if (splitEqually) {
      setMembers(handleRecalculateEqually(targetAmount, updated));
    } else {
      setMembers(updated);
    }
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 1) {
      setError('Minimal harus ada 1 anggota dalam tabungan bersama.');
      return;
    }
    const updated = members.filter((m) => m.id !== id);
    if (splitEqually) {
      setMembers(handleRecalculateEqually(targetAmount, updated));
    } else {
      setMembers(updated);
    }
  };

  const handleMemberNameChange = (id: string, name: string) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, name } : m)));
  };

  const handleMemberAmountChange = (id: string, amt: number) => {
    setSplitEqually(false);
    setMembers((prev) => {
      const next = prev.map((m) => (m.id === id ? { ...m, targetAmount: amt } : m));
      // Auto-update total target to sum of members
      const newTotal = next.reduce((sum, m) => sum + (m.targetAmount || 0), 0);
      setTargetAmount(newTotal);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul tabungan bersama wajib diisi.');
      return;
    }
    if (members.length === 0) {
      setError('Masukkan minimal 1 anggota.');
      return;
    }
    for (const m of members) {
      if (!m.name.trim()) {
        setError('Nama anggota tidak boleh kosong.');
        return;
      }
    }

    try {
      setLoading(true);
      setError('');

      if (savingToEdit) {
        // Retain existing member status where applicable
        const existingMap = new Map(savingToEdit.members.map((m) => [m.id, m]));
        const mergedMembers: SharedSavingMember[] = members.map((m) => {
          const ex = existingMap.get(m.id);
          if (ex) {
            return {
              ...ex,
              name: m.name.trim(),
              targetAmount: m.targetAmount,
            };
          }
          return {
            id: m.id,
            name: m.name.trim(),
            targetAmount: m.targetAmount,
            currentAmount: 0,
            isPaid: false,
          };
        });

        await updateSharedSaving(savingToEdit.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          targetAmount,
          targetDate: targetDate || undefined,
          walletId: walletId || undefined,
          members: mergedMembers,
        });
      } else {
        const newMembers: SharedSavingMember[] = members.map((m) => ({
          id: m.id,
          name: m.name.trim(),
          targetAmount: m.targetAmount,
          currentAmount: 0,
          isPaid: false,
        }));

        await addSharedSaving({
          title: title.trim(),
          description: description.trim() || undefined,
          targetAmount,
          targetDate: targetDate || undefined,
          walletId: walletId || undefined,
          members: newMembers,
        });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan tabungan bersama.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={savingToEdit ? 'Ubah Nabung Bersama' : 'Buat Nabung Bersama / Patungan'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Preset Ideas */}
        {!savingToEdit && (
          <div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
              <Sparkles size={12} className="text-amber-500" />
              <span>Inspirasi Rencana:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_IDEAS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => setTitle(idea)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                    title === idea
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nama Tabungan Bersama *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Liburan ke Bali, Kas Arisan, Kado Sahabat"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Target Total */}
        <div>
          <CurrencyInput
            label="Total Target Dana yang Dikumpulkan (Rp) *"
            value={targetAmount}
            onChange={handleTargetTotalChange}
            placeholder="0"
            required
          />
        </div>

        {/* Target Date & Wallet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Terkumpul (Opsional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dompet Penampung (Opsional)
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Tanpa Dompet Khusus --</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({formatRupiah(w.initialBalance)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Split Mode Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Split size={16} className="text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Bagi Rata Otomatis
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Target total dibagi rata ke {members.length} anggota ({formatRupiah(Math.round(targetAmount / (members.length || 1)))} / orang)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !splitEqually;
              setSplitEqually(next);
              if (next) {
                setMembers(handleRecalculateEqually(targetAmount, members));
              }
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              splitEqually
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {splitEqually ? 'Aktif' : 'Kustom'}
          </button>
        </div>

        {/* Member List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Daftar Anggota & Target Iuran ({members.length})
            </label>
            <button
              type="button"
              onClick={handleAddMember}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Plus size={14} />
              <span>Tambah Orang</span>
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {members.map((m, idx) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    required
                    value={m.name}
                    onChange={(e) => handleMemberNameChange(m.id, e.target.value)}
                    placeholder="Nama anggota"
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div className="w-32 sm:w-36 shrink-0">
                  <div className="relative flex items-center">
                    <span className="absolute left-2 text-[11px] font-bold text-slate-400 select-none">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={m.targetAmount > 0 ? m.targetAmount.toLocaleString('id-ID') : ''}
                      onChange={(e) => {
                        const parsed = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                        handleMemberAmountChange(m.id, parsed);
                      }}
                      placeholder="0"
                      className="w-full pl-8 pr-2 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(m.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                    title="Hapus anggota"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : savingToEdit ? 'Simpan Perubahan' : '+ Buat Nabung Bersama'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
