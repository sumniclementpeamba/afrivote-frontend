'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import BrandingForm from '@/components/BrandingForm';
import { motion } from 'framer-motion';
import {
  Save,
  Building2,
  Loader2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Type,
  FileText,
  Briefcase,
  ArrowLeft,
  Users,
  CalendarCheck,
  BadgeCheck,
  Activity,
  Lock,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
export const dynamic = 'force-dynamic'; // <-- ADD THIS

// Stagger variants for smooth page entrance
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

export default function OrganizationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    organization_type: 'SCHOOL',
    description: '',
    max_voters: 0,
    max_elections: 0,
    plan: 'FREE',
    status: 'ACTIVE',
  });

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (!loading && (!user || !user.organization)) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const { data: org, isLoading, refetch } = useQuery({
    queryKey: ['my-organization'],
    queryFn: async () => {
      const res = await api.get('/api/organizations/me/');
      return res.data;
    },
    enabled: !!user?.organization,
  });

  useEffect(() => {
    if (org) {
      setForm({
        name: org.name || '',
        email: org.email || '',
        phone: org.phone || '',
        website: org.website || '',
        address: org.address || '',
        organization_type: org.organization_type || 'SCHOOL',
        description: org.description || '',
        max_voters: org.max_voters ?? 0,
        max_elections: org.max_elections ?? 0,
        plan: org.plan ?? 'FREE',
        status: org.status ?? 'ACTIVE',
      });
    }
  }, [org]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) => api.put('/api/organizations/me/', data),
    onSuccess: async (res) => {
      await refetch();
      toast.success('Organization updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.name?.[0] || 'Update failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };
    if (!isSuperAdmin) {
      delete (payload as any).max_voters;
      delete (payload as any).max_elections;
      delete (payload as any).plan;
      delete (payload as any).status;
    }
    updateMutation.mutate(payload);
  };

  if (loading || isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading organization details...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto space-y-6 pb-12 relative"
    >
      {/* Background Ambient Glow */}
      <motion.div
        className="absolute -top-10 -left-10 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />

      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <motion.button
          onClick={() => router.push('/dashboard')}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </motion.button>
      </motion.div>

      {/* Header Banner & Stats Card */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-8 py-8 relative overflow-hidden">
          <motion.div
            className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="p-4 bg-white/20 dark:bg-slate-950/20 backdrop-blur-md rounded-2xl ring-1 ring-white/30"
            >
              <Building2 className="w-9 h-9 text-white" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {form.name || 'My Organization'}
                </h1>
                <Sparkles className="w-5 h-5 text-indigo-200" />
              </div>
              <p className="text-indigo-100 dark:text-indigo-200 text-xs font-semibold mt-1 uppercase tracking-wider flex items-center gap-2">
                <span>{form.organization_type?.replace('_', ' ')}</span>
                {org?.slug && (
                  <>
                    <span>•</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded-md font-mono text-[11px] lower-case">/{org.slug}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md divide-x-0 sm:divide-x divide-slate-100 dark:divide-slate-800/60">
          <div className="text-center p-2">
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{form.max_voters}</p>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Max Voters</p>
          </div>
          <div className="text-center p-2">
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{form.max_elections}</p>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Max Elections</p>
          </div>
          <div className="text-center p-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {form.plan}
            </span>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Plan</p>
          </div>
          <div className="text-center p-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${form.status === 'ACTIVE'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}>
              {form.status}
            </span>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Status</p>
          </div>
        </div>
      </motion.div>

      {/* Edit Form Card */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Edit Organization Details
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                <Type className="w-4 h-4 text-slate-400" /> Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all font-medium text-sm"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                <Mail className="w-4 h-4 text-slate-400" /> Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all font-medium text-sm"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                <Phone className="w-4 h-4 text-slate-400" /> Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all font-medium text-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                <Globe className="w-4 h-4 text-slate-400" /> Website
              </label>
              <input
                type="url"
                value={form.website}
                onChange={e => setForm({ ...form, website: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all font-medium text-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                <MapPin className="w-4 h-4 text-slate-400" /> Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all font-medium text-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                <Briefcase className="w-4 h-4 text-slate-400" /> Type
              </label>
              <select
                value={form.organization_type}
                onChange={e => setForm({ ...form, organization_type: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all font-medium text-sm cursor-pointer"
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
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              <FileText className="w-4 h-4 text-slate-400" /> Description
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent outline-none transition-all font-medium text-sm resize-none"
              placeholder="A brief description of your organization..."
            />
          </div>

          {/* Limits & Status – locked for org admins */}
          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" /> Limits & System Status
              </h3>
              {!isSuperAdmin && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <ShieldAlert className="w-3 h-3" /> Managed by Super Admin
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  <Users className="w-4 h-4 text-slate-400" /> Max Voters
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.max_voters}
                  onChange={e => setForm({ ...form, max_voters: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={!isSuperAdmin}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  <CalendarCheck className="w-4 h-4 text-slate-400" /> Max Elections
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.max_elections}
                  onChange={e => setForm({ ...form, max_elections: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={!isSuperAdmin}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  <BadgeCheck className="w-4 h-4 text-slate-400" /> Plan
                </label>
                <select
                  value={form.plan}
                  onChange={e => setForm({ ...form, plan: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  disabled={!isSuperAdmin}
                >
                  <option value="FREE">Free</option>
                  <option value="STANDARD">Standard</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  <Activity className="w-4 h-4 text-slate-400" /> Status
                </label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  disabled={!isSuperAdmin}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <motion.button
              type="submit"
              disabled={updateMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Branding Section – only for Standard & Enterprise */}
      <motion.div
        variants={itemVariants}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 mt-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Branding (Standard / Enterprise)
          </h2>
        </div>
        <BrandingForm />
      </motion.div>
    </motion.div>
  );
}