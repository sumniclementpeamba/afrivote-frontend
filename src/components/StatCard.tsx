'use client';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  bgColor?: string;
  textColor?: string;
  iconBg?: string;
}

export default function StatCard({ label, value, icon: Icon, bgColor, textColor, iconBg }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 ${bgColor || ''}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3.5 rounded-2xl shrink-0 ${iconBg || 'bg-indigo-50 dark:bg-indigo-950/80'}`}>
          <Icon className={`w-6 h-6 ${textColor || 'text-indigo-600 dark:text-indigo-400'}`} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-0.5">{label}</p>
          <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${textColor || 'text-slate-900 dark:text-white'}`}>{value}</p>
        </div>
      </div>
    </motion.div>
  );
}