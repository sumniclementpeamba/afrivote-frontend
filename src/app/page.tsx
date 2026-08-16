'use client';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Shield, Users, BarChart3, Zap, Star, CreditCard,
  ChevronRight, Lock, TrendingUp, Globe, Eye, Check, Sparkles, Building2,
  Menu, X
} from 'lucide-react';

// ─── useIsMobile Hook ────────────────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);

  return isMobile;
}

// ─── Animated Number ──────────────────────────────────────────────────────────
const AnimatedNumber = ({ value, suffix = '+' }: { value: number; suffix?: string }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const fps = 60;
    const totalFrames = Math.round((duration / 1000) * fps);
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      const t = frame / totalFrames;
      setDisplay(Math.round(value * (t * (2 - t))));
      if (frame >= totalFrames) { setDisplay(value); clearInterval(id); }
    }, 1000 / fps);
    return () => clearInterval(id);
  }, [value]);

  return <span>{display.toLocaleString()}{suffix}</span>;
};

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};
const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.11 } },
};
const liftCard: Variants = {
  rest: { y: 0, boxShadow: '0 4px 20px rgba(79,70,229,0.05)' },
  hover: { y: -8, boxShadow: '0 24px 48px rgba(79,70,229,0.12)', transition: { duration: 0.28, ease: 'easeOut' } },
};

// ─── Feature Tabs Data ────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: 'security', label: 'Security', Icon: Lock,
    heading: 'Bank-Grade Security, Built In',
    desc: 'Every vote is encrypted end-to-end with AES-256. Voter authentication uses time-limited tokens, ensuring no ballot can be tampered with or duplicated.',
    points: ['End-to-end AES-256 encryption', 'Time-limited voter tokens', 'Tamper-proof audit trail', 'Legally verifiable results'],
    from: 'from-blue-500', to: 'to-indigo-600',
  },
  {
    id: 'scale', label: 'Scale', Icon: TrendingUp,
    heading: 'Built to Scale with You',
    desc: 'Whether you have 100 voters or 100,000, AfriVote handles concurrent elections effortlessly. Our infrastructure auto-scales to match your demand in real time.',
    points: ['Unlimited concurrent elections', 'Bulk CSV voter imports', 'Multi-organization support', 'Real-time load balancing'],
    from: 'from-indigo-500', to: 'to-purple-600',
  },
  {
    id: 'analytics', label: 'Analytics', Icon: BarChart3,
    heading: 'Powerful Live Analytics',
    desc: 'Watch results stream in as votes are cast. Export detailed reports to PDF, CSV, or JSON. Interactive charts give you instant insights into participation trends.',
    points: ['Live result streaming', 'Voter turnout dashboards', 'Multi-format exports (PDF, CSV, JSON)', 'Historical election comparisons'],
    from: 'from-purple-500', to: 'to-pink-600',
  },
];

