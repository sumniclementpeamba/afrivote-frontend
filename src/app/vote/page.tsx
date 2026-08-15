'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Vote,
  LogOut,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Countdown from '@/components/Countdown';
import PlanBadge from '@/components/PlanBadge'; // you already have this

const getMediaUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `path${path}`;
};

function ElectionCard({
  election,
  votedPositions,
  onVoteSuccess,
}: {
  election: any;
  votedPositions: string[];
  onVoteSuccess: (positionId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const electionActive = election.is_active;

  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ['positions', election.id],
    queryFn: async () => {
      const res = await api.get(`/api/positions/?election_id=${election.id}`);
      return res.data.results || res.data;
    },
    enabled: !!election.id,
  });

  const castVoteMutation = useMutation({
    mutationFn: ({ positionId, candidateId }: { positionId: string; candidateId: string }) =>
      api.post(`/api/elections/${election.id}/vote/`, {
        position: positionId,
        candidate: candidateId,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['voter-elections'] });
      toast.success('Vote recorded!', { icon: '✅' });
      setSubmitting(prev => ({ ...prev, [variables.positionId]: false }));
      onVoteSuccess(variables.positionId);
    },
    onError: (err: any, variables) => {
      toast.error(err.response?.data?.error || 'Vote failed');
      setSubmitting(prev => ({ ...prev, [variables.positionId]: false }));
    },
  });

  const handleVote = (positionId: string) => {
    const candidateId = selectedCandidates[positionId];
    if (!candidateId) {
      toast.error('Please select a candidate');
      return;
    }
    setSubmitting(prev => ({ ...prev, [positionId]: true }));
    castVoteMutation.mutate({ positionId, candidateId });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm mb-8 overflow-hidden"
    >
      <div
        className="flex items-center justify-between p-6 sm:p-8 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {election.title}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <span>{electionActive ? 'Voting ends:' : 'Voting ended'}</span>
            <Countdown targetDate={election.end_date} />
          </p>
        </div>
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-6 sm:px-8 pb-8"
          >
            {!electionActive && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-2xl mb-6 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                This election has ended. You can no longer vote.
              </div>
            )}
            {positionsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-primary" />
              </div>
            ) : positions?.length > 0 ? (
              <div className="space-y-6">
                {positions.map((position: any) => (
                  <PositionCard
                    key={position.id}
                    position={position}
                    selectedCandidates={selectedCandidates}
                    setSelectedCandidates={setSelectedCandidates}
                    submitting={submitting}
                    onVote={handleVote}
                    isVoted={votedPositions.includes(position.id)}
                    electionActive={electionActive}
                  />
                ))}
              </div>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-center py-8 text-xs font-medium">
                No positions defined yet.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PositionCard({
  position,
  selectedCandidates,
  setSelectedCandidates,
  submitting,
  onVote,
  isVoted,
  electionActive,
}: any) {
  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates', position.id],
    queryFn: async () => {
      const res = await api.get(`/api/candidates/?position_id=${position.id}`);
      return res.data.results || res.data;
    },
  });

  return (
    <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60">
      <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4 tracking-tight">
        {position.title}
      </h4>
      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-slate-400 py-4">
          <Loader2 className="h-4 w-4 animate-spin text-primary dark:text-primary" /> Loading candidates...
        </div>
      ) : candidates?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((candidate: any) => {
            const canSelect = electionActive && !isVoted;
            const isSelected = selectedCandidates[position.id] === candidate.id;
            return (
              <motion.label
                key={candidate.id}
                whileHover={canSelect ? { scale: 1.02 } : {}}
                whileTap={canSelect ? { scale: 0.98 } : {}}
                className={`relative flex flex-col items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${isSelected
                  ? 'border-primary dark:border-primary bg-primary/10 dark:bg-primary/20 shadow-md shadow-primary/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 dark:hover:border-primary/50'
                  } ${!canSelect ? 'opacity-70 pointer-events-none' : ''}`}
              >
                <input
                  type="radio"
                  name={`position-${position.id}`}
                  value={candidate.id}
                  checked={isSelected}
                  onChange={() =>
                    setSelectedCandidates((prev: any) => ({
                      ...prev,
                      [position.id]: candidate.id,
                    }))
                  }
                  disabled={!canSelect}
                  className="hidden"
                />
                <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-4 border-slate-100 dark:border-slate-800 shrink-0 shadow-sm">
                  {candidate.photo ? (
                    <img
                      src={getMediaUrl(candidate.photo)}
                      alt={candidate.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center text-primary">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white text-center">
                  {candidate.name}
                </h5>
                {candidate.department && (
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 text-center">
                    {candidate.department}
                  </p>
                )}
                {isSelected && canSelect && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-3 text-primary"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </motion.div>
                )}
              </motion.label>
            );
          })}
        </div>
      ) : (
        <p className="text-slate-400 dark:text-slate-500 text-xs py-4">
          No candidates in this position.
        </p>
      )}

      <div className="mt-6">
        {isVoted ? (
          <div className="w-full py-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Vote Recorded
          </div>
        ) : !electionActive ? (
          <div className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-center font-bold text-xs">
            Voting Ended
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onVote(position.id)}
            disabled={submitting[position.id] || !selectedCandidates[position.id]}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {submitting[position.id] ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Vote...
              </>
            ) : (
              <>
                <Vote className="w-4 h-4" />
                Cast Vote
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default function VoterPage() {
  const { user, loading, logout, plan } = useAuth();
  const router = useRouter();
  const [votedPositions, setVotedPositions] = useState<string[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const { data: elections, isLoading: electionsLoading } = useQuery({
    queryKey: ['voter-elections'],
    queryFn: async () => {
      const res = await api.get('/api/elections/');
      return (res.data.results || res.data).filter((e: any) => e.status === 'ACTIVE');
    },
    enabled: !!user,
  });

  const { data: allPositionsData } = useQuery({
    queryKey: ['all-positions', elections],
    queryFn: async () => {
      if (!elections || elections.length === 0) return [];
      const promises = elections.map((election: any) =>
        api.get(`/api/positions/?election_id=${election.id}`)
      );
      const responses = await Promise.all(promises);
      return responses.map((res: any) => (res.data.results || res.data));
    },
    enabled: !!elections && elections.length > 0,
  });

  const allVoted = useMemo(() => {
    if (!elections || elections.length === 0) return false;
    if (!allPositionsData) return false;
    for (let i = 0; i < elections.length; i++) {
      const positions = allPositionsData[i];
      if (!positions || positions.length === 0) continue;
      for (const pos of positions) {
        if (!votedPositions.includes(pos.id)) {
          return false;
        }
      }
    }
    return elections.length > 0;
  }, [elections, allPositionsData, votedPositions]);

  useEffect(() => {
    if (allVoted) {
      setShowCompletion(true);
      const timer = setTimeout(() => {
        logout();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [allVoted, logout]);

  useEffect(() => {
    if (loading) return;

    if (user) {
      if (user.role !== 'VOTER') {
        router.push('/vote/login');
        return;
      }
      setAuthReady(true);
      return;
    }

    const token = localStorage.getItem('token');
    if (token) {
      return;
    }

    router.push('/vote/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'VOTER') {
      setAuthReady(true);
    }
  }, [user]);

  if (loading || !authReady) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary dark:text-primary" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Verifying session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden">
      {/* Background Glow – uses plan primary color */}
      <motion.div
        className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 dark:bg-primary/15 rounded-full blur-3xl pointer-events-none -z-10"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />

      <AnimatePresence>
        {showCompletion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  All votes recorded!
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Thank you for participating. You will be logged out automatically.
                </p>
              </div>
              <div className="pt-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary dark:text-primary mx-auto" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl text-white shadow-md shadow-primary/20">
            <Vote className="w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            AfriVote
          </span>
          {/* Plan badge (only if not FREE) */}
          {plan && plan !== 'FREE' && (
            <PlanBadge />
          )}
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors py-2 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Active Elections
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Select your preferred candidates and cast your vote.
          </p>
        </motion.div>

        {electionsLoading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary dark:text-primary" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Loading elections...
            </p>
          </div>
        ) : !elections || elections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-16 text-center"
          >
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/60 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
              <Vote className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              No Active Elections
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              There are currently no elections open for voting.
            </p>
          </motion.div>
        ) : (
          elections.map((election: any) => (
            <ElectionCard
              key={election.id}
              election={election}
              votedPositions={votedPositions}
              onVoteSuccess={(positionId: string) =>
                setVotedPositions(prev => [...prev, positionId])
              }
            />
          ))
        )}
      </main>
    </div>
  );
}