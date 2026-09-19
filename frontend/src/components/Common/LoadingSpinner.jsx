export const LoadingSpinner = ({ size = 'md', text = 'Cargando...' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <div
                className={`animate-spin rounded-full border-t-transparent border-cyan-500 ${sizeClasses[size] || sizeClasses.md}`}
            />
            {text && <span className="text-xs font-medium text-slate-400">{text}</span>}
        </div>
    );
};