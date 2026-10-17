import { NextResponse } from 'next/server';
import { updateParticipant, deleteParticipant } from '@/lib/eventStorage';
import { verifyAdminRequest } from '@/lib/auth';

export async function PATCH(request, context) {
  try {
    const admin = await verifyAdminRequest(request);
    const params = await Promise.resolve(context?.params || {});
    const body = await request.json();

    const updated = await updateParticipant(params.id, params.partId, body, admin.email);

    return NextResponse.json({
      success: true,
      participant: updated,
      message: 'Participant updated successfully.'
    });
  } catch (err) {
    const isAuth = err.message?.includes('Authentication') || err.message?.includes('expired');
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to update participant.' },
      { status: isAuth ? 401 : 400 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    const admin = await verifyAdminRequest(request);
    const params = await Promise.resolve(context?.params || {});

    const result = await deleteParticipant(params.id, params.partId, admin.email);

    return NextResponse.json(result);
  } catch (err) {
    const isAuth = err.message?.includes('Authentication') || err.message?.includes('expired');
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to delete participant.' },
      { status: isAuth ? 401 : 400 }
    );
  }
}
