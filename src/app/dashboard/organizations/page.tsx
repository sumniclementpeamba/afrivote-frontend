'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, X, Building2, Loader2, ShieldAlert, KeyRound, CheckCircle2, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '@/components/StatusBadge';

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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function OrganizationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    email: '',
    organization_type: 'SCHOOL',
    admin_email: '',
    admin_password: '',
  });
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const res = await api.get('/api/organizations/');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/api/organizations/', data),
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: ['organizations'] });
        toast.success('Organization created!');
      const creds = res.data.admin_credentials;
      if (creds) {
        setCredentials({ email: creds.email, password: creds.password });
      }
      setShowCreate(false);
      setForm({
        name: '', slug: '', email: '', organization_type: 'SCHOOL',
        admin_email: '', admin_password: '',
      });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || err.response?.data?.name || 'Failed to create';
      toast.error(msg);
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/organizations/${id}/approve/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organisation approved');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Approval failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/organizations/${id}/`),
    onMutate: (id) => {
      queryClient.setQueryData(['organizations'], (old: any) => {
        return old?.filter((org: any) => org.id !== id);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organisation rejected');
    },
    onError: (err: any) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.error('Rejected – removed from list.');
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/organizations/${id}/mark-paid/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organisation marked as paid');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Operation failed'),
  });

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 rounded-2xl">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">You do not have permission to view this page.</p>
      </div>
    );
  }

  const pending = data?.filter((org: any) => org.status === 'PENDING') || [];
  const approved = data?.filter((org: any) => org.status !== 'PENDING') || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 relative">
      <motion.div
        className="absolute -top-10 -right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Organizations</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage system tenant organizations and administrative accounts
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all text-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Organization
        </motion.button>
      </div>

      <section>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">Pending Approvals</h2>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
          </div>
        ) : pending.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4">
            No pending organisations.
          </p>
        ) : (
          <div className="grid gap-4">
            {pending.map((org: any) => (
              <div
                key={org.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-amber-200/60 dark:border-amber-900/40 p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{org.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{org.email}</p>
                    {!org.setup_fee_paid && (
                      <span className="mt-1 inline-block text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full border border-rose-100 dark:border-rose-900/40">
                        Unpaid Setup Fee
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!org.setup_fee_paid && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        markPaidMutation.mutate(org.id);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition"
                    >
                      <CreditCard className="w-4 h-4" /> Mark as Paid
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      approveMutation.mutate(org.id);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      rejectMutation.mutate(org.id);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 rounded-xl border border-rose-200/60 dark:border-rose-900/50 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">All Organisations</h2>
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-[50vh] gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Fetching organizations...</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {approved.map((org: any) => (
              <motion.div
                key={org.id}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                onClick={() => router.push(`/dashboard/organizations/${org.id}`)}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer relative group flex flex-col justify-between overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-3.5 mb-5">
                    <motion.div
                      whileHover={{ rotate: 12, scale: 1.05 }}
                      className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-md shadow-indigo-500/20 shrink-0"
                    >
                      <Building2 className="w-5 h-5" />
                    </motion.div>
                    <div className="overflow-hidden">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">{org.name}</h3>
                      <p className="text-xs font-mono text-slate-400 dark:text-slate-500 truncate">{org.slug}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Type</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px] bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">{org.organization_type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Status</span>
                      <StatusBadge status={org.status} />
                    </div>
                    {org.email && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Email</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[130px]">{org.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {!isLoading && (!data || data.length === 0) && (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Building2 className="w-8 h-8 stroke-1" />
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">No organizations found</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create your first organization to get started.</p>
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-md p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 my-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Create Organization</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Setup a new tenant organization</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-xs font-medium text-slate-900 dark:text-white transition-all"
                      placeholder="Organization Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Slug</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={e => setForm({ ...form, slug: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-xs font-mono text-slate-900 dark:text-white transition-all"
                      placeholder="org-slug"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Organization Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-xs font-medium text-slate-900 dark:text-white transition-all"
                    placeholder="contact@organization.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
                  <select
                    value={form.organization_type}
                    onChange={e => setForm({ ...form, organization_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-xs font-medium text-slate-900 dark:text-white transition-all"
                  >
                    <option value="SCHOOL">School</option>
                    <option value="CHURCH">Church</option>
                    <option value="COMPANY">Company</option>
                    <option value="NGO">NGO</option>
                    <option value="ASSOCIATION">Association</option>
                    <option value="PROFESSIONAL_BODY">Professional Body</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-500" /> Organization Admin Credentials
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Admin Email</label>
                      <input
                        type="email"
                        value={form.admin_email}
                        onChange={e => setForm({ ...form, admin_email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-xs font-medium text-slate-900 dark:text-white transition-all"
                        placeholder="admin@organization.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Admin Password</label>
                      <input
                        type="password"
                        value={form.admin_password}
                        onChange={e => setForm({ ...form, admin_password: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-xs font-medium text-slate-900 dark:text-white transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...
                      </>
                    ) : (
                      'Create Organization'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {credentials && (
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
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-8 text-center"
            >
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-1">Organization Created!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Admin credentials generated below:</p>

              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-left space-y-2.5 text-xs font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{credentials.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Password:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">{credentials.password}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCredentials(null)}
                className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-indigo-600/20 transition-all"
              >
                Done
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}