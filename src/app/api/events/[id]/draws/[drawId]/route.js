import { NextResponse } from 'next/server';
import { getEventDrawVersion } from '@/lib/eventStorage';

export async function GET(request, context) {
  try {
    const params = await Promise.resolve(context?.params || {});
    const result = await getEventDrawVersion(params.id, params.drawId);

    if (!result) {
      return NextResponse.json(
        { success: false, message: `Draw version "${params.drawId}" not found for this event.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      draw: result.draw,
      event: result.event
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to fetch draw version.' },
      { status: 500 }
    );
  }
}
