'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, X, Upload, User, Trash2, Loader2, Award, Building2, Vote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '@/components/StatusBadge';
import Skeleton from '@/components/Skeleton';
import { Candidate, Position } from '@/types';

const getMediaUrl = (path: string | null | undefined): string => {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http')) return path;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  return `${apiBase}${path}`;
};

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

interface CandidateFormState {
  name: string;
  position: string;
  department: string;
  email: string;
  biographyFile: File | null;
  manifestoFile: File | null;
  phone: string;
  photo: File | null;
}

export default function CandidatesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CandidateFormState>({
    name: '',
    position: '',
    department: '',
    email: '',
    biographyFile: null,
    manifestoFile: null,
    phone: '',
    photo: null,
  });

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const res = await api.get('/api/candidates/');
      return (res.data.results || res.data) as Candidate[];
    },
  });

  const { data: positions } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const res = await api.get('/api/positions/');
      return (res.data.results || res.data) as Position[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CandidateFormState) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('position', data.position);
      if (data.department) formData.append('department', data.department);
      if (data.email) formData.append('email', data.email);

      if (data.biographyFile) {
        formData.append('biography_upload', data.biographyFile);
      }
      if (data.manifestoFile) {
        formData.append('manifesto_upload', data.manifestoFile);
      }

      if (data.phone) formData.append('phone', data.phone);
      if (data.photo) formData.append('photo', data.photo);

      return api.post('/api/candidates/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate added');
      setShowCreate(false);
      setForm({
        name: '',
        position: '',
        department: '',
        email: '',
        biographyFile: null,
        manifestoFile: null,
        phone: '',
        photo: null,
      });
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to add candidate'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/candidates/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate deleted');
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to delete'),
  });

  const handleDelete = (e: React.MouseEvent, candidateId: string, candidateName: string) => {
    e.stopPropagation();
    if (window.confirm(`Delete candidate "${candidateName}"?`)) {
      deleteMutation.mutate(candidateId);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Candidates</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Overview of all registered candidates across active and upcoming elections
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all text-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Candidate
        </motion.button>
      </div>

      {/* Content State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {candidates?.map((candidate) => (
            <motion.div
              key={candidate.id}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              onClick={() => router.push(`/dashboard/candidates/${candidate.id}`)}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer relative group flex flex-col justify-between overflow-hidden"
            >
              {/* Delete Button */}
              <div className="absolute top-4 right-4 z-20">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleDelete(e, candidate.id, candidate.name)}
                  className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                  title="Delete candidate"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </motion.button>
              </div>

              {/* Profile Details */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="relative mb-3">
                  <img
                    src={candidate.photo_url || getMediaUrl(candidate.photo)}
                    alt={candidate.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-slate-100 dark:ring-slate-800/80 shadow-md transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.png';
                      e.currentTarget.onerror = null;
                    }}
                  />
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1">{candidate.name}</h3>

                {/* Position */}
                <div className="flex items-center justify-center gap-1 mt-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[180px]">{candidate.position_title || candidate.position}</span>
                </div>

                {/* Election title */}
                {candidate.election_title && (
                  <div className="flex items-center justify-center gap-1 mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <Vote className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[180px]">{candidate.election_title}</span>
                  </div>
                )}

                {candidate.department && (
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1 truncate max-w-[180px]">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span>{candidate.department}</span>
                  </p>
                )}
              </div>

              {/* Vote Stats Bar */}
              {candidate.vote_count !== undefined && (
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2">
                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                    <span>Total Votes</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">{candidate.vote_count}</span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${candidate.vote_percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold">
                    <StatusBadge status={candidate.is_active ? 'ACTIVE' : 'INACTIVE'} />
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{candidate.vote_percentage}%</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && (!candidates || candidates.length === 0) && (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <User className="w-8 h-8 stroke-1" />
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">No candidates found</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Get started by adding a new candidate to a position.</p>
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
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Add Candidate</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Register candidate details for an upcoming election</p>
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
                {/* Position */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Position</label>
                  <select
                    value={form.position}
                    onChange={e => setForm({ ...form, position: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    required
                  >
                    <option value="">Select a position</option>
                    {positions?.map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.title} ({pos.election_title || pos.election})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    required
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Department</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                  />
                </div>

                {/* Biography */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Biography <span className="text-slate-400">(PDF / DOCX)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors">
                      <Upload className="w-4 h-4 text-slate-400" />
                      Choose File
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        className="hidden"
                        onChange={(e) => setForm({ ...form, biographyFile: e.target.files?.[0] || null })}
                      />
                    </label>
                    {form.biographyFile && (
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate max-w-[180px]">
                        {form.biographyFile.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Manifesto */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Manifesto <span className="text-slate-400">(PDF / DOCX)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors">
                      <Upload className="w-4 h-4 text-slate-400" />
                      Choose File
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        className="hidden"
                        onChange={(e) => setForm({ ...form, manifestoFile: e.target.files?.[0] || null })}
                      />
                    </label>
                    {form.manifestoFile && (
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate max-w-[180px]">
                        {form.manifestoFile.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                  />
                </div>

                {/* Photo */}
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
                        onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })}
                      />
                    </label>
                    {form.photo && (
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate max-w-[180px]">
                        {form.photo.name}
                      </span>
                    )}
                  </div>
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
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all text-xs disabled:opacity-50"
                  >
                    {createMutation.isPending ? (
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
    </div>
  );
}