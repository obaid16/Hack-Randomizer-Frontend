import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backendConfig';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: 'No active session found',
        admin: null
      },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(`${getBackendUrl()}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 401) {
        cookieStore.delete('auth_token');
      }
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Session expired',
          admin: null
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      admin: data.data.admin
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Backend server is currently unreachable.',
        isOffline: true
      },
      { status: 503 }
    );
  }
}
