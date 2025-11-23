import { NextRequest, NextResponse } from 'next/server';
import { ThreatIntelligenceEngine } from '@/lib/adaptive-security/ThreatIntelligence';

const threatEngine = new ThreatIntelligenceEngine();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get current threat intelligence
    const intelligence = await threatEngine.getThreatIntelligence();
    
    // Filter by category if specified
    const filteredThreats = category === 'all' 
      ? intelligence.patterns 
      : intelligence.patterns.filter(threat => threat.category === category);

    // Apply limit
    const limitedThreats = filteredThreats.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        threats: limitedThreats,
        summary: {
          totalThreats: intelligence.totalThreats,
          activeThreatLevel: intelligence.activeThreatLevel,
          sources: intelligence.sources.length
        },
        lastUpdated: intelligence.lastUpdate,
        totalThreats: intelligence.patterns.length,
        filteredCount: limitedThreats.length
      }
    });
  } catch (error) {
    console.error('Threat intelligence API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch threat intelligence' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sources } = body;

    if (action === 'scan') {
      // Trigger manual threat intelligence scan
      const results = await threatEngine.scanThreatSources();
      
      return NextResponse.json({
        success: true,
        data: {
          scanResults: results,
          timestamp: new Date().toISOString()
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Threat intelligence scan error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to scan threat sources' },
      { status: 500 }
    );
  }
}