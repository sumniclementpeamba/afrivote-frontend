import { UserPlus, CalendarPlus, Vote, Award, BarChart3 } from 'lucide-react';

const steps = [
    {
        number: 1,
        title: 'Create an Organization',
        icon: <UserPlus className="w-5 h-5" />,
        text: 'After signing up, set up your organization (school, church, or company) and pick a plan. The Free plan lets you run one election with up to 50 voters – perfect for small clubs.',
    },
    {
        number: 2,
        title: 'Add Voters',
        icon: <UserPlus className="w-5 h-5" />,
        text: 'Upload a CSV file with voter emails, first names, and last names. AfriVote automatically sends them a welcome email. Enterprise users can also send SMS via Hubtel.',
    },
    {
        number: 3,
        title: 'Create an Election',
        icon: <CalendarPlus className="w-5 h-5" />,
        text: 'Set the election title, start/end dates, and choose anonymous or public voting. You can decide whether to show results in real‑time or after the election.',
    },
    {
        number: 4,
        title: 'Add Positions & Candidates',
        icon: <Award className="w-5 h-5" />,
        text: 'Define positions (e.g., President, Secretary) and add candidates with photos, biography, and manifesto. Candidates can even upload PDF/DOCX files – AfriVote extracts the text automatically.',
    },
    {
        number: 5,
        title: 'Monitor & Publish Results',
        icon: <BarChart3 className="w-5 h-5" />,
        text: 'Watch live turnout and vote counts. When the election ends, the winner is automatically crowned. Export results as PDF (with charts), CSV, or JSON, and share a public results link (Enterprise only).',
    },
];

export default function GettingStartedPost() {
    return (
        <div className="space-y-8">
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Setting up your first digital election with AfriVote takes less than 10 minutes.
                Follow this guide to get your organization ready to accept votes.
            </p>

            <div className="space-y-6">
                {steps.map((step) => (
                    <div
                        key={step.number}
                        className="flex gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
                    >
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            {step.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="text-xs font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full">
                                    {step.number}
                                </span>
                                {step.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                {step.text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}