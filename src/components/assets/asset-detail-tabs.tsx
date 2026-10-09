'use client';

import React, { useState } from 'react';
import { Asset } from '@/domain/types/asset';
import { TransactionLedgerEntry } from '@/domain/types/transaction';
import { Tabs, TabPanel, TabItem } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DEFAULT_CURRENCY_SYMBOL } from '@/config/constants';
import {
  FileText,
  UserCheck,
  DollarSign,
  History,
  Info,
  User,
  Building,
  ShieldAlert,
} from 'lucide-react';

interface AssetDetailTabsProps {
  asset: Asset;
  transactions: TransactionLedgerEntry[];
  isViewer: boolean;
}

export function AssetDetailTabs({
  asset,
  transactions,
  isViewer,
}: AssetDetailTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabItems: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview & Specs',
      icon: <FileText className="h-3.5 w-3.5" />,
    },
    {
      id: 'custody',
      label: 'Custody & Location',
      icon: <UserCheck className="h-3.5 w-3.5" />,
    },
    {
      id: 'financial',
      label: 'Financial & Warranty',
      icon: <DollarSign className="h-3.5 w-3.5" />,
    },
    {
      id: 'history',
      label: 'Transaction Ledger',
      icon: <History className="h-3.5 w-3.5" />,
      badge: transactions.length,
    },
    {
      id: 'metadata',
      label: 'System Metadata',
      icon: <Info className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="w-full space-y-4">
      <Tabs
        tabs={tabItems}
        activeTabId={activeTab}
        onChange={(tabId) => setActiveTab(tabId)}
      />

      {/* 1. OVERVIEW & SPECIFICATIONS */}
      <TabPanel id="overview" activeTabId={activeTab}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Hardware Identification</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">System Asset ID</dt>
                  <dd className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {asset.asset_id}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Barcode Tag</dt>
                  <dd className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {asset.asset_tag}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Manufacturer</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">{asset.brand}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Model</dt>
                  <dd className="font-medium text-slate-800 dark:text-slate-200">
                    {asset.model ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Serial Number</dt>
                  <dd className="font-mono text-slate-800 dark:text-slate-200">
                    {asset.serial_number ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Category</dt>
                  <dd className="font-mono text-slate-800 dark:text-slate-200">
                    {asset.category_id} {asset.subcategory && `(${asset.subcategory})`}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Technical Specifications (Custom Fields)</CardTitle>
            </CardHeader>
            <CardContent>
              {asset.custom_fields && Object.keys(asset.custom_fields).length > 0 ? (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  {Object.entries(asset.custom_fields).map(([key, val]) => (
                    <div key={key}>
                      <dt className="text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className="font-medium text-slate-800 dark:text-slate-200">
                        {String(val)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  No custom technical attributes logged for this item.
                </p>
              )}

              {asset.description && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-gray-800">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Notes & Description:
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 whitespace-pre-line">
                    {asset.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabPanel>

      {/* 2. CUSTODY & LOCATION */}
      <TabPanel id="custody" activeTabId={activeTab}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Custody Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Custody Model:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {asset.custody_type}
                </Badge>
              </div>

              {asset.custody_type === 'USER' && (
                <div className="p-3 bg-slate-50 dark:bg-gray-800/60 rounded border border-slate-200 dark:border-gray-700 flex items-center gap-3">
                  <User className="h-5 w-5 text-sky-600" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Assigned Custodian
                    </div>
                    <div className="font-mono text-xs text-slate-600 dark:text-slate-400">
                      User ID: {asset.current_user_id}
                    </div>
                  </div>
                </div>
              )}

              {asset.custody_type === 'DEPARTMENT' && (
                <div className="p-3 bg-slate-50 dark:bg-gray-800/60 rounded border border-slate-200 dark:border-gray-700 flex items-center gap-3">
                  <Building className="h-5 w-5 text-sky-600" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Departmental Custody
                    </div>
                    <div className="font-mono text-xs text-slate-600 dark:text-slate-400">
                      Department ID: {asset.department_id}
                    </div>
                  </div>
                </div>
              )}

              {asset.custody_type === 'NONE' && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Currently resting unassigned in inventory stock storage.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Storage & Physical Location</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Location ID</dt>
                  <dd className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {asset.location_id ?? 'Unassigned'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Owning Department</dt>
                  <dd className="font-mono text-slate-800 dark:text-slate-200">
                    {asset.department_id ?? '—'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </TabPanel>

      {/* 3. FINANCIAL & WARRANTY */}
      <TabPanel id="financial" activeTabId={activeTab}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Procurement & Financial Valuation</CardTitle>
                {isViewer && (
                  <Badge variant="warning" className="text-[10px]">
                    Restricted Field Masking Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isViewer ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <ShieldAlert className="h-4 w-4" />
                    Confidential Financial Records Masked
                  </div>
                  <p>
                    In accordance with the six-role RBAC authorization specification, financial purchase costs, book values, and procurement invoices are stripped for the VIEWER role.
                  </p>
                </div>
              ) : (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">Purchase Date</dt>
                    <dd className="font-medium text-slate-800 dark:text-slate-200">
                      {asset.purchase_date ?? '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">Purchase Cost</dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100">
                      {asset.purchase_cost != null
                        ? `${DEFAULT_CURRENCY_SYMBOL} ${asset.purchase_cost.toLocaleString()}`
                        : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">Estimated Current Value</dt>
                    <dd className="font-semibold text-slate-900 dark:text-slate-100">
                      {asset.current_value != null
                        ? `${DEFAULT_CURRENCY_SYMBOL} ${asset.current_value.toLocaleString()}`
                        : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">Useful Life</dt>
                    <dd className="text-slate-800 dark:text-slate-200">
                      {asset.useful_life_months != null
                        ? `${asset.useful_life_months} Months`
                        : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">Invoice Reference</dt>
                    <dd className="font-mono text-slate-800 dark:text-slate-200">
                      {asset.invoice_reference ?? '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">Currency</dt>
                    <dd className="font-mono text-slate-800 dark:text-slate-200">
                      {asset.currency}
                    </dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Warranty & Vendor Support</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Vendor ID</dt>
                  <dd className="font-mono text-slate-800 dark:text-slate-200">
                    {asset.vendor_id ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Warranty Active?</dt>
                  <dd>
                    {asset.warranty_expiry ? (
                      asset.warranty_expiry >= new Date().toISOString().split('T')[0] ? (
                        <Badge variant="success" className="text-[10px]">
                          Active Warranty
                        </Badge>
                      ) : (
                        <Badge variant="danger" className="text-[10px]">
                          Expired
                        </Badge>
                      )
                    ) : (
                      <span className="text-slate-400">No coverage logged</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Warranty Start</dt>
                  <dd className="text-slate-800 dark:text-slate-200">
                    {asset.warranty_start ?? '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Warranty Expiry</dt>
                  <dd className="font-semibold text-slate-800 dark:text-slate-200">
                    {asset.warranty_expiry ?? '—'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </TabPanel>

      {/* 4. TRANSACTION LEDGER */}
      <TabPanel id="history" activeTabId={activeTab}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <History className="h-4 w-4 text-sky-600" />
                Append-Only Operational Transaction Ledger
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Immutably logged events recorded in the Google Sheets Transactions tab.
              </p>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="p-6 bg-slate-50 dark:bg-gray-800/40 rounded border border-slate-200 dark:border-gray-700 text-center text-xs text-slate-500 dark:text-slate-400">
              No transaction ledger events recorded yet for this asset.
            </div>
          ) : (
            <div className="overflow-x-auto rounded border border-slate-200 dark:border-gray-800">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-gray-800 text-left text-xs">
                <thead className="bg-slate-50 dark:bg-gray-800/80 font-semibold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="px-3 py-2">Transaction ID</th>
                    <th className="px-3 py-2">Event Type</th>
                    <th className="px-3 py-2">Timestamp (UTC)</th>
                    <th className="px-3 py-2">Performed By</th>
                    <th className="px-3 py-2">Operational Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-800/50 bg-white dark:bg-gray-900 font-mono">
                  {transactions.map((tx) => (
                    <tr key={tx.transaction_id} className="hover:bg-slate-50/60 dark:hover:bg-gray-800/40">
                      <td className="px-3 py-2.5 font-semibold text-sky-700 dark:text-sky-300">
                        {tx.transaction_id}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant="secondary" className="text-[10px]">
                          {tx.transaction_type}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 font-sans">
                        {new Date(tx.timestamp).toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300 font-sans">
                        {tx.performed_by}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 font-sans">
                        {tx.notes ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </TabPanel>

      {/* 5. SYSTEM METADATA */}
      <TabPanel id="metadata" activeTabId={activeTab}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Storage Schema & Immutability Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <dt className="text-slate-500 font-sans">Created At</dt>
                <dd className="text-slate-800 dark:text-slate-200">{asset.created_at}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-sans">Last Updated At</dt>
                <dd className="text-slate-800 dark:text-slate-200">{asset.updated_at}</dd>
              </div>
              <div>
                <dt className="text-slate-500 font-sans">Soft Deleted / Archived?</dt>
                <dd className="text-slate-800 dark:text-slate-200">
                  {asset.is_archived ? 'TRUE' : 'FALSE'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 font-sans">Sheet Persistence Tab</dt>
                <dd className="text-slate-800 dark:text-slate-200">Assets (Row Record)</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </TabPanel>
    </div>
  );
}
