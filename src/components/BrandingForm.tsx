'use client';
import { useState } from 'react';
import { useAuth } from '@/app/providers';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Upload, Loader2 } from 'lucide-react';

export default function BrandingForm() {
    const { plan } = useAuth();
    const [logo, setLogo] = useState<File | null>(null);
    const [primaryColor, setPrimaryColor] = useState('#4F46E5');
    const [loading, setLoading] = useState(false);

    if (plan === 'FREE') {
        return (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 text-center">
                <p className="text-amber-700 dark:text-amber-400 font-bold text-sm">🔒 Branding is a Premium feature</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                    Upgrade to Standard or Enterprise to upload your logo and choose custom colours.
                </p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        if (logo) formData.append('logo', logo);
        formData.append('primary_color', primaryColor);
        try {
            // Corrected endpoint
            const res = await api.put('/api/organizations/me/branding/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Update localStorage with the new values
            localStorage.setItem('orgPrimaryColor', primaryColor);
            if (res.data.logo_url) {
                localStorage.setItem('orgLogo', res.data.logo_url);
            } else {
                localStorage.removeItem('orgLogo');
            }

            toast.success('Branding updated! Reloading...');
            window.location.reload();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Organization Logo
                </label>
                <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors">
                        <Upload className="w-4 h-4 text-slate-400" />
                        Choose File
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setLogo(e.target.files?.[0] || null)}
                        />
                    </label>
                    {logo && <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[180px]">{logo.name}</span>}
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Primary Colour
                </label>
                <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border border-slate-200 dark:border-slate-700/80 cursor-pointer"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all text-xs disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Saving...' : 'Save Branding'}
            </button>
        </form>
    );
}