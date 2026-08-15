// lib/authGuard.ts
import { NextRequest, NextResponse } from 'next/server';

interface AuthResult {
  authorized: boolean;
  userId?: string;
  message?: string;
}

export async function checkAuthAndSubscription(
  request: NextRequest
): Promise<AuthResult> {
  // 1. Extract token
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return { authorized: false, message: 'No token provided' };
  }

  // 2. Call the backend's auth/me endpoint to validate token and get subscription
  try {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/auth/me/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return { authorized: false, message: 'Invalid token' };
    }

    const data = await response.json();

    // 3. Check subscription expiry
    const subscriptionEndsAt = data.subscription_ends_at; // adjust if field name differs
    if (!subscriptionEndsAt || new Date() >= new Date(subscriptionEndsAt)) {
      return { authorized: false, message: 'Subscription expired' };
    }

    // 4. Optionally extract userId (if present)
    const userId = data.user_id || data.id || data.user?.id || 'unknown';

    return { authorized: true, userId };
  } catch (error) {
    return { authorized: false, message: 'Server error during authentication' };
  }
}