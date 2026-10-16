import { NextResponse } from 'next/server';
import { getDrawRecordById, updateDrawRecord } from '@/lib/drawStorage';

export async function GET(request, context) {
  try {
    const params = await Promise.resolve(context?.params || {});
    const id = params.id;
    const result = await getDrawRecordById(id);

    if (!result || !result.draw) {
      return NextResponse.json(
        { success: false, message: `Draw with ID "${id}" was not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      draw: result.draw,
      storage: result.storage
    });
  } catch (err) {
    const isDbError =
      err.message?.includes('MongoDB') ||
      err.message?.includes('connection') ||
      err.message?.includes('database') ||
      err.message?.includes('MONGODB_URI');
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to retrieve draw from database.' },
      { status: isDbError ? 503 : 500 }
    );
  }
}

export async function PATCH(request, context) {
  try {
    const params = await Promise.resolve(context?.params || {});
    const id = params.id;
    const body = await request.json();

    await updateDrawRecord(id, body);

    return NextResponse.json({
      success: true,
      message: 'Draw updated successfully.'
    });
  } catch (err) {
    const isDbError =
      err.message?.includes('MongoDB') ||
      err.message?.includes('connection') ||
      err.message?.includes('database') ||
      err.message?.includes('MONGODB_URI');
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to update draw in database.' },
      { status: isDbError ? 503 : 400 }
    );
  }
}
