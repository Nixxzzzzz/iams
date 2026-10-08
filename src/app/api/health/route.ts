import { NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';
import { getAuthConfigStatus } from '@/config/env';

/**
 * Health Check API Endpoint
 * GET /api/health
 *
 * Source of Truth: docs/ARCHITECTURE.md §6
 * INVARIANT: Operates independently of Google Sheets; exposes NO secrets or private paths.
 */

export async function GET() {
  const authStatus = getAuthConfigStatus();

  const healthData = {
    status: 'healthy',
    application: siteConfig.name,
    version: siteConfig.version,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
    auth_policy_status: authStatus,
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
