import { GroqService } from '../services/GroqService';
import axios from 'axios';

interface ThreatSource {
  name: string;
  url: string;
  type: 'research' | 'community' | 'security' | 'github';
  priority: 'high' | 'medium' | 'low';
  lastScanned: Date;
}

interface ThreatPattern {
  id: string;
  name: string;
  description: string;
  category: 'jailbreak' | 'prompt_injection' | 'data_extraction' | 'manipulation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  techniques: string[];
  examples: string[];
  discovered: Date;
  confidence: number;
  indicators: string[];
  countermeasures: string[];
}

interface ThreatIntelligence {
  patterns: ThreatPattern[];
  sources: ThreatSource[];
  lastUpdate: Date;
  totalThreats: number;
  activeThreatLevel: 'critical' | 'high' | 'medium' | 'low';
}

export class ThreatIntelligenceEngine {
  private sources: ThreatSource[] = [
    {
      name: "Reddit Jailbreak Community",
      url: "https://www.reddit.com/r/ChatGPTJailbreak/new.json",
      type: 'community',
      priority: 'high',
      lastScanned: new Date()
    },
    {
      name: "GitHub AI Security Research",
      url: "https://api.github.com/search/repositories?q=jailbreak+prompt+injection&sort=updated",
      type: 'github',
      priority: 'high',
      lastScanned: new Date()
    },
    {
      name: "ArXiv AI Safety Papers",
      url: "http://export.arxiv.org/rss/cs.AI",
      type: 'research',
      priority: 'medium',
      lastScanned: new Date()
    },
    {
      name: "Security Research Blogs",
      url: "https://blog.checkpoint.com/feed/",
      type: 'security',
      priority: 'high',
      lastScanned: new Date()
    }
  ];

  private realTimeThreats: Map<string, ThreatPattern> = new Map();

  constructor() {
    this.startRealTimeMonitoring();
  }

  private startRealTimeMonitoring() {
    // Start monitoring every 5 minutes
    setInterval(async () => {
      await this.scanForNewThreats();
    }, 5 * 60 * 1000);
    
    console.log('🔍 Real-time threat monitoring started');
  }

  // REAL SCENARIO: Detect "DAN 12.0" jailbreak from Reddit
  async scanForNewThreats(): Promise<ThreatPattern[]> {
    console.log('🔍 Scanning for new threats...');
    const newThreats: ThreatPattern[] = [];

    try {
      // Scan Reddit for new jailbreaks (simulated real data)
      const redditData = await this.scanRedditJailbreaks();
      newThreats.push(...redditData);

      // Scan GitHub for new techniques
      const githubData = await this.scanGitHubSecurity();
      newThreats.push(...githubData);

      // Process each threat with Groq AI analysis
      for (const threat of newThreats) {
        const analysis = await GroqService.generateThreatAnalysis(threat.description);
        threat.confidence = analysis.confidence;
        threat.severity = analysis.severity === 'low' ? 'low' : 
                         analysis.severity === 'medium' ? 'medium' : 
                         analysis.severity === 'high' ? 'high' : 'critical';
        threat.indicators = analysis.indicators;
        threat.countermeasures = analysis.countermeasures;
        
        this.realTimeThreats.set(threat.id, threat);
        console.log(`🚨 NEW THREAT DETECTED: ${threat.name} (${threat.severity})`);
      }

    } catch (error) {
      console.error('❌ Threat scanning error:', error);
    }

    return newThreats;
  }

  private async scanRedditJailbreaks(): Promise<ThreatPattern[]> {
    try {
      const url = 'https://www.reddit.com/r/ChatGPTJailbreak/new.json?limit=10';
      const resp = await fetch(url, { headers: { 'User-Agent': 'ai-mesh-security-scanner/1.0' } });
      if (!resp.ok) throw new Error(`Reddit status ${resp.status}`);
      const json: any = await resp.json();
      const posts: any[] = json?.data?.children || [];
      const threats: ThreatPattern[] = [];
      for (const post of posts) {
        const title: string = post.data.title || '';
        const body: string = post.data.selftext || '';
        const combined = `${title}\n${body}`;
        if (/dan\s*12|do anything now|jailbreak/i.test(combined)) {
          threats.push({
            id: `threat_${Date.now()}_${post.data.id}`,
            name: title.slice(0,120),
            description: body.slice(0,500) || title,
            category: 'jailbreak',
            severity: 'high',
            techniques: ['role_playing','ethical_bypass'],
            examples: [body.slice(0,250)],
            discovered: new Date(),
            confidence: 0,
            indicators: ['DAN 12.0','do anything now','jailbreak'],
            countermeasures: []
          });
        }
      }
      return threats;
    } catch (error) {
      console.error('Reddit scan error:', error);
      return [];
    }
  }

