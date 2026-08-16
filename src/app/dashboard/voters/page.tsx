'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Upload, X, FileSpreadsheet, Trash2, Loader2, User,
  CheckCircle, XCircle, Vote, Mail, Send, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/providers';
import { Voter } from '@/types';
import Skeleton from '@/components/Skeleton';   // <-- new import
export const dynamic = 'force-dynamic'; // <-- ADD THIS

// Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
};

export default function VotersPage() {
  const queryClient = useQueryClient();
  const { plan } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Invitation states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [inviteAll, setInviteAll] = useState(false);
  const [selectedVoterIds, setSelectedVoterIds] = useState<string[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['voters'],
    queryFn: async () => {
      const res = await api.get('/api/voters/');
      return (res.data.results || res.data) as Voter[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) =>
      api.post('/api/voters/upload-csv/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: (res: any) => {
      toast.success(`Created ${res.data.created} voters. Default password: Vote@123`, { duration: 8000 });
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      setShowUpload(false);
      setFile(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Upload failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/voters/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voters'] });
      toast.success('Voter deleted');
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Failed to delete'),
  });

  // Send email invitations
  const sendInvitations = async (voterIds?: string[], sendAll = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in.');
      return;
    }
    setInviteLoading(true);
    try {
      const body = sendAll ? { send_all: true } : { voter_ids: voterIds };
      const res = await fetch('path/api/voters/send-invitations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Invitations sent!');
      } else {
        toast.error(data.error || 'Failed to send invitations');
      }
      setShowInviteModal(false);
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };

  // Send SMS invitations
  const sendSmsInvitations = async (voterIds?: string[], sendAll = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in.');
      return;
    }
    setInviteLoading(true);
    try {
      const body = sendAll ? { send_all: true } : { voter_ids: voterIds };
      const res = await fetch('path/api/voters/send-sms-invitations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'SMS invitations sent!');
      } else {
        toast.error(data.error || 'Failed to send SMS');
      }
      setShowSmsModal(false);
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, voterId: string, voterName: string) => {
    e.stopPropagation();
    if (window.confirm(`Delete voter "${voterName}"? This will also remove their votes.`)) {
      deleteMutation.mutate(voterId);
    }
  };

  const isFree = plan === 'FREE';
  const isEnterprise = plan === 'ENTERPRISE';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 relative">
      {/* Background Ambient Glow */}
      <motion.div
        className="absolute -top-10 -right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10"
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Voters</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage voter registry, upload bulk records via CSV, and monitor voting activity
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Invite All (Email) – Standard & Enterprise */}
          {!isFree && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setInviteAll(true);
                setSelectedVoterIds([]);
                setShowInviteModal(true);
              }}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-amber-600/20 transition-all text-xs"
            >
              <Mail className="w-4 h-4" /> Invite All (Email)
            </motion.button>
          )}

          {/* Invite All (SMS) – Enterprise only */}
          {isEnterprise && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setInviteAll(true);
                setSelectedVoterIds([]);
                setShowSmsModal(true);
              }}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-rose-600/20 transition-all text-xs"
            >
              <Phone className="w-4 h-4" /> Invite All (SMS)
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all text-xs"
          >
            <Upload className="w-4 h-4" /> Upload CSV
          </motion.button>
        </div>
      </div>

      {/* Free plan banner */}
      {isFree && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 text-center">
          <p className="text-amber-700 dark:text-amber-400 font-bold text-sm">
            🔒 Email & SMS invitations are Premium features
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
            Upgrade to Standard for email invitations, or Enterprise for SMS invitations.
          </p>
        </div>
      )}

      {/* Main Grid Content – skeleton during loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {data?.map((voter) => (
            <motion.div
              key={voter.id}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all relative group flex flex-col justify-between overflow-hidden"
            >
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1">
                {/* Email invite button (Standard & Enterprise) */}
                {!isFree && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVoterIds([voter.id]);
                      setInviteAll(false);
                      setShowInviteModal(true);
                    }}
                    className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                    title="Send email invite"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </motion.button>
                )}

                {/* SMS invite button (Enterprise only) */}
                {isEnterprise && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVoterIds([voter.id]);
                      setInviteAll(false);
                      setShowSmsModal(true);
                    }}
                    className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                    title="Send SMS invite"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </motion.button>
                )}

                {/* Delete button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleDelete(e, voter.id, `${voter.first_name} ${voter.last_name}`)}
                  className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                  title="Delete voter"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </motion.button>
              </div>

              {/* Voter info (unchanged) */}
              <div>
                <div className="flex flex-col items-center text-center mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center mb-3 text-indigo-600 dark:text-indigo-400 shadow-inner">
                    <User className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1">
                    {voter.first_name} {voter.last_name}
                  </h3>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate max-w-[200px] mt-0.5">{voter.email}</p>
                </div>

                <div className="space-y-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Voter ID</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-md font-mono text-[11px]">{voter.voter_id}</span>
                  </div>
                  {voter.department && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Department</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{voter.department}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Verified</span>
                    {voter.is_verified ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-500 dark:text-rose-400">
                        <XCircle className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Voted Status</span>
                    {voter.has_voted ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/50">
                        <Vote className="w-3 h-3" /> Yes
                      </span>
                    ) : (
                      <span className="font-bold text-slate-400 dark:text-slate-500">No</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && (!data || data.length === 0) && (
        <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <User className="w-8 h-8 stroke-1" />
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">No voters registered yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Get started by uploading a CSV file containing voter details.</p>
        </div>
      )}

      {/* Upload CSV Modal (unchanged) */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Upload Voter CSV</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Import bulk voter records seamlessly</p>
                </div>
                <button
                  onClick={() => setShowUpload(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 mb-6">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 w-fit mx-auto mb-4">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <label className="cursor-pointer inline-block">
                  <span className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all inline-block">
                    Choose CSV File
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
                {file && (
                  <p className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[250px] mx-auto">
                    {file.name}
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (!file) return;
                  const fd = new FormData();
                  fd.append('file', file);
                  uploadMutation.mutate(fd);
                }}
                disabled={!file || uploadMutation.isPending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Voters'
                )}
              </motion.button>

              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center space-y-1 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  CSV columns: <strong className="text-slate-700 dark:text-slate-200">email, first_name, last_name</strong> (voter_id optional)
                </p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Default password: <strong className="text-indigo-600 dark:text-indigo-400">Vote@123</strong>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Invitation Confirmation Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8"
            >
              <div className="text-center">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-2xl text-amber-600 dark:text-amber-400 w-fit mx-auto mb-4">
                  <Mail className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Send Email Invitations</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  {inviteAll
                    ? 'This will send an invitation email to all verified voters.'
                    : `Send invitation to ${selectedVoterIds.length} voter(s)?`}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  They will receive login instructions and a link to vote.
                </p>
              </div>

              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={inviteLoading}
                  onClick={() => sendInvitations(selectedVoterIds, inviteAll)}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-600/20 transition-all text-xs disabled:opacity-50"
                >
                  {inviteLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Emails
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SMS Invitation Confirmation Modal */}
      <AnimatePresence>
        {showSmsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8"
            >
              <div className="text-center">
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-2xl text-rose-600 dark:text-rose-400 w-fit mx-auto mb-4">
                  <Phone className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Send SMS Invitations</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  {inviteAll
                    ? 'This will send an SMS to all verified voters who have a phone number.'
                    : `Send SMS to ${selectedVoterIds.length} voter(s)?`}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Only voters with a phone number on file will receive the message.
                </p>
              </div>

              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => setShowSmsModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={inviteLoading}
                  onClick={() => sendSmsInvitations(selectedVoterIds, inviteAll)}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-rose-600/20 transition-all text-xs disabled:opacity-50"
                >
                  {inviteLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send SMS
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}