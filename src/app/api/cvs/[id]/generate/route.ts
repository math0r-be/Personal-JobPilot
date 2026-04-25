import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateCVContent } from '@/lib/ai';
import { sanitizeForPrompt } from '@/lib/utils';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const cv = await prisma.cv.findUnique({ where: { id: params.id } });
  if (!cv) return NextResponse.json({ error: 'CV not found' }, { status: 404 });

  const body = await request.json();
  const { name, currentJob, experienceYears, sector, skills, experiences, education, languages } = body;

  try {
    const generatedContent = await generateCVContent({
      name: sanitizeForPrompt(name),
      currentJob: sanitizeForPrompt(currentJob),
      experienceYears,
      sector: sanitizeForPrompt(sector),
      skills: sanitizeForPrompt(skills),
      experiences: sanitizeForPrompt(experiences),
      education: sanitizeForPrompt(education),
      languages: sanitizeForPrompt(languages),
    });

    let parsed;
    try {
      const cleaned = generatedContent.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { personal: { name: sanitizeForPrompt(name), title: sanitizeForPrompt(currentJob), email: '', phone: '', location: '' }, summary: '', experience: [], education: [], skills: { hard: (skills || '').split(',').map((s: string) => s.trim()).filter(Boolean), soft: [] }, languages: [] };
    }

    const updated = await prisma.cv.update({
      where: { id: params.id },
      data: { content: JSON.stringify(parsed) },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
