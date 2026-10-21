import { NextResponse } from 'next/server';
import { getAllEvents, createEvent, bulkDeleteEvents } from '@/lib/eventStorage';
import { verifyAdminRequest } from '@/lib/auth';

export async function GET() {
  try {
    const events = await getAllEvents();
    return NextResponse.json({
      success: true,
      events
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to retrieve events from database.'
      },
      { status: 503 }
    );
  }
}

export async function POST(request) {
  try {
    const admin = await verifyAdminRequest(request);
    const body = await request.json();

    const created = await createEvent(body, admin.email);

    return NextResponse.json({
      success: true,
      event: created,
      message: 'Event created successfully.'
    });
  } catch (err) {
    const isAuthError = err.message?.includes('Authentication') || err.message?.includes('expired');
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to create event.'
      },
      { status: isAuthError ? 401 : 400 }
    );
  }
}

export async function DELETE(request) {
  try {
    const admin = await verifyAdminRequest(request);
    const body = await request.json();

    const eventIds = body.eventIds || body.ids || (body.eventId ? [body.eventId] : []);
    if (!eventIds.length) {
      return NextResponse.json(
        { success: false, message: 'No event IDs provided for deletion.' },
        { status: 400 }
      );
    }

    const result = await bulkDeleteEvents(eventIds, admin.email);
    return NextResponse.json(result);
  } catch (err) {
    const isAuthError = err.message?.includes('Authentication') || err.message?.includes('expired');
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to delete events.'
      },
      { status: isAuthError ? 401 : 400 }
    );
  }
}
