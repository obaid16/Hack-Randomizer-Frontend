import { NextResponse } from 'next/server';
import { getEventById, addParticipant } from '@/lib/eventStorage';
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
