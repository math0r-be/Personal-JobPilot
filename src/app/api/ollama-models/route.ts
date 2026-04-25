import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://localhost:11434/api/tags', {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Ollama returned ' + res.status);
    const data = await res.json();
    const models: string[] = (data.models ?? []).map((m: { name: string }) => m.name);
    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({ models: [], error: 'Ollama non disponible sur localhost:11434' });
  }
}
