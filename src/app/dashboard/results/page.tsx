'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart3, Loader2, TrendingUp, Calendar, AlertCircle, ArrowRight } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import Skeleton from '@/components/Skeleton';   // <-- new import
import { Election } from '@/types';
export const dynamic = 'force-dynamic'; // <-- ADD THIS

export default function ResultsListPage() {
  const router = useRouter();

  const { data: elections, isLoading, isError } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => {
      const res = await api.get('/api/elections/');
      return (res.data.results || res.data) as Election[];
    },
  });

  const availableElections = elections?.filter(
    (e) => e.status === 'ACTIVE' || e.status === 'COMPLETED'
  );

  const isPastDue = (election: Election) =>
    election.status === 'ACTIVE' && new Date(election.end_date).getTime() < Date.now();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 10 } },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 relative">
      {/* Background Ambient Glow */}
      <motion.div
        className="absolute -top-10 -right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Election Results</h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          View real‑time analytics and archived outcome reports for active and past elections
        </p>
      </div>

      {isLoading ? (
        // Skeleton cards grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-3xl text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
          <p className="text-base font-bold text-rose-700 dark:text-rose-400">Failed to load elections</p>
          <p className="text-xs text-rose-500 dark:text-rose-400/80 mt-1">Please check your network connection and try again.</p>
        </div>
      ) : availableElections?.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <BarChart3 className="w-8 h-8 stroke-1" />
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">No active or completed elections yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Results will automatically appear here once an election becomes active or completes.
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {availableElections.map((election) => {
            const pastDue = isPastDue(election);
            return (
              <motion.div
                key={election.id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
                onClick={() => router.push(`/dashboard/results/${election.id}`)}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer relative group overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-start gap-3.5 mb-5">
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-md shadow-indigo-500/20 text-white shrink-0"
                    >
                      <TrendingUp className="w-5 h-5" />
                    </motion.div>
                    <div className="overflow-hidden">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1">{election.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <StatusBadge status={election.status} />
                        {pastDue && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/50">
                            <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                            Past Due
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-slate-400"><Calendar className="w-3.5 h-3.5" /> Start</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{new Date(election.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-slate-400"><Calendar className="w-3.5 h-3.5" /> End</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{new Date(election.end_date).toLocaleDateString()}</span>
                    </div>
                    {election.total_votes !== undefined && (
                      <div className="flex justify-between items-center border-t border-slate-200/60 dark:border-slate-700/50 pt-2 mt-1">
                        <span className="flex items-center gap-1.5 text-slate-400"><BarChart3 className="w-3.5 h-3.5" /> Votes</span>
                        <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">{election.total_votes}</span>
                      </div>
                    )}
                  </div>

                  {pastDue && (
                    <div className="flex items-start gap-1.5 p-2.5 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl mt-3">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400/90 leading-tight">
                        This election is past its end date. Consider ending it manually to archive it.
                      </p>
                    </div>
                  )}
                </div>

                <motion.div className="mt-5 flex justify-end relative z-10" whileHover={{ x: 3 }}>
                  <span className="text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 text-xs font-bold flex items-center gap-1.5">
                    View Results <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}