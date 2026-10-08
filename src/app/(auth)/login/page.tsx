import React from 'react';
import { Lock } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getAuthConfigStatus } from '@/config/env';

/**
 * Authentication Entry Point Structural Boundary
 * Route: /login
 *
 * Source of Truth: docs/ARCHITECTURE.md §3, docs/PROJECT_RULES.md §2.6
 * INVARIANT: Fail-closed when ALLOWED_EMAIL_DOMAINS is NOT_CONFIGURED.
 * Zero demo accounts, zero bypass cookies, zero fake credentials.
 */

export default function LoginPage() {
  const authStatus = getAuthConfigStatus();
  const isPolicyConfigured = authStatus === 'CONFIGURED';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 px-4 py-12">
      <Card className="w-full max-w-md shadow-sm">
        <CardContent className="p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-md bg-slate-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {siteConfig.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {siteConfig.organization.name}
            </p>
          </div>

          {!isPolicyConfigured ? (
            <Alert
              variant="warning"
              title="Authentication Policy: Unconfigured (Fail-Closed)"
            >
              Sign-in is currently unavailable because the organization security policy is not configured (ALLOWED_EMAIL_DOMAINS = NOT_CONFIGURED). In accordance with institutional security rules, access fails closed until an administrator configures allowed domains.
            </Alert>
          ) : (
            <Alert
              variant="info"
              title="Identity Provider Connection Pending"
            >
              Domain access policy is active. Google OAuth integration will be authorized in a subsequent technical stage.
            </Alert>
          )}

          <div>
            <Button
              variant="outline"
              size="lg"
              disabled
              className="w-full text-slate-400 dark:text-slate-500 cursor-not-allowed"
            >
              Google Workspace Sign-In (Pending Authorization)
            </Button>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-1">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Authorized Personnel Only
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Zero development bypass active • All connection attempts are verified server-side
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
