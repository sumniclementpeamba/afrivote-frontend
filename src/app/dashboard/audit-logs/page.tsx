'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { FileText, Loader2, Clock, User, Layers, ShieldAlert, Radio } from 'lucide-react';

// Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const tableRowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

export default function AuditLogsPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const res = await api.get('/api/audit-logs/');
      return res.data;
    },
    refetchInterval: 10000, // auto-refresh every 10 seconds
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8 pb-12 relative"
    >
      {/* Background Ambient Glow */}
      <motion.div
        className="absolute -top-10 -right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Audit Logs</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Real-time activity feed and immutable system action tracking
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 px-3.5 py-1.5 rounded-full text-emerald-700 dark:text-emerald-400 text-xs font-bold self-start sm:self-auto">
          <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
          <span>Live Syncing</span>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-[50vh] gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Retrieving audit activity logs...</p>
        </div>
      ) : (
        <motion.div
          variants={tableRowVariants}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800/60 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="px-6 py-4">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time</span>
                  </th>
                  <th className="px-6 py-4">
                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> User</span>
                  </th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">
                    <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Model</span>
                  </th>
                  <th className="px-6 py-4">Object Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium text-slate-600 dark:text-slate-300">
                {logs?.map((log: any) => (
                  <motion.tr
                    key={log.id}
                    variants={tableRowVariants}
                    className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800 dark:text-slate-200">
                      {log.user_email || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${log.action === 'CREATE' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40' :
                          log.action === 'UPDATE' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-900/40' :
                            log.action === 'DELETE' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/40' :
                              'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-md font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                        {log.model_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
                      {log.object_id}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && (!logs || logs.length === 0) && (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <FileText className="w-8 h-8 stroke-1" />
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">No audit logs available</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Actions performed across the system will be recorded here automatically.</p>
        </div>
      )}
    </motion.div>
  );
}