import { NextRequest, NextResponse } from 'next/server';
import { getContentImports } from '@/lib/style-analyzer';

// GET /api/content-imports — List all imported content
export async function GET() {
  try {
    const imports = await getContentImports();
    return NextResponse.json({ success: true, data: imports });
  } catch (error) {
    console.error('Get content imports error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get content imports' },
      { status: 500 }
    );
  }
}
