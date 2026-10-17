import { NextResponse } from 'next/server';
import { getEventDrawVersions } from '@/lib/eventStorage';

export async function GET(request, context) {
  try {
    const params = await Promise.resolve(context?.params || {});
    const versions = await getEventDrawVersions(params.id);

    return NextResponse.json({
      success: true,
      versions,
      draws: versions
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to retrieve draw versions.' },
      { status: 500 }
    );
  }
}
