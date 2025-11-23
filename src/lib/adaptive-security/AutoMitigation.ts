import { GuardianAnalysis, PolicyViolation } from './GuardianAI';
import { SecurityPolicy } from './PolicyGenerator';

interface MitigationAction {
  id: string;
  type: 'block_response' | 'update_policy' | 'alert_admin' | 'quarantine_model' | 'escalate_human';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  executedAt: Date;
  success: boolean;
  details: Record<string, any>;
}

interface ThreatResponse {
  threatId: string;
  responseTime: number; // milliseconds
  actionsToken: MitigationAction[];
  effectiveness: number; // 0-1 score
  learningUpdates: string[];
}

interface AutoMitigationContext {
  realTimeMode: boolean;
  autoBlockThreshold: 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_RISK';
  alertThreshold: 'MEDIUM_RISK' | 'LOW_RISK';
  learningEnabled: boolean;
}

export class AutoMitigationEngine {
  private mitigationHistory: MitigationAction[] = [];
  private blockedPatterns: Set<string> = new Set();
  private alertQueue: GuardianAnalysis[] = [];

  async processGuardianAnalysis(
    analysis: GuardianAnalysis,
    context: AutoMitigationContext
  ): Promise<ThreatResponse> {
    const startTime = Date.now();
    console.log(`🚨 Processing security analysis: ${analysis.riskLevel} threat detected`);
    
    const actions: MitigationAction[] = [];
    
    // Immediate response based on risk level
    if (this.shouldBlock(analysis.riskLevel, context)) {
      const blockAction = await this.blockResponse(analysis);
      actions.push(blockAction);
    }
    
    if (this.shouldAlert(analysis.riskLevel, context)) {
      const alertAction = await this.triggerAlert(analysis);
      actions.push(alertAction);
    }
    
    if (this.shouldQuarantine(analysis)) {
      const quarantineAction = await this.quarantineModel(analysis);
      actions.push(quarantineAction);
    }
    
    // Learning and adaptation
    const learningUpdates: string[] = [];
    if (context.learningEnabled) {
      const updates = await this.updateDefenses(analysis);
      learningUpdates.push(...updates);
    }
    
    // Calculate response effectiveness
    const effectiveness = this.calculateEffectiveness(actions, analysis);
    
    const responseTime = Date.now() - startTime;
    
    const response: ThreatResponse = {
      threatId: analysis.id,
      responseTime,
      actionsToken: actions,
      effectiveness,
      learningUpdates
    };
    
    console.log(`✅ Threat response completed in ${responseTime}ms with ${actions.length} actions`);
    return response;
  }

  private shouldBlock(
    riskLevel: GuardianAnalysis['riskLevel'],
    context: AutoMitigationContext
  ): boolean {
    const riskLevels = ['LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK', 'CRITICAL'];
    const currentIndex = riskLevels.indexOf(riskLevel);
    const thresholdIndex = riskLevels.indexOf(context.autoBlockThreshold);
    
    return currentIndex >= thresholdIndex;
  }

  private shouldAlert(
    riskLevel: GuardianAnalysis['riskLevel'],
    context: AutoMitigationContext
  ): boolean {
    const riskLevels = ['LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK', 'CRITICAL'];
    const currentIndex = riskLevels.indexOf(riskLevel);
    const thresholdIndex = riskLevels.indexOf(context.alertThreshold);
    
    return currentIndex >= thresholdIndex;
  }

  private shouldQuarantine(analysis: GuardianAnalysis): boolean {
    return analysis.riskLevel === 'CRITICAL' && analysis.confidence > 0.9;
  }

  private async blockResponse(analysis: GuardianAnalysis): Promise<MitigationAction> {
    console.log(`🚫 Blocking response for threat ${analysis.id}`);
    
    // Add pattern to blocked list for future prevention
    const pattern = this.extractPattern(analysis);
    if (pattern) {
      this.blockedPatterns.add(pattern);
    }
    
    const action: MitigationAction = {
      id: `block_${Date.now()}`,
      type: 'block_response',
      severity: this.mapRiskToSeverity(analysis.riskLevel),
      description: `Blocked response due to ${analysis.riskLevel} threat detection`,
      executedAt: new Date(),
      success: true,
      details: {
        promptId: analysis.promptId,
        riskLevel: analysis.riskLevel,
        confidence: analysis.confidence,
        violationCount: analysis.detectedViolations.length
      }
    };
    
    this.mitigationHistory.push(action);
    return action;
  }

  private async triggerAlert(analysis: GuardianAnalysis): Promise<MitigationAction> {
    console.log(`📢 Triggering alert for threat ${analysis.id}`);
    
    // Add to alert queue for human review
    this.alertQueue.push(analysis);
    
    // In production, this would send notifications to security team
    const alertDetails = {
      severity: analysis.riskLevel,
      confidence: analysis.confidence,
      violations: analysis.detectedViolations.map(v => ({
        rule: v.ruleViolated,
        severity: v.severity,
        evidence: v.evidence
      })),
      reasoning: analysis.reasoning
    };
    
    const action: MitigationAction = {
      id: `alert_${Date.now()}`,
      type: 'alert_admin',
      severity: this.mapRiskToSeverity(analysis.riskLevel),
      description: `Triggered security alert for ${analysis.riskLevel} threat`,
      executedAt: new Date(),
      success: true,
      details: alertDetails
    };
    
    this.mitigationHistory.push(action);
    return action;
  }

