import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <div className="md:hidden fixed bottom-22 right-4 z-40">
      <button
        type="button"
        onClick={onClick}
        aria-label="Catat transaksi baru"
        className="ios-btn ios-btn-primary w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-600/40 ring-2 ring-white/40 dark:ring-emerald-400/30 cursor-pointer"
      >
        <Plus size={28} strokeWidth={2.8} className="drop-shadow-xs" />
      </button>
    </div>
  );
};
