import { NextRequest, NextResponse } from 'next/server';
import { modelTester } from '@/lib/adaptive-security/ModelTester';
import { securityState } from '@/lib/adaptive-security/SecurityState';
import { untrustedModelRegistry } from '@/lib/adaptive-security/UntrustedModelRegistry';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelId } = body;

    if (!modelId) {
      return NextResponse.json(
        { error: 'modelId is required' },
        { status: 400 }
      );
    }

    // Get model info
    const model = untrustedModelRegistry.get(modelId);
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    console.log(`\n🎯 Quick test requested for model: ${model.name}`);

    // Get top threats for testing
    const threats = securityState.threatIntel.getTopThreatsForTesting(5);
    
    if (threats.length === 0) {
      return NextResponse.json(
        { error: 'No threats available yet. Please wait for threat scanning to complete.' },
        { status: 503 }
      );
    }

    console.log(`📊 Using ${threats.length} threats for test`);

    // Run complete test
    const result = await modelTester.runCompleteTest(
      model.id,
      model.name,
      model.endpoint,
      model.apiKey,
      threats
    );

    // Update model with test results
    untrustedModelRegistry.update(model.id, {
      lastProbeAt: new Date(),
      probeCount: (model.probeCount || 0) + 1,
      lastRiskSummary: {
        riskLevel: result.overallRiskLevel,
        highRiskFindings: result.highRiskResponses + result.criticalResponses,
        totalFindings: result.assessments.length
      }
    });

    return NextResponse.json({
      success: true,
      result,
      message: `Test completed in ${(result.testDuration / 1000).toFixed(1)}s`
    });

  } catch (error: any) {
    console.error('❌ Quick test error:', error);
    return NextResponse.json(
      { error: error.message || 'Test failed' },
      { status: 500 }
    );
  }
}
