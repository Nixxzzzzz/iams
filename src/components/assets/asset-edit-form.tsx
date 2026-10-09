'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Asset, ASSET_CONDITIONS } from '@/domain/types/asset';
import { getAllowedNextStates } from '@/domain/lifecycle/state-machine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { Fieldset } from '@/components/ui/fieldset';
import { Alert } from '@/components/ui/alert';
import { updateAssetAction } from '@/app/actions/asset-actions';
import { UpdateAssetDTO } from '@/validation/asset.schema';
import { ArrowLeft, Save, Lock } from 'lucide-react';

interface AssetEditFormProps {
  asset: Asset;
}

export function AssetEditForm({ asset }: AssetEditFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Editable form state initialized from existing asset
  const [formData, setFormData] = useState({
    name: asset.name,
    subcategory: asset.subcategory ?? '',
    brand: asset.brand,
    model: asset.model ?? '',
    serial_number: asset.serial_number ?? '',
    status: asset.status,
    condition: asset.condition,
    custody_type: asset.custody_type,
    location_id: asset.location_id ?? '',
    department_id: asset.department_id ?? '',
    current_user_id: asset.current_user_id ?? '',
    purchase_date: asset.purchase_date ?? '',
    purchase_cost: asset.purchase_cost != null ? String(asset.purchase_cost) : '',
    useful_life_months: asset.useful_life_months != null ? String(asset.useful_life_months) : '',
    current_value: asset.current_value != null ? String(asset.current_value) : '',
    vendor_id: asset.vendor_id ?? '',
    invoice_reference: asset.invoice_reference ?? '',
    warranty_start: asset.warranty_start ?? '',
    warranty_expiry: asset.warranty_expiry ?? '',
    description: asset.description ?? '',
  });

  const allowedNextStatuses = [
    asset.status, // Current status is always a valid choice (no change)
    ...getAllowedNextStates(asset.status),
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload: UpdateAssetDTO = {
      name: formData.name.trim(),
      subcategory: formData.subcategory.trim() || null,
      brand: formData.brand.trim(),
      model: formData.model.trim() || null,
      serial_number: formData.serial_number.trim() || null,
      status: formData.status,
      condition: formData.condition,
      custody_type: formData.custody_type,
      location_id: formData.location_id.trim() || null,
      department_id: formData.department_id.trim() || null,
      current_user_id: formData.current_user_id.trim() || null,
      purchase_date: formData.purchase_date || null,
      purchase_cost: formData.purchase_cost ? Number(formData.purchase_cost) : null,
      useful_life_months: formData.useful_life_months ? Number(formData.useful_life_months) : null,
      current_value: formData.current_value ? Number(formData.current_value) : null,
      vendor_id: formData.vendor_id.trim() || null,
      invoice_reference: formData.invoice_reference.trim() || null,
      warranty_start: formData.warranty_start || null,
      warranty_expiry: formData.warranty_expiry || null,
      description: formData.description.trim() || null,
    };

    startTransition(async () => {
      try {
        await updateAssetAction(asset.asset_id, payload);
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
          throw err;
        }
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to update asset. Please check fields.'
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {errorMessage && (
        <Alert variant="danger" title="Update Error">
          {errorMessage}
        </Alert>
      )}

      {/* Immutable Identifiers Banner */}
      <div className="p-4 bg-slate-50 dark:bg-gray-800/60 rounded border border-slate-200 dark:border-gray-700 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Lock className="h-4 w-4 text-slate-400" />
          <span>
            Immutable Key: <strong className="font-mono">{asset.asset_id}</strong> | Barcode Tag: <strong className="font-mono">{asset.asset_tag}</strong>
          </span>
        </div>
        <span className="text-slate-500 font-mono">
          Created: {new Date(asset.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* 1. Identification */}
      <Fieldset
        legend="1. Core Equipment Details"
        description="Update description, model, and serial number."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Asset Name" isRequired>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="Subcategory">
            <Input
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Manufacturer / Brand" isRequired>
            <Input
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="Model / Chassis">
            <Input
              name="model"
              value={formData.model}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Hardware Serial Number">
            <Input
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
            />
          </FormField>
        </div>
      </Fieldset>

      {/* 2. Lifecycle & Condition */}
      <Fieldset
        legend="2. Lifecycle State & Condition"
        description="Lifecycle state transitions are validated against the state machine."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Operational Status" isRequired>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={allowedNextStatuses.map((st) => ({
                value: st,
                label: st.replace(/_/g, ' '),
              }))}
            />
          </FormField>

          <FormField label="Physical Condition" isRequired>
            <Select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              options={Object.values(ASSET_CONDITIONS).map((cond) => ({
                value: cond,
                label: cond,
              }))}
            />
          </FormField>
        </div>
      </Fieldset>

      {/* 3. Location & Financial */}
      <Fieldset
        legend="3. Location & Financial Adjustments"
        description="Placement coordinates and book value assessment."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Location ID">
            <Input
              name="location_id"
              value={formData.location_id}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Department ID">
            <Input
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Estimated Current Value">
            <Input
              type="number"
              step="0.01"
              name="current_value"
              value={formData.current_value}
              onChange={handleChange}
            />
          </FormField>
        </div>
      </Fieldset>

      {/* 4. Notes */}
      <Fieldset legend="4. Notes" description="Operational change comments.">
        <FormField label="Notes / Comments">
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </Fieldset>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-gray-800">
        <Link href={`/assets/${asset.asset_id}`}>
          <Button variant="ghost" type="button" disabled={isPending}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Cancel
          </Button>
        </Link>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </form>
  );
}
