import Link from 'next/link';
import { Shield, Activity, AlertTriangle, Brain, Users, Zap, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full backdrop-blur-xl bg-black/20 border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blue-400" />
              <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                WATCHTOWER MESH
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-white hover:text-blue-400 transition-colors">
                Dashboard
              </Link>
              <Link href="/threat-intel" className="text-white hover:text-blue-400 transition-colors">
                Threat Intel
              </Link>
              <Link href="/security-test" className="text-white hover:text-blue-400 transition-colors">
                Security Test
              </Link>
              <Link href="/dashboard">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">
                  Launch Platform
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Floating Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              ADAPTIVE AI
              <br />
              SECURITY MESH
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Revolutionary multi-agent AI oversight system that continuously red-teams, monitors, and defends 
              against evolving AI threats with <span className="text-blue-400 font-semibold">real-time adaptation</span>.
            </p>
            
            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="text-3xl font-bold text-green-400">98.7%</div>
                <div className="text-gray-400">Threat Detection</div>
              </div>
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="text-3xl font-bold text-blue-400">&lt;2s</div>
                <div className="text-gray-400">Response Time</div>
              </div>
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="text-3xl font-bold text-purple-400">24/7</div>
                <div className="text-gray-400">Monitoring</div>
              </div>
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="text-3xl font-bold text-cyan-400">∞</div>
                <div className="text-gray-400">Adaptations</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                  <Shield className="h-5 w-5" />
                  Launch Security Platform
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              <Link href="/demo">
                <button className="border border-white/20 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/5 transition-all flex items-center gap-3">
                  <Activity className="h-5 w-5" />
                  View Live Demo
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
              Revolutionary AI Defense Architecture
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Multi-layered adaptive security system that evolves faster than attacks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Threat Intelligence */}
            <div className="group">
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-8 hover:shadow-2xl hover:border-blue-400/40 transition-all duration-300 h-full">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Threat Intelligence AI</h3>
                <p className="text-gray-300 mb-6">
                  Continuously scans security research, GitHub, and dark web for emerging AI attack patterns. 
                  Auto-generates policies from real threats in minutes.
                </p>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Real-time threat pattern detection
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    Automated policy generation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Cross-domain threat analysis
                  </li>
                </ul>
              </div>
            </div>

            {/* Red Team AI */}
            <div className="group">
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 hover:shadow-2xl hover:border-red-400/40 transition-all duration-300 h-full">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Enhanced Red Team AI</h3>
                <p className="text-gray-300 mb-6">
                  Generates sophisticated adversarial prompts targeting specific vulnerabilities. 
                  Evolves attack techniques based on defensive responses.
                </p>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    Advanced jailbreak techniques
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    Adaptive attack evolution
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    Multi-domain exploit testing
                  </li>
                </ul>
              </div>
            </div>

            {/* Guardian AI */}
            <div className="group">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 hover:shadow-2xl hover:border-green-400/40 transition-all duration-300 h-full">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Real-time Guardian AI</h3>
                <p className="text-gray-300 mb-6">
                  Continuously monitors AI responses for policy violations, data leaks, and manipulation attempts. 
                  Provides instant risk assessment and safer alternatives.
                </p>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Real-time response analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    Policy violation detection
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Automated risk scoring
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <Shield className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-bold text-white">Watchtower Mesh</span>
          </div>
          <p className="text-gray-400">© 2025 Adaptive AI Security Platform. Defending the future of AI.</p>
        </div>
      </footer>
    </div>
  );
}
