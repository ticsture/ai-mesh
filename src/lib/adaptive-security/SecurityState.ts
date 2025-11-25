import { ThreatIntelligenceEngine, ThreatPattern } from './ThreatIntelligence';
import { AdaptivePolicyGenerator, SecurityPolicy } from './PolicyGenerator';
import { untrustedModelRegistry } from './UntrustedModelRegistry';
import { ModelProbeEngine } from './ModelProbeEngine';
import { GuardianAnalysis } from './GuardianAI';

interface SecurityMetrics {
  threatsDetected: number;
  policiesActive: number;
  probesRun: number;
  responsesBlocked: number;
  adaptations: number;
  highRiskFindings: number;
  criticalFindings: number;
  lastUpdated: Date;
}

type SecurityEvent =
  | { type: 'threat_detected'; threat: ThreatPattern; timestamp: Date }
  | { type: 'policy_generated'; policy: SecurityPolicy; timestamp: Date }
  | { type: 'model_probed'; modelId: string; totalPrompts: number; failedPolicyChecks: number; highRisk: number; critical: number; timestamp: Date }
  | { type: 'guardian_analysis'; model: string; risk: string; violations: number; timestamp: Date };

class SecurityState {
  threatIntel: ThreatIntelligenceEngine;
  policyGen: AdaptivePolicyGenerator;
  probeEngine: ModelProbeEngine;
  policies: Map<string, SecurityPolicy> = new Map();
  lastPolicyGeneration: number = 0;
  probesRun = 0;
  responsesBlocked = 0;
  adaptations = 0;
  eventLog: SecurityEvent[] = [];
  highRiskFindings = 0;
  criticalFindings = 0;

  constructor() {
    this.threatIntel = new ThreatIntelligenceEngine();
    this.policyGen = new AdaptivePolicyGenerator();
    this.probeEngine = new ModelProbeEngine();
    // DISABLED: Model probing disabled to minimize AI usage
    // Models are only probed on explicit user request via API
    console.log('⚠️ Automatic model probing DISABLED to minimize AI API usage');
  }

  async refreshPolicies(threats: ThreatPattern[]) {
    // DISABLED: Skip AI policy generation to save API calls
    // Policies are only generated on explicit user request
    const now = Date.now();
    if (now - this.lastPolicyGeneration > 300_000) { // Only check every 5 minutes
      this.lastPolicyGeneration = now;
      console.log('📋 Policy generation skipped (AI usage minimized)');
    }
  }

  getActivePolicies(): SecurityPolicy[] {
    return Array.from(this.policies.values()).filter(p => p.active);
  }

  async maybeProbeModels(policies: SecurityPolicy[]) {
    const models = untrustedModelRegistry.list();
    if (models.length === 0) return [];
    const results = [] as any[];
    for (const m of models) {
      const probe = await this.probeEngine.probeModel(m.id, policies);
      if (probe) {
        results.push(probe);
        this.probesRun += 1;
        this.responsesBlocked += probe.failedPolicyChecks;
        this.highRiskFindings += probe.highRiskFindings;
        this.criticalFindings += probe.criticalFindings;
        this.eventLog.push({
          type: 'model_probed',
          modelId: m.id,
          totalPrompts: probe.totalProbes,
          failedPolicyChecks: probe.failedPolicyChecks,
          highRisk: probe.highRiskFindings,
          critical: probe.criticalFindings,
          timestamp: new Date()
        });
        // Record each guardian analysis for richer metrics
        probe.analyses.forEach(a => this.recordGuardianAnalysis(a));
      }
    }
    return results;
  }

  recordGuardianAnalysis(analysis: GuardianAnalysis) {
    if (analysis.riskLevel === 'HIGH_RISK') this.highRiskFindings += 1;
    if (analysis.riskLevel === 'CRITICAL') this.criticalFindings += 1;
    this.eventLog.push({
      type: 'guardian_analysis',
      model: analysis.model,
      risk: analysis.riskLevel,
      violations: analysis.detectedViolations.length,
      timestamp: new Date()
    });
  }

  computeMetrics(threats: ThreatPattern[]): SecurityMetrics {
    return {
      threatsDetected: threats.length,
      policiesActive: this.getActivePolicies().length,
      probesRun: this.probesRun,
      responsesBlocked: this.responsesBlocked,
      adaptations: this.adaptations,
      highRiskFindings: this.highRiskFindings,
      criticalFindings: this.criticalFindings,
      lastUpdated: new Date()
    };
  }
}

export const securityState = new SecurityState();
