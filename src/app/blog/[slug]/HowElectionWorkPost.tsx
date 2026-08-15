import { FileText, PlayCircle, CheckCircle2, Shield, FileDown } from 'lucide-react';

function HowElectionsWorkPost() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-center">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">🗓️ Draft</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Create the election, add positions, and upload candidates. Everything stays hidden from voters until you’re ready.
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-center">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                        <PlayCircle className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">🚀 Active</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Voters receive invitations and cast their ballots. You watch the votes come in live, but individual votes are anonymous.
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-center">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">🏁 Completed</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        The election ends automatically or manually. AfriVote calculates the winners and marks them with a 👑 crown.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-500" /> Security & Anonymity
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                        Every vote is recorded with a unique hash and stored separately from the voter’s identity. That means you can prove that someone voted, but you can never see <strong>who</strong> they voted for. The results are calculated from the anonymous ballot box.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileDown className="w-5 h-5 text-emerald-500" /> After the Election
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                        Export detailed results as PDF (with charts), CSV, or JSON. Share a public PDF link for stakeholders to view the outcome. All candidates are kept in your permanent archive for future reference.
                    </p>
                </div>
            </div>
        </div>
    );
}