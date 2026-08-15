// components/PlanThemeInitializer.tsx
'use client';
import { useEffect } from 'react';
import { useAuth } from '@/app/providers';

export default function PlanThemeInitializer() {
    const { plan } = useAuth();

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('plan-free', 'plan-standard', 'plan-enterprise');
        if (plan) {
            root.classList.add(`plan-${plan.toLowerCase()}`);
        }
    }, [plan]);

    return null;
}