'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/app/providers';
import { Loader2, ShieldCheck, RefreshCw, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SetupFeeGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['setup-status', user?.organization],
    queryFn: async () => {
      const res = await api.get('/api/organizations/setup-status/');
      return res.data;
    },
    enabled: !!user?.organization && user?.role !== 'SUPER_ADMIN',
  });

  if (user?.role === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <p className="text-slate-500 dark:text-slate-400 text-sm">Could not load setup status.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
          Retry
        </button>
      </div>
    );
  }

  if (!data.setup_fee_paid) {
    const handleRedirectToPaystack = () => {
      const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      const amountInPesewas = (data.setup_fee_amount || 20) * 100;
      const email = user?.email || '';
      const organizationId = data.organization_id;

      // Build Paystack checkout URL (hosted page)
      const paystackUrl = new URL('https://checkout.paystack.com');
      paystackUrl.searchParams.set('public_key', publicKey || '');
      paystackUrl.searchParams.set('email', email);
      paystackUrl.searchParams.set('amount', String(amountInPesewas));
      paystackUrl.searchParams.set('currency', 'GHS');
      paystackUrl.searchParams.set('reference', `setup-${organizationId}-${Date.now()}`);
      paystackUrl.searchParams.set('metadata', JSON.stringify({ organization_id: organizationId }));

      window.location.href = paystackUrl.toString();
    };

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Complete Your Setup</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {data.organization_name || 'Your organisation'} is pending a one‑time setup fee of{' '}
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              GHS {data.setup_fee_amount || 20}
            </span>.
          </p>

          <button
            onClick={handleRedirectToPaystack}
            className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2"
          >
            Pay Setup Fee
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}