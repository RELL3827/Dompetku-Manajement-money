import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <div className="md:hidden fixed bottom-20 right-4 z-40">
      <button
        type="button"
        onClick={onClick}
        aria-label="Catat transaksi baru"
        className="btn-glow-emerald w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-600/40 ring-2 ring-white/30 dark:ring-slate-900/40 cursor-pointer"
      >
        <Plus size={28} strokeWidth={2.8} className="drop-shadow-xs" />
      </button>
    </div>
  );
};
