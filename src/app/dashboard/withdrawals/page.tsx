'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, Check, X } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminWithdrawalsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: async () => (await api.get('/api/organizations/admin/withdrawals/')).data,
  });

  const processMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      api.post(`/api/organizations/admin/withdrawals/${id}/process/`, { action }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      toast.success(response.data?.message || 'Withdrawal processed');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to process withdrawal');
    },
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
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Withdrawal Requests</h1>
        <p className="text-sm text-slate-500 mt-1">Approve or reject organizer payouts</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase">
              <tr>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3 hidden sm:table-cell">Requested By</th>
                <th className="px-4 py-3 hidden md:table-cell">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.map((w: any) => (
                <tr key={w.id}>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{w.organization}</td>
                  <td className="px-4 py-3">GH₵ {w.amount}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-700 dark:text-slate-300">{w.recipient_name}</div>
                    <div className="text-xs text-slate-400">
                      {w.recipient_type === 'momo' ? 'Mobile Money' : 'Bank'} • {w.recipient_account}
                    </div>
                    {w.recipient_type === 'bank' && w.recipient_bank_code && (
                      <div className="text-xs text-slate-400">Bank Code: {w.recipient_bank_code}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-slate-600 dark:text-slate-400">{w.requested_by}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-500">{new Date(w.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      w.status === 'pending'
                        ? 'bg-amber-50 text-amber-700'
                        : w.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {w.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => processMutation.mutate({ id: w.id, action: 'approve' })}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => processMutation.mutate({ id: w.id, action: 'reject' })}
                          className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {(!data || data.length === 0) && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">No withdrawal requests.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}