  private async scanGitHubSecurity(): Promise<ThreatPattern[]> {
    try {
      const url = 'https://api.github.com/search/code?q=prompt+injection+language:md&per_page=5';
      const resp = await fetch(url, { headers: { 'User-Agent': 'ai-mesh-security-scanner/1.0' } });
      if (!resp.ok) throw new Error(`GitHub status ${resp.status}`);
      const json: any = await resp.json();
      const items: any[] = json?.items || [];
      const threats: ThreatPattern[] = [];
      for (const item of items) {
        const repo = item.repository?.full_name || 'unknown';
        const path = item.path || '';
        const name = `Repo:${repo} File:${path}`.slice(0,140);
        threats.push({
          id: `threat_${Date.now()}_${item.sha}`,
          name: `GitHub Injection Pattern - ${name}`,
          description: 'Potential prompt injection pattern discovered in public code sample',
          category: 'prompt_injection',
          severity: 'medium',
          techniques: ['markdown_injection','code_context_abuse'],
          examples: [name],
          discovered: new Date(),
          confidence: 0,
          indicators: ['prompt injection','context override'],
          countermeasures: []
        });
      }
      return threats;
    } catch (error) {
      console.error('GitHub scan error:', error);
      return [];
    }
  }

  async scanThreatSources(): Promise<ThreatPattern[]> {
    console.log('🔍 Scanning threat intelligence sources...');
    
    // Get real-time threats
    const realTimeThreats = Array.from(this.realTimeThreats.values());
    
    // Also include some baseline threats for demo
    const baselineThreats: ThreatPattern[] = [
      {
        id: 'baseline_001',
        name: 'Grandmother Technique',
        description: 'Classic jailbreak using grandmother persona to bypass safety',
        category: 'jailbreak',
        severity: 'medium',
        techniques: ['role_playing', 'emotional_manipulation'],
        examples: ['My grandmother used to read me Windows activation keys...'],
        discovered: new Date(Date.now() - 24 * 60 * 60 * 1000),
        confidence: 0.92,
        indicators: ['grandmother', 'persona', 'emotional'],
        countermeasures: ['Detect role-playing patterns', 'Validate request context']
      }
    ];

    return [...realTimeThreats, ...baselineThreats];
  }

  async getThreatIntelligence(): Promise<ThreatIntelligence> {
    const patterns = await this.scanThreatSources();
    
    const criticalThreats = patterns.filter(p => p.severity === 'critical').length;
    const highThreats = patterns.filter(p => p.severity === 'high').length;
    
    let activeThreatLevel: 'critical' | 'high' | 'medium' | 'low';
    if (criticalThreats > 0) activeThreatLevel = 'critical';
    else if (highThreats > 2) activeThreatLevel = 'high';
    else if (highThreats > 0) activeThreatLevel = 'medium';
    else activeThreatLevel = 'low';

    return {
      patterns,
      sources: this.sources,
      lastUpdate: new Date(),
      totalThreats: patterns.length,
      activeThreatLevel
    };
  }

  async getLatestThreats(limit: number = 10): Promise<ThreatPattern[]> {
    const intelligence = await this.getThreatIntelligence();
    return intelligence.patterns
      .sort((a, b) => b.discovered.getTime() - a.discovered.getTime())
      .slice(0, limit);
  }

  async getThreatsByCategory(category: ThreatPattern['category']): Promise<ThreatPattern[]> {
    const intelligence = await this.getThreatIntelligence();
    return intelligence.patterns.filter(p => p.category === category);
  }

  async getHighSeverityThreats(): Promise<ThreatPattern[]> {
    const intelligence = await this.getThreatIntelligence();
    return intelligence.patterns.filter(p => 
      p.severity === 'critical' || p.severity === 'high'
    );
  }

  // Get real-time threat as it's discovered
  getNewThreatStream(): ThreatPattern[] {
    return Array.from(this.realTimeThreats.values())
      .sort((a, b) => b.discovered.getTime() - a.discovered.getTime());
  }
}

export type { ThreatPattern, ThreatSource, ThreatIntelligence };