import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const theme = searchParams.get('theme');

  const stories = await prisma.story.findMany({
    where: theme ? { theme } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(stories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { theme, title, situation, task, action, result, reflection, bestFor, sourceJobId } = body;

  if (!theme || !title || !situation || !task || !action || !result) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const story = await prisma.story.create({
    data: {
      theme: theme.trim(),
      title: title.trim(),
      situation: situation.trim(),
      task: task.trim(),
      action: action.trim(),
      result: result.trim(),
      reflection: reflection?.trim() || null,
      bestFor: bestFor?.trim() || '',
      sourceJobId: sourceJobId || null,
    },
  });

  return NextResponse.json(story, { status: 201 });
}