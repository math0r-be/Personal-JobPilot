import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export default async function NewCvPage({ searchParams }: { searchParams: { template?: string } }) {
  const templateId = searchParams.template || 'classic';
  const cv = await prisma.cv.create({
    data: {
      title: 'Nouveau CV',
      templateId,
      content: JSON.stringify({
        personal: { name: '', title: '', email: '', phone: '', location: '' },
        summary: '',
        experience: [],
        education: [],
        skills: { hard: [], soft: [] },
        languages: [],
      }),
    },
  });

  redirect(`/dashboard/cv/${cv.id}`);
}
