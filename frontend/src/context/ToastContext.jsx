import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all animate-slide-up ${
                            toast.type === 'error'
                                ? 'bg-rose-950/90 border-rose-800 text-rose-200'
                                : toast.type === 'success'
                                    ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
                                    : toast.type === 'warning'
                                        ? 'bg-amber-950/90 border-amber-800 text-amber-200'
                                        : 'bg-slate-900/90 border-slate-800 text-cyan-200'
                        }`}
                    >
                        <div className="flex items-start gap-2.5">
              <span className="text-base select-none">
                {toast.type === 'error' && '🚫'}
                  {toast.type === 'success' && '✅'}
                  {toast.type === 'warning' && '⏳'}
                  {toast.type === 'info' && 'ℹ️'}
              </span>
                            <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-slate-400 hover:text-white text-xs font-bold transition-colors ml-2"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast debe ser utilizado dentro de un ToastProvider');
    }
    return context;
};