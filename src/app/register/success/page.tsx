'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function RegistrationSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const reference = searchParams.get('reference');

    if (!reference) {
      setLoading(false);
      return;
    }

    const submitRegistration = async () => {
      try {
        const organization_name =
          localStorage.getItem('reg_org_name') || 'Organisation';

        const email =
          localStorage.getItem('reg_email') || '';

        const first_name =
          localStorage.getItem('reg_first_name') || 'Org';

        const last_name =
          localStorage.getItem('reg_last_name') || 'Admin';

        const phone =
          localStorage.getItem('reg_phone') || '';

        const password =
          localStorage.getItem('reg_password') || 'Default@123';

        await api.post('/api/organizations/public-register/', {
          organization_name,
          email,
          first_name,
          last_name,
          phone,
          password,
          transaction_ref: reference,
        });

        setSuccess(true);

        toast.success(
          'Registration submitted for approval!'
        );

        localStorage.removeItem('reg_org_name');
        localStorage.removeItem('reg_email');
        localStorage.removeItem('reg_first_name');
        localStorage.removeItem('reg_last_name');
        localStorage.removeItem('reg_phone');
        localStorage.removeItem('reg_password');
      } catch (err: any) {
        toast.error(
          err?.response?.data?.error ||
            'Registration failed'
        );

        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    submitRegistration();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">

        {loading ? (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />

            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Processing Registration
            </h1>

            <p className="text-slate-600 dark:text-slate-400">
              Please wait while we verify your payment and complete your registration.
            </p>
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />

            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Registration Submitted!
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
              Your organisation has been registered successfully and is awaiting approval from the platform administrator.
            </p>

            <button
              onClick={() => router.push('/login')}
              className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all duration-300"
            >
              Go to Login
            </button>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />

            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Registration Failed
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
              We could not complete your registration. Please try again or contact support if the issue persists.
            </p>

            <button
              onClick={() => router.push('/register')}
              className="mt-6 w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all duration-300"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}