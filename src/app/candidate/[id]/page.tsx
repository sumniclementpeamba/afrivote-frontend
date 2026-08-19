'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, User, FileText, BarChart3 } from 'lucide-react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

const getMediaUrl = (path: string | null | undefined) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return path;
};

export default function CandidateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await api.get(`/api/public/candidates/${id}/`);
        setCandidate(res.data);
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to load candidate');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!candidate) {
    return <div className="min-h-screen flex items-center justify-center">Candidate not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              {candidate.photo && (
                <img
                  src={getMediaUrl(candidate.photo)}
                  alt={candidate.name}
                  className="w-32 h-32 rounded-2xl object-cover shadow-lg border-4 border-white"
                />
              )}
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">{candidate.name}</h1>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">{candidate.position}</p>
                <p className="text-xs text-slate-500 mt-1">{candidate.election_title}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-bold">
                  <BarChart3 className="w-4 h-4" /> {candidate.vote_count} votes
                </div>
              </div>
            </div>

            {candidate.biography && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-500" /> Biography
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{candidate.biography}</p>
              </div>
            )}

            {candidate.manifesto && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" /> Manifesto
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{candidate.manifesto}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {candidate.biography_file && (
                <a
                  href={getMediaUrl(candidate.biography_file)}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition"
                >
                  <Download className="w-4 h-4" /> Download Biography
                </a>
              )}
              {candidate.manifesto_file && (
                <a
                  href={getMediaUrl(candidate.manifesto_file)}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition"
                >
                  <Download className="w-4 h-4" /> Download Manifesto
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}