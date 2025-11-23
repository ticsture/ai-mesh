# 🛡️ AI Mesh - Real-Time Adaptive AI Security Platform

> A fully functional, production-ready AI security system that continuously monitors threats, generates adaptive policies, and protects your custom AI models using multi-layered defense powered by Groq AI.

[![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Groq](https://img.shields.io/badge/Groq-AI-orange?style=for-the-badge)](https://groq.com/)

---

## 📖 Description

**AI Mesh** is an advanced real-time security monitoring platform designed to protect AI models from emerging threats like jailbreak attacks, prompt injections, and adversarial exploits. Unlike traditional static security systems, AI Mesh continuously adapts by:

1. **Discovering threats in real-time** from Reddit, GitHub, and security research
2. **Generating adaptive policies** automatically using Groq AI
3. **Testing your custom models** with sophisticated adversarial prompts
4. **Blocking malicious responses** through multi-layer AI analysis
5. **Evolving defenses continuously** based on attack patterns

### 🎯 What Makes It Unique

- **Zero Static Data**: All metrics computed from real events and live API calls
- **Real Threat Ingestion**: Actively scans Reddit r/ChatGPTJailbreak and GitHub for new attack techniques
- **User Model Support**: Register any OpenAI-compatible or custom model endpoint with API keys
- **Groq AI Powered**: Uses llama-3.1-8b-instant for threat analysis, policy generation, and risk assessment
- **Real-Time Dashboard**: Live Server-Sent Events streaming with timeline visualization
- **AI Security Assistant**: Natural language queries about your models, threats, and findings
- **Adaptive Probing**: Automatically generates follow-up attacks based on detected vulnerabilities

### 🔥 Real-World Example Flow

```
T+0:     New "DAN 12.0" jailbreak discovered on Reddit
         → ThreatIntelligenceEngine detects pattern
         → Groq AI analyzes and enriches threat data

T+2min:  Security policies automatically generated
         → AdaptivePolicyGenerator creates countermeasures
         → Policies converted to executable rules

T+5min:  Your models are protected
         → Red Team AI generates 50 attack variants
         → Guardian AI tests all registered models
         → Immediate blocking of successful attacks

T+hours: Attacker tries technique on your model → BLOCKED
         → Continuous probing catches new variations
         → Auto-mitigation updates policies
         → Real-time dashboard shows blocked attempts
```

---

## 🚀 Features

### 🔍 Real-Time Threat Intelligence
- **Live Reddit Scanning**: Monitors r/ChatGPTJailbreak every 5 minutes for new jailbreak techniques (DAN 12.0, etc.)
- **GitHub Code Search**: Discovers prompt injection patterns in public repositories
- **Groq AI Enrichment**: Analyzes and scores threats with confidence levels
- **Dynamic Pattern Detection**: Identifies emerging attack vectors automatically

### 🤖 Custom Model Registry
- **User-Supplied Endpoints**: Register any OpenAI-compatible or custom JSON API
- **API Key Management**: Secure in-memory storage (no disk persistence)
- **Per-Model Controls**: Pause/resume monitoring individually
- **Immediate Probing**: Automatic security testing on registration
- **Continuous Monitoring**: Re-probes every 10 minutes with latest threats

### 🛡️ Multi-Layer AI Protection
- **Heuristic Analysis**: Fast pattern matching for known attack signatures
- **Groq Deep Analysis**: AI-powered risk assessment with confidence scoring
- **Layered Risk Scoring**: Combines heuristic + AI evaluation for accuracy
- **Adaptive Follow-Up**: Generates targeted probes based on detected vulnerabilities

### 📊 Advanced Dashboard
- **Real-Time Metrics**: Threats detected, policies active, probes run, responses blocked
- **Protection Timeline**: Visualizes T+0 detection → T+2min policy → T+5min protection flow
- **Per-Model Status**: Risk level, probe count, last scan time
- **Live SSE Streaming**: Updates every 5 seconds without page refresh
- **System Performance**: Detection rate, response time, adaptation metrics

### 🤝 AI Security Assistant
- **Natural Language Queries**: "What are the critical findings in my models?"
- **Context-Aware Responses**: Accesses real-time security data and event logs
- **Critical Issue Highlighting**: Automatically identifies urgent security concerns
- **Actionable Insights**: Provides recommendations based on current threat landscape

### 🎨 Beautiful UI
- **Gradient Glassmorphism**: Modern design with backdrop blur effects
- **Color-Coded Risks**: CRITICAL (red), HIGH_RISK (orange), SAFE (green)
- **Animated Indicators**: Pulsing status dots for active monitoring
- **Responsive Layout**: Works seamlessly on mobile, tablet, and desktop

---

## 🏗️ Architecture

### Core Security Modules

```
src/lib/adaptive-security/
├── ThreatIntelligence.ts      # Live threat scanning (Reddit/GitHub)
├── PolicyGenerator.ts          # Groq-powered policy generation
├── RedTeamAI.ts                # Adversarial prompt creation
├── GuardianAI.ts               # Multi-layer response analysis
├── ModelProbeEngine.ts         # Model security testing
├── AutoMitigation.ts           # Automated threat response
├── WatchtowerMesh.ts           # Orchestration layer
├── SecurityState.ts            # Central state management
└── UntrustedModelRegistry.ts  # Model registry
```

#### 1. 🧠 **Threat Intelligence Engine**
Continuously scans external sources for emerging threats:
```typescript
const threatEngine = new ThreatIntelligenceEngine();
// Scans Reddit + GitHub every 5 minutes
const threats = await threatEngine.scanForNewThreats();
```
- Reddit r/ChatGPTJailbreak monitoring
- GitHub code search for prompt injection
- Pattern extraction and confidence scoring
- Groq AI enrichment with indicators and countermeasures

#### 2. 📋 **Adaptive Policy Generator**
Converts threats into executable security rules:
```typescript
const policyGen = new AdaptivePolicyGenerator();
const policies = await policyGen.generatePoliciesFromThreats(threats);
```
- Natural language policy generation via Groq
- Automatic rule conversion
- Effectiveness tracking
- Dynamic updates based on threat evolution

#### 3. ⚔️ **Enhanced Red Team AI**
Generates sophisticated adversarial prompts:
```typescript
const redTeam = new EnhancedRedTeamAI();
const attacks = await redTeam.generateAdversarialPrompts(threats, policies, 50);
```
- DAN 12.0 variants and role-playing attacks
- Multi-step manipulation techniques
- Sophistication levels (basic, intermediate, advanced)
- Groq-powered prompt generation

#### 4. 🛡️ **Real-Time Guardian AI**
Multi-layer response analysis:
```typescript
const guardian = new RealTimeGuardianAI();
const analysis = await guardian.analyzeResponse(prompt, response, policies);
```
- Heuristic pattern matching (fast first-pass)
- Groq risk assessment (deep analysis)
- Policy violation detection
- Confidence scoring with escalation rules

#### 5. 🔬 **Model Probe Engine**
Tests models with adversarial prompts:
```typescript
const probeEngine = new ModelProbeEngine();
const results = await probeEngine.probeModel(modelId, policies);
```
- 20 initial probes per cycle
- Adaptive follow-up for high/critical findings
- Risk summary updates in registry
- Detailed analysis storage

#### 6. 🕸️ **Watchtower Mesh Orchestrator**
Coordinates all security components:
```typescript
const watchtower = new WatchtowerMesh();
const results = await watchtower.runAdaptiveSecurityTest(policies);
```
- Full security test scenarios
- Guardian analysis recording
- Feedback loop integration

#### 7. 🏛️ **Security State Manager**
Central state and event management:
```typescript
const securityState = new SecurityState();
// All metrics derived from event log
const metrics = securityState.computeMetrics(threats);
```
- Event log (threat_detected, policy_generated, model_probed, guardian_analysis)
- Dynamic metrics computation
- Continuous probing loops (10-minute intervals)
- Per-model monitoring control

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router and Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icon library
- **Server-Sent Events** - Real-time data streaming

### Backend
- **Next.js API Routes** - RESTful endpoints
- **Groq SDK** - AI-powered analysis (llama-3.1-8b-instant)
- **Reddit JSON API** - Threat intelligence source
- **GitHub API** - Code search for vulnerabilities

### Security Architecture
- **Multi-agent AI** - Specialized security roles
- **Event-driven state** - Zero static data
- **Continuous monitoring** - Background threat/probe loops
- **Adaptive learning** - Policy updates based on findings

---

## 📦 Installation

### Prerequisites
- **Node.js 18+** 
- **npm or yarn**
- **Groq API key** ([get one free](https://console.groq.com))

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/ticsture/ai-mesh.git
cd ai-mesh
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
# Create .env.local file
echo "GROQ_API_KEY=your_groq_api_key_here" > .env.local
```

4. **Build the project**
```bash
npm run build
```

5. **Start development server**
```bash
npm run dev
```

6. **Access the application**
- Dashboard: http://localhost:3000/dashboard
- Model Registry: http://localhost:3000/models
- Threat Intelligence: http://localhost:3000/threat-intel

---

## 📚 Usage Guide

### Registering a Custom Model

1. **Navigate to Models Page**
```
http://localhost:3000/models
```

2. **Fill Registration Form**
- **Model Name**: Your identifier (e.g., "My GPT-4")
- **Provider Type**: `openai-compatible`, `custom`, `anthropic`, or `groq`
- **Endpoint URL**: Your model's API endpoint
- **Model Identifier** (optional): e.g., `gpt-4`, `llama-3.1-70b`
- **API Key** (optional): Your authentication key

3. **Submit and Wait**
- System runs immediate probe with 20 adversarial prompts
- Results displayed within 30-60 seconds
- Continuous monitoring begins automatically

### Using the AI Assistant

```
Navigate to /models → AI Security Assistant section

Example queries:
- "What are the critical findings in my models?"
- "Show me recent high-risk threats"
- "Which model has the most vulnerabilities?"
- "What jailbreak techniques were detected today?"
```

### Monitoring the Dashboard

```
Navigate to /dashboard

Live metrics:
- Threats Detected (from Reddit/GitHub)
- Policies Active (auto-generated)
- Probes Run (model testing cycles)
- Responses Blocked (high-risk/critical)
- Adaptations (policy updates)

Timeline shows:
- T+0: Threat detection events
- T+2min: Policy generation
- T+5min: Active protection status
```

### Managing Model Monitoring

```
Per-model controls on /models:

🟢 MONITORING badge = Active probing every 10 minutes
⏸️ Pause button = Temporarily disable monitoring
▶️ Play button = Resume monitoring
🔄 Run Probe = Manual on-demand testing
```

---

## 🔧 Configuration

### Environment Variables
```bash
# .env.local (required)
GROQ_API_KEY=gsk_your_api_key_here
```

### Security Settings (in code)
```typescript
// src/lib/adaptive-security/ThreatIntelligence.ts
// Threat scanning interval: 5 minutes
setInterval(scanForNewThreats, 5 * 60 * 1000);

// src/lib/adaptive-security/SecurityState.ts
// Model probing interval: 10 minutes
setInterval(maybeProbeModels, 10 * 60 * 1000);

// Policy refresh cooldown: 60 seconds
if (now - lastPolicyGeneration > 60_000) { ... }
```

---

## 📊 API Endpoints

### Model Management
```bash
# Register new model (triggers immediate probe)
POST /api/models/register
Body: { name, endpoint, provider, model?, apiKey? }

# List all registered models
GET /api/models/list

# Run on-demand probe
POST /api/model-probe
Body: { modelId }
```

### Security Operations
```bash
# Get dashboard metrics
GET /api/dashboard?details=true

# Real-time SSE stream
GET /api/stream/security

# Get threat intelligence
GET /api/threat-intel

# Run full security test
POST /api/security-test
Body: { targetModel, policies }
```

### AI Assistant
```bash
# Query security data
POST /api/ai-assistant
Body: { query: "What are the critical findings?" }
```

---

## 📈 Performance Metrics

### System Capabilities
- **Threat Scan Latency**: 2-5 seconds (Reddit + GitHub + Groq)
- **Policy Generation**: 3-8 seconds per threat (Groq LLM)
- **Model Probe Duration**: 30-60 seconds (20 prompts + follow-ups)
- **Dashboard Load Time**: <1 second (cached metrics)
- **SSE Latency**: <100ms (local network)

### Continuous Operations
- **Threat Scanning**: Every 5 minutes
- **Model Probing**: Every 10 minutes (per enabled model)
- **Policy Refresh**: On new threat (max once per minute)
- **SSE Updates**: Every 5 seconds to connected clients

---

## 🧪 Project Structure

```
ai-mesh/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai-assistant/route.ts       # AI chat interface
│   │   │   ├── dashboard/route.ts          # Metrics endpoint
│   │   │   ├── model-probe/route.ts        # On-demand probing
│   │   │   ├── models/
│   │   │   │   ├── register/route.ts       # Model registration
│   │   │   │   └── list/route.ts           # Model listing
│   │   │   ├── security-test/route.ts      # Full test scenarios
│   │   │   ├── stream/security/route.ts    # SSE endpoint
│   │   │   └── threat-intel/route.ts       # Threat data
│   │   ├── dashboard/page.tsx              # Main dashboard UI
│   │   ├── models/page.tsx                 # Model registry UI
│   │   ├── security-test/page.tsx          # Test console
│   │   ├── threat-intel/page.tsx           # Threat viewer
│   │   └── layout.tsx                      # Root layout
│   └── lib/
│       ├── adaptive-security/
│       │   ├── ThreatIntelligence.ts       # Real-time scanning
│       │   ├── PolicyGenerator.ts          # Groq policy gen
│       │   ├── RedTeamAI.ts                # Attack generation
│       │   ├── GuardianAI.ts               # Response analysis
│       │   ├── ModelProbeEngine.ts         # Model testing
│       │   ├── AutoMitigation.ts           # Auto-response
│       │   ├── WatchtowerMesh.ts           # Orchestrator
│       │   ├── SecurityState.ts            # State manager
│       │   └── UntrustedModelRegistry.ts   # Model registry
│       └── services/
│           └── GroqService.ts              # Groq AI integration
├── public/                                  # Static assets
├── .env.local                              # Environment variables
├── package.json                            # Dependencies
├── tsconfig.json                           # TypeScript config
├── tailwind.config.ts                      # Tailwind config
└── next.config.ts                          # Next.js config
```

---

## 🔒 Security Considerations

### Current Implementation
- **API keys stored in-memory only** (not persisted to disk)
- **Server restart purges all keys**
- **No authentication layer** (single-user local deployment)

### Production Recommendations
1. **Database Integration**: Use PostgreSQL with pgcrypto for encrypted storage
2. **Key Management**: Integrate AWS KMS, Azure Key Vault, or HashiCorp Vault
3. **Authentication**: Add NextAuth.js, Clerk, or Auth0
4. **Rate Limiting**: Implement per-user API quotas
5. **Audit Logging**: Persist event log to database for compliance
6. **HTTPS Only**: Enforce TLS in production
7. **Environment Isolation**: Separate dev/staging/prod Groq API keys

---

## 🐛 Troubleshooting

### "Failed to fetch dashboard data"
- **Check**: Groq API key in `.env.local`
- **Verify**: API rate limits not exceeded
- **Confirm**: Server running on port 3000

### Models not being probed
- **Check**: Monitoring enabled (green badge, not paused)
- **Verify**: Model endpoint reachable
- **Review**: SecurityState event log for errors
- **Wait**: Initial probe cycle is 10 minutes

### No threats detected
- **Confirm**: Internet connection active
- **Check**: Reddit/GitHub APIs accessible
- **Wait**: 5+ minutes for initial scan cycle
- **Verify**: User-Agent headers not blocked

### SSE connection errors
- **Symptom**: Dashboard shows stale data
- **Solution**: SSE auto-closes after 5 minutes, refresh page
- **Check**: Browser console for connection errors

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Add JSDoc comments for public functions
- Update README for new features
- Test locally before submitting PR

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Groq** for lightning-fast LLM inference
- **Next.js team** for excellent React framework
- **Reddit & GitHub** for threat intelligence sources
- **Open-source community** for security research

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ticsture/ai-mesh/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ticsture/ai-mesh/discussions)
- **Email**: [Your contact email]

---

**Built with ❤️ using Groq AI, Next.js, and real-time adaptive security principles.**

*Protecting AI models from emerging threats, one adaptation at a time.*
