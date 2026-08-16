'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/app/providers';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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
  ShieldAlert,
} from 'lucide-react';
export const dynamic = 'force-dynamic'; // <-- ADD THIS

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
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
    if (!authLoading && !isSuperAdmin) {
      router.push('/dashboard');
    }
  }, [authLoading, isSuperAdmin, router]);

  const { data: org, isLoading, refetch } = useQuery({
    queryKey: ['organization', id],
    queryFn: async () => {
      const res = await api.get(`/api/organizations/${id}/`);
      return res.data;
    },
    enabled: !!id && isSuperAdmin,
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
    mutationFn: (data: typeof form) => api.put(`/api/organizations/${id}/`, data),
    onSuccess: async () => {
      await refetch();   // refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.name?.[0] || 'Update failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading organization details...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto space-y-6 pb-12 relative"
    >
      {/* Ambient Background Glow */}
      <motion.div
        className="absolute -top-10 -right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />

      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard/organizations')}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 text-xs font-bold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Organizations
      </button>

      {/* Header Banner & Quick Stats */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-6 sm:px-8 py-8 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3.5 bg-white/10 dark:bg-slate-950/20 backdrop-blur-md rounded-2xl border border-white/20 text-white shrink-0">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{form.name || 'Organization'}</h1>
              <p className="text-indigo-100 text-xs sm:text-sm font-medium mt-1">
                {form.organization_type?.replace('_', ' ')} · {org?.slug && <span className="font-mono text-indigo-200">/{org.slug}</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-50/50 dark:bg-slate-800/20 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800/80">
          <div className="text-center pt-2 sm:pt-0">
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{form.max_voters}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Max Voters</p>
          </div>
          <div className="text-center pt-2 sm:pt-0">
            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{form.max_elections}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Max Elections</p>
          </div>
          <div className="text-center pt-2 sm:pt-0">
            <p className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{form.plan}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Plan</p>
          </div>
          <div className="text-center pt-2 sm:pt-0">
            <span className={`inline-block text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${form.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40' :
                form.status === 'SUSPENDED' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40' :
                  'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40'
              }`}>
              {form.status}
            </span>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">Status</p>
          </div>
        </div>
      </div>

      {/* Edit Form Card */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 tracking-tight">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Edit Organization Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <Type className="w-3.5 h-3.5 text-slate-400" /> Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-xs font-medium text-slate-900 dark:text-white transition-all"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-xs font-medium text-slate-900 dark:text-white transition-all"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-xs font-medium text-slate-900 dark:text-white transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" /> Website
              </label>
              <input
                type="url"
                value={form.website}
                onChange={e => setForm({ ...form, website: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-xs font-medium text-slate-900 dark:text-white transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-xs font-medium text-slate-900 dark:text-white transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Type
              </label>
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
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Description
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-xs font-medium text-slate-900 dark:text-white transition-all"
              placeholder="A brief description of the organization..."
            />
          </div>

          {/* Limits & Status Section */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
              Limits & Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> Max Voters
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.max_voters}
                  onChange={e => setForm({ ...form, max_voters: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-xs font-bold text-slate-900 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-slate-400" /> Max Elections
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.max_elections}
                  onChange={e => setForm({ ...form, max_elections: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-xs font-bold text-slate-900 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-slate-400" /> Plan
                </label>
                <select
                  value={form.plan}
                  onChange={e => setForm({ ...form, plan: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-xs font-bold text-slate-900 dark:text-white transition-all"
                >
                  <option value="FREE">Free</option>
                  <option value="STANDARD">Standard</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-400" /> Status
                </label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none text-xs font-bold text-slate-900 dark:text-white transition-all"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4">
            <motion.button
              type="submit"
              disabled={updateMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-2xl shadow-lg shadow-indigo-600/20 text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </motion.div>
  );
}