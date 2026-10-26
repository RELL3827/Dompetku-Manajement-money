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
        className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xl shadow-emerald-600/40 flex items-center justify-center transition-all active:scale-90 hover:scale-105"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>
    </div>
  );
};
