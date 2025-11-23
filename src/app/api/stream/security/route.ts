import { NextRequest } from 'next/server';
import { securityState } from '@/lib/adaptive-security/SecurityState';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      function send(data: any) {
        if (!closed) {
          try {
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
          } catch (err) {
            closed = true;
          }
        }
      }
      // Initial snapshot
      send({ type: 'init', metrics: securityState.computeMetrics([]), events: securityState.eventLog.slice(-25) });
      const interval = setInterval(() => {
        if (closed) {
          clearInterval(interval);
          return;
        }
        const metrics = securityState.computeMetrics([]);
        const events = securityState.eventLog.slice(-5);
        send({ type: 'update', metrics, events });
      }, 5000);
      const closeTimeout = setTimeout(() => {
        closed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      }, 5 * 60 * 1000); // auto-close after 5 minutes
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
}
