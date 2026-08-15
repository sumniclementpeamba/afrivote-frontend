'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import {
  Vote, Users, CheckCircle, Clock, BarChart3, Building2, UserPlus, Camera,
  BadgeCheck, TrendingUp, RefreshCw, ChevronRight, Sparkles, ArrowUpRight
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/app/providers';
import { Election, Candidate } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Skeleton loader with pulse glow effect (kept locally for now)
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/60 rounded-2xl ${className}`} />
);

const getMediaUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `path${path}`;
};

// Motion Stagger Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 20 }
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const { data: elections, isLoading: electionsLoading } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => {
      const res = await api.get('/api/elections/');
      return (res.data.results || res.data) as Election[];
    },
    enabled: !isSuperAdmin,
    refetchInterval: 10000,
  });

  const { data: systemStats, isLoading: statsLoading } = useQuery({
    queryKey: ['systemStats'],
    queryFn: async () => {
      const res = await api.get('/api/system-stats/');
      return res.data;
    },
    enabled: isSuperAdmin,
    refetchInterval: 10000,
  });

  const { data: recentCandidates } = useQuery({
    queryKey: ['recent-candidates', isSuperAdmin],
    queryFn: async () => {
      const res = await api.get('/api/candidates/?ordering=-created_at&limit=8');
      return (res.data.results || res.data).slice(0, 8) as Candidate[];
    },
    refetchInterval: 10000,
  });

  const { data: recentUpgrades } = useQuery({
    queryKey: ['recent-upgrades'],
    queryFn: async () => {
      const res = await api.get('/api/subscriptions/recent-upgrades/');
      return res.data;
    },
    enabled: isSuperAdmin,
    refetchInterval: 10000,
  });

  const { data: org } = useQuery({
    queryKey: ['my-organization'],
    queryFn: async () => {
      const res = await api.get('/api/organizations/me/');
      return res.data;
    },
    enabled: !isSuperAdmin && !!user?.organization,
    refetchInterval: 10000,
  });

  const isLoading = isSuperAdmin ? statsLoading : electionsLoading;

  // ── Early return: full‑page skeleton while data loads ──
  if (isLoading) {
    return (
      <div className="space-y-8 relative pb-12">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      </div>
    );
  }

  const stats = isSuperAdmin
    ? {
      total: systemStats?.total_elections || 0,
      active: systemStats?.active_elections || 0,
      completed: systemStats?.completed_elections || 0,
      upcoming: (systemStats?.total_elections || 0) - (systemStats?.active_elections || 0) - (systemStats?.completed_elections || 0),
    }
    : {
      total: elections?.length || 0,
      active: elections?.filter((e: any) => e.status === 'ACTIVE').length || 0,
      completed: elections?.filter((e: any) => e.status === 'COMPLETED').length || 0,
      upcoming: elections?.filter((e: any) => e.status === 'SCHEDULED').length || 0,
    };

  const plan = org?.plan || 'FREE';

  return (
    <div className="space-y-8 relative pb-12 overflow-hidden">
      {/* Animated Ambient Radial Glow Background */}
      <motion.div
        className="absolute -top-24 -left-20 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute top-1/2 -right-20 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none -z-10"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
      />

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              <Sparkles className="w-5 h-5 text-indigo-500" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isSuperAdmin ? 'System Overview' : 'Dashboard Overview'}
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isSuperAdmin ? 'Everything happening across all organizations.' : "Welcome back! Here's what's happening."}
          </p>
        </div>
      </motion.div>

      {/* Plan Info – Org Admin Only */}
      {!isSuperAdmin && org && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          whileHover={{ y: -2 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
        >
          {/* … plan info unchanged … */}
          <div className="flex items-center gap-4 z-10">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className={`p-3.5 rounded-2xl ${plan === 'FREE' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' :
                plan === 'STANDARD' ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800' :
                  'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                }`}
            >
              <BadgeCheck className="w-7 h-7" />
            </motion.div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Plan</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{plan}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800 z-10">
            <div className="text-left md:text-center">
              <p className="text-xs font-semibold text-slate-400">Elections Used</p>
              <p className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                {elections?.length || 0} <span className="text-slate-400 font-normal">/ {org.max_elections}</span>
              </p>
            </div>
            <div className="text-left md:text-center">
              <p className="text-xs font-semibold text-slate-400">Max Voters</p>
              <p className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{org.max_voters}</p>
            </div>
            {plan !== 'ENTERPRISE' && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/dashboard/billing"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-indigo-500/20 transition"
                >
                  <span>Upgrade</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Super Admin System Stats Grid (no inner loading check) */}
      {isSuperAdmin && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
        >
          <motion.div variants={cardVariants} whileHover={{ y: -4 }}>
            <StatCard label="Organizations" value={systemStats?.total_organizations ?? 0} icon={Building2} bgColor="bg-gradient-to-br from-violet-500/10 to-violet-600/5 dark:from-violet-500/20 dark:to-violet-600/10" textColor="text-violet-600 dark:text-violet-400" iconBg="bg-violet-500/10 dark:bg-violet-500/20" />
          </motion.div>
          <motion.div variants={cardVariants} whileHover={{ y: -4 }}>
            <StatCard label="Total Voters" value={systemStats?.total_voters ?? 0} icon={Users} bgColor="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 dark:from-cyan-500/20 dark:to-cyan-600/10" textColor="text-cyan-600 dark:text-cyan-400" iconBg="bg-cyan-500/10 dark:bg-cyan-500/20" />
          </motion.div>
          <motion.div variants={cardVariants} whileHover={{ y: -4 }}>
            <StatCard label="Positions" value={systemStats?.total_positions ?? 0} icon={BarChart3} bgColor="bg-gradient-to-br from-rose-500/10 to-rose-600/5 dark:from-rose-500/20 dark:to-rose-600/10" textColor="text-rose-600 dark:text-rose-400" iconBg="bg-rose-500/10 dark:bg-rose-500/20" />
          </motion.div>
          <motion.div variants={cardVariants} whileHover={{ y: -4 }}>
            <StatCard label="Candidates" value={systemStats?.total_candidates ?? 0} icon={UserPlus} bgColor="bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-500/20 dark:to-amber-600/10" textColor="text-amber-600 dark:text-amber-400" iconBg="bg-amber-500/10 dark:bg-amber-500/20" />
          </motion.div>
        </motion.div>
      )}

      {/* General Election Stats Grid (always shown because isLoading is false) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
      >
        <motion.div variants={cardVariants} whileHover={{ y: -4 }}>
          <StatCard label="Total Elections" value={stats.total} icon={Vote} bgColor="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 dark:from-indigo-500/20 dark:to-indigo-600/10" textColor="text-indigo-600 dark:text-indigo-400" iconBg="bg-indigo-500/10 dark:bg-indigo-500/20" />
        </motion.div>
        <motion.div variants={cardVariants} whileHover={{ y: -4 }}>
          <StatCard label="Active Now" value={stats.active} icon={BarChart3} bgColor="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/20 dark:to-emerald-600/10" textColor="text-emerald-600 dark:text-emerald-400" iconBg="bg-emerald-500/10 dark:bg-emerald-500/20" />
        </motion.div>
        <motion.div variants={cardVariants} whileHover={{ y: -4 }}>
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle} bgColor="bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10" textColor="text-purple-600 dark:text-purple-400" iconBg="bg-purple-500/10 dark:bg-purple-500/20" />
        </motion.div>
        <motion.div variants={cardVariants} whileHover={{ y: -4 }}>
          <StatCard label={isSuperAdmin ? 'Other' : 'Upcoming'} value={stats.upcoming} icon={Clock} bgColor="bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-500/20 dark:to-amber-600/10" textColor="text-amber-600 dark:text-amber-400" iconBg="bg-amber-500/10 dark:bg-amber-500/20" />
        </motion.div>
      </motion.div>

      {/* Recent Candidates Section */}
      {recentCandidates && recentCandidates.length > 0 && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-500" />
              Recent Candidates
            </h2>
            <Link href="/dashboard/candidates" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {recentCandidates.map((candidate) => (
              <motion.div
                key={candidate.id}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/dashboard/candidates/${candidate.id}`)}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group"
              >
                {candidate.photo ? (
                  <div className="relative mb-3">
                    <img
                      src={getMediaUrl(candidate.photo)}
                      alt={candidate.name}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/10 dark:ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all shadow-md"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <UserPlus className="w-8 h-8" />
                  </div>
                )}
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {candidate.name}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {candidate.position_title || candidate.position}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Upgrades – Super Admin Only */}
      {isSuperAdmin && recentUpgrades && recentUpgrades.length > 0 && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Recent Upgrades
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentUpgrades.map((sub: any) => (
              <motion.div
                key={sub.id}
                variants={cardVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 flex items-center gap-4 shadow-sm"
              >
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{sub.organization_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{sub.plan}</span> • {new Date(sub.created_at).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Elections – Org Admin Only (no loading check) */}
      {!isSuperAdmin && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Vote className="w-5 h-5 text-indigo-500" />
              Recent Elections
            </h2>
            <Link href="/dashboard/elections" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections?.slice(0, 6).map((election) => (
              <motion.div
                key={election.id}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/dashboard/elections/${election.id}`)}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <motion.div
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors"
                    >
                      <Vote className="w-6 h-6" />
                    </motion.div>
                    <StatusBadge status={election.status} />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {election.title}
                  </h3>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Start Date</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(election.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">End Date</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(election.end_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}