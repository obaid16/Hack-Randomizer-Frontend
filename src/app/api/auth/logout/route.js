import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backendConfig';

export async function POST() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (token) {
    try {
      await fetch(`${getBackendUrl()}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (e) {
      // Backend may be offline, still proceed with clearing local cookie
    }
  }

  // Clear cookie
  cookieStore.delete('auth_token');

  return NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });
}
