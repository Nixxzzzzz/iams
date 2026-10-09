import React from 'react';
import { Alert } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Database, ShieldAlert, KeyRound, Server } from 'lucide-react';

/**
 * Operational Configuration State Banner
 * Source of Truth: docs/GOOGLE_SHEETS_INTEGRATION.md §1 & §2, docs/PROJECT_RULES.md §2.2
 *
 * Rendered when Google Sheets persistence is not configured.
 * INVARIANT: Zero fake data, zero silent in-memory fallback.
 */

export function ConfigurationRequiredBanner() {
  return (
    <div className="space-y-6">
      <Alert
        variant="warning"
        title="Asset Storage Environment Not Configured"
      >
        The asset persistence layer requires Google Sheets API credentials to store and query inventory. No live spreadsheet connection is currently active.
      </Alert>

      <Card className="border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader>
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Database className="h-5 w-5" />
            <CardTitle>Administrator Configuration Instructions</CardTitle>
          </div>
          <CardDescription>
            To activate asset inventory operations, configure the following server-side environment variables in your environment:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-white dark:bg-gray-900 rounded border border-amber-200 dark:border-amber-900/50 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800 dark:text-slate-200">
                <KeyRound className="h-3.5 w-3.5 text-amber-600" />
                GOOGLE_SPREADSHEET_ID
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The ID extracted from your corporate Google Sheets workbook URL.
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-gray-900 rounded border border-amber-200 dark:border-amber-900/50 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800 dark:text-slate-200">
                <Server className="h-3.5 w-3.5 text-amber-600" />
                GOOGLE_SERVICE_ACCOUNT_EMAIL
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The client email of the dedicated Google Cloud Service Account.
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-gray-900 rounded border border-amber-200 dark:border-amber-900/50 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800 dark:text-slate-200">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                GOOGLE_PRIVATE_KEY
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The RSA private key (PEM/PKCS8 format) with newline formatting preserved.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-400 border-t border-amber-200 dark:border-amber-900/50 pt-3">
            <strong>Security Guarantee:</strong> Credentials are never bundled to client browsers and must never be exposed via <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded">NEXT_PUBLIC_</code> variables.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
