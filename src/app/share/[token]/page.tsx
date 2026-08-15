'use client';
import { useParams } from 'next/navigation';
import { Loader2, ExternalLink } from 'lucide-react';

export default function SharedResultsPage() {
    const { token } = useParams<{ token: string }>();
    const pdfUrl = `path/share/${token}/`;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Election Results
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Live view – opens directly in your browser
                </p>
            </div>

            {/* PDF Viewer */}
            <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden relative"
                style={{ height: '70vh', maxHeight: '800px' }}>
                {/* Loading spinner */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 z-10" id="pdf-loader">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                </div>

                {/* PDF iframe */}
                <iframe
                    src={pdfUrl}
                    className="w-full h-full border-0"
                    title="Election Results"
                    onLoad={() => {
                        const loader = document.getElementById('pdf-loader');
                        if (loader) loader.style.display = 'none';
                    }}
                />
            </div>

            {/* Fallback link (in case PDF doesn't load) */}
            <div className="mt-4 text-center">
                <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open PDF directly
                </a>
            </div>

            <p className="text-xs text-slate-400 mt-4">
                Powered by <span className="font-bold text-indigo-500">AfriVote</span>
            </p>
        </div>
    );
}