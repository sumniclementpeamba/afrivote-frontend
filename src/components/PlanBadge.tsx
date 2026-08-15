'use client';
import { useAuth } from '@/app/providers';

export default function PlanBadge() {
    const { plan } = useAuth();
    if (!plan || plan === 'FREE') return null;

    const label = plan === 'STANDARD' ? 'Pro' : 'Ent';
    const className =
        plan === 'STANDARD'
            ? 'bg-blue-100 text-blue-800 border border-blue-200'
            : 'bg-amber-100 text-amber-800 border border-amber-200';

    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${className}`}>
            {label}
        </span>
    );
}