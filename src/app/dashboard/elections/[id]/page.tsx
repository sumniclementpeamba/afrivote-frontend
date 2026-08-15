'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Plus, UserPlus, X, Loader2, Vote, Briefcase,
  Users, Upload, GripVertical, Sparkles, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '@/components/StatusBadge';
import ReorderCandidatesModal from '@/components/ReorderCandidatesModal';

const getMediaUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `path${path}`;
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
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20 }
  },
};

export default function ElectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPosition, setNewPosition] = useState({ title: '', max_selections: 1 });
  const [addingCandidateFor, setAddingCandidateFor] = useState<string | null>(null);
  const [newCandidate, setNewCandidate] = useState({
    name: '', department: '', email: '', photo: null as File | null,
  });

  const { data: election, isLoading: electionLoading } = useQuery({
    queryKey: ['election', id],
    queryFn: async () => {
      const res = await api.get(`/api/elections/${id}/`);
      return res.data;
    },
    enabled: !!id,
  });

  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ['positions', id],
    queryFn: async () => {
      const res = await api.get(`/api/positions/?election_id=${id}`);
      return res.data.results || res.data;
    },
    enabled: !!id,
  });

  const canEdit = election?.status === 'DRAFT' || election?.status === 'SCHEDULED';

  const addPositionMutation = useMutation({
    mutationFn: (data: typeof newPosition) =>
      api.post('/api/positions/', { ...data, election: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions', id] });
      toast.success('Position added');
      setShowAddPosition(false);
      setNewPosition({ title: '', max_selections: 1 });
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to add position'),
  });

  const addCandidateMutation = useMutation({
    mutationFn: async ({ positionId, data }: { positionId: string; data: typeof newCandidate }) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('position', positionId);
      if (data.department) formData.append('department', data.department);
      if (data.email) formData.append('email', data.email);
      if (data.photo) formData.append('photo', data.photo);
      return api.post('/api/candidates/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', addingCandidateFor] });
      toast.success('Candidate added');
      setAddingCandidateFor(null);
      setNewCandidate({ name: '', department: '', email: '', photo: null });
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to add candidate'),
  });

  if (electionLoading || positionsLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading details...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8 pb-12 relative"
    >
      {/* Background Ambient Glow */}
      <motion.div
        className="absolute -top-10 -left-10 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />

      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <motion.button
          onClick={() => router.back()}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </motion.button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{election?.title}</h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            <Vote className="w-3.5 h-3.5 text-indigo-500" />
            <span>{election?.election_type}</span>
            <span>•</span>
            <StatusBadge status={election?.status} />
          </div>
        </div>
      </motion.div>

      {/* Positions Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Positions
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">Manage voting positions and assign candidates</p>
            </div>
          </div>

          {canEdit && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddPosition(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20 transition-all text-xs font-bold"
            >
              <Plus className="w-4 h-4" /> Add Position
            </motion.button>
          )}
        </div>

        {positions?.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Briefcase className="w-8 h-8 stroke-1" />
            </div>
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">No positions yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Add a position to start configuring this election.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {positions?.map((position: any) => (
              <PositionCard
                key={position.id}
                position={position}
                onAddCandidate={() => setAddingCandidateFor(position.id)}
                router={router}
                canEdit={canEdit}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Position Modal */}
      <AnimatePresence>
        {showAddPosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Add Position</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Specify title and allowed selection limit</p>
                </div>
                <button
                  onClick={() => setShowAddPosition(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); addPositionMutation.mutate(newPosition); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Title</label>
                  <input
                    type="text"
                    value={newPosition.title}
                    onChange={e => setNewPosition({ ...newPosition, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Max Selections</label>
                  <input
                    type="number"
                    min={1}
                    value={newPosition.max_selections}
                    onChange={e => setNewPosition({ ...newPosition, max_selections: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddPosition(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={addPositionMutation.isPending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all text-xs disabled:opacity-50"
                  >
                    {addPositionMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Position'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Candidate Modal */}
      <AnimatePresence>
        {addingCandidateFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Add Candidate</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Register a candidate for this position</p>
                </div>
                <button
                  onClick={() => setAddingCandidateFor(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addCandidateMutation.mutate({ positionId: addingCandidateFor, data: newCandidate });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Name</label>
                  <input
                    type="text"
                    value={newCandidate.name}
                    onChange={e => setNewCandidate({ ...newCandidate, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Department</label>
                  <input
                    type="text"
                    value={newCandidate.department}
                    onChange={e => setNewCandidate({ ...newCandidate, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    value={newCandidate.email}
                    onChange={e => setNewCandidate({ ...newCandidate, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Photo</label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors">
                      <Upload className="w-4 h-4 text-slate-400" />
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setNewCandidate({ ...newCandidate, photo: e.target.files?.[0] || null })}
                      />
                    </label>
                    {newCandidate.photo && (
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate max-w-[180px]">
                        {newCandidate.photo.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setAddingCandidateFor(null)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={addCandidateMutation.isPending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all text-xs disabled:opacity-50"
                  >
                    {addCandidateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Candidate'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// -------- PositionCard component (with canEdit prop) --------
function PositionCard({ position, onAddCandidate, router, canEdit }: any) {
  const [showReorder, setShowReorder] = useState(false);

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates', position.id],
    queryFn: async () => {
      const res = await api.get(`/api/candidates/?position_id=${position.id}`);
      return res.data.results || res.data;
    },
  });

  return (
    <div className="p-6 sm:p-8 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{position.title}</h3>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
            Max selections: <span className="text-slate-700 dark:text-slate-300 font-bold">{position.max_selections}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowReorder(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-xl transition text-xs font-bold"
          >
            <GripVertical className="w-3.5 h-3.5 text-slate-400" /> Reorder
          </motion.button>
          {canEdit && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddCandidate}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition text-xs font-bold"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add Candidate
            </motion.button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-4 flex items-center gap-2 text-xs font-medium text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          <span>Loading candidates...</span>
        </div>
      ) : candidates?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {candidates.map((candidate: any) => (
            <motion.div
              key={candidate.id}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/candidates/${candidate.id}`);
              }}
              className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-none transition-all"
            >
              {candidate.photo ? (
                <img
                  src={getMediaUrl(candidate.photo)}
                  alt={candidate.name}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shrink-0">
                  <Users className="w-5 h-5 text-indigo-500" />
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{candidate.name}</p>
                {candidate.department && (
                  <p className="text-[11px] font-medium text-slate-400 truncate">{candidate.department}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 italic">No candidates assigned to this position yet.</p>
      )}

      <ReorderCandidatesModal
        positionId={position.id}
        isOpen={showReorder}
        onClose={() => setShowReorder(false)}
      />
    </div>
  );
}