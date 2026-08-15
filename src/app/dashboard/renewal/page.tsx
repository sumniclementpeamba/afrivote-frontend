'use client';

import { useAuth } from '@/app/providers';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarClock, ShieldCheck } from 'lucide-react';

export default function RenewalPage() {
  const { renewSubscription, subscriptionEndsAt, logout } = useAuth();
  const router = useRouter();

  const handleRenew = () => {
    // Extend subscription by 28 days
    renewSubscription();
    // Redirect back to dashboard
    router.push('/dashboard');
  };

  // Optional: calculate remaining days (if not expired yet, but they navigated here manually)
  const isExpired = subscriptionEndsAt
    ? new Date() >= new Date(subscriptionEndsAt)
    : true;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 relative z-10"
      >
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CalendarClock className="w-8 h-8 text-rose-500 dark:text-rose-400" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Subscription Expired
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            {isExpired
              ? 'Your subscription period has ended. Renew now to continue using AfriVote.'
              : 'Your subscription is still active. You can renew early to extend your access.'}
          </p>

          {/* Optional: show expiry date */}
          {subscriptionEndsAt && (
            <div className="mb-6 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold">Current expiry:</span>{' '}
              {new Date(subscriptionEndsAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}

          {/* Renew button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRenew}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            Renew for 28 Days
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          {/* Logout option */}
          <button
            onClick={logout}
            className="mt-4 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
          >
            Logout instead
          </button>
        </div>
      </motion.div>
    </div>
  );
}