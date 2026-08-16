'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import api from '@/lib/api';
import {
  Vote, Mail, Lock, ArrowRight, Loader2,
  ShieldCheck, Shield, Eye, EyeOff,
} from 'lucide-react';
import { data } from 'framer-motion/client';

// ─── Decorative animated dot grid ────────────────────────────────────────────
const DotGrid = () => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage:
        'radial-gradient(circle, rgba(52,211,153,0.10) 1.2px, transparent 1.2px)',
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
    <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 group-focus-within/field:text-emerald-400 transition-colors duration-200">
      {label}
    </label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-600 group-focus-within/field:text-emerald-400 transition-colors duration-200 pointer-events-none">
        <Icon className="w-4 h-4" />
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full pl-11 pr-11 py-3.5 rounded-xl text-sm font-medium text-white placeholder-slate-600
          bg-white/[0.04] border border-white/[0.07]
          focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20
          hover:border-white/[0.12]
          transition-all duration-200"
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
export default function VoterLoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Get JWT token
      const res = await api.post('/api/auth/login/', { email, password });
      const token = res.data.access;

      // 2. Fetch user profile
      const profile = await api.get('/api/auth/me/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = {
        role: profile.data.role,
        organization: profile.data.organization || null,
        firstName: profile.data.first_name || 'Voter',
        email: profile.data.email || '',
        profilePicture: profile.data.profile_picture || null,
      };

      // 3. Block non‑voters
      if (user.role?.toUpperCase() !== 'VOTER') {
        toast.error('Admins must use the Admin Portal.');
        setLoading(false);
        return;
      }

      // 4. Persist session and redirect
      login(token, user);
      toast.success('Welcome!');
      router.push('/vote');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#060b1c] p-4 selection:bg-emerald-500 selection:text-white">

      {/* Background */}
      <DotGrid />
      <Orb className="top-[-12%] right-[-8%]  w-[500px] h-[500px] bg-emerald-600/[0.08]" delay={0} />
      <Orb className="bottom-[-12%] left-[-8%] w-[500px] h-[500px] bg-teal-600/[0.08]"    delay={2} />
      <Orb className="top-[38%] left-[32%]    w-[260px] h-[260px] bg-emerald-900/[0.06]"  delay={4} />

      {/* ── Logo ── */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 relative z-10"
      >
        <a href="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="p-2 bg-emerald-500/[0.10] rounded-xl border border-emerald-500/[0.18] shadow-lg"
          >
            <Vote className="w-5 h-5 text-emerald-400" />
          </motion.div>
          <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 bg-clip-text text-transparent tracking-tight">
            AfriVote
          </span>
        </a>
      </motion.div>

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md z-10"
      >
        {/* Outer glow ring */}
        <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent pointer-events-none" />

        <div className="relative bg-white/[0.04] backdrop-blur-2xl rounded-[2rem] border border-white/[0.08] shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Top edge highlight */}
          <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent" />
          {/* Left edge highlight */}
          <div className="absolute left-0 top-[15%] bottom-[15%] w-px bg-gradient-to-b from-transparent via-teal-400/20 to-transparent" />

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-[60px] h-[60px] rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 shadow-xl shadow-emerald-900/40 mb-5"
              >
                <Vote className="w-7 h-7 text-white" />
              </motion.div>
              <h1 className="text-[2rem] font-black tracking-tight mb-1 bg-gradient-to-br from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Voter Login
              </h1>
              <p className="text-slate-400 text-sm font-medium">Cast your vote securely</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field
                label="Email Address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="voter@example.com"
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
                    className="text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    {showPw
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye    className="w-4 h-4" />}
                  </button>
                }
              />

              {/* Submit button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-3.5 rounded-xl font-bold text-sm text-white overflow-hidden
                    bg-gradient-to-r from-emerald-600 to-teal-600
                    hover:from-emerald-500 hover:to-teal-500
                    shadow-xl shadow-emerald-950/60 hover:shadow-emerald-500/25
                    disabled:opacity-50 disabled:pointer-events-none
                    flex items-center justify-center gap-2 group/btn
                    transition-all duration-300"
                >
                  {/* Shimmer sweep */}
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
                        Cast Your Vote
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            </form>

            {/* Notice */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.12]"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-emerald-200/55 text-xs leading-relaxed">
                Default password: <strong>Vote@123</strong> unless you have changed it.
              </p>
            </motion.div>

            {/* Security indicators */}
            <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center justify-center gap-5">
              <SecBadge label="Anonymous" />
              <SecBadge label="Verifiable" />
              <SecBadge label="Secure" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Footer link ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 text-sm text-slate-600 mt-6"
      >
        Are you an administrator?{' '}
        <Link
          href="/login"
          className="text-emerald-400 font-semibold hover:text-emerald-300 underline-offset-2 hover:underline transition-colors"
        >
          Admin Portal
        </Link>
      </motion.p>
    </div>
  );
}