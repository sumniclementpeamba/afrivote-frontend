import Link from 'next/link';
import { Clock } from 'lucide-react';

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400">
          <Clock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Pending Approval</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Your organisation is awaiting approval from the super admin. You will be notified once it is approved.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg transition"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}