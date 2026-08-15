import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';

const plans = [
    {
        name: 'Free',
        price: 'Free',
        color: 'slate',
        features: {
            'Active elections': '1',
            'Max voters': '50',
            'Email invitations': false,
            'SMS invitations': false,
            'Custom branding': false,
            'Export PDF/CSV': false,
            'Charts in exports': false,
            'Advanced analytics': false,
            'Public live sharing': false,
            Support: 'Community',
        },
    },
    {
        name: 'Standard',
        price: 'GHS 200/month',
        color: 'indigo',
        features: {
            'Active elections': '3',
            'Max voters': '500',
            'Email invitations': true,
            'SMS invitations': false,
            'Custom branding': true,
            'Export PDF/CSV': true,
            'Charts in exports': true,
            'Advanced analytics': false,
            'Public live sharing': false,
            Support: 'Email (48h)',
        },
    },
    {
        name: 'Enterprise',
        price: 'GHS 500/month',
        color: 'purple',
        features: {
            'Active elections': 'Unlimited',
            'Max voters': 'Unlimited',
            'Email invitations': true,
            'SMS invitations': true,
            'Custom branding': true,
            'Export PDF/CSV': true,
            'Charts in exports': true,
            'Advanced analytics': true,
            'Public live sharing': true,
            Support: 'Priority phone & chat',
        },
    },
];

export default function PlansComparisonPost() {
    return (
        <div className="space-y-8">
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                AfriVote offers three plans to fit every size and budget. Here’s what each tier includes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col`}
                    >
                        <div className="mb-4">
                            <h3 className={`text-lg font-black text-slate-900 dark:text-white`}>
                                {plan.name}
                            </h3>
                            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                                {plan.price}
                            </p>
                        </div>

                        <ul className="space-y-2.5 flex-1">
                            {Object.entries(plan.features).map(([feature, value]) => (
                                <li key={feature} className="flex items-start gap-2 text-sm">
                                    {value === true ? (
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                    ) : value === false ? (
                                        <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 mt-0.5 shrink-0" />
                                    ) : (
                                        <MinusCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                    )}
                                    <span className="text-slate-700 dark:text-slate-300">
                                        <strong className="text-slate-900 dark:text-white">{feature}:</strong>{' '}
                                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="p-5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl text-sm text-slate-700 dark:text-slate-300">
                <p>
                    <strong>How to upgrade:</strong> Go to your organization settings → Billing, and select the plan that fits your needs. The upgrade takes effect immediately, and you can cancel anytime.
                </p>
                <p className="mt-2">
                    <strong>Note:</strong> Prices may vary – contact us for a custom quote if you need more than 10,000 voters or dedicated hosting.
                </p>
            </div>
        </div>
    );
}