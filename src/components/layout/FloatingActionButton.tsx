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
        className="ios-btn ios-btn-primary fab-liquid w-14 h-14 rounded-full flex items-center justify-center shadow-2xl ring-2 ring-white/50 dark:ring-emerald-400/40 cursor-pointer backdrop-blur-md"
      >
        <Plus size={28} strokeWidth={2.8} className="drop-shadow-xs" />
      </button>
    </div>
  );
};
