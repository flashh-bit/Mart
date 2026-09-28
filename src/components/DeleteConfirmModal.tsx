import React, { useEffect } from 'react';
import { Trash2, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { Product } from '../types.js';
import { formatIndianRupees, DEFAULT_PRODUCT_PLACEHOLDER } from '../utils/presets.js';

interface DeleteConfirmModalProps {
  product: Product | null;
  currency?: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  product,
  currency = '₹',
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, isDeleting]);

  if (!product) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-accent/60 backdrop-blur-xs animate-fade-in"
      onClick={() => {
        if (!isDeleting) onCancel();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-surface rounded-2xl border border-border-subtle shadow-2xl p-6 overflow-hidden animate-scale-up space-y-5"
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-background transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 border border-red-200/80 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1 pr-6">
            <h3
              id="delete-dialog-title"
              className="font-serif-display text-xl font-bold text-text-primary"
            >
              Delete Product?
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              This action cannot be undone. This item will be permanently removed from your catalog and will no longer appear on your live store.
            </p>
          </div>
        </div>

        {/* Product Preview Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border-subtle">
          <img
            src={product.imageUrl || DEFAULT_PRODUCT_PLACEHOLDER}
            alt={product.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_PLACEHOLDER;
            }}
            className="w-14 h-14 rounded-lg object-cover bg-[#F3EFEA] border border-border-subtle shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider block truncate">
              {product.category}
            </span>
            <p className="text-sm font-bold text-text-primary truncate leading-snug">
              {product.name}
            </p>
            <p className="text-xs font-semibold text-[#B85D3D] mt-0.5">
              {formatIndianRupees(product.price, currency)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-border-subtle text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-background transition-colors cursor-pointer disabled:opacity-50 touch-target"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-98 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2 touch-target"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
