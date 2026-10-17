import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const result = await authenticateAdmin(email, password);

    // Set secure HttpOnly cookie
    const cookieStore = cookies();
    cookieStore.set('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      admin: result.admin,
      token: result.token
    });
  } catch (error) {
    const isAuthError =
      error.message?.includes('Invalid email or password') ||
      error.message?.includes('required');

    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Authentication failed'
      },
      { status: isAuthError ? 401 : 503 }
    );
  }
}
