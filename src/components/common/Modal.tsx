import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className={`modal-dialog-box w-full ${maxWidthClass} bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-700/70 max-h-[92vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100/80 dark:border-slate-800/80">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="btn-tactile p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
