import { NextResponse } from 'next/server';
import { generateEventTeams } from '@/lib/eventStorage';
import { verifyAdminRequest } from '@/lib/auth';

export async function POST(request, context) {
  try {
    // 1. Enforce admin authorization
    const admin = await verifyAdminRequest(request);

    // 2. Parse event ID and optional requested count
    const params = await Promise.resolve(context?.params || {});
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Empty body allowed
    }

    // 3. Generate teams and save versioned snapshot
    const result = await generateEventTeams(
      params.id,
      admin.email,
      body.requestedTeamCount ? Number(body.requestedTeamCount) : null
    );

    return NextResponse.json({
      success: true,
      draw: result.draw,
      version: result.version,
      message: `Successfully formed ${result.draw.totalTeams} teams for ${result.draw.title}.`
    });
  } catch (err) {
    const isAuth =
      err.message?.includes('Authentication') ||
      err.message?.includes('expired') ||
      err.message?.includes('log in');

    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Failed to generate teams.'
      },
      { status: isAuth ? 401 : 400 }
    );
  }
}
