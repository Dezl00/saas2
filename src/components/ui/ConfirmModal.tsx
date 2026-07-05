"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "تأكيد الحذف",
  cancelText = "إلغاء",
  onConfirm,
  onCancel,
  isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Solid Dark Overlay without blur */}
      <div className="absolute inset-0 bg-surface-950/40" onClick={() => !isLoading && onCancel()} />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-none border-2 border-surface-100 animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-error-100 text-error-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h3 className="text-xl font-bold text-surface-950 text-center mb-2">{title}</h3>
        <p className="text-surface-500 text-center mb-8 font-medium">{description}</p>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3.5 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-2xl font-bold transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3.5 bg-error-600 hover:bg-error-700 text-white rounded-2xl font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
