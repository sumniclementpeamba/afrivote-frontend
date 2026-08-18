'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, TrendingUp, DollarSign, Vote } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SuperAdminEarningsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['super-admin-earnings'],
    queryFn: async () => (await api.get('/api/organizations/earnings/')).data,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Platform Earnings</h1>
        <p className="text-sm text-slate-500 mt-1">Your revenue from paid voting</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" /> Total Commission
          </div>
          <div className="mt-3 text-4xl font-black text-slate-900 dark:text-white">
            GH₵ {data?.total_commission || '0.00'}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <DollarSign className="w-4 h-4" /> Total Processed
          </div>
          <div className="mt-3 text-4xl font-black text-slate-900 dark:text-white">
            GH₵ {data?.total_amount_processed || '0.00'}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <Vote className="w-4 h-4" /> Paid Votes
          </div>
          <div className="mt-3 text-4xl font-black text-slate-900 dark:text-white">
            {data?.total_paid_votes || 0}
          </div>
        </div>
      </div>
    </div>
  );
}