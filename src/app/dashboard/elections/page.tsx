'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { useAuth } from '@/app/providers';
import toast from 'react-hot-toast';
import { Plus, Play, X, Trash2, Loader2, Lock, ArrowUpRight, Sparkles, Calendar, Vote, Layers, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '@/components/StatusBadge';
import { Election } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 

// Staggered motion variants for layout entrances
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
    transition: { type: 'spring', stiffness: 260, damping: 22 }
  },
};

export default function ElectionsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    election_type: 'MULTIPLE',
    start_date: '',
    end_date: '',
    description: '',
    organization: '',
  });

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Fetch organizations (super admin only)
  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => (await api.get('/api/organizations/')).data,
    enabled: isSuperAdmin,
  });

  // Fetch elections
  const { data: elections, isLoading } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => {
      const res = await api.get('/api/elections/');
      return (res.data.results || res.data) as Election[];
    },
  });

  // Fetch current org limits (only for org admins)
  const { data: org } = useQuery({
    queryKey: ['my-organization'],
    queryFn: async () => {
      const res = await api.get('/api/organizations/me/');
      return res.data;
    },
    enabled: !isSuperAdmin && !!user?.organization,
  });

  const electionCount = elections?.length || 0;
  const maxElections = org?.max_elections ?? 100;   // fallback for super admin
  const limitReached = !isSuperAdmin && electionCount >= maxElections;
  const currentPlan = org?.plan || 'FREE';
  const canUpgrade = !isSuperAdmin && currentPlan !== 'ENTERPRISE';

  const formatDate = (localDate: string) => {
    if (!localDate) return '';
    return new Date(localDate).toISOString();
  };

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const payload: any = {
        title: data.title,
        election_type: data.election_type,
        description: data.description,
        start_date: formatDate(data.start_date),
        end_date: formatDate(data.end_date),
      };
      if (isSuperAdmin && data.organization) payload.organization = data.organization;
      return api.post('/api/elections/', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      toast.success('Election created!');
      setShowModal(false);
      setFormData({ title: '', election_type: 'MULTIPLE', start_date: '', end_date: '', description: '', organization: '' });
    },
    onError: (err: any) => {
      const data = err.response?.data;
      const msg = data?.plan_limit || data?.detail || data?.title?.[0] || 'Creation failed';
      toast.error(msg);
    },
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/elections/${id}/start/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      toast.success('Election started');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to start election'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/elections/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      toast.success('Election deleted');
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to delete'),
  });

  const handleDelete = (e: React.MouseEvent, electionId: string, electionTitle: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${electionTitle}"? This will also remove all positions, candidates, and votes.`)) {
      deleteMutation.mutate(electionId);
    }
  };

  const handleStart = (e: React.MouseEvent, electionId: string) => {
    e.stopPropagation();
    startMutation.mutate(electionId);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Elections</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">Manage and monitor your ongoing & past elections</p>

          {canUpgrade && (
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 uppercase tracking-wider transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Upgrade Plan
            </Link>
          )}
        </div>

        {/* Action Button */}
        {limitReached ? (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/dashboard/billing"
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all font-bold text-sm"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              Upgrade to Create More
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> New Election
          </motion.button>
        )}
      </div>

      {/* Limit Reached Banner */}
      {limitReached && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/20 dark:bg-amber-500/5 text-amber-900 dark:text-amber-200 px-5 py-4 rounded-2xl shadow-sm backdrop-blur-md"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl shrink-0">
              <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-sm">Plan limit reached</p>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                You have used all <strong className="font-bold">{electionCount}</strong> of your <strong className="font-bold">{maxElections}</strong> allowed elections.
                Upgrade your plan to unlock unlimited elections.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-24 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading elections...</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {elections?.map((election) => (
            <motion.div
              key={election.id}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              onClick={() => router.push(`/dashboard/elections/${election.id}`)}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 border border-slate-200/80 dark:border-slate-800/80 p-6 cursor-pointer transition-all relative group flex flex-col justify-between"
            >
              <div>
                {/* Delete button wrapper */}
                <div className="absolute top-4 right-4 z-20">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleDelete(e, election.id, election.title)}
                    className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete election"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                <div className="flex items-start gap-3.5 mb-5 pr-8">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {election.title}
                    </h3>
                    <div className="mt-1">
                      <StatusBadge status={election.status} />
                    </div>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800/60">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-slate-400"><Layers className="w-3.5 h-3.5" /> Type:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{election.election_type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-slate-400"><Calendar className="w-3.5 h-3.5" /> Start:</span>
                    <span className="text-slate-700 dark:text-slate-300">{new Date(election.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-slate-400"><Clock className="w-3.5 h-3.5" /> End:</span>
                    <span className="text-slate-700 dark:text-slate-300">{new Date(election.end_date).toLocaleDateString()}</span>
                  </div>
                  {election.total_votes !== undefined && (
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="flex items-center gap-1.5 text-slate-400"><Vote className="w-3.5 h-3.5" /> Votes:</span>
                      <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">{election.total_votes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons inside Card */}
              {(election.status === 'DRAFT' || election.status === 'SCHEDULED') && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => handleStart(e, election.id)}
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all text-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Start Election
                </motion.button>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && (!elections || elections.length === 0) && (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 stroke-1" />
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">No elections found</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Get started by creating your first election above.</p>
        </div>
      )}

      {/* Creation Modal */}
      <AnimatePresence>
        {showModal && !limitReached && (
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
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Create Election</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fill in the details to launch a new vote</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4">
                {isSuperAdmin && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Organization</label>
                    <select
                      value={formData.organization}
                      onChange={e => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm cursor-pointer"
                      required
                    >
                      <option value="">Select organization</option>
                      {organizations?.map((org: any) => (<option key={org.id} value={org.id}>{org.name}</option>))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium resize-none"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Type</label>
                    <select
                      value={formData.election_type}
                      onChange={e => setFormData({ ...formData, election_type: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm cursor-pointer"
                    >
                      <option value="MULTIPLE">Multiple Positions</option>
                      <option value="SINGLE">Single Position</option>
                      <option value="REFERENDUM">Referendum</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Start Date</label>
                    <input
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={createMutation.isPending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all text-xs disabled:opacity-50"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Election'
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