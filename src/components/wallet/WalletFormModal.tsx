import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CurrencyInput } from '../common/CurrencyInput';
import { IconRenderer, AVAILABLE_WALLET_ICONS, AVAILABLE_COLORS } from '../common/IconRenderer';
import { saveWallet } from '../../db/services';
import type { Wallet, WalletType } from '../../types';

interface WalletFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  walletToEdit?: Wallet | null;
}

export const WalletFormModal: React.FC<WalletFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  walletToEdit,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('bank');
  const [icon, setIcon] = useState('Landmark');
  const [color, setColor] = useState('#10b981');
  const [initialBalance, setInitialBalance] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletToEdit) {
      setName(walletToEdit.name);
      setType(walletToEdit.type);
      setIcon(walletToEdit.icon);
      setColor(walletToEdit.color);
      setInitialBalance(walletToEdit.initialBalance);
    } else {
      setName('');
      setType('cash');
      setIcon('Banknote');
      setColor('#10b981');
      setInitialBalance(0);
    }
    setError('');
  }, [walletToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama dompet tidak boleh kosong');
      return;
    }

    setLoading(true);
    try {
      await saveWallet({
        id: walletToEdit?.id,
        name: name.trim(),
        type,
        icon,
        color,
        initialBalance,
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan dompet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={walletToEdit ? 'Ubah Dompet' : 'Tambah Dompet Baru'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Wallet Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nama Dompet
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Contoh: BCA Utama, Gopay, Dompet Saku"
            maxLength={30}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
          />
          {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        </div>

        {/* Wallet Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tipe Dompet
          </label>
          <select
            value={type}
            onChange={(e) => {
              const newType = e.target.value as WalletType;
              setType(newType);
              if (newType === 'cash') setIcon('Banknote');
              if (newType === 'bank') setIcon('Landmark');
              if (newType === 'ewallet') setIcon('Smartphone');
              if (newType === 'investment') setIcon('TrendingUp');
            }}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:border-emerald-500"
          >
            <option value="cash">Uang Tunai (Cash)</option>
            <option value="bank">Rekening Bank</option>
            <option value="ewallet">E-Wallet (GoPay, OVO, Dana, dll)</option>
            <option value="investment">Investasi / Tabungan</option>
            <option value="other">Lainnya</option>
          </select>
        </div>

        {/* Initial Balance */}
        <CurrencyInput
          value={initialBalance}
          onChange={setInitialBalance}
          label="Saldo Awal Dompet"
          showQuickChips={false}
        />

        {/* Icon & Color Preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: color }}
          >
            <IconRenderer name={icon} size={20} />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {name.trim() || 'Nama Dompet'}
            </span>
            <p className="text-slate-400 capitalize">{type}</p>
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Pilih Ikon
          </label>
          <div className="grid grid-cols-5 gap-2 p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
            {AVAILABLE_WALLET_ICONS.map((iconName) => (
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
                <IconRenderer name={iconName} size={20} />
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
            {loading ? 'Menyimpan...' : 'Simpan Dompet'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
