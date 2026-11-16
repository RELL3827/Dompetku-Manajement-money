import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <div className="md:hidden fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] z-40">
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
