import React from 'react';
import { Lock } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

/**
 * Authentication Entry Point Structural Placeholder
 * Route: /login
 *
 * Source of Truth: docs/ARCHITECTURE.md §3, docs/UI_UX_GUIDELINES.md §1
 * INVARIANT: No fake OAuth execution, no mock bypass, zero fake credentials.
 */

export default function LoginPage() {
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

          <Alert
            variant="warning"
            title="Authentication Pending Integration"
          >
            Access requires Google Workspace OAuth. Sign-in controls are disabled pending Stage 4 OAuth integration authorization.
          </Alert>

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

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Authorized Personnel Only • Access boundary enforced
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
