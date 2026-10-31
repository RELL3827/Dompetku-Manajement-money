import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import {
  Star,
  Send,
  CheckCircle2,
  Copy,
  ExternalLink,
  Bug,
  Lightbulb,
  Heart,
  Palette,
  HelpCircle,
} from 'lucide-react';
import { getActiveStatsEndpoint, detectPlatform } from '../../telemetry/optInStats';
import { APP_VERSION } from '../../utils/version';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackCategory = 'feature' | 'bug' | 'testimonial' | 'uiux' | 'other';

const CATEGORIES: Array<{
  id: FeedbackCategory;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}> = [
  { id: 'feature', label: 'Saran Fitur Baru', icon: Lightbulb, color: 'text-amber-500' },
  { id: 'bug', label: 'Laporan Bug / Kendala', icon: Bug, color: 'text-rose-500' },
  { id: 'testimonial', label: 'Kesan & Pengalaman', icon: Heart, color: 'text-pink-500' },
  { id: 'uiux', label: 'Tampilan & Desain', icon: Palette, color: 'text-purple-500' },
  { id: 'other', label: 'Lainnya', icon: HelpCircle, color: 'text-blue-500' },
];

const RATING_LABELS: Record<number, string> = {
  1: 'Perlu banyak perbaikan 😞',
  2: 'Kurang memuaskan 😐',
  3: 'Cukup bagus 🙂',
  4: 'Sangat bermanfaat & rapi! 😊',
  5: 'Luar biasa! Sangat saya sukai ⭐⭐⭐⭐⭐',
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<FeedbackCategory>('feature');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setRating(5);
    setHoverRating(0);
    setCategory('feature');
    setMessage('');
    setContact('');
    setIsSubmitting(false);
    setSubmitSuccess(false);
    setStatusMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatFeedbackText = () => {
    const catObj = CATEGORIES.find((c) => c.id === category);
    return `*Feedback DompetKu App (v${APP_VERSION})*\n\n` +
      `⭐ Rating: ${rating}/5 (${RATING_LABELS[rating] || ''})\n` +
      `📁 Kategori: ${catObj ? catObj.label : category}\n` +
      `📱 Platform: ${detectPlatform()}\n` +
      (contact.trim() ? `👤 Kontak: ${contact.trim()}\n` : '') +
      `\n💬 Pesan:\n${message.trim()}`;
  };

  // Submit via Server Endpoint if available
  const handleSubmitToServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setStatusMessage('Silakan tuliskan pesan atau saran Anda terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const endpoint = getActiveStatsEndpoint();
    if (endpoint) {
      try {
        const payload = {
          rating,
          category,
          message: message.trim(),
          contact: contact.trim() || undefined,
          app_version: APP_VERSION,
          platform: detectPlatform(),
        };

        const res = await fetch(`${endpoint}/api/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setSubmitSuccess(true);
          setStatusMessage('Terima kasih banyak! Umpan balik Anda telah berhasil dikirimkan ke pengembang.');
          setIsSubmitting(false);
          return;
        }
      } catch {
        // Fallback to offline choices below
      }
    }

    // If no stats endpoint or network failed, give friendly offline success
    setSubmitSuccess(true);
    setStatusMessage('Umpan balik telah disiapkan! Anda juga dapat mengirimkannya langsung lewat GitHub atau WhatsApp di bawah.');
    setIsSubmitting(false);
  };

  // Send via WhatsApp
  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(formatFeedbackText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Send via GitHub Issue
  const handleSendGithub = () => {
    const title = encodeURIComponent(`[Feedback] ${CATEGORIES.find((c) => c.id === category)?.label}: ${message.slice(0, 40)}...`);
    const body = encodeURIComponent(formatFeedbackText());
    window.open(`https://github.com/RELL3827/Dompetku-Manajement-money/issues/new?title=${title}&body=${body}`, '_blank');
  };

  // Copy to Clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatFeedbackText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Beri Umpan Balik & Saran">
      {submitSuccess ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 size={36} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Terima Kasih atas Masukan Anda!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto">
              {statusMessage || 'Setiap saran dan kritik sangat berharga untuk terus menyempurnakan DompetKu.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleSendGithub}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <ExternalLink size={14} />
              <span>Buka di GitHub Issues</span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
            >
              Tutup
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitToServer} className="space-y-4">
          {statusMessage && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
              {statusMessage}
            </div>
          )}

          {/* Star Rating */}
          <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Bagaimana pengalaman Anda menggunakan DompetKu?
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      size={28}
                      className={
                        isFilled
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'text-slate-300 dark:text-slate-600'
                      }
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2">
              {RATING_LABELS[hoverRating || rating]}
            </p>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Topik Umpan Balik
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={16} className={cat.color} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pesan / Saran Anda *
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan pendapat, fitur yang diinginkan, atau kendala yang Anda alami saat menggunakan DompetKu..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Contact (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama atau Kontak (Opsional)
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Email / Telegram / WhatsApp (boleh dikosongkan jika ingin anonim)"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              🔒 Boleh anonim. Kontak hanya digunakan jika Anda mengizinkan kami membalas saran Anda.
            </p>
          </div>

          {/* Quick Alternative Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1"
              >
                <Copy size={13} />
                <span>{copied ? 'Tersalin!' : 'Salin Pesan'}</span>
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1"
              >
                <span>Kirim via WA</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <Send size={14} />
                <span>{isSubmitting ? 'Mengirim...' : 'Kirim Masukan'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
