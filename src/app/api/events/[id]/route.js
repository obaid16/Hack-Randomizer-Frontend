import { NextResponse } from 'next/server';
import { getEventById, updateEvent, deleteEvent } from '@/lib/eventStorage';
import { verifyAdminRequest } from '@/lib/auth';

export async function GET(request, context) {
  try {
    const params = await Promise.resolve(context?.params || {});
    const event = await getEventById(params.id);

    if (!event) {
      return NextResponse.json(
        { success: false, message: `Event with ID "${params.id}" not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch event.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, context) {
  try {
    const admin = await verifyAdminRequest(request);
    const params = await Promise.resolve(context?.params || {});
    const body = await request.json();

    const updated = await updateEvent(params.id, body, admin.email);

    return NextResponse.json({
      success: true,
      event: updated,
      message: 'Event updated successfully.'
    });
  } catch (err) {
    const isAuth = err.message?.includes('Authentication') || err.message?.includes('expired');
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to update event.' },
      { status: isAuth ? 401 : 400 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    const admin = await verifyAdminRequest(request);
    const params = await Promise.resolve(context?.params || {});

    const result = await deleteEvent(params.id, admin.email);

    return NextResponse.json(result);
  } catch (err) {
    const isAuth = err.message?.includes('Authentication') || err.message?.includes('expired');
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to delete event.' },
      { status: isAuth ? 401 : 400 }
    );
  }
}
