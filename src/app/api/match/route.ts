import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { adaptCV } from '@/lib/ai';
import { matchSchema } from '@/lib/schemas';
import { parseJson } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = matchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }
    const { jobText, cvId, jobPostingId, referenceCvId } = parsed.data;

    let sourceCvId = cvId;
    let sourceContent = '{}';

    if (referenceCvId) {
      const refCv = await prisma.cv.findUnique({ where: { id: referenceCvId } });
      if (refCv) {
        sourceCvId = referenceCvId;
        sourceContent = refCv.content;
      }
    } else if (sourceCvId) {
      const cv = await prisma.cv.findUnique({ where: { id: sourceCvId } });
      if (cv) sourceContent = cv.content;
    } else {
      const refCv = await prisma.cv.findFirst({ where: { isReference: true } });
      if (refCv) {
        sourceCvId = refCv.id;
        sourceContent = refCv.content;
      } else {
        const cv = await prisma.cv.findFirst({ orderBy: { updatedAt: 'desc' } });
        if (cv) {
          sourceCvId = cv.id;
          sourceContent = cv.content;
        }
      }
    }

    const adapted = await adaptCV(sourceContent, jobText);
    const parsedResult = parseJson(adapted) as Record<string, unknown>;

    const adaptedTitle = (parsedResult.personal as { title?: string })?.title ?? '';
    const adaptedSummary = (parsedResult.summary as string) ?? '';
    const coverLetterBody = (parsedResult.coverLetter as string) ?? '';

    const adaptedCv = await prisma.cv.create({
      data: {
        title: adaptedTitle || `Candidature ${new Date().toLocaleDateString('fr-FR')}`,
        content: adapted,
        templateId: 'atlas',
        jobPostingId: jobPostingId || null,
        matchScore: typeof parsedResult.matchScore === 'number' ? parsedResult.matchScore : null,
      },
    });

    let coverLetterId: string | null = null;

    if (coverLetterBody) {
      const created = await prisma.coverLetter.create({
        data: {
          title: adaptedTitle ? `Lettre - ${adaptedTitle}` : 'Lettre de motivation',
          body: coverLetterBody,
          cvId: adaptedCv.id,
          jobPostingId: jobPostingId || null,
        },
      });
      coverLetterId = created.id;
    }

    if (jobPostingId) {
      await prisma.activityLog.create({
        data: { jobId: jobPostingId, type: 'CV_SENT', description: `CV créé pour ${adaptedTitle || 'candidature'}` },
      });
    }

    return NextResponse.json({
      score: parsedResult.matchScore ?? 0,
      matchedSkills: (parsedResult.matchedSkills as string[]) ?? [],
      missingSkills: (parsedResult.missingSkills as string[]) ?? [],
      yearsMatch: (parsedResult.yearsMatch as string) ?? '',
      keywords: parsedResult.skills ? (parsedResult.skills as { hard?: string[] })?.hard ?? [] : [],
      changes: [],
      coverLetter: coverLetterBody,
      adaptedTitle,
      adaptedSummary,
      cvId: adaptedCv.id,
      coverLetterId,
    });
  } catch (err) {
    console.error('[api/match]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
