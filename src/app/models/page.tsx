"use client";
import { useEffect, useState } from 'react';
import { Shield, Play, Pause, Activity, AlertTriangle, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface RegisteredModel {
  id: string;
  name: string;
  provider: string;
  endpoint: string;
  model?: string;
  createdAt: string;
  lastProbeAt?: string;
  lastRiskSummary?: {
    riskLevel: string;
    highRiskFindings: number;
    totalFindings: number;
  };
  monitoringEnabled?: boolean;
  probeCount?: number;
}

export default function ModelsPage() {
  const [models, setModels] = useState<RegisteredModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [registerData, setRegisterData] = useState({ name: '', endpoint: '', provider: 'openai-compatible', model: '', apiKey: '' });
  const [probeResult, setProbeResult] = useState<any>(null);
  const [probingModelId, setProbingModelId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchModels = async () => {
    const res = await fetch('/api/models/list');
    const json = await res.json();
    setModels(json.models || []);
  };

  useEffect(() => { 
    fetchModels(); 
    const interval = setInterval(fetchModels, 15000);
    return () => clearInterval(interval);
  }, []);

  const registerModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setProbeResult(null);
    if (!registerData.name || !registerData.endpoint) {
      setError('Name and endpoint are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/models/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      const json = await res.json();
      if (json.error) setError(json.error); 
      else {
        setRegisterData({ name: '', endpoint: '', provider: 'openai-compatible', model: '', apiKey: '' });
        await fetchModels();
        if (json.initialProbe) {
          setProbeResult(json.initialProbe);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const probeModel = async (id: string) => {
    setProbingModelId(id);
    setProbeResult(null);
    try {
      const res = await fetch('/api/model-probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: id })
      });
      const json = await res.json();
      setProbeResult(json.probe);
      await fetchModels();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setProbingModelId(null);
    }
  };

  const toggleMonitoring = async (id: string, current: boolean) => {
    try {
      const model = models.find(m => m.id === id);
      if (!model) return;
      // Update locally first for instant feedback
      setModels(prev => prev.map(m => m.id === id ? {...m, monitoringEnabled: !current} : m));
      // Then persist (will implement API endpoint)
    } catch (e: any) {
      setError(e.message);
    }
  };

  const askAI = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery })
      });
      const json = await res.json();
      if (json.success) {
        setAiResponse(json.response);
      } else {
        setAiResponse('Error: ' + json.error);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'CRITICAL') return 'text-red-400 bg-red-500/10 border-red-500/30';
    if (risk === 'HIGH_RISK') return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    if (risk === 'MEDIUM_RISK') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    if (risk === 'SAFE') return 'text-green-400 bg-green-500/10 border-green-500/30';
    return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="fixed top-0 w-full backdrop-blur-xl bg-black/20 border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-400" />
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                MODEL REGISTRY
              </h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/dashboard" className="text-white hover:text-blue-400 transition-colors">Dashboard</Link>
              <Link href="/threat-intel" className="text-white hover:text-blue-400 transition-colors">Threats</Link>
              <Link href="/security-test" className="text-white hover:text-blue-400 transition-colors">Tests</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 p-8 max-w-7xl mx-auto">
        
        {/* Registration Form */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Activity className="h-6 w-6 text-blue-400" />
            Register Your Custom Model
          </h2>
          <p className="text-gray-300 mb-6">
            Add your AI model endpoint for continuous security monitoring. Our agents will probe it with adversarial prompts and detect vulnerabilities in real-time.
          </p>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          <form onSubmit={registerModel} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Model Name</label>
                <input 
                  type="text"
                  placeholder="e.g., My Custom GPT"
                  value={registerData.name}
                  onChange={e => setRegisterData(d => ({...d, name: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Provider Type</label>
                <select
                  value={registerData.provider}
                  onChange={e => setRegisterData(d => ({...d, provider: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-400 focus:outline-none transition-colors"
                >
                  <option value="openai-compatible">OpenAI-Compatible</option>
                  <option value="custom">Custom JSON API</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="groq">Groq</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Endpoint URL</label>
              <input 
                type="url"
                placeholder="https://api.example.com/v1/chat/completions"
                value={registerData.endpoint}
                onChange={e => setRegisterData(d => ({...d, endpoint: e.target.value}))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Model Identifier (optional)</label>
                <input 
                  type="text"
                  placeholder="e.g., gpt-4, llama-3.1-70b"
                  value={registerData.model}
                  onChange={e => setRegisterData(d => ({...d, model: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">API Key (stored in-memory)</label>
                <input 
                  type="password"
                  placeholder="sk-..."
                  value={registerData.apiKey}
                  onChange={e => setRegisterData(d => ({...d, apiKey: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <p className="text-xs text-gray-400">
                ⚠️ API keys are stored only in server memory. Server restart will purge them.
              </p>
              <button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <><Clock className="h-4 w-4 animate-spin" /> Registering...</> : <><Shield className="h-4 w-4" /> Register Model</>}
              </button>
            </div>
          </form>
        </div>

        {/* AI Assistant */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg border border-purple-500/20 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-purple-400" />
            AI Security Assistant
          </h2>
          <p className="text-gray-300 mb-4">Ask questions about your models, threats, or security findings</p>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && askAI()}
              placeholder="e.g., What are the critical findings in my models?"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none transition-colors"
            />
            <button
              onClick={askAI}
              disabled={aiLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              {aiLoading ? 'Analyzing...' : 'Ask AI'}
            </button>
          </div>
          {aiResponse && (
            <div className="bg-white/5 border border-purple-500/20 rounded-lg p-4">
              <p className="text-white whitespace-pre-wrap">{aiResponse}</p>
            </div>
          )}
        </div>

        {/* Models List */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Registered Models ({models.length})</h2>
          
          {models.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No models registered yet. Add one above to start monitoring.</p>
            </div>
          )}

          <div className="space-y-4">
            {models.map(m => (
              <div key={m.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{m.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(m.lastRiskSummary?.riskLevel || 'UNKNOWN')}`}>
                        {m.lastRiskSummary?.riskLevel || 'UNKNOWN'}
                      </span>
                      {m.monitoringEnabled !== false ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/30 flex items-center gap-1">
                          <Activity className="h-3 w-3 animate-pulse" />
                          MONITORING
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/30">
                          PAUSED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{m.endpoint}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Provider: <span className="text-gray-300">{m.provider}</span></span>
                      {m.model && <span>Model: <span className="text-gray-300">{m.model}</span></span>}
                      <span>Probes: <span className="text-blue-400">{m.probeCount || 0}</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMonitoring(m.id, m.monitoringEnabled !== false)}
                      className={`p-3 rounded-lg transition-all ${
                        m.monitoringEnabled !== false
                          ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}
                      title={m.monitoringEnabled !== false ? 'Pause Monitoring' : 'Resume Monitoring'}
                    >
                      {m.monitoringEnabled !== false ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => probeModel(m.id)}
                      disabled={!!probingModelId}
                      className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {probingModelId === m.id ? (
                        <><Clock className="h-4 w-4 animate-spin" /> Probing...</>
                      ) : (
                        <><Activity className="h-4 w-4" /> Run Probe</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Risk Summary */}
                {m.lastRiskSummary && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-gray-400 text-xs mb-1">Total Findings</div>
                      <div className="text-white text-2xl font-bold">{m.lastRiskSummary.totalFindings}</div>
                    </div>
                    <div className="bg-red-500/10 rounded-lg p-3">
                      <div className="text-red-300 text-xs mb-1">High-Risk</div>
                      <div className="text-red-400 text-2xl font-bold">{m.lastRiskSummary.highRiskFindings}</div>
                    </div>
                    <div className="bg-blue-500/10 rounded-lg p-3">
                      <div className="text-blue-300 text-xs mb-1">Last Probe</div>
                      <div className="text-blue-400 text-sm font-medium">
                        {m.lastProbeAt ? new Date(m.lastProbeAt).toLocaleString() : 'Never'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Probe Result */}
        {probeResult && (
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 mt-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
              Probe Result: {probeResult.modelName}
            </h2>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-500/10 rounded-lg p-4">
                <div className="text-blue-300 text-sm mb-1">Total Probes</div>
                <div className="text-white text-3xl font-bold">{probeResult.totalProbes}</div>
              </div>
              <div className="bg-yellow-500/10 rounded-lg p-4">
                <div className="text-yellow-300 text-sm mb-1">Failed Checks</div>
                <div className="text-white text-3xl font-bold">{probeResult.failedPolicyChecks}</div>
              </div>
              <div className="bg-orange-500/10 rounded-lg p-4">
                <div className="text-orange-300 text-sm mb-1">High-Risk</div>
                <div className="text-white text-3xl font-bold">{probeResult.highRiskFindings}</div>
              </div>
              <div className="bg-red-500/10 rounded-lg p-4">
                <div className="text-red-300 text-sm mb-1">Critical</div>
                <div className="text-white text-3xl font-bold">{probeResult.criticalFindings}</div>
              </div>
            </div>
            <details className="bg-white/5 rounded-lg p-4">
              <summary className="text-white font-semibold cursor-pointer">View All Analyses ({probeResult.analyses.length})</summary>
              <div className="space-y-3 mt-4">
                {probeResult.analyses.map((a: any) => (
                  <div key={a.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(a.riskLevel)}`}>
                        {a.riskLevel}
                      </span>
                      <span className="text-gray-400 text-xs">Confidence: {Math.round(a.confidence * 100)}%</span>
                    </div>
                    {a.detectedViolations.length > 0 && (
                      <div className="text-sm text-gray-300 space-y-1">
                        {a.detectedViolations.map((v: any, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                            <span>{v.ruleViolated} ({v.severity})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
