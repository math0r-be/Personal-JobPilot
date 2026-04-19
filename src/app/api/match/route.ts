import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { adaptCV } from '@/lib/ai';

function parseJson(raw: string): unknown {
  const stripped = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
    .trim();
  return JSON.parse(stripped);
}

export async function POST(req: NextRequest) {
  try {
    const { jobText, cvId, jobPostingId } = await req.json() as {
      jobText: string;
      cvId?: string;
      jobPostingId?: string;
    };

    if (!jobText?.trim()) {
      return NextResponse.json({ error: 'jobText required' }, { status: 400 });
    }

    let sourceCvId = cvId;
    let sourceContent = '{}';

    if (sourceCvId) {
      const cv = await prisma.cv.findUnique({ where: { id: sourceCvId } });
      if (cv) sourceContent = cv.content;
    } else {
      const cv = await prisma.cv.findFirst({ orderBy: { updatedAt: 'desc' } });
      if (cv) {
        sourceCvId = cv.id;
        sourceContent = cv.content;
      }
    }

    const adapted = await adaptCV(sourceContent, jobText);
    const parsed = parseJson(adapted) as Record<string, unknown>;

    const adaptedTitle = (parsed.personal as { title?: string })?.title ?? '';
    const adaptedSummary = (parsed.summary as string) ?? '';
    const coverLetterBody = (parsed.coverLetter as string) ?? '';

    const adaptedCv = await prisma.cv.create({
      data: {
        title: adaptedTitle || `Candidature ${new Date().toLocaleDateString('fr-FR')}`,
        content: adapted,
        templateId: 'classic',
        jobPostingId: jobPostingId || null,
      },
    });

    if (coverLetterBody) {
      await prisma.coverLetter.create({
        data: {
          title: adaptedTitle ? `Lettre - ${adaptedTitle}` : 'Lettre de motivation',
          body: coverLetterBody,
          cvId: adaptedCv.id,
          jobPostingId: jobPostingId || null,
        },
      });
    }

    return NextResponse.json({
      score: parsed.matchScore ?? 0,
      keywords: parsed.skills ? (parsed.skills as { hard?: string[] })?.hard ?? [] : [],
      changes: [],
      coverLetter: coverLetterBody,
      adaptedTitle,
      adaptedSummary,
      cvId: adaptedCv.id,
      coverLetterId: coverLetterBody ? adaptedCv.id : null,
    });
  } catch (err) {
    console.error('[api/match]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
