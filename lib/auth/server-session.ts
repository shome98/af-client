import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { AuthApiResponse, User } from '@/types/auth.types';

const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL;

if (!AUTH_API_BASE_URL) {
  throw new Error(
    'Missing auth API base URL. Set NEXT_PUBLIC_AUTH_API_BASE_URL.',
  );
}

const BASE = `${AUTH_API_BASE_URL.replace(/\/+$/, '')}/api`;

function createCookieHeader() {
  return (value: string) => value;
}

export async function getServerAuthUser() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${createCookieHeader()(cookie.value)}`)
    .join('; ');

  if (!cookieHeader) {
    return null;
  }

  try {
    const response = await fetch(`${BASE}/auth/me`, {
      headers: {
        cookie: cookieHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as AuthApiResponse<{ user: User }>;

    if (!data.success) {
      return null;
    }

    return data.data?.user ?? null;
  } catch {
    return null;
  }
}

export async function requireServerUser() {
  const user = await getServerAuthUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

export async function requireServerAdmin() {
  const user = await requireServerUser();

  // Keep admin authorization close to the protected leaf so the whole route
  // group can be removed later without touching shared auth plumbing.
  if (user.role !== 'admin') {
    redirect('/my-dashboard');
  }

  return user;
}

export async function redirectIfAuthenticated() {
  const user = await getServerAuthUser();

  if (user) {
    redirect('/my-dashboard');
  }
}
