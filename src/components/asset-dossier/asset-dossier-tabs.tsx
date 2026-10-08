'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { DossierTabKey } from './types';
import { Tabs, TabPanel, TabItem } from '../ui/tabs';
import { FileText, UserCheck, DollarSign, Wrench, Folder } from 'lucide-react';

export interface AssetDossierTabsProps {
  activeTab: DossierTabKey;
  onTabChange: (tab: DossierTabKey) => void;
  overviewContent?: React.ReactNode;
  custodyContent?: React.ReactNode;
  financialContent?: React.ReactNode;
  maintenanceContent?: React.ReactNode;
  documentsContent?: React.ReactNode;
  badges?: {
    custody?: number | string;
    maintenance?: number | string;
    documents?: number | string;
  };
  className?: string;
}

export const AssetDossierTabs: React.FC<AssetDossierTabsProps> = ({
  activeTab,
  onTabChange,
  overviewContent,
  custodyContent,
  financialContent,
  maintenanceContent,
  documentsContent,
  badges,
  className,
}) => {
  const tabsList: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <FileText className="h-3.5 w-3.5" />,
    },
    {
      id: 'custody',
      label: 'Custody & Assignment',
      icon: <UserCheck className="h-3.5 w-3.5" />,
      badge: badges?.custody,
    },
    ...(financialContent !== undefined
      ? [
          {
            id: 'financial',
            label: 'Financial',
            icon: <DollarSign className="h-3.5 w-3.5" />,
          },
        ]
      : []),
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: <Wrench className="h-3.5 w-3.5" />,
      badge: badges?.maintenance,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <Folder className="h-3.5 w-3.5" />,
      badge: badges?.documents,
    },
  ];

  return (
    <div className={cn('w-full space-y-4', className)}>
      <Tabs
        tabs={tabsList}
        activeTabId={activeTab}
        onChange={(tabId) => onTabChange(tabId as DossierTabKey)}
      />

      <div className="mt-4">
        <TabPanel id="overview" activeTabId={activeTab}>
          {overviewContent}
        </TabPanel>

        <TabPanel id="custody" activeTabId={activeTab}>
          {custodyContent}
        </TabPanel>

        {financialContent !== undefined && (
          <TabPanel id="financial" activeTabId={activeTab}>
            {financialContent}
          </TabPanel>
        )}

        <TabPanel id="maintenance" activeTabId={activeTab}>
          {maintenanceContent}
        </TabPanel>

        <TabPanel id="documents" activeTabId={activeTab}>
          {documentsContent}
        </TabPanel>
      </div>
    </div>
  );
};
