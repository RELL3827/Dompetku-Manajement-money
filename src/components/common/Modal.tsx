import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

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
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const modalBoxRef = useRef<HTMLDivElement>(null);

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

  // Mobile Bottom Sheet Gesture: Drag down to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only drag when at the very top of content scroll
    const contentDiv = modalBoxRef.current?.querySelector('.overflow-y-auto');
    if (contentDiv && contentDiv.scrollTop > 5) return;

    startYRef.current = e.touches[0].clientY;
    currentYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const dy = e.touches[0].clientY - startYRef.current;
    if (dy > 0) {
      currentYRef.current = e.touches[0].clientY;
      setDragY(dy);
    } else {
      setDragY(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const dy = currentYRef.current - startYRef.current;
    if (dy > 75) {
      triggerHaptic('light');
      onClose();
    }
    setDragY(0);
  };

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
        ref={modalBoxRef}
        style={{
          transform: dragY > 0 ? `translate3d(0, ${dragY}px, 0)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className={`modal-dialog-box w-full ${maxWidthClass} bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-white/60 dark:border-white/10 max-h-[92vh] flex flex-col overflow-hidden ring-1 ring-black/5 dark:ring-white/5 touch-ripple-container`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Drag Handle Pill (Mobile Only Gesture Anchor) */}
        <div
          className="w-full flex justify-center pt-2.5 pb-1 sm:hidden cursor-grab active:cursor-grabbing touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          aria-hidden="true"
        >
          <div className="w-12 h-1.5 rounded-full bg-slate-300/80 dark:bg-slate-700/80 transition-all hover:w-16 hover:bg-emerald-500/60" />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 sm:py-4 border-b border-slate-100/80 dark:border-slate-800/80"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="ios-btn p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 rounded-xl bg-slate-100/70 hover:bg-slate-200/80 dark:bg-slate-800/70 dark:hover:bg-slate-700/80 transition-all cursor-pointer"
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