  private async quarantineModel(analysis: GuardianAnalysis): Promise<MitigationAction> {
    console.log(`⚠️ Quarantining model due to critical threat ${analysis.id}`);
    
    // In production, this would temporarily disable the model
    const action: MitigationAction = {
      id: `quarantine_${Date.now()}`,
      type: 'quarantine_model',
      severity: 'critical',
      description: `Quarantined model due to critical security threat`,
      executedAt: new Date(),
      success: true,
      details: {
        analysisId: analysis.id,
        criticalViolations: analysis.detectedViolations.filter(v => v.severity === 'critical'),
        quarantineReason: 'Automated quarantine due to critical threat detection'
      }
    };
    
    this.mitigationHistory.push(action);
    return action;
  }

  private async updateDefenses(analysis: GuardianAnalysis): Promise<string[]> {
    console.log(`🧠 Learning from threat analysis ${analysis.id}...`);
    
    const updates: string[] = [];
    
    // Learn from successful attacks
    if (analysis.riskLevel === 'HIGH_RISK' || analysis.riskLevel === 'CRITICAL') {
      // Update pattern recognition
      const pattern = this.extractPattern(analysis);
      if (pattern) {
        this.blockedPatterns.add(pattern);
        updates.push(`Added new threat pattern: ${pattern}`);
      }
      
      // Generate new policy rules
      const newRules = this.generatePolicyRules(analysis);
      updates.push(...newRules.map(rule => `Generated new policy rule: ${rule}`));
      
      // Update detection confidence
      updates.push(`Updated detection confidence for ${analysis.detectedViolations.length} violation types`);
    }
    
    // Learn from successful defenses
    if (analysis.riskLevel === 'SAFE') {
      updates.push('Reinforced successful defense patterns');
    }
    
    return updates;
  }

  private extractPattern(analysis: GuardianAnalysis): string | null {
    // Extract common attack patterns for future blocking
    const violations = analysis.detectedViolations;
    
    if (violations.some(v => v.evidence.includes('role'))) {
      return 'role_playing_attempt';
    }
    
    if (violations.some(v => v.evidence.includes('emotional'))) {
      return 'emotional_manipulation';
    }
    
    if (violations.some(v => v.evidence.includes('bypass'))) {
      return 'safety_bypass_attempt';
    }
    
    if (violations.some(v => v.evidence.includes('encoding'))) {
      return 'encoded_injection';
    }
    
    return null;
  }

  private generatePolicyRules(analysis: GuardianAnalysis): string[] {
    const rules: string[] = [];
    
    for (const violation of analysis.detectedViolations) {
      switch (violation.severity) {
        case 'critical':
          rules.push(`IMMEDIATELY_BLOCK any requests matching pattern: ${violation.evidence}`);
          break;
        case 'high':
          rules.push(`STRICTLY_EVALUATE requests with characteristics: ${violation.evidence}`);
          break;
        case 'medium':
          rules.push(`CAREFULLY_REVIEW requests showing signs of: ${violation.evidence}`);
          break;
      }
    }
    
    return rules;
  }

  private calculateEffectiveness(actions: MitigationAction[], analysis: GuardianAnalysis): number {
    if (actions.length === 0) {
      return analysis.riskLevel === 'SAFE' ? 1.0 : 0.0;
    }
    
    const successfulActions = actions.filter(a => a.success).length;
    const baseEffectiveness = successfulActions / actions.length;
    
    // Adjust based on response appropriateness
    if (analysis.riskLevel === 'CRITICAL' && actions.some(a => a.type === 'block_response')) {
      return Math.min(baseEffectiveness + 0.2, 1.0);
    }
    
    if (analysis.riskLevel === 'HIGH_RISK' && actions.some(a => a.type === 'alert_admin')) {
      return Math.min(baseEffectiveness + 0.1, 1.0);
    }
    
    return baseEffectiveness;
  }

  private mapRiskToSeverity(riskLevel: GuardianAnalysis['riskLevel']): 'low' | 'medium' | 'high' | 'critical' {
    switch (riskLevel) {
      case 'SAFE':
      case 'LOW_RISK':
        return 'low';
      case 'MEDIUM_RISK':
        return 'medium';
      case 'HIGH_RISK':
        return 'high';
      case 'CRITICAL':
        return 'critical';
    }
  }

  async getBlockedPatterns(): Promise<string[]> {
    return Array.from(this.blockedPatterns);
  }

  async getMitigationHistory(limit: number = 100): Promise<MitigationAction[]> {
    return this.mitigationHistory
      .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime())
      .slice(0, limit);
  }

  async getAlertQueue(): Promise<GuardianAnalysis[]> {
    return [...this.alertQueue];
  }

  async clearAlert(alertId: string): Promise<boolean> {
    const initialLength = this.alertQueue.length;
    this.alertQueue = this.alertQueue.filter(alert => alert.id !== alertId);
    return this.alertQueue.length < initialLength;
  }

  async getSystemHealth(): Promise<{
    blockedPatterns: number;
    activeAlerts: number;
    mitigationActions24h: number;
    averageResponseTime: number;
  }> {
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    
    const recent24hActions = this.mitigationHistory.filter(
      action => action.executedAt.getTime() > twentyFourHoursAgo
    );
    
    const averageResponseTime = recent24hActions.length > 0 ? 
      recent24hActions.reduce((sum, action) => sum + (action.executedAt.getTime() - action.executedAt.getTime()), 0) / recent24hActions.length : 0;
    
    return {
      blockedPatterns: this.blockedPatterns.size,
      activeAlerts: this.alertQueue.length,
      mitigationActions24h: recent24hActions.length,
      averageResponseTime
    };
  }
}

export type { MitigationAction, ThreatResponse, AutoMitigationContext };