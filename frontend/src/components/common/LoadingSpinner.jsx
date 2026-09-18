import React from 'react';

export const LoadingSpinner = ({ text = 'Cargando información...', size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4'
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 gap-3 select-none">
            <div
                className={`${sizeClasses[size]} border-slate-700 border-t-cyan-400 rounded-full animate-spin`}
            />
            {text && <span className="text-xs font-medium text-slate-400 animate-pulse">{text}</span>}
        </div>
    );
};