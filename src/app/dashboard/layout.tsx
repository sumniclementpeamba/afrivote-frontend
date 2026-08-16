'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import SetupFeeGate from '@/components/SetupFeeGate';
import {
  Sun, Moon, Menu, X, Zap, LogOut, LayoutDashboard, Building2,
  Vote, Award, Users, UserCheck, BarChart3, CreditCard, ShieldCheck, FileText
} from 'lucide-react';
import PlanBadge from '@/components/PlanBadge';
import { isSubscriptionExpired } from '@/utils/subscription';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, plan, subscriptionEndsAt } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orgLogo, setOrgLogo] = useState<string | null>(null);
  const [debug, setDebug] = useState('');

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subscriptionExpired = isSubscriptionExpired(subscriptionEndsAt);
  const isRenewalPage = pathname === '/dashboard/renewal';

  useEffect(() => {
    const t = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const expiry = localStorage.getItem('subscriptionEndsAt');
    setDebug(`Token: ${t ? 'YES' : 'NO'}, Role: ${role || 'none'}, Expiry: ${expiry || 'none'}`);

    if (!t) {
      router.push('/login');
      return;
    }

    if (role === 'VOTER') {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userOrgId');
      router.push('/vote/login');
      return;
    }

    setToken(t);
    setUserRole(role);
    setOrgLogo(localStorage.getItem('orgLogo'));
  }, [router]);

  useEffect(() => {
    if (token && subscriptionExpired && !isRenewalPage) {
      router.push('/dashboard/renewal');
    }
  }, [token, subscriptionExpired, isRenewalPage, router]);

  const toggleDark = () => {
    if (!mounted) return;
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Checking authentication...</p>
          {debug && (
            <div className="fixed top-2 left-2 right-2 z-[999] bg-red-500/90 text-white text-xs p-3 rounded-xl shadow-lg overflow-auto max-h-40">
              {debug}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (userRole === 'VOTER') return null;

  if (subscriptionExpired && !isRenewalPage) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Your subscription has expired. Redirecting…</p>
        </div>
      </div>
    );
  }

  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex relative antialiased selection:bg-indigo-500 selection:text-white">
      {/* Debug Panel */}
      {debug && (
        <div className="fixed top-2 left-2 right-2 z-[999] bg-blue-500/90 text-white text-xs p-3 rounded-xl shadow-lg overflow-auto max-h-40">
          {debug}
        </div>
      )}

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 flex flex-col justify-between p-5 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header / Logo */}
          <div className="flex items-center justify-between pb-6 mb-4 border-b border-slate-200 dark:border-slate-800/80">
            <Link href="/dashboard" className="flex items-center gap-3" onClick={handleLinkClick}>
              <div className="p-2 bg-indigo-600 dark:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center">
                {orgLogo ? (
                  <img src={orgLogo} alt="Logo" className="w-8 h-8 object-contain" />
                ) : (
                  <Zap className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="text-xl font-black text-indigo-600 dark:text-white">
                AfriVote
              </span>
              {plan && <PlanBadge />}
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            <AnimatedNavItem href="/dashboard" Icon={LayoutDashboard} label="Dashboard" onClick={handleLinkClick} />

            {isSuperAdmin ? (
              <>
                <AnimatedNavItem href="/dashboard/organizations" Icon={Building2} label="Organizations" onClick={handleLinkClick} />
                <AnimatedNavItem href="/dashboard/elections" Icon={Vote} label="Elections" onClick={handleLinkClick} />
                <AnimatedNavItem href="/dashboard/positions" Icon={Award} label="Positions" onClick={handleLinkClick} />
                <AnimatedNavItem href="/dashboard/candidates" Icon={Users} label="Candidates" onClick={handleLinkClick} />
                <AnimatedNavItem href="/dashboard/voters" Icon={UserCheck} label="Voters" onClick={handleLinkClick} />
                <AnimatedNavItem href="/dashboard/results" Icon={BarChart3} label="Results" onClick={handleLinkClick} />
                <AnimatedNavItem href="/dashboard/upgrade-requests" Icon={CreditCard} label="Upgrade Requests" onClick={handleLinkClick} />
                <AnimatedNavItem href="/dashboard/audit-logs" Icon={FileText} label="Audit Logs" onClick={handleLinkClick} />
              </>
            ) : (
              <>
                <AnimatedNavItem href="/dashboard/organization" Icon={Building2} label="My Organization" onClick={handleLinkClick} />
                <AnimatedNavItem href="/dashboard/elections" Icon={Vote} label="Elections" onClick={handleLinkClick} />
                <AnimatedNavItem href="/dashboard/positions" Icon={Award} label="Positions" onClick={handleLinkClick} />
                <AnimatedNavItem href="/dashboard/candidates" Icon={Users} label="Candidates" onClick={handleLinkClick} />
                <AnimatedNavItem href="/dashboard/voters" Icon={UserCheck} label="Voters" onClick={handleLinkClick} />
                <AnimatedNavItem href="/dashboard/results" Icon={BarChart3} label="Results" onClick={handleLinkClick} />
                <AnimatedNavItem href="/dashboard/billing" Icon={CreditCard} label="Billing" onClick={handleLinkClick} />
                <AnimatedNavItem href="/dashboard/audit-logs" Icon={FileText} label="Audit Logs" onClick={handleLinkClick} />
              </>
            )}
          </nav>

          {/* Footer Controls / User Profile */}
          <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
            <button
              onClick={toggleDark}
              className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition"
            >
              <div className="flex items-center gap-2.5">
                {mounted && resolvedTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600" />
                )}
                <span>{mounted && resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-300 dark:border-slate-800">
                {mounted && resolvedTheme === 'dark' ? 'ON' : 'OFF'}
              </span>
            </button>

            {user && (
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 transition-all">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-indigo-500/20 shrink-0">
                  {user.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.firstName || 'User'}
                  </p>
                  <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 truncate flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 inline" />
                    {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Org Admin'}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-600/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-200 dark:border-rose-500/20 hover:border-rose-600 font-bold text-xs rounded-xl transition-all shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950">
        {/* Top Navbar Header (Mobile Menu Trigger) */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center">
                {orgLogo ? (
                  <img src={orgLogo} alt="Logo" className="w-6 h-6 object-contain" />
                ) : (
                  <Zap className="w-4 h-4 text-white" />
                )}
              </div>
              <h1 className="text-base font-black text-indigo-600 dark:text-white tracking-tight">AfriVote</h1>
              {plan && <PlanBadge />}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <SetupFeeGate>
            {children}
          </SetupFeeGate>
        </div>
      </main>
    </div>
  );
}

// ─── Sub-Component for Navigation Items (plain) ──────────────────────────────
const AnimatedNavItem = ({
  href,
  Icon,
  label,
  onClick
}: {
  href: string;
  Icon: React.ElementType;
  label: string;
  onClick: () => void;
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 active:bg-indigo-50 dark:active:bg-indigo-500/20 transition-all duration-150 group"
    >
      <Icon className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
      <span>{label}</span>
    </Link>
  );
};