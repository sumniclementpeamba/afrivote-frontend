'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Wallet, Loader2, ArrowDown, Eye, History } from 'lucide-react';
import { motion } from 'framer-motion';

export const dynamic = 'force-dynamic';

export default function WalletPage() {
  const queryClient = useQueryClient();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [recipientType, setRecipientType] = useState('momo');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientBankCode, setRecipientBankCode] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => (await api.get('/api/organizations/wallet/')).data,
  });

  // NEW: fetch withdrawal history
  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['my-withdrawals'],
    queryFn: async () => (await api.get('/api/organizations/withdrawals/')).data,
  });

  const withdrawMutation = useMutation({
    mutationFn: (payload: {
      amount: string;
      recipient_type: string;
      recipient_account: string;
      recipient_name: string;
      recipient_bank_code: string;
    }) => api.post('/api/organizations/withdraw/', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['my-withdrawals'] });
      toast.success('Withdrawal requested successfully!');
      setWithdrawOpen(false);
      setWithdrawAmount('');
      setRecipientType('momo');
      setRecipientAccount('');
      setRecipientName('');
      setRecipientBankCode('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to request withdrawal');
    },
  });

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (!recipientAccount || !recipientName) {
      toast.error('Please enter recipient account and name');
      return;
    }
    if (recipientType === 'bank' && !recipientBankCode) {
      toast.error('Please enter bank code');
      return;
    }
    withdrawMutation.mutate({
      amount: withdrawAmount,
      recipient_type: recipientType,
      recipient_account: recipientAccount,
      recipient_name: recipientName,
      recipient_bank_code: recipientBankCode,
    });
  };

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
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Wallet</h1>
        <p className="text-sm text-slate-500 mt-1">Your earnings from paid voting</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <Wallet className="w-4 h-4" /> Available Balance
          </div>
          <div className="mt-3 text-4xl font-black text-slate-900 dark:text-white">
            GH₵ {data?.wallet_balance || '0.00'}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <Eye className="w-4 h-4" /> Total Earned
          </div>
          <div className="mt-3 text-4xl font-black text-slate-900 dark:text-white">
            GH₵ {data?.total_earned || '0.00'}
          </div>
        </div>
      </div>

      {/* Withdraw Button */}
      <button
        onClick={() => setWithdrawOpen(true)}
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg transition"
      >
        <ArrowDown className="w-4 h-4" /> Withdraw
      </button>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white">Recent Paid Votes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase">
              <tr>
                <th className="px-4 py-3">Election</th>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3 hidden sm:table-cell">Votes</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3 hidden md:table-cell">Commission</th>
                <th className="px-4 py-3">Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.recent_transactions?.map((t: any) => (
                <tr key={t.id}>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{t.election}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.candidate}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{t.votes}</td>
                  <td className="px-4 py-3">GH₵ {t.amount}</td>
                  <td className="px-4 py-3 hidden md:table-cell">GH₵ {t.commission}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">GH₵ {t.earned}</td>
                </tr>
              ))}
              {(!data?.recent_transactions || data.recent_transactions.length === 0) && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">No paid votes yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal History */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4" /> Withdrawal History
          </h2>
        </div>
        {withdrawalsLoading ? (
          <div className="py-10 text-center text-slate-400">Loading withdrawals...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 uppercase">
                <tr>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Recipient</th>
                  <th className="px-4 py-3 hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {withdrawals?.map((w: any) => (
                  <tr key={w.id}>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">GH₵ {w.amount}</td>
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
                    <td className="px-4 py-3 hidden sm:table-cell text-slate-600 dark:text-slate-400">
                      {w.recipient_name} • {w.recipient_account}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-500">
                      {new Date(w.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!withdrawals || withdrawals.length === 0) && (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-400">No withdrawal requests yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {withdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm"
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Withdraw Funds</h3>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Amount (GH₵)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Recipient Type
                </label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="momo">Mobile Money</option>
                  <option value="bank">Bank Account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Account Number / Mobile Number
                </label>
                <input
                  type="text"
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              {recipientType === 'bank' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Bank Code
                  </label>
                  <input
                    type="text"
                    value={recipientBankCode}
                    onChange={(e) => setRecipientBankCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setWithdrawOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={withdrawMutation.isPending}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg disabled:opacity-50"
                >
                  {withdrawMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Request Withdrawal'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}