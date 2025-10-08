import { NextResponse } from 'next/server';
import { healthCheck } from '@/lib/db';

export async function GET() {
  try {
    const dbHealth = await healthCheck();

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      database: dbHealth,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: { status: 'unhealthy', connected: false },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}