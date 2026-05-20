'use client';

const adminKey = 'memoryshots_admin_token';

export function saveAdminToken(token: string) {
  localStorage.setItem(adminKey, token);
}

export function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(adminKey);
}

export function clearAdminToken() {
  localStorage.removeItem(adminKey);
}

export function guestTokenKey(slug: string) {
  return `memoryshots_guest_${slug}`;
}
