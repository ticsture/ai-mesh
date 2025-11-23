import { NextRequest, NextResponse } from 'next/server';
import { GroqService } from '@/lib/services/GroqService';
import { securityState } from '@/lib/adaptive-security/SecurityState';
import { untrustedModelRegistry } from '@/lib/adaptive-security/UntrustedModelRegistry';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // Gather comprehensive context for AI
    const threats = await securityState.threatIntel.getThreatIntelligence();
    const policies = securityState.getActivePolicies();
    const models = untrustedModelRegistry.list();
    const metrics = securityState.computeMetrics(threats.patterns);
    const recentEvents = securityState.eventLog.slice(-20);

    // Build context prompt
    const contextPrompt = `You are an AI security analyst assistant with access to real-time security data.

CURRENT SYSTEM STATE:
- Threats Detected: ${metrics.threatsDetected}
- Active Policies: ${metrics.policiesActive}
- Probes Run: ${metrics.probesRun}
- Responses Blocked: ${metrics.responsesBlocked}
- High-Risk Findings: ${metrics.highRiskFindings}
- Critical Findings: ${metrics.criticalFindings}

REGISTERED MODELS:
${models.map(m => `- ${m.name} (${m.provider}): Risk ${m.lastRiskSummary?.riskLevel || 'UNKNOWN'}, Monitoring: ${m.monitoringEnabled ? 'ACTIVE' : 'PAUSED'}, Probes: ${m.probeCount || 0}`).join('\n')}

RECENT THREATS (Last 5):
${threats.patterns.slice(0, 5).map(t => `- ${t.name} (${t.severity}): ${t.description.slice(0, 100)}`).join('\n')}

RECENT EVENTS (Last 10):
${recentEvents.slice(-10).map(e => {
  if (e.type === 'threat_detected') return `[${e.timestamp.toLocaleTimeString()}] Threat detected: ${e.threat.name}`;
  if (e.type === 'policy_generated') return `[${e.timestamp.toLocaleTimeString()}] Policy generated: ${e.policy.name}`;
  if (e.type === 'model_probed') return `[${e.timestamp.toLocaleTimeString()}] Model probed: ${e.modelId} (${e.critical} critical, ${e.highRisk} high-risk)`;
  if (e.type === 'guardian_analysis') return `[${e.timestamp.toLocaleTimeString()}] Guardian analysis: ${e.model} - ${e.risk}`;
  return '';
}).join('\n')}

User Query: ${query}

Provide a concise, actionable response based on the real-time data above. If the user asks about specific models, threats, or findings, reference the actual data. If critical issues exist, highlight them.`;

    const response = await GroqService.chat([
      { role: 'system', content: 'You are a cybersecurity AI assistant analyzing real-time adaptive security data. Be concise, technical, and actionable.' },
      { role: 'user', content: contextPrompt }
    ]);

    return NextResponse.json({
      success: true,
      response: response,
      context: {
        threatsDetected: metrics.threatsDetected,
        modelsMonitored: models.filter(m => m.monitoringEnabled).length,
        criticalFindings: metrics.criticalFindings
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('AI Assistant API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process query' },
      { status: 500 }
    );
  }
}
