export default function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div
            className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/60 rounded-2xl ${className}`}
        />
    );
}