"use client";
import { useEffect, useState } from 'react';
import { Shield, Play, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
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
  probeCount?: number;
}

interface TestResult {
  modelId: string;
  modelName: string;
  testDuration: number;
  threatsUsed: number;
  promptsGenerated: number;
  promptsTested: number;
  overallRiskLevel: string;
  overallScore: number;
  safeResponses: number;
  lowRiskResponses: number;
  mediumRiskResponses: number;
  highRiskResponses: number;
  criticalResponses: number;
  assessments: any[];
}

export default function ModelsPage() {
  const [models, setModels] = useState<RegisteredModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    endpoint: '', 
    provider: 'openai-compatible', 
    model: '', 
    apiKey: '' 
  });
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const fetchModels = async () => {
    const res = await fetch('/api/models/list');
    const json = await res.json();
    setModels(json.models || []);
  };

  useEffect(() => { 
    fetchModels(); 
  }, []);

  const registerModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
      if (json.error) {
        setError(json.error);
      } else {
        setRegisterData({ name: '', endpoint: '', provider: 'openai-compatible', model: '', apiKey: '' });
        await fetchModels();
      }
    } finally {
      setLoading(false);
    }
  };

  const runQuickTest = async (modelId: string) => {
    setTestingModelId(modelId);
    setTestResult(null);
    setError('');
    
    try {
      const res = await fetch('/api/test-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId })
      });
      
      const json = await res.json();
      
      if (json.error) {
        setError(json.error);
      } else {
        setTestResult(json.result);
        await fetchModels();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setTestingModelId(null);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'SAFE': return 'text-green-500';
      case 'LOW_RISK': return 'text-blue-500';
      case 'MEDIUM_RISK': return 'text-yellow-500';
      case 'HIGH_RISK': return 'text-orange-500';
      case 'CRITICAL': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'SAFE': return 'bg-green-100 border-green-300';
      case 'LOW_RISK': return 'bg-blue-100 border-blue-300';
      case 'MEDIUM_RISK': return 'bg-yellow-100 border-yellow-300';
      case 'HIGH_RISK': return 'bg-orange-100 border-orange-300';
      case 'CRITICAL': return 'bg-red-100 border-red-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-blue-400" />
              <h1 className="text-4xl font-bold">AI Model Security Tester</h1>
            </div>
            <Link href="/dashboard" className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
              Dashboard
            </Link>
          </div>
          <p className="text-gray-300 text-lg">
            Test untrusted AI models for security vulnerabilities in 10-20 seconds
          </p>
        </div>

        {/* How it works */}
        <div className="mb-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400 mb-2">1</div>
              <div className="font-semibold mb-1">Quick Threat Scan</div>
              <div className="text-gray-400">Scans latest security threats from Reddit, HackerNews</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400 mb-2">2</div>
              <div className="font-semibold mb-1">Generate Test Prompts</div>
              <div className="text-gray-400">AI generates targeted adversarial prompts based on threats</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400 mb-2">3</div>
              <div className="font-semibold mb-1">AI Judge Assessment</div>
              <div className="text-gray-400">Analyzes responses and assigns risk scores</div>
            </div>
          </div>
        </div>

        {/* Register Form */}
        <div className="mb-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Register Untrusted Model</h2>
          <form onSubmit={registerModel} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Model Name (e.g., CustomGPT)"
                value={registerData.name}
                onChange={e => setRegisterData({...registerData, name: e.target.value})}
                className="px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="API Endpoint URL"
                value={registerData.endpoint}
                onChange={e => setRegisterData({...registerData, endpoint: e.target.value})}
                className="px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="API Key (optional)"
                value={registerData.apiKey}
                onChange={e => setRegisterData({...registerData, apiKey: e.target.value})}
                className="px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <select
                value={registerData.provider}
                onChange={e => setRegisterData({...registerData, provider: e.target.value})}
                className="px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="openai-compatible">OpenAI Compatible</option>
                <option value="custom">Custom API</option>
              </select>
            </div>
            {error && (
              <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register Model'}
            </button>
          </form>
        </div>

        {/* Registered Models */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Registered Models ({models.length})</h2>
          <div className="grid gap-4">
            {models.map(model => (
              <div key={model.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{model.name}</h3>
                    <p className="text-gray-400 text-sm">{model.endpoint}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {model.probeCount || 0} tests
                      </span>
                      {model.lastProbeAt && (
                        <span>Last tested: {new Date(model.lastProbeAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => runQuickTest(model.id)}
                    disabled={testingModelId === model.id}
                    className="px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2"
                  >
                    {testingModelId === model.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Quick Test (10-20s)
                      </>
                    )}
                  </button>
                </div>

                {model.lastRiskSummary && (
                  <div className={`p-4 rounded-lg border ${getRiskBg(model.lastRiskSummary.riskLevel)}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold">Last Test Result:</span>
                        <span className={`ml-2 font-bold ${getRiskColor(model.lastRiskSummary.riskLevel)}`}>
                          {model.lastRiskSummary.riskLevel}
                        </span>
                      </div>
                      <div className="text-sm">
                        {model.lastRiskSummary.highRiskFindings} high-risk / {model.lastRiskSummary.totalFindings} total
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {models.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No models registered yet. Add your first model above.
              </div>
            )}
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="mb-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Test Results: {testResult.modelName}</h2>
            
            {/* Overall Score */}
            <div className={`p-6 rounded-lg border mb-6 ${getRiskBg(testResult.overallRiskLevel)}`}>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2 ${getRiskColor(testResult.overallRiskLevel)}">
                  {testResult.overallScore}/100
                </div>
                <div className="text-2xl font-bold mb-1">
                  {testResult.overallRiskLevel}
                </div>
                <div className="text-sm opacity-75">
                  Test completed in {(testResult.testDuration / 1000).toFixed(1)} seconds
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="bg-green-900/30 border border-green-500 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400">{testResult.safeResponses}</div>
                <div className="text-sm text-gray-300">Safe</div>
              </div>
              <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">{testResult.lowRiskResponses}</div>
                <div className="text-sm text-gray-300">Low Risk</div>
              </div>
              <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400">{testResult.mediumRiskResponses}</div>
                <div className="text-sm text-gray-300">Medium</div>
              </div>
              <div className="bg-orange-900/30 border border-orange-500 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-400">{testResult.highRiskResponses}</div>
                <div className="text-sm text-gray-300">High</div>
              </div>
              <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-red-400">{testResult.criticalResponses}</div>
                <div className="text-sm text-gray-300">Critical</div>
              </div>
            </div>

            {/* Test Details */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Threats Used</div>
                <div className="text-2xl font-bold">{testResult.threatsUsed}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Prompts Generated</div>
                <div className="text-2xl font-bold">{testResult.promptsGenerated}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Prompts Tested</div>
                <div className="text-2xl font-bold">{testResult.promptsTested}</div>
              </div>
            </div>

            {/* Individual Assessments */}
            <div>
              <h3 className="text-xl font-bold mb-4">Detailed Assessments</h3>
              <div className="space-y-4">
                {testResult.assessments.map((assessment, idx) => (
                  <div key={idx} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold mb-1">Test #{idx + 1}</div>
                        <div className="text-sm text-gray-300 mb-2">{assessment.prompt}</div>
                        <div className="text-sm text-gray-400 italic mb-2">
                          Response: "{assessment.response.slice(0, 200)}{assessment.response.length > 200 ? '...' : ''}"
                        </div>
                        <div className="text-sm text-gray-400">{assessment.reasoning}</div>
                      </div>
                      <div className={`ml-4 px-4 py-2 rounded-lg font-bold ${getRiskBg(assessment.riskLevel)}`}>
                        {assessment.riskLevel}
                      </div>
                    </div>
                    {assessment.violations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-600">
                        <div className="text-sm text-red-400">
                          Violations: {assessment.violations.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
