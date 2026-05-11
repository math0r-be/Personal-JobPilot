import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface ScoredJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  status: string;
  matchScore: number | null;
  remoteScore: number;
  levelScore: number;
  salaryScore: number;
  growthScore: number;
  totalScore: number;
  notes: string;
}

function scoreRemote(location: string | null, rawText: string): number {
  const text = `${location ?? ''} ${rawText}`.toLowerCase();
  if (text.includes('remote') || text.includes('100%') || text.includes('full remote') || text.includes('teletravail')) return 5;
  if (text.includes('hybride') || text.includes('hybrid') || text.includes('2 jours')) return 3;
  if (text.includes('sur site') || text.includes('on-site') || text.includes(' présentiel')) return 1;
  if (!location) return 3;
  return 2;
}

function scoreLevel(title: string | null, rawText: string): number {
  const text = `${title ?? ''} ${rawText}`.toLowerCase();
  if (text.includes('director') || text.includes('vp ') || text.includes('head of')) return 5;
  if (text.includes('principal') || text.includes('staff')) return 4;
  if (text.includes('senior') || text.includes('sr.') || text.includes('lead')) return 3;
  if (text.includes('mid') || text.includes('confirmé')) return 2;
  return 1;
}

function scoreSalary(salary: string | null): number {
  if (!salary) return 2;
  const cleaned = salary.replace(/[^0-9k]/gi, '');
  const nums = cleaned.match(/\d+/g);
  if (!nums || nums.length === 0) return 2;
  const num = Math.min(...nums.map(Number));
  if (num >= 80) return 5;
  if (num >= 60) return 4;
  if (num >= 45) return 3;
  if (num >= 35) return 2;
  return 1;
}

function scoreGrowth(title: string | null, rawText: string): number {
  const text = `${title ?? ''} ${rawText}`.toLowerCase();
  const positive = ['startup', 'scale-up', 'series a', 'series b', 'series c', 'unicorn', 'hypergrowth', 'en forte croissance'];
  const negative = ['large entreprise', 'big corp', 'legacy', 'conglomérat'];
  const posMatches = positive.filter(k => text.includes(k)).length;
  const negMatches = negative.filter(k => text.includes(k)).length;
  if (posMatches > negMatches) return 4 + Math.min(posMatches, 2);
  if (negMatches > posMatches) return Math.max(1, 3 - negMatches);
  return 3;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { jobIds } = body as { jobIds: string[] };

  if (!jobIds || !Array.isArray(jobIds) || jobIds.length < 2) {
    return NextResponse.json({ error: 'Minimum 2 job IDs required' }, { status: 400 });
  }

  const jobs = await prisma.jobPosting.findMany({
    where: { id: { in: jobIds } },
    include: {
      cvs: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  const validJobs = jobs.filter(j => jobIds.includes(j.id));
  if (validJobs.length < 2) {
    return NextResponse.json({ error: 'Not enough valid jobs found' }, { status: 400 });
  }

  const SCORES: ScoredJob[] = validJobs.map(job => {
    const matchScore = job.cvs[0]?.matchScore ?? null;
    const cvMatchNorm = matchScore !== null ? Math.round(matchScore / 20) : 3;

    const remoteScore = scoreRemote(job.location, job.rawText);
    const levelScore = scoreLevel(job.title, job.rawText);
    const salaryScore = scoreSalary(job.salary);
    const growthScore = scoreGrowth(job.title, job.rawText);

    const totalScore = Math.round((
      cvMatchNorm * 0.30 +
      salaryScore * 0.20 +
      levelScore * 0.20 +
      remoteScore * 0.15 +
      growthScore * 0.15
    ) * 10) / 10;

    let notes = '';
    if (cvMatchNorm >= 4) notes += 'CV match excellent. ';
    else if (cvMatchNorm <= 2) notes += 'CV match faible — à vérifier. ';
    if (remoteScore >= 4) notes += 'Remote-friendly. ';
    else if (remoteScore <= 1) notes += 'Sur site — attention. ';
    if (salaryScore >= 4) notes += 'Package compétitif. ';
    else if (salaryScore <= 1) notes += 'Salaire à négocier. ';

    return {
      id: job.id,
      title: job.title || 'Sans titre',
      company: job.company || 'Entreprise inconnue',
      location: job.location || '',
      salary: job.salary,
      status: job.status,
      matchScore,
      remoteScore,
      levelScore,
      salaryScore,
      growthScore,
      totalScore,
      notes: notes.trim(),
    };
  });

  SCORES.sort((a, b) => b.totalScore - a.totalScore);

  return NextResponse.json({ jobs: SCORES });
}