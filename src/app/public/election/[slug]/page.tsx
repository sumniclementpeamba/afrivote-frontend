'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check, Loader2, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

// ─── Media URL Helper ────────────────────────────────────────────────────────
const getMediaUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  return `${baseUrl}${path}`;
};

// ─── Motion variants ─────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

const cardHover = {
  rest: { scale: 1, boxShadow: '0 4px 20px rgba(79,70,229,0.05)' },
  hover: { scale: 1.02, boxShadow: '0 24px 48px rgba(79,70,229,0.12)' },
};

export default function PublicPaidElectionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const electionSlug = params.slug as string;

  const [election, setElection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selections, setSelections] = useState<Record<string, { candidateId: string; votes: number }>>({});
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const fetchElection = async () => {
    try {
      const res = await api.get(`/api/public/elections/slug/${electionSlug}/`);
      setElection(res.data);
      setError('');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.detail || err.message;
      setError(msg || 'Failed to load election');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchElection();
  }, [electionSlug]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchElection();
    }, 5000);

    return () => clearInterval(interval);
  }, [electionSlug]);

  // Payment verification effect
  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference && election?.id && !verifying) {
      verifyPayment(reference);
    }
  }, [searchParams, election?.id, verifying]);

  const verifyPayment = async (reference: string) => {
    if (!election?.id || verifying) return;
    setVerifying(true);
    try {
      await api.post(`/api/${election.id}/verify-paid-vote/`, { reference });
      toast.success('Votes credited successfully!');
      await fetchElection();
      window.history.replaceState({}, '', `/public/election/${electionSlug}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Payment verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleCandidateSelect = (positionId: string, candidateId: string) => {
    setSelections((prev) => ({
      ...prev,
      [positionId]: {
        candidateId,
        votes: prev[positionId]?.votes || 1,
      },
    }));
  };

  const handleVotesChange = (positionId: string, votes: number) => {
    setSelections((prev) => ({
      ...prev,
      [positionId]: {
        ...prev[positionId],
        votes,
      },
    }));
  };

  const totalVotes = Object.values(selections).reduce((sum, sel) => sum + sel.votes, 0);
  const totalAmount = totalVotes * parseFloat(election?.vote_price || '0');

  const handlePay = async () => {
    if (!election) return;
    const items = Object.entries(selections).map(([, sel]) => ({
      candidate_id: sel.candidateId,
      votes: sel.votes,
    }));
    if (items.length === 0) {
      toast.error('Please select at least one candidate');
      return;
    }
    setPaying(true);
    try {
      const res = await api.post(`/api/${election.id}/initiate-paid-vote/`, {
        items,
      });
      window.location.href = res.data.url;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <p className="text-red-500 font-bold text-lg mb-2">Error loading election</p>
        <p className="text-slate-600 text-sm">{error}</p>
        <button onClick={fetchElection} className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-xl">
          Retry
        </button>
      </div>
    );
  }

  if (!election) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Election not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Decorative background orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-300/20 to-purple-300/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-300/10 to-indigo-300/20 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Top mini navbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black text-indigo-600 dark:text-white tracking-tight">AfriVote</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Election Header */}
          <motion.div variants={itemVariants} className="text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{election.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto md:mx-0">{election.description}</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-full text-sm font-bold">
              💰 Paid Voting – GH₵ {election.vote_price} per vote
            </div>
          </motion.div>

          {/* Positions */}
          {election.positions.map((position: any) => {
            const maxVotes = Math.max(
              ...position.candidates.map((c: any) => c.vote_count),
              0
            );

            return (
              <motion.section key={position.id} variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="h-8 w-1 bg-indigo-500 rounded-full" />
                  {position.title}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {position.candidates.map((candidate: any) => {
                    const isSelected = selections[position.id]?.candidateId === candidate.id;
                    const percentage = maxVotes > 0 ? (candidate.vote_count / maxVotes) * 100 : 0;

                    return (
                      <motion.div
                        key={candidate.id}
                        variants={cardHover}
                        initial="rest"
                        whileHover="hover"
                        animate={isSelected ? { scale: 1.02, boxShadow: '0 0 0 2px #6366f1, 0 24px 48px rgba(79,70,229,0.12)' } : undefined}
                        onClick={() => handleCandidateSelect(position.id, candidate.id)}
                        className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {candidate.photo && (
                            <img
                              src={getMediaUrl(candidate.photo)}
                              alt={candidate.name}
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white shadow-md"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white truncate">{candidate.name}</p>
                            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                              {candidate.vote_count} votes
                            </p>
                            {/* Live progress bar */}
                            <div className="mt-2 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                              />
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>

                        {isSelected && (
                          <div className="mt-4 pl-24 sm:pl-28">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Votes</label>
                            <select
                              value={selections[position.id]?.votes || 1}
                              onChange={(e) => handleVotesChange(position.id, parseInt(e.target.value))}
                              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              {[1, 2, 5, 10, 20, 50].map((n) => (
                                <option key={n} value={n}>
                                  {n} vote{n > 1 ? 's' : ''} – GH₵ {n * parseFloat(election.vote_price)}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            );
          })}

          {/* Summary & Pay Button */}
          <motion.div variants={itemVariants} className="sticky bottom-4 z-20">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Votes: <span className="text-slate-900 dark:text-white">{totalVotes}</span></p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">GH₵ {totalAmount.toFixed(2)}</p>
                </div>
                <button
                  onClick={handlePay}
                  disabled={totalVotes === 0 || paying || verifying}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:pointer-events-none transition-all active:scale-95"
                >
                  {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Vote Now'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* No separate "Most Voted" section – bars are now integrated into candidate cards */}
        </motion.div>
      </main>
    </div>
  );
}