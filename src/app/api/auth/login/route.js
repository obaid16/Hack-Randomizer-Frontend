import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backendConfig';

export async function POST(request) {
  try {
    const body = await request.json();

    const response = await fetch(`${getBackendUrl()}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Login failed',
          errors: data.errors || []
        },
        { status: response.status }
      );
    }

    // Set HttpOnly cookie on Next.js response
    const cookieStore = cookies();
    cookieStore.set('auth_token', data.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      admin: data.data.admin
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Backend server is currently unreachable. Please ensure the backend is started at ' + BACKEND_URL,
        isOffline: true
      },
      { status: 503 }
    );
  }
}
