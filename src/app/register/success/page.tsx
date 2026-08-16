'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

// Optional: keep force-dynamic for extra safety
export const dynamic = 'force-dynamic';

// ─── Inner component that actually uses useSearchParams ─────────────────────
function RegistrationSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }

    api.post('/api/organizations/public-register/', {
      organization_name: localStorage.getItem('reg_org_name') || 'Organisation',
      email: localStorage.getItem('reg_email') || '',
      first_name: localStorage.getItem('reg_first_name') || 'Org',
      last_name: localStorage.getItem('reg_last_name') || 'Admin',
      phone: localStorage.getItem('reg_phone') || '',
      password: localStorage.getItem('reg_password') || 'Default@123',
      transaction_ref: reference,
    })
      .then(() => {
        setSuccess(true);
        toast.success('Registration submitted for approval!');
        localStorage.clear();
      })
      .catch((err) => {
        toast.error(err.response?.data?.error || 'Registration failed');
      })
      .finally(() => setLoading(false));
  }, [reference, router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        {loading ? (
          <>
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Processing your registration...</p>
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Registration Submitted!</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Your organisation is pending approval. You will be notified once the super admin approves it.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition"
            >
              Go to Login
            </button>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Registration Failed</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              We couldn't complete your registration. Please try again.
            </p>
            <button
              onClick={() => router.push('/register')}
              className="mt-6 w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Default export wrapped in Suspense ─────────────────────────────────────
export default function RegistrationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <RegistrationSuccessContent />
    </Suspense>
  );
}