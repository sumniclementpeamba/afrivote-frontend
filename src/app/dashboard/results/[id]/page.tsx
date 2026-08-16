'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  ArrowLeft,
  BarChart3,
  VoteIcon,
  Users,
  Loader2,
  FileDown,
  Share2,
  AlertCircle,
  Crown,
  TrendingUp,
  Copy,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import AnimatedVoteCount from '@/components/AnimatedVoteCount';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useAuth } from '@/app/providers';
import { useState } from 'react';
import Skeleton from '@/components/Skeleton';
export const dynamic = 'force-dynamic'; // <-- ADD THIS

const getMediaUrl = (path: string | null | undefined): string => {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http')) return path;
  return path; // relative path – Next.js proxy handles /media
};

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f59e0b', '#14b8a6'];

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
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
};

export default function ResultsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { plan } = useAuth();
  const isEnterprise = plan === 'ENTERPRISE';
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const { data: results, isLoading, isError } = useQuery({
    queryKey: ['election-results', id],
    queryFn: async () => {
      const res = await api.get(`/api/elections/${id}/results/`);
      return res.data;
    },
    refetchInterval: 1000,
    enabled: !!id,
  });

  const { data: timeline } = useQuery({
    queryKey: ['vote-timeline', id],
    queryFn: async () => {
      const res = await api.get(`/api/elections/${id}/vote_timeline/`);
      return res.data;
    },
    refetchInterval: 10000,
    enabled: isEnterprise && !!id,
  });

  const handleDownload = (format: 'pdf' | 'csv' | 'json') => {
    if (!id) return;
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to download.');
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    window.open(
      `${apiBase}/api/elections/${id}/results_${format}/?token=${token}`,
      '_blank'
    );
  };

  const handleShare = async () => {
    if (!id || !results) return;
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to share results.');
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    if (isEnterprise) {
      try {
        toast.loading('Generating public link...');
        const res = await api.post(`/api/elections/${id}/enable_sharing/`);
        const shareLink = res.data.share_url;
        setShareUrl(shareLink);
        toast.success('Public link generated! Click Copy to share.');
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to create share link');
      } finally {
        toast.dismiss();
      }
    } else {
      const pdfUrl = `${apiBase}/api/elections/${id}/results_pdf/?token=${token}`;
      try {
        toast.loading('Preparing PDF...');
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error('Failed to generate PDF');
        const blob = await response.blob();
        const filename = `${results.election_title.replace(/\s+/g, '_')}_results.pdf`;
        const file = new File([blob], filename, { type: 'application/pdf' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: results.election_title, files: [file] });
          toast.success('Results shared!');
        } else {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success('PDF downloaded – you can now share it manually.');
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          toast.error('Could not share results. Please try again.');
        }
      } finally {
        toast.dismiss();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-64" />
        <div className="bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 rounded-3xl space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-72" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  if (isError || !results) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-3xl text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
        <p className="text-base font-bold text-rose-700 dark:text-rose-400">Failed to load election results</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          Back to Results
        </button>
      </div>
    );
  }

  const totalVotes = results.total_votes_cast || 0;
  const eligibleVoters = results.eligible_voters || 0;
  const remaining = Math.max(0, eligibleVoters - totalVotes);
  const turnoutPercent = eligibleVoters > 0 ? Math.round((totalVotes / eligibleVoters) * 100) : 0;
  const electionStatus = results.status;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-8 pb-12 relative"
    >
      <motion.div
        className="absolute -top-10 -right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />

      <motion.div variants={itemVariants}>
        <motion.button
          onClick={() => router.back()}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 text-xs font-bold shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Results
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              electionStatus === 'ACTIVE'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${electionStatus === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {electionStatus === 'ACTIVE' ? 'Live Feed' : 'Final Results'}
            </span>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">• Status: {electionStatus}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{results.election_title}</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Total votes cast: <span className="font-bold text-indigo-600 dark:text-indigo-400"><AnimatedVoteCount count={totalVotes} /></span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-white rounded-xl shadow-lg transition-all text-xs font-bold ${
              isEnterprise ? 'bg-green-600 hover:bg-green-500 shadow-green-600/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" /> {isEnterprise ? 'Public Link' : 'Share'}
          </motion.button>

          {shareUrl && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const textarea = document.createElement('textarea');
                textarea.value = shareUrl!;
                document.body.appendChild(textarea);
                textarea.select();
                try {
                  document.execCommand('copy');
                  toast.success('Link copied!');
                } catch (err) {
                  toast.error('Copy failed – please copy manually');
                }
                document.body.removeChild(textarea);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Link
            </motion.button>
          )}

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleDownload('pdf')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl transition-all text-xs font-bold"
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-400" /> PDF
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleDownload('csv')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-all text-xs font-bold"
          >
            <FileDown className="w-3.5 h-3.5" /> CSV
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleDownload('json')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-600/20 transition-all text-xs font-bold"
          >
            <FileDown className="w-3.5 h-3.5" /> JSON
          </motion.button>
        </div>
      </motion.div>

      {/* Voter Turnout Scoreboard (unchanged) */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Voter Turnout</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Overall turnout breakdown and completion metrics</p>
            </div>
          </div>
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/50">
            {turnoutPercent}% Completed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/40 rounded-2xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-300">
              <AnimatedVoteCount count={eligibleVoters} />
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-500/80 dark:text-indigo-400/80 mt-1">Eligible Voters</p>
          </div>
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40 rounded-2xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300">
              <AnimatedVoteCount count={totalVotes} />
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-500/80 dark:text-emerald-400/80 mt-1">Votes Cast</p>
          </div>
          <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100/80 dark:border-amber-900/40 rounded-2xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-300">
              <AnimatedVoteCount count={remaining} />
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-500/80 dark:text-amber-400/80 mt-1">Remaining</p>
          </div>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/50">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, turnoutPercent)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3 text-center">
          <AnimatedVoteCount count={totalVotes} /> of <AnimatedVoteCount count={eligibleVoters} /> voters participated ({turnoutPercent}%)
        </p>
      </motion.div>

      {/* Zero Votes State (unchanged) */}
      {totalVotes === 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-12 text-center"
        >
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <VoteIcon className="w-8 h-8 stroke-1" />
          </div>
          <p className="text-4xl font-black text-slate-300 dark:text-slate-700 mb-1">0</p>
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">No votes have been cast yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Results will update automatically in real-time when ballots are submitted.</p>
        </motion.div>
      )}

      {/* ENTERPRISE ONLY: Votes Over Time */}
      {isEnterprise && timeline && timeline.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Votes Over Time</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Hourly accumulation of votes during the election</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="votes"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 3, fill: '#6366f1' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Charts Section */}
      {totalVotes > 0 && results.positions?.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Visual Results</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {results.positions.map((position: any) => {
              const chartData = position.candidates.map((c: any) => ({
                name: c.name,
                votes: c.vote_count,
              }));

              return (
                <div
                  key={position.position_id}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8"
                >
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                    {position.title}
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Positions & Candidates (Original Cards) */}
      {results.positions?.map((position: any) => {
        return (
          <motion.div
            key={position.position_id}
            variants={itemVariants}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{position.title}</h2>
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                {position.total_votes} vote{position.total_votes !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {position.candidates.map((candidate: any) => {
                const percentage = candidate.percentage || 0;
                const isWinner = candidate.is_winner;
                const isLeading = candidate.is_leading;
                const highlight = isWinner || isLeading;
                const ringColor = isWinner
                  ? 'ring-amber-300 dark:ring-amber-500/50'
                  : isLeading
                    ? 'ring-blue-300 dark:ring-blue-500/50'
                    : 'ring-white dark:ring-slate-800';

                return (
                  <motion.div
                    key={candidate.candidate_id}
                    whileHover={{ y: -6 }}
                    className={`bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl p-6 border transition-all relative flex flex-col justify-between ${
                      highlight
                        ? `ring-2 ${ringColor} border-amber-300 dark:border-amber-500/50 shadow-lg shadow-amber-500/10`
                        : 'border-slate-200/60 dark:border-slate-800'
                    }`}
                  >
                    {highlight && (
                      <div className={`absolute -top-3 -right-3 rounded-2xl p-2 shadow-lg z-10 ${
                        isWinner
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-amber-500/20'
                          : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-blue-500/20'
                      }`}>
                        <Crown className="w-4 h-4 fill-current" />
                      </div>
                    )}

                    <div className="flex flex-col items-center text-center mb-5">
                      <img
                        src={getMediaUrl(candidate.photo)}
                        alt={candidate.name}
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-md mb-3 ring-4 ${ringColor}`}
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.png';
                          e.currentTarget.onerror = null;
                        }}
                      />
                      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1">{candidate.name}</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                          <AnimatedVoteCount count={candidate.vote_count || 0} />
                        </span>
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">total votes</span>
                      </div>
                    </div>

                    <div>
                      <div className="w-full h-2.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                        <motion.div
                          className={`h-full rounded-full ${
                            isWinner
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                              : isLeading
                                ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>Vote Share</span>
                        <span className="text-slate-900 dark:text-slate-100 font-black">{percentage}%</span>
                      </div>

                      {isWinner && (
                        <div className="mt-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-full text-xs font-black border border-amber-200/80 dark:border-amber-900/50">
                            <Crown className="w-3 h-3 text-amber-500" /> Winner
                          </span>
                        </div>
                      )}
                      {isLeading && (
                        <div className="mt-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 rounded-full text-xs font-black border border-blue-200/80 dark:border-blue-900/50">
                            <Crown className="w-3 h-3 text-blue-500" /> Leading
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}