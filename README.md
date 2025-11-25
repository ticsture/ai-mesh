# AI Mesh - Rapid Security Testing for Untrusted AI Models

A defensive security platform built for the Apart Research Defensive Acceleration Hackathon. AI Mesh enables rapid adversarial testing of untrusted AI models using real-time threat intelligence and AI-powered risk assessment.

## Overview

AI Mesh addresses the critical need to quickly evaluate the security posture of untrusted AI models before deployment. The system:

1. Collects real-time threat intelligence from security communities (Reddit r/ChatGPTJailbreak, HackerNews)
2. Generates adversarial test prompts based on current attack techniques
3. Tests untrusted models with these prompts
4. Uses AI-powered judges to assess response safety
5. Provides comprehensive risk reports in 10-20 seconds

## Key Features

**Quick Model Testing**
- Test any untrusted AI model in 10-20 seconds
- Register models via OpenAI-compatible or custom API endpoints
- Automatic adversarial prompt generation from latest threats
- AI judge evaluates responses for safety violations

**Real-Time Threat Intelligence**
- Live scanning of r/ChatGPTJailbreak (5 min intervals)
- HackerNews security monitoring (10 min intervals)
- Automatic threat enrichment via Groq AI
- Pattern detection for emerging attack vectors

**Risk Assessment**
- Multi-layer analysis (heuristic + AI-powered)
- Risk scoring: SAFE, LOW, MEDIUM, HIGH, CRITICAL
- Detailed vulnerability breakdown per test prompt
- Actionable security recommendations

## Architecture

**Core Components:**
- `ModelTester` - Orchestrates 3-step testing workflow (generate prompts, test model, assess responses)
- `ThreatIntelligence` - Collects and enriches security threats from external sources
- `GroqService` - Powers AI judge and threat analysis using llama-3.1-8b-instant
- `SecurityState` - Central state management and event tracking
- `UntrustedModelRegistry` - Manages registered models and test results

**Technology Stack:**
- Next.js 16 with TypeScript
- Groq AI (llama-3.1-8b-instant)
- Tailwind CSS
- Server-Sent Events for real-time updates

## Installation

```bash
# Clone repository
git clone https://github.com/ticsture/ai-mesh.git
cd ai-mesh

# Install dependencies
npm install

# Configure Groq API key
echo "GROQ_API_KEY=your_groq_api_key" > .env.local

# Build and run
npm run build
npm run dev
```

Access at http://localhost:3000/models-test

## Usage

**Testing an Untrusted Model:**

1. Navigate to `/models-test`
2. Register model:
   - Name: Your identifier
   - Endpoint: Model's API URL
   - Provider: openai-compatible, custom, anthropic, or groq
   - API Key (optional): Authentication token
3. Click "Quick Test (10-20s)"
4. Review risk assessment and detailed findings

**Test Workflow:**
```
1. Fetch top 5 high-severity threats (instant)
2. Generate 15 adversarial prompts via Groq (3-5 seconds)
3. Test untrusted model with prompts (5-10 seconds)
4. AI judge evaluates responses (3-5 seconds)
5. Display comprehensive risk report
```

## API Endpoints

```bash
# Test model
POST /api/test-model
Body: { modelId: string }

# Register model
POST /api/models/register
Body: { name, endpoint, provider, model?, apiKey? }

# List models
GET /api/models/list
```

## Project Structure

```
src/
├── lib/adaptive-security/
│   ├── ModelTester.ts          # Core testing workflow
│   ├── ThreatIntelligence.ts   # Threat collection
│   ├── SecurityState.ts         # State management
│   └── UntrustedModelRegistry.ts
├── app/
│   ├── api/
│   │   ├── test-model/route.ts
│   │   └── models/
│   └── models-test/page.tsx    # Testing UI
└── services/
    └── GroqService.ts          # AI integration
```

## Configuration

Minimal AI usage by design:
- No automatic probing (only on-demand testing)
- Reduced threat scanning (2 sources, 5-10 min intervals)
- Efficient batch processing of test prompts
- Single AI judge call per test session

Environment variables:
```bash
GROQ_API_KEY=your_groq_api_key
```

## Defensive Acceleration Use Case

This platform is designed for security researchers and organizations that need to:
- Quickly vet untrusted AI models before integration
- Identify vulnerability to current jailbreak techniques
- Make informed decisions about model deployment
- Maintain up-to-date threat awareness

The focus is speed and actionability - getting from "unknown model" to "comprehensive risk assessment" in under 30 seconds.

## Development

Built for the Apart Research Defensive Acceleration Hackathon to demonstrate practical AI safety tooling that bridges the gap between threat intelligence and model evaluation.
