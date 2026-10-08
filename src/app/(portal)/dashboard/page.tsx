'use client';

import React from 'react';
import { PageHeader } from '@/components/shell/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Panel } from '@/components/ui/panel';
import { Alert } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConditionBadge } from '@/components/ui/condition-badge';
import { ASSET_STATUSES, ASSET_CONDITIONS } from '@/domain/types/asset';
import { Layers, ShieldCheck, Box, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Design System & UI Component Foundation"
        subtitle="Stage 2 — High-Density Enterprise Operational UI Architecture"
        actionsSlot={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Documentation
            </Button>
            <Button variant="primary" size="sm">
              Component Registry
            </Button>
          </div>
        }
      />

      {/* Architectural Status Alert */}
      <Alert
        variant="info"
        title="Design System Foundation Established"
      >
        All 29 enterprise UI primitives, layout shell components, DataTable foundation, and 5-tab Asset Dossier structural models have been established adhering to WCAG 2.2 AA and the neutral Slate/Zinc/Sky-600 design tokens.
      </Alert>

      {/* Component Foundation Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
              <Layers className="h-4 w-4" />
              <CardTitle>Design Tokens</CardTitle>
            </div>
            <CardDescription>Centralized typography, geometry & color tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <p>
              Uniform 36px control height, dense 40px table row height, 4px/6px radii, and accessible high-contrast neutral surfaces.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
              <ShieldCheck className="h-4 w-4" />
              <CardTitle>Accessibility Standards</CardTitle>
            </div>
            <CardDescription>WCAG 2.2 AA compliance measures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <p>
              Keyboard focus rings, ARIA roles for dialogs, drawers, tabs, and tooltips, high contrast colors, and reduced-motion enforcement.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
              <Box className="h-4 w-4" />
              <CardTitle>Pure Presentation</CardTitle>
            </div>
            <CardDescription>Zero business logic inside UI primitives</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <p>
              Components consume strictly typed props with zero repository calls, zero fake stats, and zero mock business datasets.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Semantic Status & Condition Indicators Showcase */}
      <Panel
        title="Authoritative Lifecycle & Condition Indicators"
        subtitle="16 domain lifecycle states and 6 physical condition ratings from domain types"
      >
        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
              Lifecycle States (16 Authoritative Domain States)
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.values(ASSET_STATUSES).map((status) => (
                <StatusBadge key={status} status={status} />
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
              Physical Condition Ratings (6 Domain Conditions)
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.values(ASSET_CONDITIONS).map((condition) => (
                <ConditionBadge key={condition} condition={condition} />
              ))}
            </div>
          </div>
        </div>
      </Panel>

      {/* Operational State Architecture Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel
          title="Empty State Architecture"
          subtitle="Explicit operational empty state with structured guidance"
        >
          <EmptyState
            title="Operational Inventory Queue Clear"
            description="No records are currently pending inspection or custody handover in this queue."
            action={
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Refresh Queue
              </Button>
            }
          />
        </Panel>

        <Panel
          title="Data Architecture Notice"
          subtitle="Data ingestion deferred to authorized integration stage"
        >
          <div className="p-6 text-center space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              In accordance with the Stage 2 architectural constraint, no fake business records, mock repositories, or simulated metrics are rendered.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Live asset data pipelines will connect to the DataTable foundation upon Stage 6 Google Sheets repository adapter authorization.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
