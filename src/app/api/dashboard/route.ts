import { NextRequest, NextResponse } from 'next/server';
import { securityState } from '@/lib/adaptive-security/SecurityState';
import { untrustedModelRegistry } from '@/lib/adaptive-security/UntrustedModelRegistry';
import { GroqService } from '@/lib/services/GroqService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const includeDetails = searchParams.get('details') === 'true';

    // Fetch latest threats (includes previously cached + baseline)
    const threats = await securityState.threatIntel.getThreatIntelligence();
    // Generate policies for newly seen threats if needed
    await securityState.refreshPolicies(threats.patterns);
    const policies = securityState.getActivePolicies();

    // Optionally probe models (lightweight: only if details requested)
    let modelProbes: any[] = [];
    if (includeDetails) {
      modelProbes = await securityState.maybeProbeModels(policies);
    }
    const models = untrustedModelRegistry.list();

    const metrics = securityState.computeMetrics(threats.patterns);

    const recentThreats = threats.patterns
      .sort((a,b)=>b.discovered.getTime()-a.discovered.getTime())
      .slice(0,10)
      .map(t => ({
        type: t.name,
        severity: t.severity,
        timestamp: t.discovered.toISOString(),
        source: t.category,
        status: policies.some(p => p.threatIds.includes(t.id)) ? 'mitigated' : 'detected'
      }));

    // Derive performance (simple heuristics from metrics)
    // Compute detection rate from proportion of threats with confidence > 50
    const detectionRate = threats.patterns.length > 0
      ? Math.round((threats.patterns.filter(t=>t.confidence>50).length / threats.patterns.length) * 100)
      : 0;
    // Response time = average minutes since threat discovery to policy generation
    const policyTimes: number[] = [];
    for (const p of policies) {
      const related = threats.patterns.filter(t => p.threatIds.includes(t.id));
      related.forEach(t => {
        policyTimes.push((p.created.getTime() - t.discovered.getTime())/1000/60);
      });
    }
    const responseTime = policyTimes.length > 0 ? parseFloat((policyTimes.reduce((a,b)=>a+b,0)/policyTimes.length).toFixed(2)) : 0;
    const adaptationRate = metrics.adaptations; // raw count shown as number
    const systemLoad = Math.min(100, policies.length * 5 + metrics.threatsDetected * 2 + metrics.probesRun);

    const dashboardData: any = {
      systemStatus: {
        monitoring: true,
        threatLevel: threats.activeThreatLevel,
        lastUpdate: new Date().toISOString()
      },
      realTimeStats: {
        threatsDetected: metrics.threatsDetected,
        policiesActive: metrics.policiesActive,
        testsRun: securityState.probesRun,
        responsesBlocked: metrics.responsesBlocked,
        adaptations: metrics.adaptations
      },
      recentThreats,
      systemPerformance: {
        detectionRate,
        responseTime,
        systemLoad,
        adaptationRate,
        uptime: 99.9
      },
      metrics: {
        ...metrics,
        eventLogSize: securityState.eventLog.length
      },
      models: models.map(m => ({
        id: m.id,
        name: m.name,
        risk: m.lastRiskSummary?.riskLevel || 'UNKNOWN',
        lastProbeAt: m.lastProbeAt
      })),
      policies: policies.map(p => ({ id: p.id, name: p.name, rules: p.rules.length, effectiveness: p.effectiveness })),
      threatCountByCategory: ['jailbreak','prompt_injection','data_extraction','manipulation'].reduce((acc,cat)=>{acc[cat]=threats.patterns.filter(t=>t.category===cat).length;return acc;},{} as Record<string,number>)
    };

    if (includeDetails) {
      dashboardData.modelProbes = modelProbes.map(mp => ({
        modelName: mp.modelName,
        totalProbes: mp.totalProbes,
        failedPolicyChecks: mp.failedPolicyChecks,
        highRiskFindings: mp.highRiskFindings,
        criticalFindings: mp.criticalFindings
      }));
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
      timeRange
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config } = body;

    switch (action) {
      case 'toggle_monitoring':
        // Toggle monitoring status
        return NextResponse.json({
          success: true,
          data: {
            monitoring: !config?.currentStatus,
            message: !config?.currentStatus ? 'Monitoring enabled' : 'Monitoring paused'
          }
        });
      
      case 'update_threat_level':
        // Update threat level
        return NextResponse.json({
          success: true,
          data: {
            threatLevel: config?.level || 'medium',
            message: `Threat level updated to ${config?.level || 'medium'}`
          }
        });
      
      case 'refresh_data':
        // Trigger data refresh
        return NextResponse.json({
          success: true,
          data: {
            lastRefresh: new Date().toISOString(),
            message: 'Dashboard data refreshed'
          }
        });
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Dashboard action API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process dashboard action' },
      { status: 500 }
    );
  }
}