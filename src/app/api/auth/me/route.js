import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(request) {
  const cookieStore = cookies();
  let token = cookieStore.get('auth_token')?.value;

  if (!token && request.headers) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

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

  const decoded = verifyAdminToken(token);
  if (!decoded) {
    cookieStore.delete('auth_token');
    return NextResponse.json(
      {
        success: false,
        message: 'Session expired or invalid',
        admin: null
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    admin: {
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    }
  });
}
