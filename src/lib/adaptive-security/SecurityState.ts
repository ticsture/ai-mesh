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
    // Continuous model probing every 10 minutes if models exist
    setInterval(async () => {
      const models = untrustedModelRegistry.list().filter(m => m.monitoringEnabled !== false);
      if (models.length === 0) return;
      const policies = this.getActivePolicies();
      if (policies.length === 0) return;
      // Only probe enabled models
      for (const m of models) {
        const probe = await this.probeEngine.probeModel(m.id, policies);
        if (probe) {
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
          probe.analyses.forEach(a => this.recordGuardianAnalysis(a));
          // Update probe count
          untrustedModelRegistry.update(m.id, { probeCount: (m.probeCount || 0) + 1 });
        }
      }
    }, 10 * 60 * 1000);
  }

  async refreshPolicies(threats: ThreatPattern[]) {
    // Avoid regenerating too frequently (<60s)
    const now = Date.now();
    const unseen = threats.filter(t => !Array.from(this.policies.values()).some(p => p.threatIds.includes(t.id)));
    if (unseen.length > 0 && (now - this.lastPolicyGeneration > 60_000)) {
      const newPolicies = await this.policyGen.generatePoliciesFromThreats(unseen);
      newPolicies.forEach(p => {
        this.policies.set(p.id, p);
        this.eventLog.push({ type: 'policy_generated', policy: p, timestamp: new Date() });
      });
      this.lastPolicyGeneration = now;
      this.adaptations += newPolicies.length;
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
