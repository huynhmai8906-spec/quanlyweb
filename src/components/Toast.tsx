import React from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-2xl shadow-lg border backdrop-blur-md flex items-start gap-3 transition-all transform translate-y-0 animate-fade-in ${
            toast.type === 'emergency'
              ? 'bg-emergency-red text-white border-red-700 shadow-red-500/20'
              : toast.type === 'warning'
              ? 'bg-amber-600 text-white border-amber-700 shadow-amber-500/20'
              : 'bg-slate-900 text-white border-slate-800 shadow-black/30'
          }`}
        >
          <span className="material-symbols-outlined text-[24px] shrink-0">
            {toast.type === 'emergency'
              ? 'emergency'
              : toast.type === 'warning'
              ? 'warning'
              : 'check_circle'}
          </span>
          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-xs uppercase tracking-wider">{toast.title}</h5>
            <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toast.description}</p>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-white/70 hover:text-white shrink-0 p-1"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
