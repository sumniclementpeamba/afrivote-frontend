'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import api from '@/lib/api';

interface User {
  role: string;
  organization: string | null;
  firstName: string;
  email: string;
  profilePicture: string | null;
  plan?: string;
  // subscription expiry date (ISO string)
  subscriptionEndsAt?: string | null;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  plan: string | null;
  subscriptionEndsAt: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  renewSubscription: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  plan: null,
  subscriptionEndsAt: null,
  login: () => { },
  logout: () => { },
  renewSubscription: () => { },
});

export const useAuth = () => useContext(AuthContext);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<string | null>(null);
  const [subscriptionEndsAt, setSubscriptionEndsAt] = useState<string | null>(null);
  const router = useRouter();
  const [queryClient] = useState(() => new QueryClient());

  // Helper to create a fallback expiry date (now + 28 days)
  const getDefaultExpiry = () => {
    const date = new Date();
    date.setDate(date.getDate() + 28);
    return date.toISOString();
  };

  // Load user from token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    // Read stored expiry (if any)
    const storedExpiry = localStorage.getItem('subscriptionEndsAt');
    if (storedExpiry) {
      setSubscriptionEndsAt(storedExpiry);
    }

    api.get('/api/auth/me/', { headers: { Authorization: `Bearer ${storedToken}` } })
      .then(res => {
        setToken(storedToken);

        // Save branding to localStorage
        localStorage.setItem('orgLogo', res.data.organization_logo || '');
        localStorage.setItem('orgPrimaryColor', res.data.organization_primary_color || '#4F46E5');

        // Determine subscription expiry: use API value or fallback to 28 days from now
        const expiry = res.data.subscription_ends_at || getDefaultExpiry();

        const userData: User = {
          role: res.data.role,
          organization: res.data.organization,
          firstName: res.data.first_name || 'User',
          email: res.data.email || '',
          profilePicture: res.data.profile_picture || null,
          plan: res.data.organization_plan || null,
          subscriptionEndsAt: expiry,
        };

        setUser(userData);
        setPlan(userData.plan || null);
        setSubscriptionEndsAt(expiry);

        // Always store expiry (fallback if needed)
        localStorage.setItem('subscriptionEndsAt', expiry);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userOrgId');
        localStorage.removeItem('voterId');
        localStorage.removeItem('subscriptionEndsAt');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userRole', newUser.role);
    setUser(newUser);

    if (newUser.organization) {
      localStorage.setItem('userOrgId', newUser.organization);
    } else {
      localStorage.removeItem('userOrgId');
    }

    // Plan (string)
    if (newUser.plan) {
      localStorage.setItem('userPlan', newUser.plan);
    } else {
      localStorage.removeItem('userPlan');
    }

    // Determine expiry: use provided value or fallback
    const expiry = newUser.subscriptionEndsAt || getDefaultExpiry();
    localStorage.setItem('subscriptionEndsAt', expiry);
    setSubscriptionEndsAt(expiry);

    setToken(newToken);
    setUser({ ...newUser, subscriptionEndsAt: expiry });
    setPlan(newUser.plan || null);

    // Fetch branding data immediately after login
    api.get('/api/auth/me/', { headers: { Authorization: `Bearer ${newToken}` } })
      .then(res => {
        localStorage.setItem('orgLogo', res.data.organization_logo || '');
        localStorage.setItem('orgPrimaryColor', res.data.organization_primary_color || '#4F46E5');

        // Update expiry if the API provides a value; otherwise keep existing fallback
        if (res.data.subscription_ends_at) {
          const apiExpiry = res.data.subscription_ends_at;
          localStorage.setItem('subscriptionEndsAt', apiExpiry);
          setSubscriptionEndsAt(apiExpiry);
        }
      })
      .catch(() => { /* ignore branding fetch errors */ });
  }, []);

  // Renew subscription: adds 28 days from now
  const renewSubscription = useCallback(() => {
    const newExpiry = getDefaultExpiry();

    setSubscriptionEndsAt(newExpiry);
    localStorage.setItem('subscriptionEndsAt', newExpiry);

    // Update user object if needed
    setUser(prev => (prev ? { ...prev, subscriptionEndsAt: newExpiry } : prev));
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setPlan(null);
    setSubscriptionEndsAt(null);
    router.push('/');
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          token,
          user,
          loading,
          plan,
          subscriptionEndsAt,
          login,
          logout,
          renewSubscription,
        }}
      >
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}