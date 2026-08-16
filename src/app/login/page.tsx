'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/providers';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Mail, Lock, ArrowRight, Loader2,
  ShieldAlert, Shield, Eye, EyeOff,
} from 'lucide-react';

// ─── Decorative animated dot grid ────────────────────────────────────────────
const DotGrid = () => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage:
        'radial-gradient(circle, rgba(99,102,241,0.12) 1.2px, transparent 1.2px)',
      backgroundSize: '28px 28px',
    }}
  />
);

// ─── Floating orb ─────────────────────────────────────────────────────────────
const Orb = ({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) => (
  <motion.div
    className={`absolute rounded-full blur-[130px] pointer-events-none ${className}`}
    animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
    transition={{ duration: 6, repeat: Infinity, delay, ease: 'easeInOut' }}
  />
);

// ─── Security badge ───────────────────────────────────────────────────────────
const SecBadge = ({ label }: { label: string }) => (
  <div className="flex items-center gap-1 text-slate-600 text-[10px] font-bold tracking-wide">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(52,211,153,0.6)]" />
    {label}
  </div>
);

// ─── Input field ──────────────────────────────────────────────────────────────
const Field = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  suffix,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ElementType;
  suffix?: React.ReactNode;
}) => (
  <div className="group/field space-y-2">
    <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 group-focus-within/field:text-indigo-400 transition-colors duration-200">
      {label}
    </label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within/field:text-indigo-400 transition-colors duration-200 pointer-events-none">
        <Icon className="w-4 h-4" />
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full pl-11 pr-11 py-3.5 rounded-xl text-sm font-medium text-white placeholder-slate-500
          bg-white/[0.10] border border-white/[0.15]
          focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white/[0.14]
          hover:border-white/[0.20]
          transition-all duration-200"
        style={{ WebkitAppearance: 'none', fontSize: '16px' }}
      />
      {suffix && (
        <span className="absolute inset-y-0 right-0 flex items-center pr-4">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState('');           // <-- DEBUG STATE
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDebug('Submitting...');
    try {
      // 1. Get JWT token
      const res = await api.post('/api/auth/login/', { email, password });
      const token = res.data.access;
      setDebug(`Token received: ${token ? 'YES' : 'NO'}`);

      // 2. Fetch user profile
      const profile = await api.get('/api/auth/me/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDebug(`Profile fetched: role=${profile.data.role}`);

      const user = {
        role: profile.data.role,
        organization: profile.data.organization || null,
        firstName: profile.data.first_name || 'User',
        email: profile.data.email || '',
        profilePicture: profile.data.profile_picture || null,
      };

      // 3. BLOCK VOTERS
      if (user.role === 'VOTER') {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userOrgId');
        toast.error('❌ Voters must use the Voter Portal. Redirecting...');
        setDebug('Blocked: VOTER');
        setLoading(false);
        setTimeout(() => {
          window.location.href = '/vote/login';
        }, 1500);
        return;
      }

      // 4. BLOCK non-admins
      if (user.role !== 'SUPER_ADMIN' && user.role !== 'ORG_ADMIN') {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userOrgId');
        toast.error('❌ Unauthorized. Admin access only.');
        setDebug('Blocked: Not admin');
        setLoading(false);
        return;
      }

      // 5. BLOCK org admins whose organisation is not approved
      if (user.role === 'ORG_ADMIN') {
        const orgStatus = profile.data.organization_status;
        if (orgStatus !== 'ACTIVE') {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userOrgId');
          toast.error('⏳ Your organisation is pending approval. Please wait for the super admin to approve you.');
          setDebug('Blocked: Pending approval');
          setLoading(false);
          window.location.href = '/pending-approval';
          return;
        }
      }

      // 6. Save auth state and manually set fallback subscription expiry
      const fallbackExpiry = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString();
      localStorage.setItem('subscriptionEndsAt', fallbackExpiry);

      login(token, user);

      // Also ensure role/token are present before redirect
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);

      setDebug(`Token set: ${localStorage.getItem('token') ? 'YES' : 'NO'}, Role: ${user.role}`);
      toast.success('Welcome back!');

      // Slight delay to allow React state updates before full reload
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    } catch (err: any) {
      setDebug(`Error: ${JSON.stringify(err.response?.data || err.message || err)}`);
      if (err.response?.data?.detail) {
        toast.error(err.response.data.detail);
      } else if (err.response?.status === 401) {
        toast.error('Invalid email or password');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#060b1c] px-4 py-8 sm:p-4 selection:bg-indigo-500 selection:text-white">

      {/* DEBUG PANEL – visible on screen for mobile debugging */}
      {debug && (
        <div className="fixed top-2 left-2 right-2 z-[999] bg-red-500/90 text-white text-xs p-3 rounded-xl shadow-lg overflow-auto max-h-40">
          {debug}
        </div>
      )}

      {/* Background */}
      <DotGrid />
      <Orb className="top-[-12%] right-[-8%]  w-[500px] h-[500px] bg-indigo-600/[0.08]" delay={0} />
      <Orb className="bottom-[-12%] left-[-8%] w-[500px] h-[500px] bg-purple-600/[0.08]" delay={2} />
      <Orb className="top-[38%] left-[32%]    w-[260px] h-[260px] bg-indigo-900/[0.06]" delay={4} />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 sm:mb-8 relative z-10"
      >
        <a href="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="p-2 bg-indigo-500/[0.10] rounded-xl border border-indigo-500/[0.18] shadow-lg"
          >
            <Zap className="w-5 h-5 text-indigo-400" />
          </motion.div>
          <span className="text-2xl font-black text-indigo-300 tracking-tight">
            AfriVote
          </span>
        </a>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md z-10 mx-auto"
      >
        <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-br from-indigo-500/25 via-purple-500/10 to-transparent pointer-events-none" />

        <div className="relative bg-white/[0.06] backdrop-blur-2xl rounded-[2rem] border border-white/[0.10] shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-indigo-400/35 to-transparent" />
          <div className="absolute left-0 top-[15%] bottom-[15%] w-px bg-gradient-to-b from-transparent via-purple-400/20 to-transparent" />

          <div className="p-5 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-xl shadow-indigo-900/40 mb-4 sm:mb-5"
              >
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </motion.div>
              <h1 className="text-[1.5rem] sm:text-[2rem] font-black tracking-tight mb-1 text-white">
                Admin Login
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">System Administration Portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <Field
                label="Email Address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="admin@organization.com"
                icon={Mail}
              />
              <Field
                label="Secure Password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                icon={Lock}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="text-slate-400 hover:text-slate-300 transition-colors p-1"
                  >
                    {showPw
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-3.5 rounded-xl font-bold text-sm text-white overflow-hidden
                    bg-gradient-to-r from-indigo-600 to-purple-600
                    hover:from-indigo-500 hover:to-purple-500
                    shadow-xl shadow-indigo-950/60 hover:shadow-indigo-500/25
                    disabled:opacity-50 disabled:pointer-events-none
                    flex items-center justify-center gap-2 group/btn
                    transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent animate-shimmer pointer-events-none" />
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2 relative z-10"
                      >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Authenticating…
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="flex items-center gap-2 relative z-10"
                      >
                        Authorize Session
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-5 sm:mt-6 flex items-start gap-2.5 p-3 sm:p-3.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/[0.12]"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-200/55 text-[11px] sm:text-xs leading-relaxed">
                This portal is exclusively for internal organization administrators.
                Voters must use the designated voter gateway.
              </p>
            </motion.div>

            <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center justify-center gap-4 sm:gap-5 flex-wrap">
              <SecBadge label="AES-256" />
              <SecBadge label="TLS 1.3" />
              <SecBadge label="2FA Ready" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 text-xs sm:text-sm text-slate-600 mt-5 sm:mt-6 text-center px-4"
      >
        Looking for the voting gateway?{' '}
        <Link
          href="/vote/login"
          className="text-indigo-400 font-semibold hover:text-indigo-300 underline-offset-2 hover:underline transition-colors"
        >
          Voter Portal
        </Link>
      </motion.p>
    </div>
  );
}