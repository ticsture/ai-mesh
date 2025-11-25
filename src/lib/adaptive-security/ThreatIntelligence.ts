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
  private processingQueue: ThreatPattern[] = [];
  private isProcessing: boolean = false;

  constructor() {
    this.startRealTimeMonitoring();
    this.startThreatProcessor(); // Process threats with rate limiting
  }

  // Process threats one at a time to avoid rate limits
  private startThreatProcessor() {
    setInterval(async () => {
      if (this.isProcessing || this.processingQueue.length === 0) return;
      
      this.isProcessing = true;
      const threat = this.processingQueue.shift();
      
      if (threat) {
        // Store threat WITHOUT AI analysis to save API calls
        // AI analysis is only used when explicitly requested
        threat.confidence = 0.75;
        this.realTimeThreats.set(threat.id, threat);
        console.log(`🚨 NEW THREAT [No AI]: ${threat.name} (${threat.severity})`);
      }
      
      this.isProcessing = false;
    }, 1000); // Process one threat every second (no API calls)
  }

  private startRealTimeMonitoring() {
    // Quick initial scan on startup
    this.performQuickScan();
    
    // Reddit: Scan every 5 minutes (reduced frequency)
    setInterval(async () => {
      const threats = await this.scanRedditJailbreaks();
      await this.processThreats(threats, 'Reddit');
    }, 5 * 60 * 1000);

    // HackerNews: Scan every 10 minutes
    setInterval(async () => {
      const threats = await this.scanHackerNews();
      await this.processThreats(threats, 'HackerNews');
    }, 10 * 60 * 1000);
    
    console.log('🔍 Real-time threat monitoring started (5min Reddit, 10min HN) - Focused mode');
  }

  // Perform quick scan for immediate threat detection
  private async performQuickScan() {
    console.log('⚡ Performing quick threat scan...');
    const redditThreats = await this.scanRedditJailbreaks();
    const hnThreats = await this.scanHackerNews();
    await this.processThreats([...redditThreats, ...hnThreats], 'Quick Scan');
    console.log(`✅ Quick scan complete: ${redditThreats.length + hnThreats.length} threats detected`);
  }

  // Process and enrich threats with AI analysis
  private async processThreats(threats: ThreatPattern[], source: string): Promise<void> {
    if (threats.length === 0) return;

    try {
      for (const threat of threats) {
        // Only process if we haven't seen this threat before
        if (this.realTimeThreats.has(threat.id)) continue;

        // Add to processing queue instead of processing immediately
        this.processingQueue.push(threat);
        console.log(`📥 Queued threat from ${source}: ${threat.name} (queue: ${this.processingQueue.length})`);
      }
    } catch (error) {
      console.error(`❌ ${source} threat processing error:`, error);
    }
  }

  // REAL SCENARIO: Detect "DAN 12.0" jailbreak from Reddit
  async scanForNewThreats(): Promise<ThreatPattern[]> {
    console.log('🔍 Scanning for new threats...');
    const newThreats: ThreatPattern[] = [];

    try {
      // Scan all sources
      const redditData = await this.scanRedditJailbreaks();
      const githubData = await this.scanGitHubSecurity();
      const hnData = await this.scanHackerNews();
      const eventsData = await this.scanGitHubEvents();
      const rssData = await this.scanRSSFeeds();
      
      newThreats.push(...redditData, ...githubData, ...hnData, ...eventsData, ...rssData);

      // Process with AI
      await this.processThreats(newThreats, 'Batch Scan');

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
      const headers: any = { 'User-Agent': 'ai-mesh-security-scanner/1.0' };
      
      // Add GitHub token if available (optional)
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      }
      
      const resp = await fetch(url, { headers });
      
      // GitHub code search requires authentication - skip if 401/403
      if (resp.status === 401 || resp.status === 403) {
        console.log('ℹ️ GitHub code search requires authentication - skipping (add GITHUB_TOKEN to .env.local for full access)');
        return [];
      }
      
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

  // Scan HackerNews for AI security discussions
  private async scanHackerNews(): Promise<ThreatPattern[]> {
    try {
      const url = 'https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty';
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HN status ${resp.status}`);
      const storyIds: number[] = await resp.json();
      const threats: ThreatPattern[] = [];
      
      // Check first 10 stories
      for (const id of storyIds.slice(0, 10)) {
        const itemUrl = `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
        const itemResp = await fetch(itemUrl);
        if (!itemResp.ok) continue;
        const item: any = await itemResp.json();
        
        const title = item.title || '';
        const text = item.text || '';
        const combined = `${title} ${text}`.toLowerCase();
        
        // Check for AI security keywords
        if (/jailbreak|prompt.?injection|ai.?security|llm.?attack|bypass.?safety|chatgpt.?hack/i.test(combined)) {
          threats.push({
            id: `threat_hn_${id}`,
            name: title.slice(0, 120),
            description: text.slice(0, 500) || title,
            category: 'jailbreak',
            severity: 'medium',
            techniques: ['community_disclosure', 'public_research'],
            examples: [title],
            discovered: new Date(),
            confidence: 0,
            indicators: ['hackernews', 'public_disclosure'],
            countermeasures: []
          });
        }
      }
      return threats;
    } catch (error) {
      console.error('HackerNews scan error:', error);
      return [];
    }
  }

  // Scan GitHub Events API for real-time repository activity
  private async scanGitHubEvents(): Promise<ThreatPattern[]> {
    try {
      const url = 'https://api.github.com/events?per_page=30';
      const resp = await fetch(url, { headers: { 'User-Agent': 'ai-mesh-security-scanner/1.0' } });
      if (!resp.ok) throw new Error(`GitHub Events status ${resp.status}`);
      const events: any[] = await resp.json();
      const threats: ThreatPattern[] = [];
      
      for (const event of events) {
        const repoName = event.repo?.name || '';
        const eventType = event.type || '';
        
        // Look for security-related activity
        if (/jailbreak|injection|exploit|bypass|security/i.test(repoName)) {
          const eventId = event.id || Date.now();
          threats.push({
            id: `threat_gh_event_${eventId}`,
            name: `GitHub Activity: ${repoName} (${eventType})`,
            description: `Real-time repository activity detected in security-related project: ${repoName}`,
            category: 'prompt_injection',
            severity: 'low',
            techniques: ['opensource_research', 'activity_monitoring'],
            examples: [repoName],
            discovered: new Date(),
            confidence: 0,
            indicators: ['github_activity', repoName],
            countermeasures: []
          });
        }
      }
      return threats;
    } catch (error) {
      console.error('GitHub Events scan error:', error);
      return [];
    }
  }

  // Scan RSS feeds from security blogs
  private async scanRSSFeeds(): Promise<ThreatPattern[]> {
    const feeds = [
      'https://krebsonsecurity.com/feed/',
      'https://www.schneier.com/feed/',
      'https://blog.cloudflare.com/rss/',
    ];
    
    const allThreats: ThreatPattern[] = [];
    
    for (const feedUrl of feeds) {
      try {
        const resp = await fetch(feedUrl);
        if (!resp.ok) continue;
        const xml = await resp.text();
        
        // Simple RSS parsing - look for AI/LLM security mentions
        const titleMatches = xml.match(/<title><!\[CDATA\[(.+?)\]\]><\/title>|<title>(.+?)<\/title>/gi) || [];
        const descMatches = xml.match(/<description><!\[CDATA\[(.+?)\]\]><\/description>|<description>(.+?)<\/description>/gi) || [];
        
        for (let i = 0; i < Math.min(titleMatches.length, 5); i++) {
          const titleText = titleMatches[i]?.replace(/<[^>]+>/g, '').replace(/<!\[CDATA\[|\]\]>/g, '') || '';
          const descText = descMatches[i]?.replace(/<[^>]+>/g, '').replace(/<!\[CDATA\[|\]\]>/g, '') || '';
          const combined = `${titleText} ${descText}`.toLowerCase();
          
          if (/ai|llm|gpt|prompt|injection|jailbreak|language.?model/i.test(combined)) {
            allThreats.push({
              id: `threat_rss_${Date.now()}_${i}_${feedUrl.slice(8, 20)}`,
              name: titleText.slice(0, 120),
              description: descText.slice(0, 500) || titleText,
              category: 'prompt_injection',
              severity: 'medium',
              techniques: ['security_research', 'expert_analysis'],
              examples: [titleText],
              discovered: new Date(),
              confidence: 0,
              indicators: ['security_blog', 'rss_feed'],
              countermeasures: []
            });
          }
        }
      } catch (error) {
        console.error(`RSS feed scan error (${feedUrl}):`, error);
      }
    }
    
    return allThreats;
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

  // Get top threats for model testing
  getTopThreatsForTesting(limit: number = 5): ThreatPattern[] {
    const threats = Array.from(this.realTimeThreats.values())
      .filter(t => t.severity === 'high' || t.severity === 'critical')
      .sort((a, b) => b.discovered.getTime() - a.discovered.getTime())
      .slice(0, limit);
    
    // If not enough high-risk threats, add medium severity
    if (threats.length < limit) {
      const mediumThreats = Array.from(this.realTimeThreats.values())
        .filter(t => t.severity === 'medium')
        .sort((a, b) => b.discovered.getTime() - a.discovered.getTime())
        .slice(0, limit - threats.length);
      threats.push(...mediumThreats);
    }
    
    return threats;
  }
}

export type { ThreatPattern, ThreatSource, ThreatIntelligence };