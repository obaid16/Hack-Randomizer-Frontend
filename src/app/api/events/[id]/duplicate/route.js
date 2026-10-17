import { NextResponse } from 'next/server';
import { duplicateEventTemplate } from '@/lib/eventStorage';
import { verifyAdminRequest } from '@/lib/auth';

export async function POST(request, context) {
  try {
    const admin = await verifyAdminRequest(request);
    const params = await Promise.resolve(context?.params || {});
    const body = await request.json();

    const cloned = await duplicateEventTemplate(params.id, body, admin.email);

    return NextResponse.json({
      success: true,
      event: cloned,
      message: 'Event template duplicated successfully.'
    });
  } catch (err) {
    const isAuth = err.message?.includes('Authentication') || err.message?.includes('expired');
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to duplicate event template.' },
      { status: isAuth ? 401 : 400 }
    );
  }
}
