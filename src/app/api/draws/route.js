import { NextResponse } from 'next/server';
import { saveDrawRecord, getAllDrawRecords } from '@/lib/drawStorage';

export async function GET() {
  try {
    const result = await getAllDrawRecords();
    return NextResponse.json({
      success: true,
      draws: result.draws || [],
      storage: result.storage
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to fetch saved draws.'
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await saveDrawRecord(body);
    return NextResponse.json({
      success: true,
      draw: result.draw,
      storage: result.storage,
      message: 'Draw saved successfully.'
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to save draw record.'
      },
      { status: 400 }
    );
  }
}
