import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  importAndAnalyze,
  getStyleProfile,
  getAllStyleProfiles,
  getContentImports,
  detectLanguage,
  getTextStats,
} from '@/lib/style-analyzer';

// POST /api/style-profile/import — Import texts and analyze style
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items } = body as {
      items: Array<{ type: string; text: string; source: string; filename?: string }>;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items provided' },
        { status: 400 }
      );
    }

    const result = await importAndAnalyze(items);

    return NextResponse.json({
      success: true,
      data: {
        imported: result.imported,
        profiles: result.profiles,
      },
    });
  } catch (error) {
    console.error('Style import error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import and analyze' },
      { status: 500 }
    );
  }
}

// GET /api/style-profile — Get all style profiles
export async function GET() {
  try {
    const profiles = await getAllStyleProfiles();
    return NextResponse.json({ success: true, data: profiles });
  } catch (error) {
    console.error('Get style profiles error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get style profiles' },
      { status: 500 }
    );
  }
}
