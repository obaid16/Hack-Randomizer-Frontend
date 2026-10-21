import { NextResponse } from 'next/server';
import {
  getEventById,
  addParticipant,
  bulkDeleteParticipants,
  bulkUpdateParticipantsStatus
} from '@/lib/eventStorage';
import { verifyAdminRequest } from '@/lib/auth';

export async function GET(request, context) {
  try {
    const params = await Promise.resolve(context?.params || {});
    const event = await getEventById(params.id);

    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      participants: event.participants || []
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const admin = await verifyAdminRequest(request);
    const params = await Promise.resolve(context?.params || {});
    const body = await request.json();

    const participant = await addParticipant(params.id, body, admin.email);

    return NextResponse.json({
      success: true,
      participant,
      message: 'Participant added successfully.'
    });
  } catch (err) {
    const isAuth = err.message?.includes('Authentication') || err.message?.includes('expired');
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to add participant.' },
      { status: isAuth ? 401 : 400 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    const admin = await verifyAdminRequest(request);
    const params = await Promise.resolve(context?.params || {});
    const body = await request.json();

    const participantIds = body.participantIds || body.ids || (body.participantId ? [body.participantId] : []);
    if (!participantIds.length) {
      return NextResponse.json(
        { success: false, message: 'No participant IDs provided for deletion.' },
        { status: 400 }
      );
    }

    const result = await bulkDeleteParticipants(params.id, participantIds, admin.email);
    return NextResponse.json(result);
  } catch (err) {
    const isAuth = err.message?.includes('Authentication') || err.message?.includes('expired');
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to delete participants.' },
      { status: isAuth ? 401 : 400 }
    );
  }
}

export async function PATCH(request, context) {
  try {
    const admin = await verifyAdminRequest(request);
    const params = await Promise.resolve(context?.params || {});
    const body = await request.json();

    const participantIds = body.participantIds || body.ids || [];
    const status = body.status || 'ACTIVE';

    if (!participantIds.length) {
      return NextResponse.json(
        { success: false, message: 'No participant IDs provided for status update.' },
        { status: 400 }
      );
    }

    const result = await bulkUpdateParticipantsStatus(params.id, participantIds, status, admin.email);
    return NextResponse.json(result);
  } catch (err) {
    const isAuth = err.message?.includes('Authentication') || err.message?.includes('expired');
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to update participant status.' },
      { status: isAuth ? 401 : 400 }
    );
  }
}
