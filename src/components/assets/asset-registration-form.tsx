'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { Fieldset } from '@/components/ui/fieldset';
import { Alert } from '@/components/ui/alert';
import { ASSET_STATUSES, ASSET_CONDITIONS, CUSTODY_TYPES, AssetStatus, AssetCondition, CustodyType } from '@/domain/types/asset';
import { DEFAULT_CURRENCY, DEFAULT_CURRENCY_SYMBOL } from '@/config/constants';
import { createAssetAction } from '@/app/actions/asset-actions';
import { CreateAssetDTO } from '@/validation/asset.schema';
import { ArrowLeft, PackagePlus } from 'lucide-react';

interface FormState {
  asset_tag: string;
  name: string;
  category_id: string;
  subcategory: string;
  brand: string;
  model: string;
  serial_number: string;
  status: AssetStatus;
  condition: AssetCondition;
  custody_type: CustodyType;
  department_id: string;
  location_id: string;
  current_user_id: string;
  purchase_date: string;
  purchase_cost: string;
  useful_life_months: string;
  currency: string;
  vendor_id: string;
  invoice_reference: string;
  warranty_start: string;
  warranty_expiry: string;
  description: string;
  custom_cpu: string;
  custom_ram: string;
  custom_storage: string;
}

export function AssetRegistrationForm() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<FormState>({
    // Identification
    asset_tag: '',
    name: '',
    category_id: 'CAT-000001',
    subcategory: '',
    brand: '',
    model: '',
    serial_number: '',
    // Status
    status: ASSET_STATUSES.ACQUIRED,
    condition: ASSET_CONDITIONS.NEW,
    // Custody & Location
    custody_type: CUSTODY_TYPES.NONE,
    department_id: '',
    location_id: 'LOC-000001',
    current_user_id: '',
    // Financial
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_cost: '',
    useful_life_months: '36',
    currency: DEFAULT_CURRENCY,
    // Warranty & Vendor
    vendor_id: '',
    invoice_reference: '',
    warranty_start: '',
    warranty_expiry: '',
    // Specifications & Notes
    description: '',
    custom_cpu: '',
    custom_ram: '',
    custom_storage: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Build custom_fields from specifications
    const custom_fields: Record<string, unknown> = {};
    if (formData.custom_cpu.trim()) custom_fields.cpu = formData.custom_cpu.trim();
    if (formData.custom_ram.trim()) custom_fields.ram_gb = Number(formData.custom_ram);
    if (formData.custom_storage.trim()) custom_fields.storage = formData.custom_storage.trim();

    const payload: CreateAssetDTO = {
      asset_tag: formData.asset_tag.trim(),
      name: formData.name.trim(),
      category_id: formData.category_id.trim(),
      subcategory: formData.subcategory.trim() || null,
      brand: formData.brand.trim(),
      model: formData.model.trim() || null,
      serial_number: formData.serial_number.trim() || null,
      description: formData.description.trim() || null,
      status: formData.status,
      condition: formData.condition,
      custody_type: formData.custody_type,
      location_id: formData.location_id.trim() || null,
      department_id: formData.department_id.trim() || null,
      current_user_id: formData.current_user_id.trim() || null,
      purchase_date: formData.purchase_date || null,
      purchase_cost: formData.purchase_cost ? Number(formData.purchase_cost) : null,
      useful_life_months: formData.useful_life_months ? Number(formData.useful_life_months) : null,
      currency: formData.currency.trim() || DEFAULT_CURRENCY,
      vendor_id: formData.vendor_id.trim() || null,
      invoice_reference: formData.invoice_reference.trim() || null,
      warranty_start: formData.warranty_start || null,
      warranty_expiry: formData.warranty_expiry || null,
      custom_fields: Object.keys(custom_fields).length > 0 ? custom_fields : null,
    };

    startTransition(async () => {
      try {
        await createAssetAction(payload);
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
          // Next.js redirect thrown inside Server Action, allow it to propagate
          throw err;
        }
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to register asset. Please verify input fields.'
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {errorMessage && (
        <Alert variant="danger" title="Registration Error">
          {errorMessage}
        </Alert>
      )}

      {/* 1. IDENTIFICATION */}
      <Fieldset
        legend="1. Identification & Equipment Taxonomy"
        description="Core identity keys, categorization, and physical hardware indicators."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Asset Tag (Physical Barcode / Tag ID)" isRequired>
            <Input
              name="asset_tag"
              value={formData.asset_tag}
              onChange={handleChange}
              placeholder="e.g. TAG-10042"
              required
            />
          </FormField>

          <FormField label="Asset Name / Description Summary" isRequired>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. MacBook Pro 16 M2 Max"
              required
            />
          </FormField>

          <FormField label="Category ID" isRequired>
            <Select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              options={[
                { value: 'CAT-000001', label: 'CAT-000001 (Computing & Laptops)' },
                { value: 'CAT-000002', label: 'CAT-000002 (Displays & Monitors)' },
                { value: 'CAT-000003', label: 'CAT-000003 (Networking & Servers)' },
                { value: 'CAT-000004', label: 'CAT-000004 (AV & Presentation)' },
                { value: 'CAT-000005', label: 'CAT-000005 (Peripherals & Accessories)' },
              ]}
            />
          </FormField>

          <FormField label="Subcategory">
            <Input
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              placeholder="e.g. Workstation Laptop"
            />
          </FormField>

          <FormField label="Manufacturer / Brand" isRequired>
            <Input
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g. Apple, Dell, Lenovo"
              required
            />
          </FormField>

          <FormField label="Model / Chassis Number">
            <Input
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g. A2485 / XPS-15"
            />
          </FormField>

          <FormField label="Serial Number (Hardware S/N)">
            <Input
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              placeholder="e.g. C02G1234MD6R"
            />
          </FormField>
        </div>
      </Fieldset>

      {/* 2. STATUS & CONDITION */}
      <Fieldset
        legend="2. Operational Status & Physical Condition"
        description="Initial lifecycle phase and baseline physical inspection condition."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Initial Status" isRequired>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={Object.values(ASSET_STATUSES).map((status) => ({
                value: status,
                label: status.replace(/_/g, ' '),
              }))}
            />
          </FormField>

          <FormField label="Initial Physical Condition" isRequired>
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

      {/* 3. CUSTODY & LOCATION */}
      <Fieldset
        legend="3. Custody Allocation & Storage Location"
        description="Initial placement and dual-mode custody assignment."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Custody Type" isRequired>
            <Select
              name="custody_type"
              value={formData.custody_type}
              onChange={handleChange}
              options={[
                { value: CUSTODY_TYPES.NONE, label: 'NONE (In Storage)' },
                { value: CUSTODY_TYPES.USER, label: 'USER (Assigned Custodian)' },
                { value: CUSTODY_TYPES.DEPARTMENT, label: 'DEPARTMENT (Shared Asset)' },
              ]}
            />
          </FormField>

          <FormField label="Storage Location ID">
            <Input
              name="location_id"
              value={formData.location_id}
              onChange={handleChange}
              placeholder="e.g. LOC-000001"
            />
          </FormField>

          <FormField label="Owning / Custodial Department ID">
            <Input
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              placeholder="e.g. DEP-000001"
            />
          </FormField>

          {formData.custody_type === CUSTODY_TYPES.USER && (
            <FormField label="Assigned User ID" isRequired>
              <Input
                name="current_user_id"
                value={formData.current_user_id}
                onChange={handleChange}
                placeholder="e.g. USR-000001"
                required
              />
            </FormField>
          )}
        </div>
      </Fieldset>

      {/* 4. FINANCIAL & PROCUREMENT */}
      <Fieldset
        legend="4. Financial & Procurement Terms"
        description="Procurement cost, invoice identifiers, and operational useful life."
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField label="Purchase Date">
            <Input
              type="date"
              name="purchase_date"
              value={formData.purchase_date}
              onChange={handleChange}
            />
          </FormField>

          <FormField label={`Purchase Cost (${DEFAULT_CURRENCY_SYMBOL})`}>
            <Input
              type="number"
              step="0.01"
              min="0"
              name="purchase_cost"
              value={formData.purchase_cost}
              onChange={handleChange}
              placeholder="0.00"
            />
          </FormField>

          <FormField label="Currency (ISO 4217)">
            <Input
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              placeholder={DEFAULT_CURRENCY}
              maxLength={3}
            />
          </FormField>

          <FormField label="Useful Life (Months)">
            <Input
              type="number"
              min="0"
              name="useful_life_months"
              value={formData.useful_life_months}
              onChange={handleChange}
              placeholder="36"
            />
          </FormField>
        </div>
      </Fieldset>

      {/* 5. WARRANTY & VENDOR */}
      <Fieldset
        legend="5. Vendor & Warranty Coverage"
        description="Procurement supplier, invoice reference, and warranty validity period."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Vendor ID">
            <Input
              name="vendor_id"
              value={formData.vendor_id}
              onChange={handleChange}
              placeholder="e.g. VEN-000001"
            />
          </FormField>

          <FormField label="Procurement Invoice Reference">
            <Input
              name="invoice_reference"
              value={formData.invoice_reference}
              onChange={handleChange}
              placeholder="e.g. INV-2024-001"
            />
          </FormField>

          <FormField label="Warranty Start Date">
            <Input
              type="date"
              name="warranty_start"
              value={formData.warranty_start}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Warranty Expiry Date">
            <Input
              type="date"
              name="warranty_expiry"
              value={formData.warranty_expiry}
              onChange={handleChange}
            />
          </FormField>
        </div>
      </Fieldset>

      {/* 6. SPECIFICATIONS & NOTES */}
      <Fieldset
        legend="6. Technical Specifications & Notes"
        description="Hardware attributes and descriptive operational comments."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Processor / CPU">
            <Input
              name="custom_cpu"
              value={formData.custom_cpu}
              onChange={handleChange}
              placeholder="e.g. Apple M2 Max, Intel i7-13700H"
            />
          </FormField>

          <FormField label="RAM (GB)">
            <Input
              type="number"
              name="custom_ram"
              value={formData.custom_ram}
              onChange={handleChange}
              placeholder="e.g. 32"
            />
          </FormField>

          <FormField label="Storage Capacity & Type">
            <Input
              name="custom_storage"
              value={formData.custom_storage}
              onChange={handleChange}
              placeholder="e.g. 1TB NVMe SSD"
            />
          </FormField>
        </div>

        <div className="mt-4">
          <FormField label="Operational Description & Inspection Notes">
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add physical condition observations, included accessories, or operational notes..."
              rows={3}
            />
          </FormField>
        </div>
      </Fieldset>

      {/* Form Submission Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-gray-800">
        <Link href="/assets">
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
          <PackagePlus className="h-4 w-4 mr-2" />
          Complete Registration
        </Button>
      </div>
    </form>
  );
}