// ─── Floating Mockup Card ─────────────────────────────────────────────────────
const VoteMockup = () => (
  <motion.div
    animate={{ y: [0, -12, 0] }}
    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    className="relative w-full max-w-[360px] mx-auto"
  >
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 blur-2xl opacity-25" />

    <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 dark:border-slate-800 overflow-hidden transition-all duration-300">
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-5 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white/15 rounded-xl backdrop-blur-md">
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <span className="text-white font-bold text-xs block leading-none">AfriVote Live</span>
            <span className="text-[10px] text-indigo-200">Realtime Election Node</span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-300 text-[10px] font-bold tracking-wider">LIVE</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Student Union Election</p>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>

        {[
          { name: 'Clement Peamba', votes: 842, pct: 62, color: 'bg-gradient-to-r from-indigo-500 to-indigo-600' },
          { name: 'Larbi Evans', votes: 415, pct: 31, color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
          { name: 'Abigail Abrefi', votes: 94, pct: 7, color: 'bg-gradient-to-r from-pink-400 to-rose-500' },
        ].map((c) => (
          <div key={c.name} className="space-y-1.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-100">{c.name}</span>
              <span className="text-slate-500 dark:text-slate-400 font-semibold">{c.votes.toLocaleString()} votes</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <motion.div
                className={`h-full rounded-full ${c.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${c.pct}%` }}
                transition={{ duration: 1.4, delay: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <span className="text-slate-400 font-medium">1,351 votes verified</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900">78% Turnout</span>
        </div>
      </div>

      <div className="px-6 pb-6">
        <button className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white font-extrabold py-3 rounded-2xl text-xs text-center shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-95 transition-all">
          Submit Ballot Token
        </button>
      </div>
    </div>
  </motion.div>
);

// ─── Main Landing Page Component ──────────────────────────────────────────────
export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('security');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const feature = FEATURES.find((f) => f.id === activeTab)!;
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">

      {/* Decorative Orbs */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-300/30 to-purple-300/20 dark:from-indigo-900/20 dark:to-purple-900/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-[40%] -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-purple-300/20 to-pink-300/20 dark:from-purple-950/20 dark:to-pink-900/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200/60 dark:border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div initial={isMobile ? false : { opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 cursor-pointer">
              <motion.div whileHover={{ rotate: 12, scale: 1.05 }} transition={{ duration: 0.2 }} className="p-2 bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                <Zap className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">AfriVote</span>
            </motion.div>

            {/* Desktop Actions */}
            <motion.div initial={isMobile ? false : { opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden md:flex items-center gap-2 sm:gap-3">
              <Link href="/register" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-semibold px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all text-sm">
                Register Organisation
              </Link>
              <Link href="/login" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-sm">
                Admin Sign In
              </Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href="/vote/login" className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30">
                  Voter Sign In
                </Link>
              </motion.div>
            </motion.div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden border-t border-slate-200/60 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl overflow-hidden px-4 pt-4 pb-6 space-y-3"
            >
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 py-3 rounded-2xl text-sm"
              >
                Register Organisation
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 py-3 rounded-2xl text-sm"
              >
                Admin Sign In
              </Link>
              <Link
                href="/vote/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 py-3 rounded-2xl text-sm shadow-md shadow-indigo-500/20"
              >
                Voter Sign In
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <motion.div
                initial={isMobile ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-6 shadow-sm"
              >
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                Next-Gen Voting Infrastructure for Africa
              </motion.div>

              <motion.h1
                initial={isMobile ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-[1.1]"
              >
                Secure, Verifiable<br />Elections{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                  Made Effortless
                </span>
              </motion.h1>

              <motion.p
                initial={isMobile ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-lg text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-xl font-medium"
              >
                Empower schools, institutions, enterprises, and professional bodies to deploy encrypted, transparent, tamper-proof elections in minutes.
              </motion.p>

              <motion.div
                initial={isMobile ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-base font-extrabold px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/25 transition group w-full sm:w-auto"
                  >
                    Register Organisation
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-base font-bold px-8 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 transition group w-full sm:w-auto"
                  >
                    Admin Portal
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                initial={isMobile ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800/60"
              >
                {[
                  { Icon: Shield, label: 'AES-256 Encrypted' },
                  { Icon: Globe, label: 'Pan-African Scale' },
                  { Icon: Eye, label: 'Audit Transparent' },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                    <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={isMobile ? false : { opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.2 }}
              className="flex justify-center"
            >
              <VoteMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-slate-900/50 border-y border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            variants={stagger}
            initial={isMobile ? false : "hidden"}
            whileInView={isMobile ? undefined : "visible"}
            animate={isMobile ? "visible" : undefined}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: 50000, label: 'Votes Cast', suffix: '+' },
              { value: 1200, label: 'Elections Run', suffix: '+' },
              { value: 300, label: 'Organizations', suffix: '+' },
              { value: 98, label: 'Uptime SLA', suffix: '%' },
            ].map(({ value, label, suffix }) => (
              <motion.div key={label} variants={fadeUp} className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  <AnimatedNumber value={value} suffix={suffix} />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.span
              initial={isMobile ? false : { opacity: 0 }}
              whileInView={isMobile ? undefined : { opacity: 1 }}
              animate={isMobile ? { opacity: 1 } : undefined}
              viewport={{ once: true }}
              className="text-indigo-600 dark:text-indigo-400 font-extrabold text-xs tracking-[0.2em] uppercase"
            >
              Simple Process
            </motion.span>
            <motion.h2
              initial={isMobile ? false : { opacity: 0, y: 20 }}
              whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
              animate={isMobile ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true }}
              className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-2 mb-4"
            >
              How AfriVote Works
            </motion.h2>
            <div className="h-1.5 w-16 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mb-4" />
            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Three clear steps to deploy your custom, automated digital election.
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial={isMobile ? false : "hidden"}
            whileInView={isMobile ? undefined : "visible"}
            animate={isMobile ? "visible" : undefined}
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            <div className="hidden md:block absolute top-[3.5rem] left-[20%] right-[20%] h-px border-t-2 border-dashed border-indigo-200 dark:border-indigo-900 z-0" />

            {[
              { step: '01', title: 'Create Organization', desc: 'A super admin sets up your organization profile and provisions credentials securely.', Icon: Users },
              { step: '02', title: 'Setup Ballots & Voters', desc: 'Add roles, register candidates, and import voter lists via secure CSV uploads seamlessly.', Icon: BarChart3 },
              { step: '03', title: 'Cast & Track Votes', desc: 'Voters use tokenized links to vote on any device. Watch results stream in instantly.', Icon: Shield },
            ].map((item, idx) => (
              <motion.div key={idx} variants={fadeUp} className="relative z-10">
                <motion.div
                  variants={liftCard}
                  initial="rest"
                  whileHover="hover"
                  className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center relative overflow-hidden group"
                >
                  <div className="absolute -right-2 -top-3 text-[5rem] font-black text-indigo-500/[0.04] dark:text-indigo-400/[0.05] select-none group-hover:text-indigo-500/[0.08] transition-colors leading-none">
                    {item.step}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                    <item.Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mb-2 bg-indigo-50 dark:bg-indigo-950/60 inline-block px-3 py-1 rounded-lg">
                    Step {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature Tabs */}
      <section className="py-24 bg-white dark:bg-slate-900/60 border-y border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <motion.span
              initial={isMobile ? false : { opacity: 0 }}
              whileInView={isMobile ? undefined : { opacity: 1 }}
              animate={isMobile ? { opacity: 1 } : undefined}
              viewport={{ once: true }}
              className="text-indigo-600 dark:text-indigo-400 font-extrabold text-xs tracking-[0.2em] uppercase"
            >
              Platform Capabilities
            </motion.span>
            <motion.h2
              initial={isMobile ? false : { opacity: 0, y: 20 }}
              whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
              animate={isMobile ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true }}
              className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-2 mb-4"
            >
              Everything You Need
            </motion.h2>
            <div className="h-1.5 w-16 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" />
          </div>

          <div className="flex justify-center gap-3 mb-12 flex-wrap">
            {FEATURES.map((f) => (
              <motion.button
                key={f.id}
                onClick={() => setActiveTab(f.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${activeTab === f.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                <f.Icon className="w-4 h-4" />
                {f.label}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{feature.heading}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-8">{feature.desc}</p>
                <ul className="space-y-3.5">
                  {feature.points.map((pt) => (
                    <li key={pt} className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${feature.from} ${feature.to} flex items-center justify-center shrink-0 shadow-sm`}>
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </div>
                      <span className="font-semibold text-sm">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`relative h-72 rounded-3xl bg-gradient-to-br ${feature.from} ${feature.to} flex items-center justify-center shadow-2xl overflow-hidden`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
                <div className="w-40 h-40 rounded-full border-2 border-white/20 animate-ping absolute" />
                <feature.Icon className="w-24 h-24 text-white/40 relative z-10" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Admin Lifecycle */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={isMobile ? false : { opacity: 0 }}
              whileInView={isMobile ? undefined : { opacity: 1 }}
              animate={isMobile ? { opacity: 1 } : undefined}
              viewport={{ once: true }}
              className="text-indigo-600 dark:text-indigo-400 font-extrabold text-xs tracking-[0.2em] uppercase"
            >
              For Administrators
            </motion.span>
            <motion.h2
              initial={isMobile ? false : { opacity: 0, y: 20 }}
              whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
              animate={isMobile ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true }}
              className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-2 mb-4"
            >
              Admin Operations Lifecycle
            </motion.h2>
            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Getting your organization live and ready for election day is simple.
            </p>
          </div>

          <motion.div
            variants={stagger}
            initial={isMobile ? false : "hidden"}
            whileInView={isMobile ? undefined : "visible"}
            animate={isMobile ? "visible" : undefined}
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          >
            {[
              { title: '1. Request an Organization', desc: 'Get approved instantly or contact the platform admin to format an admin login and dynamic passcode setup.', Icon: Shield, from: 'from-blue-500', to: 'to-indigo-500' },
              { title: '2. Configure Your Profile', desc: 'Log in as the top-level admin, apply custom visual branding, and establish strict access limits for your workspace.', Icon: Users, from: 'from-indigo-500', to: 'to-purple-500' },
              { title: '3. Upload Voters & Create Elections', desc: 'Assemble electoral positions, upload bio details and profile media, and queue up targeted voter rosters seamlessly.', Icon: BarChart3, from: 'from-purple-500', to: 'to-pink-500' },
              { title: '4. Track Results & Upgrade', desc: 'Evaluate telemetry using responsive analytics widgets. Export instantly to PDF, CSV, or JSON.', Icon: Star, from: 'from-pink-500', to: 'to-rose-500' },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="flex gap-5 bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className="shrink-0">
                  <div className={`p-4 bg-gradient-to-br ${step.from} ${step.to} rounded-2xl shadow-md text-white group-hover:scale-110 transition-transform`}>
                    <step.Icon className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">{step.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Register Your Organisation Section */}
      <section className="py-24 bg-white dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={isMobile ? false : { opacity: 0, y: 30 }}
            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
            animate={isMobile ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-3xl inline-flex mx-auto mb-6">
              <Building2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              Ready to Register Your Organisation?
            </h2>
            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10">
              Join hundreds of schools, churches, NGOs, and companies running secure digital elections with AfriVote. Pay a one‑time setup fee of <span className="font-bold text-emerald-600 dark:text-emerald-400">GHS 20</span> and get started immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-base font-extrabold px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/25 transition group w-full sm:w-auto"
                >
                  Register Your Organisation
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-base font-bold px-8 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300 transition group w-full sm:w-auto"
                >
                  Admin Login
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={isMobile ? false : { opacity: 0, scale: 0.96 }}
            whileInView={isMobile ? undefined : { opacity: 1, scale: 1 }}
            animate={isMobile ? { opacity: 1, scale: 1 } : undefined}
            viewport={{ once: true }}
            className="relative bg-gradient-to-tr from-indigo-950 via-indigo-900 to-purple-950 rounded-[2.5rem] shadow-2xl text-center py-16 px-6 sm:px-14 overflow-hidden border border-indigo-800/40"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
            <motion.h2
              initial={isMobile ? false : { opacity: 0, y: 12 }}
              whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
              animate={isMobile ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true }}
              className="text-3xl sm:text-5xl font-black text-white mb-5 relative z-10 tracking-tight"
            >
              Ready to Upgrade Scale?
            </motion.h2>
            <p className="text-base sm:text-lg text-indigo-100/85 max-w-2xl mx-auto mb-10 relative z-10 leading-relaxed font-medium">
              Unlock capabilities for larger voter pools, concurrent secure elections, and top-tier analytics pipelines. Transact seamlessly via Paystack.
            </p>
            <motion.a
              href="/login"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 bg-white hover:bg-indigo-50 text-indigo-950 font-black text-base px-8 py-4 rounded-2xl shadow-xl transition-all relative z-10"
            >
              Go to Billing <CreditCard className="w-5 h-5 text-indigo-600" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white dark:bg-slate-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.span
            initial={isMobile ? false : { opacity: 0 }}
            whileInView={isMobile ? undefined : { opacity: 1 }}
            animate={isMobile ? { opacity: 1 } : undefined}
            viewport={{ once: true }}
            className="text-indigo-600 dark:text-indigo-400 font-extrabold text-xs tracking-[0.2em] uppercase"
          >
            The Builders
          </motion.span>
          <motion.h2
            initial={isMobile ? false : { opacity: 0, y: 20 }}
            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
            animate={isMobile ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-2 mb-3"
          >
            Meet Our Engineering Team
          </motion.h2>
          <div className="h-1.5 w-16 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mb-6" />
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mb-16 max-w-md mx-auto">
            Built with high-performance architecture by an expert pair of developers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              { name: 'Clement Peamba Sumni', role: 'Backend Developer & API Engineer', avatar: '/images/umat.png' },
              { name: 'Evans Caleb Larbi', role: 'Frontend Engineer', avatar: '/images/evans.jpg' },
            ].map((member, idx) => (
              <motion.div
                key={idx}
                initial={isMobile ? false : { opacity: 0, y: 30 }}
                whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                animate={isMobile ? { opacity: 1, y: 0 } : undefined}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                whileHover={{ y: -6 }}
                className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group text-center"
              >
                <div className="relative inline-block mb-5">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover relative z-10 border-4 border-white dark:border-slate-800 shadow-md group-hover:scale-105 transition-transform"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{member.name}</h3>
                <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-3">{member.role}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                  Architecting resilient digital infrastructure and reliable election technologies across Africa.
                </p>
              </motion.div>
            ))}
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-16 max-w-sm mx-auto font-medium">
            AfriVote is open-source. Community contributions and security reviews are highly valued.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 bg-indigo-600 rounded-xl">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">AfriVote</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                Secure, scalable, and verifiable election infrastructure built for organizations across Africa.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-[0.15em]">Platform</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/login" className="hover:text-indigo-400 transition-colors">Admin Portal</Link></li>
                <li><Link href="/vote/login" className="hover:text-indigo-400 transition-colors">Voter Portal</Link></li>
                <li><Link href="/register" className="hover:text-indigo-400 transition-colors">Register Organisation</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-[0.15em]">Company</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/about" className="hover:text-indigo-400 transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 text-center text-xs text-slate-600 dark:text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} BfriVote. Built securely with optimal encryption pipelines.
          </div>
        </div>
      </footer>
    </div>
  );
}