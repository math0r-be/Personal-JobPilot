const PORTALS: Record<string, { name: string; type: 'greenhouse' | 'ashby' | 'lever' | 'wellfound' | 'custom'; baseUrl: string; jobListPattern: string; companyId?: string }> = {
  'anthropic': { name: 'Anthropic', type: 'greenhouse', baseUrl: 'https://boards.greenhouse.io', jobListPattern: '/anthropic/jobs', companyId: 'anthropic' },
  'openai': { name: 'OpenAI', type: 'custom', baseUrl: 'https://openai.com', jobListPattern: '/careers', companyId: '' },
  'mistral': { name: 'Mistral', type: 'custom', baseUrl: 'https://mistral.ai', jobListPattern: '/careers', companyId: '' },
  'huggingface': { name: 'Hugging Face', type: 'custom', baseUrl: 'https://huggingface.co', jobListPattern: '/careers', companyId: '' },
};

export type ScanResult = {
  company: string;
  title: string;
  url: string;
  location?: string;
};

export async function scanPortal(portalKey: string): Promise<ScanResult[]> {
  const portal = PORTALS[portalKey];
  if (!portal) throw new Error(`Unknown portal: ${portalKey}`);

  try {
    const url = `${portal.baseUrl}${portal.jobListPattern}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    return parseJobsFromHtml(html, portal);
  } catch (err) {
    console.error(`[portal-scanner] Failed to scan ${portalKey}:`, err);
    return [];
  }
}

function parseJobsFromHtml(html: string, portal: { name: string; type: string }): ScanResult[] {
  const results: ScanResult[] = [];

  if (portal.type === 'greenhouse') {
    const regex = /<a[^>]*href="([^"]*\/jobs\/[^"]+)"[^>]*>([^<]+)<\/a>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const title = match[2].trim();
      const href = match[1].startsWith('http') ? match[1] : `https://boards.greenhouse.io${match[1]}`;
      if (title && title.length > 2 && !results.some(r => r.title === title)) {
        results.push({ company: portal.name, title, url: href });
      }
    }
  }

  return results.slice(0, 30);
}

export async function scanAllPortals(keys?: string[]): Promise<Record<string, ScanResult[]>> {
  const targets = keys || Object.keys(PORTALS);
  const results: Record<string, ScanResult[]> = {};
  await Promise.allSettled(
    targets.map(async (key) => {
      try {
        const jobs = await scanPortal(key);
        if (jobs.length > 0) results[key] = jobs;
      } catch {}
    })
  );
  return results;
}

export async function importScanResults(results: ScanResult[]): Promise<{ created: number; skipped: number }> {
  const { prisma } = await import('./db');
  let created = 0;
  let skipped = 0;

  for (const job of results) {
    const existing = await prisma.jobPosting.findFirst({
      where: { company: job.company, title: job.title },
    });
    if (existing) { skipped++; continue; }

    await prisma.jobPosting.create({
      data: {
        title: job.title,
        company: job.company,
        location: job.location || '',
        url: job.url,
        rawText: `${job.title} - ${job.company}${job.location ? ` - ${job.location}` : ''}`,
        status: 'new',
      },
    });
    created++;
  }

  return { created, skipped };
}
