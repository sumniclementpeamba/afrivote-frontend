'use client';
import { motion, useInView, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle,
  Zap,
  Star,
  CreditCard,
  ArrowRight,
} from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 'Free',
    description: 'For small organisations just getting started.',
    features: ['Up to 100 voters', '3 elections', 'Basic support'],
    icon: Zap,
    gradient: 'from-slate-400 to-slate-500',
    popular: false,
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
    icon: CreditCard,
    gradient: 'from-blue-500 to-indigo-500',
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
    icon: Star,
    gradient: 'from-purple-500 to-pink-500',
    popular: false,
  },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

export default function PublicPricingPage() {
  return (
    <div className="min-h-screen bg-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-lg">
            Choose a plan that fits your organisation. Upgrade, downgrade, or cancel at any time.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-start"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={item}
              whileHover={{ y: -8 }}
              className={`relative bg-white rounded-3xl shadow-sm border p-8 flex flex-col h-full transition-shadow duration-300 ${
                plan.popular
                  ? 'ring-2 ring-indigo-500 border-indigo-200 shadow-lg shadow-indigo-200/50'
                  : 'border-slate-200 hover:shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-lg shadow-indigo-200">
                  Most Popular
                </div>
              )}
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${plan.gradient} shadow-md`}>
                  <plan.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{plan.name}</h3>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-black text-slate-900">{plan.price}</span>
              </div>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">{plan.description}</p>
              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-slate-700 text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                {plan.name === 'Free' ? (
                  <Link
                    href="/login"
                    className="w-full py-3.5 inline-block text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-colors"
                  >
                    Get Started
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="w-full py-3.5 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-colors"
                  >
                    Upgrade to {plan.name}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <p className="text-center text-sm text-slate-400 mt-16">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium underline underline-offset-2">
            Sign in
          </Link>{' '}
          to manage your billing.
        </p>
      </div>
    </div>
  );
}