'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/app/providers';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  CheckCircle, Loader2, ArrowRight, Sparkles, Building2, Rocket, Zap, ShieldCheck, RefreshCw,
} from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 'Free',
    description: 'For small organisations just getting started.',
    features: ['Up to 100 voters', '3 elections', 'Basic support'],
    planId: 'FREE',
    gradient: 'from-slate-500 to-slate-600',
    icon: Zap,
  },
  {
    name: 'Standard',
    price: 'GH₵ 30/month',
    description: 'Growing organisations that need more capacity.',
    features: [
      'Up to 5,000 voters',
      '15 elections',
      'Priority support',
      'CSV voter upload',
      'Real‑time results',
    ],
    planId: 'STANDARD',
    gradient: 'from-indigo-500 to-purple-600',
    icon: Building2,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'GH₵ 100/month',
    description: 'Large organisations with advanced requirements.',
    features: [
      'Unlimited voters',
      '50 elections',
      'Dedicated support',
      'White‑label',
      'API access',
    ],
    planId: 'ENTERPRISE',
    gradient: 'from-purple-600 to-pink-600',
    icon: Rocket,
  },
];

// Motion variants
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

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20 }
  },
};

export default function BillingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [verifying, setVerifying] = useState(false);

  const { data: org, isLoading } = useQuery({
    queryKey: ['my-organization'],
    queryFn: async () => {
      const res = await api.get('/api/organizations/me/');
      return res.data;
    },
    enabled: !!user?.organization,
  });

  const createPaymentMutation = useMutation({
    mutationFn: (plan: string) => api.post('/api/subscriptions/create-payment/', { plan }),
    onSuccess: (res) => {
      window.open(res.data.url, '_blank');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to initiate payment');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (reference: string) => {
      const plan = searchParams.get('plan') || 'STANDARD';
      return api.post('/api/subscriptions/verify-payment/', { reference, plan });
    },
    onSuccess: () => {
      toast.success('Payment verified! Your plan has been upgraded.');
      queryClient.invalidateQueries({ queryKey: ['my-organization'] });
      queryClient.invalidateQueries({ queryKey: ['elections'] });
      setVerifying(false);
      router.replace('/dashboard/billing');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Verification failed');
      setVerifying(false);
    },
  });

  // Handle redirect from Paystack
  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference) {
      setVerifying(true);
      verifyMutation.mutate(reference);
      const timeout = setTimeout(() => {
        if (verifyMutation.isPending) {
          toast.error('Verification is taking longer than expected. You can retry or contact support.');
          setVerifying(false);
        }
      }, 30000);
      return () => clearTimeout(timeout);
    }
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading billing details...</p>
      </div>
    );
  }

  const currentPlan = org?.plan || 'FREE';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8 pb-12 relative"
    >
      {/* Background Ambient Glow */}
      <motion.div
        className="absolute -top-10 -right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Billing & Plans</h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Upgrade your plan with Paystack for instant feature activation and higher voter limits
        </p>
      </div>

      {/* Payment Verification Banner */}
      {verifying && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 p-4 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 rounded-2xl text-indigo-800 dark:text-indigo-300 text-xs font-bold backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Verifying your payment transaction...</span>
          </div>
          <button
            onClick={() => {
              const ref = searchParams.get('reference');
              if (ref) verifyMutation.mutate(ref);
            }}
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 underline font-black"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </motion.div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.name.toUpperCase();
          return (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              className={`relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border p-7 flex flex-col justify-between transition-all shadow-sm hover:shadow-xl ${plan.popular
                  ? 'ring-2 ring-indigo-500 border-indigo-200 dark:border-indigo-900/80 lg:-translate-y-2'
                  : 'border-slate-200/80 dark:border-slate-800/80'
                }`}
            >
              {/* Badges Header */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1 shadow-md shadow-indigo-500/20">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3.5 right-6 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  Active Plan
                </div>
              )}

              <div>
                {/* Title & Icon */}
                <div className="flex items-center gap-3 mb-6 mt-1">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${plan.gradient} text-white shadow-md`}>
                    <plan.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{plan.name}</h3>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 line-clamp-1">{plan.description}</p>
                  </div>
                </div>

                {/* Price Display */}
                <div className="mb-6 p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{plan.price.split('/')[0]}</span>
                  {plan.planId !== 'FREE' && (
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-bold"> / month</span>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div>
                {isCurrent ? (
                  <div className="w-full py-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-center rounded-2xl text-xs font-black border border-indigo-100 dark:border-indigo-900/50">
                    Your Current Plan
                  </div>
                ) : plan.planId !== 'FREE' ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => createPaymentMutation.mutate(plan.planId)}
                    disabled={createPaymentMutation.isPending}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {createPaymentMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Upgrade to {plan.name} <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                ) : (
                  <div className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-center rounded-2xl text-xs font-bold">
                    Free Forever
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Security Footer Note */}
      <div className="flex items-center justify-center gap-2 pt-6 text-center max-w-xl mx-auto text-xs font-medium text-slate-400 dark:text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <p>
          Payments are securely processed by <span className="font-bold text-slate-700 dark:text-slate-300">Paystack</span>.
          You can upgrade, downgrade, or cancel your subscription at any time.
        </p>
      </div>
    </motion.div>
  );
}