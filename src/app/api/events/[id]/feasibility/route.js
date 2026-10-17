import { NextResponse } from 'next/server';
import { previewFeasibility } from '@/lib/eventStorage';

export async function GET(request, context) {
  try {
    const params = await Promise.resolve(context?.params || {});
    const feasibility = await previewFeasibility(params.id);

    return NextResponse.json({
      success: true,
      feasibility
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to calculate feasibility.' },
      { status: 500 }
    );
  }
}
