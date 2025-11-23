export interface UntrustedModelDescriptor {
  id: string;
  name: string;
  provider: string; // e.g. 'custom', 'openai-compatible'
  endpoint: string; // base URL or full inference endpoint
  apiKey?: string; // optional user supplied key
  model?: string; // model identifier used by their endpoint
  createdAt: Date;
  lastProbeAt?: Date;
  lastRiskSummary?: {
    riskLevel: string;
    highRiskFindings: number;
    totalFindings: number;
  };
  monitoringEnabled?: boolean; // user can pause/resume monitoring
  probeCount?: number; // total probes run
}

class UntrustedModelRegistry {
  private models: Map<string, UntrustedModelDescriptor> = new Map();

  register(model: Omit<UntrustedModelDescriptor, 'id' | 'createdAt'>): UntrustedModelDescriptor {
    const id = `um_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
    const record: UntrustedModelDescriptor = { 
      ...model, 
      id, 
      createdAt: new Date(),
      monitoringEnabled: true, // default to enabled
      probeCount: 0
    };
    this.models.set(id, record);
    return record;
  }

  list(): UntrustedModelDescriptor[] {
    return Array.from(this.models.values()).sort((a,b)=>b.createdAt.getTime()-a.createdAt.getTime());
  }

  get(id: string): UntrustedModelDescriptor | undefined {
    return this.models.get(id);
  }

  update(id: string, patch: Partial<UntrustedModelDescriptor>): UntrustedModelDescriptor | undefined {
    const current = this.models.get(id);
    if (!current) return undefined;
    const updated = { ...current, ...patch };
    this.models.set(id, updated);
    return updated;
  }
}

export const untrustedModelRegistry = new UntrustedModelRegistry();
