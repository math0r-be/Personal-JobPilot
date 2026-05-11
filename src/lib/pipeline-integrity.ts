import { prisma } from './db';

export interface HealthReport {
  totalJobs: number;
  duplicateCount: number;
  duplicates: Array<{ company: string; role: string; ids: string[] }>;
  orphanedCvs: number;
  orphanedCoverLetters: number;
  unparsedJobs: number;
  unevaluatedJobs: number;
  statusBreakdown: Record<string, number>;
  anomalies: string[];
}

export async function healthCheck(): Promise<HealthReport> {
  const allJobs = await prisma.jobPosting.findMany({ orderBy: { createdAt: 'desc' } });
  const allCvs = await prisma.cv.findMany();
  const allCoverLetters = await prisma.coverLetter.findMany();

  const statusBreakdown: Record<string, number> = {};
  for (const j of allJobs) {
    statusBreakdown[j.status] = (statusBreakdown[j.status] || 0) + 1;
  }

  const duplicates: Array<{ company: string; role: string; ids: string[] }> = [];
  const seen = new Map<string, string[]>();
  for (const j of allJobs) {
    const key = `${j.company.toLowerCase()}|${j.title.toLowerCase()}`;
    const existing = seen.get(key);
    if (existing) {
      existing.push(j.id);
    } else {
      seen.set(key, [j.id]);
    }
  }
  Array.from(seen).forEach(([, ids]) => {
    if (ids.length > 1) {
      const job = allJobs.find(j => j.id === ids[0]);
      if (job) {
        duplicates.push({ company: job.company, role: job.title, ids });
      }
    }
  });

  const orphanedCvs = allCvs.filter(c => c.jobPostingId && !allJobs.find(j => j.id === c.jobPostingId)).length;
  const orphanedCoverLetters = allCoverLetters.filter(cl => cl.jobPostingId && !allJobs.find(j => j.id === cl.jobPostingId)).length;
  const unparsedJobs = allJobs.filter(j => !j.parsedData || j.parsedData === '{}').length;
  const unevaluatedJobs = allJobs.filter(j => j.score == null).length;

  const anomalies: string[] = [];
  const unlinkedCvs = allCvs.filter(c => c.jobPostingId && !allJobs.find(j => j.id === c.jobPostingId));
  if (unlinkedCvs.length > 0) anomalies.push(`${unlinkedCvs.length} CVs liés à des jobs supprimés`);
  if (duplicates.length > 0) anomalies.push(`${duplicates.length} doublon(s) entreprise+rôle`);
  allJobs.forEach(j => {
    const ageDays = Math.floor((Date.now() - new Date(j.createdAt).getTime()) / 86400000);
    if (j.status === 'new' && ageDays > 30) anomalies.push(`"${j.title}" chez ${j.company} — statut "new" depuis ${ageDays} jours`);
    if (j.status === 'applied' && ageDays > 60) anomalies.push(`"${j.title}" chez ${j.company} — postulé depuis ${ageDays} jours sans suivi`);
  });

  return {
    totalJobs: allJobs.length,
    duplicateCount: duplicates.length,
    duplicates,
    orphanedCvs,
    orphanedCoverLetters,
    unparsedJobs,
    unevaluatedJobs,
    statusBreakdown,
    anomalies,
  };
}

export async function deduplicate(company: string, title: string): Promise<number> {
  const key = `${company.toLowerCase()}|${title.toLowerCase()}`;
  const allJobs = await prisma.jobPosting.findMany();
  const matches = allJobs.filter(j => `${j.company.toLowerCase()}|${j.title.toLowerCase()}` === key);
  if (matches.length <= 1) return 0;

  matches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const [keep, ...remove] = matches;

  for (const r of remove) {
    await prisma.cv.updateMany({ where: { jobPostingId: r.id }, data: { jobPostingId: keep.id } });
    await prisma.coverLetter.updateMany({ where: { jobPostingId: r.id }, data: { jobPostingId: keep.id } });
    await prisma.email.updateMany({ where: { jobPostingId: r.id }, data: { jobPostingId: keep.id } });
    await prisma.activityLog.deleteMany({ where: { jobId: r.id } });
    await prisma.story.updateMany({ where: { sourceJobId: r.id }, data: { sourceJobId: keep.id } });
    await prisma.jobPosting.delete({ where: { id: r.id } });
  }

  return remove.length;
}
