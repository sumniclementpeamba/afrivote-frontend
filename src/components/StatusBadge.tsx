interface StatusBadgeProps {
  status: string;
}

const statusConfigs: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE: { bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/60 dark:border-emerald-800/40', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  COMPLETED: { bg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200/60 dark:border-blue-800/40', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  SCHEDULED: { bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200/60 dark:border-amber-800/40', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  DRAFT: { bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', text: 'text-slate-600 dark:text-slate-300', dot: 'bg-slate-400' },
  CANCELLED: { bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200/60 dark:border-rose-800/40', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
  PENDING: { bg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200/60 dark:border-purple-800/40', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
  SUSPENDED: { bg: 'bg-orange-50 dark:bg-orange-950/50 border-orange-200/60 dark:border-orange-800/40', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfigs[status] || statusConfigs.DRAFT;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} transition-all`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}