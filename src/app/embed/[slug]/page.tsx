'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Loader2, Users, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

const getMediaUrl = (path: string | null | undefined) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  return `${baseUrl}${path}`;
};

export default function EmbedLeaderboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const [election, setElection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchElection = async () => {
    try {
      const res = await api.get(`/api/public/elections/slug/${slug}/`);
      setElection(res.data);
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElection();
  }, [slug]);

  useEffect(() => {
    const interval = setInterval(fetchElection, 5000);
    return () => clearInterval(interval);
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] bg-transparent">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!election) {
    return (
      <div className="flex items-center justify-center min-h-[300px] bg-transparent text-sm text-slate-400">
        Election not found
      </div>
    );
  }

  return (
    <div className="bg-transparent p-4 sm:p-6 font-sans text-slate-900 dark:text-white">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white truncate">{election.title}</h2>
            <p className="text-xs text-indigo-200">{election.organization_name || ''}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-ping" /> LIVE
          </span>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {election.positions.map((position: any) => {
            const maxVotes = Math.max(...position.candidates.map((c: any) => c.vote_count), 0);
            const sortedCandidates = position.candidates.slice().sort((a: any, b: any) => b.vote_count - a.vote_count);

            return (
              <div key={position.id}>
                <h3 className="font-black text-base text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  {position.title}
                </h3>
                <div className="space-y-4">
                  {sortedCandidates.map((candidate: any, idx: number) => {
                    const percentage = maxVotes > 0 ? (candidate.vote_count / maxVotes) * 100 : 0;
                    const isLeader = idx === 0 && candidate.vote_count > 0;

                    return (
                      <div
                        key={candidate.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl border ${
                          isLeader
                            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700'
                        }`}
                      >
                        <div className="relative shrink-0">
                          {candidate.photo ? (
                            <img
                              src={getMediaUrl(candidate.photo)}
                              alt={candidate.name}
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white shadow-md"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-500 font-black text-2xl">
                              {candidate.name.charAt(0)}
                            </div>
                          )}
                          {isLeader && (
                            <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow">
                              <Crown className="w-4 h-4 text-white" />
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-200 truncate">
                              {candidate.name}
                            </span>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 ml-2 whitespace-nowrap">
                              {candidate.vote_count} votes
                            </span>
                          </div>
                          <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className={`h-full rounded-full ${
                                isLeader
                                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                                  : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}