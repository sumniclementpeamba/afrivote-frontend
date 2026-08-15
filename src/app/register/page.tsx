'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, ShieldCheck, ArrowRight, Building2, ExternalLink, Briefcase } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    organization_name: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    organization_type: 'SCHOOL',
    password: '',
  });

  const handleRegistration = async () => {
    setLoading(true);
    try {
      // Save form data to localStorage for later use after payment
      localStorage.setItem('reg_org_name', form.organization_name);
      localStorage.setItem('reg_email', form.email);
      localStorage.setItem('reg_first_name', form.first_name);
      localStorage.setItem('reg_last_name', form.last_name);
      localStorage.setItem('reg_phone', form.phone);
      localStorage.setItem('reg_org_type', form.organization_type);
      localStorage.setItem('reg_password', form.password);

      // Send registration data to backend to create Paystack payment URL
      const res = await api.post('/api/organizations/setup-payment/', form);

      // Open the Paystack checkout URL in a new tab
      window.open(res.data.url, '_blank');

      toast.success('Complete payment in the new tab. Your registration will be processed.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Create Your Organisation</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pay a one‑time setup fee of GHS 20. Your account will be approved by the super admin.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegistration();
          }}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Organisation name"
            required
            value={form.organization_name}
            onChange={(e) => setForm({ ...form, organization_name: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          />

          {/* Organisation Type Selector */}
          <div className="relative">
            <select
              value={form.organization_type}
              onChange={(e) => setForm({ ...form, organization_type: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium cursor-pointer appearance-none"
              required
            >
              <option value="SCHOOL">School</option>
              <option value="CHURCH">Church</option>
              <option value="COMPANY">Company</option>
              <option value="NGO">NGO</option>
              <option value="ASSOCIATION">Association</option>
              <option value="PROFESSIONAL_BODY">Professional Body</option>
              <option value="OTHER">Other</option>
            </select>
            <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <input
            type="text"
            placeholder="Your first name"
            required
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          />
          <input
            type="text"
            placeholder="Your last name"
            required
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          />
          <input
            type="email"
            placeholder="Admin email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay GHS 20 & Register
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}