export function isSubscriptionExpired(subscriptionEndsAt: string | null | undefined): boolean {
  // If no expiry date is present, assume the user is active (or not required)
  if (!subscriptionEndsAt) return false;

  const now = new Date();
  const end = new Date(subscriptionEndsAt);

  return now >= end;
}