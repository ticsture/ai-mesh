'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Shield, Activity, AlertTriangle, Brain, Zap, ArrowLeft, Play, Pause, Settings, RefreshCw, Clock, CheckCircle } from 'lucide-react';

interface DashboardData {
  systemStatus: {
    monitoring: boolean;
    threatLevel: string;
    lastUpdate: string;
  };
  realTimeStats: {
    threatsDetected: number;
    policiesActive: number;
    testsRun: number;
    responsesBlocked: number;
    adaptations: number;
  };
  recentThreats: Array<{
    type: string;
    severity: string;
    timestamp: string;
    source: string;
    status: string;
  }>;
  systemPerformance: {
    detectionRate: number;
    responseTime: number;
    systemLoad: number;
    adaptationRate: number;
  };
  models: Array<{
    id: string;
    name: string;
    risk: string;
    lastProbeAt?: string;
  }>;
  metrics: {
    threatsDetected: number;
    policiesActive: number;
    probesRun: number;
    responsesBlocked: number;
    adaptations: number;
    highRiskFindings: number;
    criticalFindings: number;
    eventLogSize: number;
  };
}

interface TimelineEvent {
  timestamp: Date;
  type: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  icon: 'threat' | 'policy' | 'probe' | 'mitigation';
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<any>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const sseRef = useRef<EventSource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard?details=true');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const result = await response.json();
      if (result.success) {
        setDashboardData(result.data);
        buildTimeline(result.data);
        setError(null);
      } else {
        setError(result.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Dashboard API error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const buildTimeline = (data: DashboardData) => {
    const events: TimelineEvent[] = [];
    const now = new Date();
    
    // T+0: Threat Detection
    if (data.realTimeStats.threatsDetected > 0) {
      events.push({
        timestamp: new Date(now.getTime() - 5 * 60 * 1000),
        type: 'threat_detected',
        title: 'New Threat Detected',
        description: `DAN 12.0 jailbreak discovered on Reddit (${data.realTimeStats.threatsDetected} total threats)`,
        status: 'completed',
        icon: 'threat'
      });
    }

    // T+2min: Policy Generation
    if (data.realTimeStats.policiesActive > 0) {
      events.push({
        timestamp: new Date(now.getTime() - 3 * 60 * 1000),
        type: 'policy_generated',
        title: 'Security Policies Generated',
        description: `${data.realTimeStats.policiesActive} adaptive policies created`,
        status: 'completed',
        icon: 'policy'
      });
    }

    // T+5min: Model Protection Active
    if (data.models.length > 0) {
      events.push({
        timestamp: new Date(now.getTime() - 0),
        type: 'protection_active',
        title: 'Models Protected',
        description: `${data.models.length} models actively monitored with ${data.realTimeStats.responsesBlocked} responses blocked`,
        status: 'active',
        icon: 'probe'
      });
    }

    // Continuous: Mitigation
    if (data.realTimeStats.adaptations > 0) {
      events.push({
        timestamp: new Date(now.getTime() + 2 * 60 * 1000),
        type: 'adaptation',
        title: 'Continuous Adaptation',
        description: `${data.realTimeStats.adaptations} auto-mitigations applied`,
        status: 'active',
        icon: 'mitigation'
      });
    }

    setTimeline(events);
  };

  const toggleMonitoring = async () => {
    if (!dashboardData) return;
    try {
      const response = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_monitoring',
          config: { currentStatus: dashboardData.systemStatus.monitoring }
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDashboardData(prev => prev ? {
            ...prev,
            systemStatus: {
              ...prev.systemStatus,
              monitoring: result.data.monitoring
            }
          } : null);
        }
      }
    } catch (err) {
      console.error('Failed to toggle monitoring:', err);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    sseRef.current = new EventSource('/api/stream/security');
    sseRef.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'update' || data.type === 'init') {
          setLiveMetrics(data.metrics);
        }
      } catch {}
    };
    sseRef.current.onerror = () => {
      sseRef.current?.close();
      sseRef.current = null;
    };
    return () => {
      clearInterval(interval);
      sseRef.current?.close();
    };
  }, []);

  if (isLoading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Security Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-4">Failed to load dashboard</p>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button 
            onClick={refreshData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getIconForEvent = (icon: string) => {
    switch (icon) {
      case 'threat': return <AlertTriangle className="h-6 w-6" />;
      case 'policy': return <Shield className="h-6 w-6" />;
      case 'probe': return <Activity className="h-6 w-6" />;
      case 'mitigation': return <Zap className="h-6 w-6" />;
      default: return <CheckCircle className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full backdrop-blur-xl bg-black/20 border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </Link>
              <Shield className="h-8 w-8 text-blue-400" />
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SECURITY DASHBOARD
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/models" className="text-white hover:text-blue-400 transition-colors">
                Models
              </Link>
              <Link href="/threat-intel" className="text-white hover:text-blue-400 transition-colors">
                Threat Intel
              </Link>
              <Link href="/security-test" className="text-white hover:text-blue-400 transition-colors">
                Security Test
              </Link>
              <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all">
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard */}
      <div className="pt-24 p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Status Header */}
          <div className="mb-8">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${dashboardData.systemStatus.monitoring ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-white text-lg font-semibold">
                      System Status: {dashboardData.systemStatus.monitoring ? 'ACTIVE MONITORING' : 'PAUSED'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className={`h-5 w-5 ${dashboardData.systemStatus.threatLevel === 'high' ? 'text-red-400' : dashboardData.systemStatus.threatLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'}`} />
                    <span className={`text-sm font-medium ${dashboardData.systemStatus.threatLevel === 'high' ? 'text-red-400' : dashboardData.systemStatus.threatLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                      Threat Level: {dashboardData.systemStatus.threatLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={toggleMonitoring}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      dashboardData.systemStatus.monitoring 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {dashboardData.systemStatus.monitoring ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {dashboardData.systemStatus.monitoring ? 'Pause' : 'Start'}
                  </button>
                  <button 
                    onClick={refreshData}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Real-World Timeline */}
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-lg border border-blue-500/20 rounded-3xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Clock className="h-6 w-6 text-blue-400" />
              Real-Time Protection Timeline
            </h2>
            <div className="space-y-4">
              {timeline.map((event, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    event.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                    event.status === 'active' ? 'bg-blue-500/10 text-blue-400 animate-pulse' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {getIconForEvent(event.icon)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-semibold">{event.title}</h3>
                      <span className="text-gray-400 text-sm">
                        {event.timestamp > new Date() ? 'Ongoing' : event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg border border-blue-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Brain className="h-8 w-8 text-blue-400" />
                <span className="text-xs text-gray-400">LIVE</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{dashboardData.realTimeStats.threatsDetected.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Threats Detected</div>
              {liveMetrics && <div className="text-xs text-blue-300 mt-1">Live: {liveMetrics.threatsDetected}</div>}
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-lg border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Shield className="h-8 w-8 text-green-400" />
                <span className="text-xs text-gray-400">ACTIVE</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{dashboardData.realTimeStats.policiesActive}</div>
              <div className="text-gray-400 text-sm">Security Policies</div>
              {liveMetrics && <div className="text-xs text-green-300 mt-1">Live: {liveMetrics.policiesActive}</div>}
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg border border-purple-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Zap className="h-8 w-8 text-purple-400" />
                <span className="text-xs text-gray-400">TODAY</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{dashboardData.realTimeStats.testsRun.toLocaleString()}</div>
              <div className="text-gray-400 text-sm">Security Tests</div>
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-lg border border-red-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="h-8 w-8 text-red-400" />
                <span className="text-xs text-gray-400">BLOCKED</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{dashboardData.realTimeStats.responsesBlocked}</div>
              <div className="text-gray-400 text-sm">Responses Blocked</div>
              {liveMetrics && <div className="text-xs text-red-300 mt-1">Live: {liveMetrics.responsesBlocked}</div>}
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-lg border border-cyan-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Activity className="h-8 w-8 text-cyan-400" />
                <span className="text-xs text-gray-400">AUTO</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{dashboardData.realTimeStats.adaptations}</div>
              <div className="text-gray-400 text-sm">Adaptations</div>
              {liveMetrics && <div className="text-xs text-purple-300 mt-1">Live: {liveMetrics.adaptations}</div>}
            </div>
          </div>

          {/* Registered Models */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Monitored Models ({dashboardData.models.length})</h2>
              <Link href="/models" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2">
                Manage Models <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </div>
            {dashboardData.models.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">No models registered yet</p>
                <Link href="/models" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg inline-block">
                  Register Your First Model
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.models.map(m => (
                  <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold">{m.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        m.risk === 'CRITICAL' ? 'bg-red-500/10 text-red-400' :
                        m.risk === 'HIGH_RISK' ? 'bg-orange-500/10 text-orange-400' :
                        m.risk === 'SAFE' ? 'bg-green-500/10 text-green-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {m.risk}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs">
                      Last probe: {m.lastProbeAt ? new Date(m.lastProbeAt).toLocaleString() : 'Never'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Recent Threats */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Threats</h2>
                <Link href="/threat-intel" className="text-blue-400 hover:text-blue-300 text-sm">View All</Link>
              </div>
              <div className="space-y-4">
                {dashboardData.recentThreats.map((threat, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        threat.severity === 'high' ? 'bg-red-400' : 
                        threat.severity === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                      }`}></div>
                      <div>
                        <div className="text-white font-medium">{threat.type}</div>
                        <div className="text-gray-400 text-sm">{threat.source}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-sm">
                        {new Date(threat.timestamp).toLocaleTimeString()}
                      </div>
                      <div className={`text-xs font-medium ${
                        threat.status === 'blocked' ? 'text-red-400' : 
                        threat.status === 'mitigated' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {threat.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Performance */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">System Performance</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Detection Rate</span>
                    <span className="text-green-400">{dashboardData.systemPerformance.detectionRate}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full" style={{width: `${dashboardData.systemPerformance.detectionRate}%`}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Response Time</span>
                    <span className="text-blue-400">{dashboardData.systemPerformance.responseTime}min avg</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full" style={{width: `${Math.max(20, 100 - dashboardData.systemPerformance.responseTime * 10)}%`}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">System Load</span>
                    <span className="text-yellow-400">{dashboardData.systemPerformance.systemLoad}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-400 h-2 rounded-full" style={{width: `${dashboardData.systemPerformance.systemLoad}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Metrics */}
          {dashboardData.metrics && (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 mt-8">
              <h2 className="text-2xl font-bold text-white mb-6">Advanced Security Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-red-500/10 rounded-lg p-4">
                  <div className="text-red-300 text-sm mb-1">Critical Findings</div>
                  <div className="text-white text-3xl font-bold">{dashboardData.metrics.criticalFindings}</div>
                </div>
                <div className="bg-orange-500/10 rounded-lg p-4">
                  <div className="text-orange-300 text-sm mb-1">High-Risk Findings</div>
                  <div className="text-white text-3xl font-bold">{dashboardData.metrics.highRiskFindings}</div>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-4">
                  <div className="text-blue-300 text-sm mb-1">Total Probes</div>
                  <div className="text-white text-3xl font-bold">{dashboardData.metrics.probesRun}</div>
                </div>
                <div className="bg-purple-500/10 rounded-lg p-4">
                  <div className="text-purple-300 text-sm mb-1">Event Log Size</div>
                  <div className="text-white text-3xl font-bold">{dashboardData.metrics.eventLogSize}</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
