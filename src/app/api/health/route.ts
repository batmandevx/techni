import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Health check endpoint for deployment monitoring
export async function GET() {
  const startTime = Date.now();
  
  // Collect system health information
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    responseTime: 0,
    checks: {
      memory: checkMemory(),
      api: { status: 'ok' },
    },
  };
  
  health.responseTime = Date.now() - startTime;
  
  // Return 503 if any critical check fails
  const isHealthy = health.checks.memory.status !== 'critical';
  
  return NextResponse.json(health, { 
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  });
}

function checkMemory() {
  const used = process.memoryUsage();
  const maxHeap = 512 * 1024 * 1024; // 512MB threshold
  
  const heapUsedPercent = (used.heapUsed / maxHeap) * 100;
  
  return {
    status: heapUsedPercent > 90 ? 'critical' : heapUsedPercent > 70 ? 'warning' : 'ok',
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    external: `${Math.round(used.external / 1024 / 1024)}MB`,
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
  };
}

// HEAD request for simple health checks (load balancers)
export async function HEAD() {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache',
    }
  });
}
