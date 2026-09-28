import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 max-w-sm w-full animate-fade-up pointer-events-auto"
    >
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all ${
          isSuccess
            ? 'bg-surface/95 border-[#C6D4C9] text-text-primary'
            : isError
            ? 'bg-surface/95 border-red-200 text-text-primary'
            : 'bg-surface/95 border-border-subtle text-text-primary'
        }`}
      >
        {/* Status Icon */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isSuccess
              ? 'bg-[#EDF2EE] text-[#4E6554]'
              : isError
              ? 'bg-red-50 text-red-600'
              : 'bg-[#F3EFEA] text-[#B85D3D]'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-[#364A3C]" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          {toast.title && (
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              {toast.title}
            </h4>
          )}
          <p className="text-xs sm:text-sm text-[#44403C] leading-snug mt-0.5">
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-[#F3EFEA] transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
