import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Domain imports
import { ASSET_STATUSES, ASSET_CONDITIONS } from '../src/domain/types/asset';

// UI imports
import { Button, IconButton } from '../src/components/ui/button';
import { Input } from '../src/components/ui/input';
import { Textarea } from '../src/components/ui/textarea';
import { Select } from '../src/components/ui/select';
import { Checkbox } from '../src/components/ui/checkbox';
import { Radio } from '../src/components/ui/radio';
import { Switch } from '../src/components/ui/switch';
import { FormField } from '../src/components/ui/form-field';
import { Label } from '../src/components/ui/label';
import { Fieldset } from '../src/components/ui/fieldset';
import { Card, CardHeader, CardTitle, CardContent } from '../src/components/ui/card';
import { Panel } from '../src/components/ui/panel';
import { Badge } from '../src/components/ui/badge';
import { StatusBadge } from '../src/components/ui/status-badge';
import { ConditionBadge } from '../src/components/ui/condition-badge';
import { Alert } from '../src/components/ui/alert';
import { Dialog, DialogFooter } from '../src/components/ui/dialog';
import { Drawer } from '../src/components/ui/drawer';
import { Tabs, TabPanel } from '../src/components/ui/tabs';
import { Breadcrumbs } from '../src/components/ui/breadcrumbs';
import { Pagination } from '../src/components/ui/pagination';
import { DataTable } from '../src/components/ui/data-table';
import { EmptyState } from '../src/components/ui/empty-state';
import { LoadingState } from '../src/components/ui/loading-state';
import { ErrorState } from '../src/components/ui/error-state';
import { ConfirmationDialog } from '../src/components/ui/confirmation-dialog';

