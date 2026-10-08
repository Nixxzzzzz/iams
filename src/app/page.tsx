"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Wrench,
  Boxes,
  ArrowUpDown,
  ExternalLink,
  RotateCcw,
  X,
  History,
} from "lucide-react";
import { Asset, Transaction } from "@/domain/models";
import { AssetStatus, AssetCondition } from "@/domain/enums";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConditionBadge } from "@/components/ui/condition-badge";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export default function AssetInventoryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<Transaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  // Fetch asset data from internal API
  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/assets");
      const json = await res.json();
      if (json.success && json.data) {
        setAssets(json.data.items);
      }
    } catch (err) {
      console.error("Failed to fetch assets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Fetch single asset details and audit ledger on row selection
  const handleSelectAsset = async (asset: Asset) => {
    setSelectedAsset(asset);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/assets/${asset.asset_id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedHistory(json.data.history || []);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Filter computation
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      search === "" ||
      asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.asset_tag.toLowerCase().includes(search.toLowerCase()) ||
      asset.serial_number.toLowerCase().includes(search.toLowerCase()) ||
      asset.brand.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || asset.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Summary Metrics
  const totalCount = assets.length;
  const availableCount = assets.filter(
    (a) => a.status === AssetStatus.AVAILABLE
  ).length;
  const inUseCount = assets.filter(
    (a) =>
      a.status === AssetStatus.IN_USE ||
      a.status === AssetStatus.ASSIGNED ||
      a.status === AssetStatus.CHECKED_OUT
  ).length;
  const maintenanceCount = assets.filter(
    (a) => a.status === AssetStatus.IN_MAINTENANCE
  ).length;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Asset Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational registry of physical equipment, hardware tags, and custody states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-900 text-white dark:bg-sky-600 dark:hover:bg-sky-500 hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* Operational Summary Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Total Cataloged
            </div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white mt-0.5 font-mono-num">
              {totalCount}
            </div>
          </div>
          <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Boxes className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Available Stock
            </div>
            <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5 font-mono-num">
              {availableCount}
            </div>
          </div>
          <div className="w-8 h-8 rounded bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              In Custody / Deployed
            </div>
            <div className="text-lg font-semibold text-blue-700 dark:text-blue-400 mt-0.5 font-mono-num">
              {inUseCount}
            </div>
          </div>
          <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              In Maintenance
            </div>
            <div className="text-lg font-semibold text-amber-700 dark:text-amber-400 mt-0.5 font-mono-num">
              {maintenanceCount}
            </div>
          </div>
          <div className="w-8 h-8 rounded bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Wrench className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name, asset tag, brand, or serial..."
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 w-full sm:w-72"
          />

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Statuses</option>
              <option value={AssetStatus.AVAILABLE}>Available</option>
              <option value={AssetStatus.IN_USE}>In Use</option>
              <option value={AssetStatus.ASSIGNED}>Assigned</option>
              <option value={AssetStatus.CHECKED_OUT}>Checked Out</option>
              <option value={AssetStatus.IN_MAINTENANCE}>In Maintenance</option>
              <option value={AssetStatus.DAMAGED}>Damaged</option>
              <option value={AssetStatus.RETIRED}>Retired</option>
            </select>
          </div>

          {(search !== "" || statusFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredAssets.length}</span> of {totalCount} items
        </div>
      </div>

      {/* Master Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th scope="col" className="py-2.5 px-3.5">
                  <div className="flex items-center gap-1">
                    <span>Asset Tag</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th scope="col" className="py-2.5 px-3.5">Name & Hardware</th>
                <th scope="col" className="py-2.5 px-3.5">Serial Number</th>
                <th scope="col" className="py-2.5 px-3.5">Status</th>
                <th scope="col" className="py-2.5 px-3.5">Condition</th>
                <th scope="col" className="py-2.5 px-3.5">Location</th>
                <th scope="col" className="py-2.5 px-3.5 text-right">Cost</th>
                <th scope="col" className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading asset inventory...
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No matching assets found. Adjust search or filters.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr
                    key={asset.asset_id}
                    onClick={() => handleSelectAsset(asset)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3.5 font-mono text-slate-900 dark:text-slate-100 font-medium">
                      {asset.asset_tag}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {asset.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {asset.brand} {asset.model ? `• ${asset.model}` : ""}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {asset.serial_number}
                    </td>
                    <td className="py-3 px-3.5">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="py-3 px-3.5">
                      <ConditionBadge condition={asset.condition} />
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 dark:text-slate-300">
                      {asset.location_id}
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono-num text-slate-700 dark:text-slate-300">
                      {formatCurrency(asset.purchase_cost)}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAsset(asset);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-800 dark:text-sky-400 font-medium"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Detail & Historical Ledger Slide-Over Pane */}
      {selectedAsset && (
        <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                  {selectedAsset.asset_tag}
                </span>
                <StatusBadge status={selectedAsset.status} />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedAsset.name}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedAsset(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Basic Spec Panel */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Hardware Specifications
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-md border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-slate-500 block">Brand:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {selectedAsset.brand}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Model:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {selectedAsset.model || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Serial Number:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {selectedAsset.serial_number}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Physical Condition:</span>
                  <ConditionBadge condition={selectedAsset.condition} className="mt-0.5" />
                </div>
              </div>
            </div>

            {/* Financial & Procurement */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Financial & Procurement
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-md border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-slate-500 block">Purchase Date:</span>
                  <span className="text-slate-900 dark:text-white">
                    {formatDate(selectedAsset.purchase_date)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Purchase Cost:</span>
                  <span className="font-medium text-slate-900 dark:text-white font-mono-num">
                    {formatCurrency(selectedAsset.purchase_cost)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Invoice Reference:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {selectedAsset.invoice_reference || "-"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Warranty Expiry:</span>
                  <span className="text-slate-900 dark:text-white">
                    {formatDate(selectedAsset.warranty_expiry)}
                  </span>
                </div>
              </div>
            </div>

            {/* Custody History & Transaction Ledger */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Custody History & Audit Ledger
                </h3>
              </div>

              {historyLoading ? (
                <div className="text-xs text-slate-400 text-center py-4">
                  Loading ledger events...
                </div>
              ) : selectedHistory.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-800/30 rounded border border-dashed border-slate-200 dark:border-slate-800">
                  No historical transitions logged for this item yet.
                </div>
              ) : (
                <div className="relative border-l border-slate-200 dark:border-slate-800 ml-2 space-y-4 py-1">
                  {selectedHistory.map((txn) => (
                    <div key={txn.transaction_id} className="relative pl-4 text-xs">
                      <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-sky-500 ring-4 ring-white dark:ring-slate-900" />
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {txn.transaction_type}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {formatDateTime(txn.timestamp)} • Action by {txn.action_by_user_id}
                      </div>
                      {txn.notes && (
                        <div className="text-slate-600 dark:text-slate-300 mt-1 bg-slate-100/60 dark:bg-slate-800/60 p-2 rounded text-[11px]">
                          {txn.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              ID: {selectedAsset.asset_id}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
              >
                Print QR Tag
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium rounded bg-slate-900 text-white dark:bg-sky-600 hover:bg-slate-800"
              >
                Modify Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
