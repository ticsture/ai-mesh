import { NextRequest, NextResponse } from 'next/server';
import { WatchtowerMesh } from '@/lib/adaptive-security/WatchtowerMesh';

const watchtower = new WatchtowerMesh();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType, config } = body;

    let testResult;

    switch (testType) {
      case 'comprehensive':
        testResult = await watchtower.runAdaptiveSecurityTest();
        break;
      case 'redteam':
        testResult = await watchtower.executeSecurityTests({
          includeRedTeam: true,
          includeGuardian: true,
          includeMitigation: false
        });
        break;
      case 'policy':
        testResult = await watchtower.executeSecurityTests({
          includeRedTeam: false,
          includeGuardian: true,
          includeMitigation: false
        });
        break;
      case 'guardian':
        testResult = await watchtower.executeSecurityTests({
          includeRedTeam: false,
          includeGuardian: true,
          includeMitigation: true
        });
        break;
      case 'adaptation':
        testResult = await watchtower.runAdaptiveSecurityTest();
        // Trigger adaptation process
        await watchtower.adaptDefensesFromResults(testResult);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid test type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        testId: `test_${Date.now()}`,
        testType,
        startTime: new Date().toISOString(),
        results: testResult,
        status: 'completed'
      }
    });
  } catch (error) {
    console.error('Security test API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run security test' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return test history or status
    const testHistory = {
      recentTests: [
        {
          id: 'test_1732273200000',
          testType: 'comprehensive',
          status: 'completed',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          duration: 847,
          threats: 156,
          blocked: 152,
          adapted: 23,
          result: 'passed'
        },
        {
          id: 'test_1732270800000',
          testType: 'redteam',
          status: 'completed', 
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          duration: 432,
          threats: 89,
          blocked: 85,
          adapted: 12,
          result: 'failed'
        }
      ],
      statistics: {
        totalTests: 247,
        passRate: 87.4,
        avgDuration: 542,
        lastRun: new Date().toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      data: testHistory
    });
  } catch (error) {
    console.error('Security test history API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test history' },
      { status: 500 }
    );
  }
}