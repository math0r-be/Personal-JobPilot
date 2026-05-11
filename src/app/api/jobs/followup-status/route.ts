import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const CADENCE = {
  appliedFirst: 7,
  appliedSubsequent: 7,
  appliedMaxFollowups: 2,
  respondedInitial: 1,
  respondedSubsequent: 3,
  interviewThankyou: 1,
};

type Urgency = 'overdue' | 'urgent' | 'waiting' | 'cold' | 'none';

function daysBetween(d1: Date, d2: Date): number {
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function computeUrgency(
  status: string,
  createdAt: Date,
  followUpCount: number,
  lastFollowUpAt: Date | null,
  followUpDate: Date | null
): Urgency {
  const now = new Date();

  if (status === 'applied') {
    if (followUpCount >= CADENCE.appliedMaxFollowups) return 'cold';
    if (followUpCount === 0) {
      const daysSince = daysBetween(createdAt, now);
      return daysSince >= CADENCE.appliedFirst ? 'overdue' : 'waiting';
    }
    if (lastFollowUpAt) {
      const daysSinceLast = daysBetween(lastFollowUpAt, now);
      return daysSinceLast >= CADENCE.appliedSubsequent ? 'overdue' : 'waiting';
    }
    return 'waiting';
  }

  if (status === 'responded') {
    const daysSince = daysBetween(createdAt, now);
    return daysSince >= CADENCE.respondedInitial ? 'overdue' : 'waiting';
  }

  if (status === 'interview') {
    const daysSince = daysBetween(createdAt, now);
    return daysSince >= CADENCE.interviewThankyou ? 'overdue' : 'waiting';
  }

  return 'none';
}

function computeNextFollowupDate(
  status: string,
  createdAt: Date,
  lastFollowUpAt: Date | null,
  followUpCount: number,
  followUpDate: Date | null
): Date | null {
  if (status === 'applied') {
    if (followUpCount >= CADENCE.appliedMaxFollowups) return null;
    if (followUpCount === 0) return addDays(createdAt, CADENCE.appliedFirst);
    if (lastFollowUpAt) return addDays(lastFollowUpAt, CADENCE.appliedSubsequent);
    return addDays(createdAt, CADENCE.appliedFirst);
  }
  if (status === 'responded') {
    if (lastFollowUpAt) return addDays(lastFollowUpAt, CADENCE.respondedSubsequent);
    return addDays(createdAt, CADENCE.respondedSubsequent);
  }
  if (status === 'interview') {
    return followUpDate ?? addDays(createdAt, CADENCE.interviewThankyou);
  }
  return null;
}

export async function GET() {
  const ACTIONABLE_STATUSES = ['applied', 'responded', 'interview'];

  const jobs = await prisma.jobPosting.findMany({
    where: {
      status: { in: ACTIONABLE_STATUSES },
    },
    orderBy: { createdAt: 'asc' },
  });

  const now = new Date();
  const entries = jobs.map(job => {
    const lastFollowUpAt = job.lastFollowUpAt ? new Date(job.lastFollowUpAt) : null;
    const createdAt = new Date(job.createdAt);
    const followUpDate = job.followUpDate ? new Date(job.followUpDate) : null;
    const followUpCount = job.followUpCount ?? 0;

    const urgency = computeUrgency(job.status, createdAt, followUpCount, lastFollowUpAt, followUpDate);
    const nextDate = computeNextFollowupDate(job.status, createdAt, lastFollowUpAt, followUpCount, followUpDate);
    const daysUntilNext = nextDate ? daysBetween(now, nextDate) : null;
    const daysSinceApp = daysBetween(createdAt, now);
    const daysSinceLastFollowup = lastFollowUpAt ? daysBetween(lastFollowUpAt, now) : null;

    return {
      id: job.id,
      title: job.title,
      company: job.company,
      status: job.status,
      urgency,
      daysSinceApplication: daysSinceApp,
      daysSinceLastFollowup,
      followUpCount,
      nextFollowupDate: nextDate?.toISOString().split('T')[0] ?? null,
      daysUntilNext,
      followUpDate: followUpDate?.toISOString().split('T')[0] ?? null,
    };
  });

  const urgencyOrder: Record<Urgency, number> = { urgent: 0, overdue: 1, waiting: 2, cold: 3, none: 9 };
  entries.sort((a, b) => (urgencyOrder[a.urgency] ?? 9) - (urgencyOrder[b.urgency] ?? 9));

  const stats = {
    total: entries.length,
    overdue: entries.filter(e => e.urgency === 'overdue').length,
    urgent: entries.filter(e => e.urgency === 'urgent').length,
    waiting: entries.filter(e => e.urgency === 'waiting').length,
    cold: entries.filter(e => e.urgency === 'cold').length,
  };

  return NextResponse.json({ entries, stats });
}