describe('Stage 2 — Design System & UI Component Foundation Test Suite', () => {
  describe('1. Button & IconButton Primitives', () => {
    it('renders primary button with accessible focus ring and styling', () => {
      const html = renderToStaticMarkup(
        React.createElement(Button, { variant: 'primary', size: 'md' }, 'Execute Action')
      );
      assert(html.includes('Execute Action'));
      assert(html.includes('bg-sky-600'));
      assert(html.includes('focus-visible:ring-sky-600'));
    });

    it('renders disabled button with disabled attribute and pointer-events-none', () => {
      const html = renderToStaticMarkup(
        React.createElement(Button, { disabled: true }, 'Disabled Action')
      );
      assert(html.includes('disabled=""'));
      assert(html.includes('disabled:cursor-not-allowed'));
    });

    it('renders destructive variant with danger color', () => {
      const html = renderToStaticMarkup(
        React.createElement(Button, { variant: 'destructive' }, 'Decommission')
      );
      assert(html.includes('bg-red-600'));
    });

    it('renders loading spinner inside button when isLoading is true', () => {
      const html = renderToStaticMarkup(
        React.createElement(Button, { isLoading: true }, 'Saving')
      );
      assert(html.includes('animate-spin'));
    });

    it('renders IconButton with required aria-label attribute', () => {
      const html = renderToStaticMarkup(
        React.createElement(IconButton, { 'aria-label': 'Refresh Data' }, 'X')
      );
      assert(html.includes('aria-label="Refresh Data"'));
    });
  });

  describe('2. Form System Controls & Validation', () => {
    it('renders Input with error border when isError is true', () => {
      const html = renderToStaticMarkup(
        React.createElement(Input, { isError: true, placeholder: 'Enter value' })
      );
      assert(html.includes('border-red-500'));
    });

    it('renders Label with red asterisk indicator when isRequired is true', () => {
      const html = renderToStaticMarkup(
        React.createElement(Label, { isRequired: true }, 'Equipment Tag')
      );
      assert(html.includes('Equipment Tag'));
      assert(html.includes('*'));
      assert(html.includes('text-red-600'));
    });

    it('renders FormField with accessible alert role on error message', () => {
      const html = renderToStaticMarkup(
        React.createElement(
          FormField,
          {
            id: 'tag-input',
            label: 'Tag',
            isRequired: true,
            error: 'Tag is mandatory',
          },
          React.createElement(Input, { id: 'tag-input' })
        )
      );
      assert(html.includes('role="alert"'));
      assert(html.includes('Tag is mandatory'));
    });

    it('renders Select with accessible options and chevron', () => {
      const options = [
        { value: 'opt1', label: 'Option 1' },
        { value: 'opt2', label: 'Option 2' },
      ];
      const html = renderToStaticMarkup(
        React.createElement(Select, { options })
      );
      assert(html.includes('value="opt1"'));
      assert(html.includes('Option 1'));
      assert(html.includes('value="opt2"'));
      assert(html.includes('Option 2'));
    });

    it('renders Checkbox with accessible label and disabled state', () => {
      const html = renderToStaticMarkup(
        React.createElement(Checkbox, {
          id: 'test-chk',
          label: 'Include Archived',
          disabled: true,
        })
      );
      assert(html.includes('type="checkbox"'));
      assert(html.includes('Include Archived'));
      assert(html.includes('disabled=""'));
    });

    it('renders Radio with label and description', () => {
      const html = renderToStaticMarkup(
        React.createElement(Radio, {
          id: 'opt-a',
          label: 'Standard Warranty',
          description: '12 months coverage',
        })
      );
      assert(html.includes('type="radio"'));
      assert(html.includes('Standard Warranty'));
      assert(html.includes('12 months coverage'));
    });

    it('renders Switch with role switch and aria-checked attribute', () => {
      const html = renderToStaticMarkup(
        React.createElement(Switch, {
          checked: true,
          label: 'Dark Mode',
        })
      );
      assert(html.includes('role="switch"'));
      assert(html.includes('aria-checked="true"'));
      assert(html.includes('Dark Mode'));
    });

    it('renders Fieldset with structured legend and section border', () => {
      const html = renderToStaticMarkup(
        React.createElement(
          Fieldset,
          { legend: 'Section 1: Hardware Specs', description: 'Technical attributes' },
          React.createElement('div', null, 'Field content')
        )
      );
      assert(html.includes('Section 1: Hardware Specs'));
      assert(html.includes('Technical attributes'));
    });
  });

  describe('3. Semantic Status & Condition Badges', () => {
    it('maps all 16 domain AssetStatus states without exception', () => {
      const statuses = Object.values(ASSET_STATUSES);
      assert.equal(statuses.length, 16);

      for (const status of statuses) {
        const html = renderToStaticMarkup(
          React.createElement(StatusBadge, { status })
        );
        assert(html.length > 0, `StatusBadge failed for status ${status}`);
        assert(html.includes('rounded'), `StatusBadge missing badge class for ${status}`);
      }
    });

    it('maps AVAILABLE status to green/emerald semantic styling', () => {
      const html = renderToStaticMarkup(
        React.createElement(StatusBadge, { status: ASSET_STATUSES.AVAILABLE })
      );
      assert(html.includes('Available'));
      assert(html.includes('bg-emerald-50'));
    });

    it('maps IN_MAINTENANCE status to orange semantic styling', () => {
      const html = renderToStaticMarkup(
        React.createElement(StatusBadge, { status: ASSET_STATUSES.IN_MAINTENANCE })
      );
      assert(html.includes('In Maintenance'));
      assert(html.includes('bg-orange-50'));
    });

    it('maps DAMAGED and LOST statuses to red/rose semantic styling', () => {
      const damagedHtml = renderToStaticMarkup(
        React.createElement(StatusBadge, { status: ASSET_STATUSES.DAMAGED })
      );
      assert(damagedHtml.includes('Damaged'));
      assert(damagedHtml.includes('bg-red-50'));

      const lostHtml = renderToStaticMarkup(
        React.createElement(StatusBadge, { status: ASSET_STATUSES.LOST })
      );
      assert(lostHtml.includes('Lost'));
      assert(lostHtml.includes('bg-rose-50'));
    });

    it('maps all 6 domain AssetCondition ratings without exception', () => {
      const conditions = Object.values(ASSET_CONDITIONS);
      assert.equal(conditions.length, 6);

      for (const cond of conditions) {
        const html = renderToStaticMarkup(
          React.createElement(ConditionBadge, { condition: cond })
        );
        assert(html.length > 0, `ConditionBadge failed for condition ${cond}`);
      }
    });
  });

  describe('4. Feedback & Alert Components', () => {
    it('renders Alert with correct role="alert" for danger and warning variants', () => {
      const dangerHtml = renderToStaticMarkup(
        React.createElement(Alert, { variant: 'danger', title: 'Fatal Error' }, 'Action rejected')
      );
      assert(dangerHtml.includes('role="alert"'));
      assert(dangerHtml.includes('Fatal Error'));
      assert(dangerHtml.includes('Action rejected'));

      const warningHtml = renderToStaticMarkup(
        React.createElement(Alert, { variant: 'warning', title: 'Warning' }, 'Quota near limit')
      );
      assert(warningHtml.includes('role="alert"'));
    });

    it('renders Alert with role="status" for info and success variants', () => {
      const infoHtml = renderToStaticMarkup(
        React.createElement(Alert, { variant: 'info', title: 'Notice' }, 'Informational message')
      );
      assert(infoHtml.includes('role="status"'));

      const successHtml = renderToStaticMarkup(
        React.createElement(Alert, { variant: 'success', title: 'Success' }, 'Saved successfully')
      );
      assert(successHtml.includes('role="status"'));
    });
  });

  describe('5. Overlays, Dialogs & Drawers', () => {
    it('renders Dialog with role="dialog" and aria-modal="true" when isOpen is true', () => {
      const html = renderToStaticMarkup(
        React.createElement(
          Dialog,
          {
            isOpen: true,
            onClose: () => {},
            title: 'Decommission Asset',
            description: 'Action is irreversible',
          },
          React.createElement('div', null, 'Dialog Body Content')
        )
      );
      assert(html.includes('role="dialog"'));
      assert(html.includes('aria-modal="true"'));
      assert(html.includes('Decommission Asset'));
      assert(html.includes('Action is irreversible'));
    });

    it('renders nothing when Dialog isOpen is false', () => {
      const html = renderToStaticMarkup(
        React.createElement(
          Dialog,
          { isOpen: false, onClose: () => {}, title: 'Hidden Modal' },
          'Hidden'
        )
      );
      assert.equal(html, '');
    });

    it('renders ConfirmationDialog with danger confirm button and match prompt', () => {
      const html = renderToStaticMarkup(
        React.createElement(ConfirmationDialog, {
          isOpen: true,
          onClose: () => {},
          onConfirm: () => {},
          title: 'Confirm Delete',
          message: 'All associated data will be archived.',
          requireMatchString: 'AST-000109',
        })
      );
      assert(html.includes('Confirm Delete'));
      assert(html.includes('AST-000109'));
      assert(html.includes('bg-red-600'));
    });

    it('renders Drawer with role="dialog" and aria-modal="true" when isOpen is true', () => {
      const html = renderToStaticMarkup(
        React.createElement(
          Drawer,
          {
            isOpen: true,
            onClose: () => {},
            title: 'Asset Inspection Details',
          },
          React.createElement('div', null, 'Drawer Body')
        )
      );
      assert(html.includes('role="dialog"'));
      assert(html.includes('aria-modal="true"'));
      assert(html.includes('Asset Inspection Details'));
    });
  });

  describe('6. Tabs Navigation Accessibility', () => {
    it('renders Tabs with role="tablist", role="tab", and correct aria-selected', () => {
      const tabs = [
        { id: 'tab1', label: 'Overview' },
        { id: 'tab2', label: 'History', badge: 3 },
      ];
      const html = renderToStaticMarkup(
        React.createElement(Tabs, {
          tabs,
          activeTabId: 'tab1',
          onChange: () => {},
        })
      );
      assert(html.includes('role="tablist"'));
      assert(html.includes('role="tab"'));
      assert(html.includes('aria-selected="true"'));
      assert(html.includes('Overview'));
      assert(html.includes('History'));
      assert(html.includes('3'));
    });

    it('renders TabPanel with role="tabpanel" when matching active tab', () => {
      const html = renderToStaticMarkup(
        React.createElement(
          TabPanel,
          { id: 'tab1', activeTabId: 'tab1' },
          React.createElement('p', null, 'Panel content')
        )
      );
      assert(html.includes('role="tabpanel"'));
      assert(html.includes('Panel content'));
    });

    it('does not render TabPanel when activeTabId does not match', () => {
      const html = renderToStaticMarkup(
        React.createElement(
          TabPanel,
          { id: 'tab1', activeTabId: 'tab2' },
          React.createElement('p', null, 'Panel content')
        )
      );
      assert.equal(html, '');
    });
  });

  describe('7. DataTable Foundation & States', () => {
    interface TestItem {
      id: string;
      code: string;
      title: string;
    }

    const testColumns = [
      { id: 'code', header: 'Code', accessorKey: 'code' as const, sortable: true },
      { id: 'title', header: 'Title', accessorKey: 'title' as const },
    ];

    it('renders empty state when data array is empty', () => {
      const html = renderToStaticMarkup(
        React.createElement(DataTable<TestItem>, {
          columns: testColumns,
          data: [],
          keyExtractor: (item) => item.id,
          emptyTitle: 'No items found',
          emptyDescription: 'The catalog is currently empty.',
        })
      );
      assert(html.includes('No items found'));
      assert(html.includes('The catalog is currently empty.'));
    });

    it('renders loading skeleton rows when isLoading is true', () => {
      const html = renderToStaticMarkup(
        React.createElement(DataTable<TestItem>, {
          columns: testColumns,
          data: [],
          keyExtractor: (item) => item.id,
          isLoading: true,
        })
      );
      assert(html.includes('animate-pulse'));
    });

    it('renders dense table rows with data and sort headers', () => {
      const sampleData: TestItem[] = [
        { id: '1', code: 'T-001', title: 'Monitor 27in' },
        { id: '2', code: 'T-002', title: 'Keyboard USB' },
      ];

      const html = renderToStaticMarkup(
        React.createElement(DataTable<TestItem>, {
          columns: testColumns,
          data: sampleData,
          keyExtractor: (item) => item.id,
          sortColumn: 'code',
          sortDirection: 'asc',
        })
      );

      assert(html.includes('T-001'));
      assert(html.includes('Monitor 27in'));
      assert(html.includes('T-002'));
      assert(html.includes('Keyboard USB'));
      assert(html.includes('h-10')); // 40px dense row height
    });

    it('renders selection checkboxes when isSelectable is true', () => {
      const sampleData: TestItem[] = [
        { id: '1', code: 'T-001', title: 'Sample' },
      ];

      const html = renderToStaticMarkup(
        React.createElement(DataTable<TestItem>, {
          columns: testColumns,
          data: sampleData,
          keyExtractor: (item) => item.id,
          isSelectable: true,
          selectedIds: ['1'],
        })
      );

      assert(html.includes('type="checkbox"'));
      assert(html.includes('aria-label="Select all rows"'));
    });
  });

  describe('8. Breadcrumbs & Pagination', () => {
    it('renders Breadcrumbs with semantic nav and chevron separators', () => {
      const items = [
        { label: 'Portal' },
        { label: 'Inventory' },
        { label: 'Detail' },
      ];
      const html = renderToStaticMarkup(
        React.createElement(Breadcrumbs, { items })
      );
      assert(html.includes('aria-label="Breadcrumb"'));
      assert(html.includes('Portal'));
      assert(html.includes('Inventory'));
      assert(html.includes('aria-current="page"'));
      assert(html.includes('Detail'));
    });

    it('renders Pagination with current range, total count, and prev/next buttons', () => {
      const html = renderToStaticMarkup(
        React.createElement(Pagination, {
          currentPage: 2,
          totalPages: 5,
          pageSize: 25,
          totalItems: 120,
          onPageChange: () => {},
        })
      );
      assert(html.includes('Showing'));
      assert(html.includes('26'));
      assert(html.includes('50'));
      assert(html.includes('120'));
      assert(html.includes('Page 2 of 5'));
    });
  });

  describe('9. Operational State Primitives', () => {
    it('renders EmptyState with icon, title, description, and action button', () => {
      const html = renderToStaticMarkup(
        React.createElement(EmptyState, {
          title: 'No assets registered',
          description: 'Register the first item to initialize.',
          action: React.createElement(Button, null, 'Register Asset'),
        })
      );
      assert(html.includes('No assets registered'));
      assert(html.includes('Register the first item to initialize.'));
      assert(html.includes('Register Asset'));
    });

    it('renders ErrorState with alert role, message, and retry button', () => {
      const html = renderToStaticMarkup(
        React.createElement(ErrorState, {
          title: 'Network Timeout',
          message: 'Unable to contact server.',
          onRetry: () => {},
        })
      );
      assert(html.includes('role="alert"'));
      assert(html.includes('Network Timeout'));
      assert(html.includes('Retry'));
    });

    it('renders LoadingState with tabular skeleton rows', () => {
      const html = renderToStaticMarkup(
        React.createElement(LoadingState, { rows: 4, type: 'table' })
      );
      assert(html.includes('role="status"'));
      assert(html.includes('animate-pulse'));
    });
  });
});
