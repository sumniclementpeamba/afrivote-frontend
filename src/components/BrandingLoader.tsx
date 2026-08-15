'use client';
import { useEffect } from 'react';
import { useAuth } from '@/app/providers';

export default function BrandingLoader() {
    const { user } = useAuth();

    useEffect(() => {
        const root = document.documentElement;

        // Use the organization’s primary colour if available, else default indigo
        const storedColor = localStorage.getItem('orgPrimaryColor');
        const color = storedColor || '#4F46E5';
        root.style.setProperty('--color-primary', hexToRgb(color));

        // Logo – you can set a CSS variable for the logo URL
        const logoUrl = localStorage.getItem('orgLogo');
        if (logoUrl) {
            root.style.setProperty('--org-logo', `url(${logoUrl})`);
            root.classList.add('has-org-logo');
        } else {
            root.classList.remove('has-org-logo');
        }
    }, [user]);

    return null;
}

// Helper to convert hex to RGB string for Tailwind
function hexToRgb(hex: string): string {
    const c = hex.substring(1);      // strip #
    const rgb = parseInt(c, 16);      // convert rrggbb to decimal
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return `${r} ${g} ${b}`;
}