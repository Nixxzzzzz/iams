import { ShieldAlert, Lock } from 'lucide-react';
import { siteConfig } from '@/config/site';

/**
 * Authentication Entry Point Placeholder
 * Route: /login
 *
 * Source of Truth: docs/ARCHITECTURE.md §3, docs/UI_UX_GUIDELINES.md §1
 * INVARIANT: No fake OAuth execution, no bypass buttons, no AI gradients.
 */

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">{siteConfig.name}</h1>
          <p className="text-sm text-slate-600">{siteConfig.organization.name}</p>
        </div>

        <div className="border border-amber-200 bg-amber-50 rounded-md p-4 mb-6">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 space-y-1">
              <p className="font-semibold">Authentication Required</p>
              <p>
                Access to this enterprise portal requires authentication through the organization Google Workspace OAuth service.
              </p>
              <p className="text-amber-700 pt-1">
                Stage 1 Baseline: Google OAuth integration point will be activated in the dedicated integration stage following administrative domain configuration.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center py-2.5 px-4 rounded-md text-sm font-medium text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed"
          >
            Google Workspace Sign-In (Pending Stage Authorization)
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Authorized Personnel Only • All access attempts are recorded in the security audit ledger.
          </p>
        </div>
      </div>
    </div>
  );
}
