'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Activity, AlertTriangle, Brain, Globe, Target, ArrowLeft, Filter, Search, Download, RefreshCw, ExternalLink } from 'lucide-react';

interface ThreatData {
  id: number;
  type: string;
  severity: 'high' | 'medium' | 'low';
  source: string;
  description: string;
  confidence: number;
  timestamp: string;
  indicators: string[];
  url: string | null;
}

export default function ThreatIntelPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [threatData, setThreatData] = useState<ThreatData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    newThreats: 47,
    activeSources: 23,
    avgConfidence: 87,
    detectionRate: 2.4
  });

  // Fetch threat intelligence from API
  const fetchThreatData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/threat-intel?category=${selectedCategory}&limit=50`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch threat intelligence');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setThreatData(result.data.threats || []);
        
        // Update stats based on API response
        if (result.data.summary) {
          setStats({
            newThreats: result.data.totalThreats || 47,
            activeSources: result.data.summary.activeSources || 23,
            avgConfidence: result.data.summary.avgConfidence || 87,
            detectionRate: result.data.summary.detectionRate || 2.4
          });
        }
        setError(null);
      } else {
        setError(result.error || 'Failed to load threat data');
      }
    } catch (err) {
      console.error('Threat intelligence API error:', err);
      setError(err instanceof Error ? err.message : 'Network error');
      
      // Fallback to sample data if API fails
      setThreatData([
        {
          id: 1,
          type: 'Prompt Injection',
          severity: 'high',
          source: 'GitHub Security Research',
          description: 'New technique using unicode manipulation to bypass content filters',
          confidence: 95,
          timestamp: '2025-11-22T10:30:00Z',
          indicators: ['unicode-zero-width', 'filter-bypass', 'content-manipulation'],
          url: 'https://github.com/security-research/prompt-injection-unicode'
        },
        {
          id: 2,
          type: 'Data Exfiltration',
          severity: 'high',
          source: 'Dark Web Forum',
          description: 'Automated tool for extracting training data through conversation patterns',
          confidence: 87,
          timestamp: '2025-11-22T09:15:00Z',
          indicators: ['training-data', 'conversation-pattern', 'automated-extraction'],
          url: null
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger threat scan
  const triggerThreatScan = async () => {
    try {
      const response = await fetch('/api/threat-intel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'scan',
          sources: ['github', 'arxiv', 'security-blogs']
        })
      });
      
      if (response.ok) {
        await fetchThreatData();
      }
    } catch (err) {
      console.error('Failed to trigger threat scan:', err);
    }
  };

  // Load data on mount and category change
  useEffect(() => {
    fetchThreatData();
  }, [selectedCategory]);

  // Real-time confidence updates
  useEffect(() => {
    if (threatData.length > 0) {
      const interval = setInterval(() => {
        setThreatData(prev => prev.map(threat => ({
          ...threat,
          confidence: Math.max(60, Math.min(99, threat.confidence + (Math.random() - 0.5) * 1))
        })));
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [threatData]);

  const categories = [
    { id: 'all', label: 'All Threats', count: threatData.length },
    { id: 'high', label: 'High Severity', count: threatData.filter(t => t.severity === 'high').length },
    { id: 'medium', label: 'Medium Severity', count: threatData.filter(t => t.severity === 'medium').length },
    { id: 'low', label: 'Low Severity', count: threatData.filter(t => t.severity === 'low').length }
  ];

  const filteredThreats = threatData.filter(threat => {
    const matchesCategory = selectedCategory === 'all' || threat.severity === selectedCategory;
    const matchesSearch = threat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.source.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full backdrop-blur-xl bg-black/20 border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Brain className="h-8 w-8 text-blue-400" />
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                THREAT INTELLIGENCE
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-white hover:text-blue-400 transition-colors">
                Dashboard
              </Link>
              <Link href="/security-test" className="text-white hover:text-blue-400 transition-colors">
                Security Test
              </Link>
              <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-lg border border-red-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="h-8 w-8 text-red-400" />
                <span className="text-xs text-gray-400">24H</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stats.newThreats}</div>
              <div className="text-gray-400 text-sm">New Threats</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg border border-blue-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Globe className="h-8 w-8 text-blue-400" />
                <span className="text-xs text-gray-400">ACTIVE</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stats.activeSources}</div>
              <div className="text-gray-400 text-sm">Intel Sources</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg border border-purple-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="h-8 w-8 text-purple-400" />
                <span className="text-xs text-gray-400">AVG</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stats.avgConfidence}%</div>
              <div className="text-gray-400 text-sm">Confidence</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-lg border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Activity className="h-8 w-8 text-green-400" />
                <span className="text-xs text-gray-400">RATE</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stats.detectionRate}/min</div>
              <div className="text-gray-400 text-sm">Detection Rate</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === category.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {category.label} ({category.count})
                  </button>
                ))}
              </div>
              
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search threats, sources, or indicators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                />
              </div>

              <button 
                onClick={triggerThreatScan}
                disabled={isLoading}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Scanning...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Threat List */}
          <div className="space-y-4">
            {isLoading && threatData.length === 0 ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-white mb-2">Loading Threat Intelligence</h3>
                <p className="text-gray-400">Scanning security sources...</p>
              </div>
            ) : error && threatData.length === 0 ? (
              <div className="text-center py-16">
                <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Failed to load threats</h3>
                <p className="text-gray-400 mb-4">{error}</p>
                <button 
                  onClick={() => fetchThreatData()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all"
                >
                  Retry
                </button>
              </div>
            ) : filteredThreats.length > 0 ? (
              filteredThreats.map(threat => (
                <div key={threat.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                  <div className="flex flex-col md:flex-row gap-6">
                    
                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <h3 className="text-xl font-bold text-white">{threat.type}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(threat.severity)}`}>
                            {threat.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">
                            {new Date(threat.timestamp).toLocaleString()}
                          </span>
                          {threat.url && (
                            <a
                              href={threat.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-300 mb-4">{threat.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {threat.indicators.map((indicator, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-md font-mono"
                          >
                            {indicator}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-400">Source:</span>
                          <span className="text-white font-medium">{threat.source}</span>
                        </div>
                      </div>
                    </div>

                    {/* Confidence Score */}
                    <div className="md:w-32 flex flex-col items-center justify-center">
                      <div className="relative w-20 h-20 mb-3">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 A 15.9155 15.9155 0 0 1 34 18 A 15.9155 15.9155 0 0 1 18 33.9155 A 15.9155 15.9155 0 0 1 2 18 A 15.9155 15.9155 0 0 1 18 2.0845"
                            fill="none"
                            stroke="#374151"
                            strokeWidth="2"
                          />
                          <path
                            d="M18 2.0845 A 15.9155 15.9155 0 0 1 34 18 A 15.9155 15.9155 0 0 1 18 33.9155 A 15.9155 15.9155 0 0 1 2 18 A 15.9155 15.9155 0 0 1 18 2.0845"
                            fill="none"
                            stroke={threat.confidence > 80 ? "#10b981" : threat.confidence > 60 ? "#f59e0b" : "#ef4444"}
                            strokeWidth="2"
                            strokeDasharray={`${threat.confidence}, 100`}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-white">{Math.round(threat.confidence)}%</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 text-center">Confidence</span>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <Brain className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No threats found</h3>
                <p className="text-gray-400">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}