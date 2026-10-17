import { NextResponse } from 'next/server';
import { bulkImportParticipants } from '@/lib/eventStorage';
import { verifyAdminRequest } from '@/lib/auth';

export async function POST(request, context) {
  try {
    const admin = await verifyAdminRequest(request);
    const params = await Promise.resolve(context?.params || {});
    const body = await request.json();
    const list = Array.isArray(body) ? body : (body.participants || []);
    const result = await bulkImportParticipants(params.id, list, admin.email);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.count} participants (${result.skipped || 0} skipped).`,
      count: result.count,
      skipped: result.skipped || 0
    });
  } catch (err) {
    const isAuth = err.message?.includes('Authentication') || err.message?.includes('expired');
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to bulk import participants.' },
      { status: isAuth ? 401 : 400 }
    );
  }
}
