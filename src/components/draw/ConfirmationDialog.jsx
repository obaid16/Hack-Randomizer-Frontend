'use client';

import { AlertTriangle, X } from 'lucide-react';

/**
 * Clean Light-Themed Confirmation Modal.
 */
export default function ConfirmationDialog({
  isOpen = false,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl border border-border shadow-elevated p-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 text-rose-600">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center border border-rose-200">
              <AlertTriangle size={18} />
            </div>
            <h3 className="font-display font-bold text-base text-primaryText">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-secondaryText hover:text-primaryText p-1 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-secondaryText leading-relaxed mb-6 pl-10.5">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-canvas hover:bg-slate-100 text-primaryText text-xs font-semibold border border-border transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs ${
              confirmVariant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-accent hover:bg-accent-hover'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
