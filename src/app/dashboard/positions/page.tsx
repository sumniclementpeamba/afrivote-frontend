'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, X, Trash2, Loader2, Briefcase, Users, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Position, Election } from '@/types';
export const dynamic = 'force-dynamic'; // <-- ADD THIS

// Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20 }
  },
};

export default function PositionsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    max_selections: 1,
    election: '',
  });

  const { data: positions, isLoading } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const res = await api.get('/api/positions/');
      return (res.data.results || res.data) as Position[];
    },
  });

  const { data: elections } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => {
      const res = await api.get('/api/elections/');
      return (res.data.results || res.data) as Election[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/api/positions/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Position created');
      setShowCreate(false);
      setForm({ title: '', max_selections: 1, election: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Creation failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/positions/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Position deleted');
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to delete'),
  });

  const handleDelete = (e: React.MouseEvent, positionId: string, positionTitle: string) => {
    e.stopPropagation();
    if (window.confirm(`Delete position "${positionTitle}" and all its candidates?`)) {
      deleteMutation.mutate(positionId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 relative">
      {/* Background Ambient Light */}
      <motion.div
        className="absolute -top-10 -right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Positions</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage all available leadership roles across active and configured elections
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all text-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Position
        </motion.button>
      </div>

      {/* Main Grid Content */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-[50vh] gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading positions...</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {positions?.map((pos) => (
            <motion.div
              key={pos.id}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all relative group flex flex-col justify-between overflow-hidden"
            >
              {/* Delete Button Header */}
              <div className="absolute top-4 right-4 z-20">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleDelete(e, pos.id, pos.title)}
                  className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                  title="Delete position"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </motion.button>
              </div>

              <div>
                {/* Title and Icon Header */}
                <div className="flex items-start gap-3.5 mb-5 pr-8">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1">{pos.title}</h3>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate mt-0.5">{pos.election_title || pos.election}</p>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Max Selections</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">{pos.max_selections}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Required</span>
                    <span className={`inline-flex items-center gap-1 font-bold ${pos.is_required ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      {pos.is_required ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> No
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Candidates</span>
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
                      <Users className="w-3.5 h-3.5" />
                      {pos.candidate_count}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && (!positions || positions.length === 0) && (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Briefcase className="w-8 h-8 stroke-1" />
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">No positions found</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Get started by creating a new position for an election.</p>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
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
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Add Position</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Define a role for an ongoing or upcoming election</p>
                </div>
                <button
                  onClick={() => setShowCreate(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createMutation.mutate(form);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Election</label>
                  <select
                    value={form.election}
                    onChange={e => setForm({ ...form, election: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    required
                  >
                    <option value="">Select an election</option>
                    {elections?.map((el) => (
                      <option key={el.id} value={el.id}>{el.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Max Selections</label>
                  <input
                    type="number"
                    min={1}
                    value={form.max_selections}
                    onChange={e => setForm({ ...form, max_selections: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={createMutation.isPending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-xs disabled:opacity-50"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Position'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}