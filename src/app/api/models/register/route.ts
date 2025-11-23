import { NextResponse } from 'next/server';
import { untrustedModelRegistry } from '@/lib/adaptive-security/UntrustedModelRegistry';
import { securityState } from '@/lib/adaptive-security/SecurityState';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, provider = 'custom', endpoint, apiKey, model } = body;
    if (!name || !endpoint) {
      return NextResponse.json({ error: 'name and endpoint required' }, { status: 400 });
    }

    const record = untrustedModelRegistry.register({ name, provider, endpoint, apiKey, model });

    // Immediately trigger a probe cycle for the newly registered model if policies exist
    let initialProbe: any = null;
    try {
      const policies = securityState.getActivePolicies();
      if (policies.length > 0) {
        // Probe only the new model (avoid probing all by directly calling probeEngine)
        const probe = await securityState.probeEngine.probeModel(record.id, policies);
        if (probe) {
          // Mirror internal accounting similar to maybeProbeModels
          securityState.probesRun += 1;
          securityState.responsesBlocked += probe.failedPolicyChecks;
          securityState.highRiskFindings += probe.highRiskFindings;
          securityState.criticalFindings += probe.criticalFindings;
          securityState.eventLog.push({
            type: 'model_probed',
            modelId: record.id,
            totalPrompts: probe.totalProbes,
            failedPolicyChecks: probe.failedPolicyChecks,
            highRisk: probe.highRiskFindings,
            critical: probe.criticalFindings,
            timestamp: new Date()
          });
          probe.analyses.forEach(a => securityState.recordGuardianAnalysis(a));
        }
        initialProbe = probe;
      }
    } catch (err) {
      // Ignore probe failure; still return model registration success
    }

    return NextResponse.json({ model: record, initialProbe });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'registration failed' }, { status: 500 });
  }
}
