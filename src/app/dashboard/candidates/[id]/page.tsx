'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  ArrowLeft, User, Mail, Briefcase, Loader2, Award,
  BarChart3, BookOpen, Quote, Phone, Vote
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from '@/components/StatusBadge';
import Skeleton from '@/components/Skeleton';

const getMediaUrl = (path: string | null | undefined): string => {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http')) return path;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  return `${apiBase}${path}`;
};

// Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20 }
  },
};

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: candidate, isLoading, isError } = useQuery({
    queryKey: ['candidate', id],
    queryFn: async () => {
      const res = await api.get(`/api/candidates/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <Skeleton className="h-6 w-32" />
        <div className="bg-white/80 dark:bg-slate-900/80 p-8 rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Skeleton className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-4 border border-rose-100 dark:border-rose-900/40">
          <User className="w-8 h-8" />
        </div>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Candidate not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          Return Back
        </button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto space-y-8 pb-12 relative"
    >
      <motion.div
        className="absolute -top-10 -left-10 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />

      <motion.div variants={itemVariants}>
        <motion.button
          onClick={() => router.back()}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 text-xs font-bold shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Candidates
        </motion.button>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden"
      >
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8 sm:p-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
            {candidate.photo || candidate.photo_url ? (
              <img
                src={candidate.photo_url || getMediaUrl(candidate.photo)}
                alt={candidate.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-white/20 shadow-2xl shrink-0"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white/10 backdrop-blur-md ring-4 ring-white/20 flex items-center justify-center shrink-0">
                <User className="w-14 h-14 text-white/80" />
              </div>
            )}

            <div className="space-y-2">
              <div className="inline-block">
                <StatusBadge status={candidate.is_active ? 'ACTIVE' : 'INACTIVE'} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{candidate.name}</h1>
              <p className="text-indigo-100 font-semibold text-sm flex items-center justify-center sm:justify-start gap-1.5">
                <Award className="w-4 h-4 text-indigo-200" />
                <span>{candidate.position_title || candidate.position}</span>
              </p>
              {candidate.election_title && (
                <p className="text-indigo-200/80 font-medium text-xs flex items-center justify-center sm:justify-start gap-1.5">
                  <Vote className="w-3.5 h-3.5" />
                  <span>{candidate.election_title}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3 p-3.5 bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Mail className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</p>
              <p className="text-xs font-semibold truncate">{candidate.email || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300">
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600 dark:text-purple-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</p>
              <p className="text-xs font-semibold truncate">{candidate.department || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Phone className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</p>
              <p className="text-xs font-semibold truncate">{candidate.phone || '—'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {candidate.biography && (
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Biography</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">
                {candidate.biography}
              </p>
            </div>
          </motion.div>
        )}

        {candidate.manifesto && (
          <motion.div
            variants={itemVariants}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                  <Quote className="w-4 h-4" />
                </div>
                <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Manifesto</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">
                {candidate.manifesto}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8"
      >
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Vote Statistics</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Live turnout metric for this candidate</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
          <div className="text-center sm:text-left shrink-0">
            <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{candidate.vote_count}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total Votes</p>
          </div>

          <div className="w-full flex-1">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              <span>Overall Share</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-black">{candidate.vote_percentage}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-300/30 dark:border-slate-700/50">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${candidate.vote_percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}