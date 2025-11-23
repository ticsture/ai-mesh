import { NextResponse } from 'next/server';
import { untrustedModelRegistry } from '@/lib/adaptive-security/UntrustedModelRegistry';
import { ModelProbeEngine } from '@/lib/adaptive-security/ModelProbeEngine';
import { AdaptivePolicyGenerator } from '@/lib/adaptive-security/PolicyGenerator';
import { ThreatIntelligenceEngine } from '@/lib/adaptive-security/ThreatIntelligence';

// On-demand probe of a registered untrusted model
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { modelId } = body;
    if (!modelId) return NextResponse.json({ error: 'modelId required' }, { status: 400 });

    const descriptor = untrustedModelRegistry.get(modelId);
    if (!descriptor) return NextResponse.json({ error: 'model not found' }, { status: 404 });

    const threatIntel = new ThreatIntelligenceEngine();
    const policyGen = new AdaptivePolicyGenerator();
    const probeEngine = new ModelProbeEngine();

    // For realism: fetch recent threats & generate policies
    const threats = await threatIntel.scanForNewThreats();
    const policies = await policyGen.generatePoliciesFromThreats(threats);

    const result = await probeEngine.probeModel(modelId, policies);

    return NextResponse.json({ probe: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'probe failed' }, { status: 500 });
  }
}
