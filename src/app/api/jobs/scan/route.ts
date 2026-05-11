import { NextRequest, NextResponse } from 'next/server';
import { scanAllPortals, importScanResults } from '@/lib/portal-scanner';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const keys: string[] | undefined = body.portals;

  try {
    const scanResults = await scanAllPortals(keys);
    const allResults = Object.values(scanResults).flat();

    if (allResults.length === 0) {
      return NextResponse.json({ scanned: Object.keys(scanResults).length, found: 0, message: 'Aucune offre trouvée' });
    }

    const { created, skipped } = await importScanResults(allResults);

    return NextResponse.json({
      scanned: Object.keys(scanResults).length,
      found: allResults.length,
      created,
      skipped,
      portals: Object.fromEntries(
        Object.entries(scanResults).map(([k, v]) => [k, v.length])
      ),
    });
  } catch (err) {
    console.error('[api/jobs/scan]', err);
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
  }
}
