import { NextResponse } from 'next/server';
import { untrustedModelRegistry } from '@/lib/adaptive-security/UntrustedModelRegistry';

export async function GET() {
  const models = untrustedModelRegistry.list();
  return NextResponse.json({ models });
}
