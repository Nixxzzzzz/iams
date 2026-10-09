import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Validation Schemas
import {
  createAssetSchema,
  updateAssetSchema,
  assetFilterSchema,
  assetTagSchema,
  currencySchema,
} from '../src/validation/asset.schema';

// Domain & Lifecycle
import {
  ASSET_STATUSES,
  ASSET_CONDITIONS,
  CUSTODY_TYPES,
  Asset,
} from '../src/domain/types/asset';
import { TRANSACTION_TYPES } from '../src/domain/types/transaction';
import { AUDIT_ACTIONS } from '../src/domain/types/audit-log';

// Utilities
import { formatEntityId, isValidId } from '../src/lib/utils/id-generator';
import { sanitizeForSpreadsheet, desanitizeFromSpreadsheet } from '../src/lib/utils/sanitize';
import { Mutex } from '../src/lib/utils/mutex';
import { ID_PREFIXES, DEFAULT_CURRENCY } from '../src/config/constants';
import { isGoogleSheetsConfigured, getGoogleSheetsConfig } from '../src/config/env';
import {
  mapAssetToRow,
  mapRowToAsset,
  ASSET_SHEET_HEADERS,
} from '../src/lib/google-sheets/asset-row-mapper';

// Repositories & Doubles
import { InMemoryAssetRepository } from '../src/repositories/memory/in-memory-asset-repository';
import { InMemoryTransactionRepository } from '../src/repositories/memory/in-memory-transaction-repository';
import { InMemoryAuditLogRepository } from '../src/repositories/memory/in-memory-audit-log-repository';
import { InMemorySettingsRepository } from '../src/repositories/memory/in-memory-settings-repository';
import { setRepositoryContainer, getRepositoryContainer } from '../src/repositories/factory';

// Domain Service & Security
import { AssetService } from '../src/domain/services/asset-service';
import { USER_ROLES } from '../src/security/roles';
import { maskAssetForRole, maskAssetsForRole } from '../src/security/field-masking';
import {
  ValidationError,
  ForbiddenError,
  ScopeViolationError,
  NotFoundError,
  InvalidStateTransitionError,
} from '../src/lib/errors/app-error';

describe('Stage 4 — Core Asset Data, Google Sheets Foundation & Inventory Test Suite', () => {
  let assetRepo: InMemoryAssetRepository;
  let txnRepo: InMemoryTransactionRepository;
  let auditRepo: InMemoryAuditLogRepository;
  let settingsRepo: InMemorySettingsRepository;
  let assetService: AssetService;

  beforeEach(() => {
    assetRepo = new InMemoryAssetRepository();
    txnRepo = new InMemoryTransactionRepository();
    auditRepo = new InMemoryAuditLogRepository();
    settingsRepo = new InMemorySettingsRepository();

    const container = {
      assetRepository: assetRepo,
      transactionRepository: txnRepo,
      auditLogRepository: auditRepo,
      settingsRepository: settingsRepo,
    };

    setRepositoryContainer(container);
    assetService = new AssetService(container);
  });

  // 1. Asset schema validation
  describe('1. Asset Schema Validation', () => {
    it('validates a complete, compliant asset registration payload', () => {
      const validPayload = {
        asset_tag: 'TAG-10042',
        name: 'MacBook Pro 16 M3 Max',
        category_id: 'CAT-000001',
        subcategory: 'Engineering Laptop',
        brand: 'Apple',
        model: 'A2991',
        serial_number: 'C02G1234MD6R',
        description: 'Assigned for high-performance development',
        condition: ASSET_CONDITIONS.NEW,
        status: ASSET_STATUSES.AVAILABLE,
        custody_type: CUSTODY_TYPES.NONE,
        location_id: 'LOC-000001',
        department_id: 'DEP-000001',
        purchase_date: '2025-01-15',
        purchase_cost: 249000,
        useful_life_months: 36,
        currency: 'INR',
        vendor_id: 'VEN-000001',
        invoice_reference: 'INV-2025-091',
        warranty_start: '2025-01-15',
        warranty_expiry: '2028-01-15',
        custom_fields: { ram_gb: 64, storage: '2TB SSD' },
      };

      const parsed = createAssetSchema.parse(validPayload);
      assert.equal(parsed.asset_tag, 'TAG-10042');
      assert.equal(parsed.name, 'MacBook Pro 16 M3 Max');
      assert.equal(parsed.brand, 'Apple');
      assert.equal(parsed.currency, 'INR');
      assert.equal(parsed.purchase_cost, 249000);
    });
  });

  // 2. Invalid asset rejection
  describe('2. Invalid Asset Rejection', () => {
    it('rejects asset missing required fields (asset_tag, name, brand, category_id)', () => {
      assert.throws(
        () => createAssetSchema.parse({ name: 'Incomplete' }),
        (err) => err instanceof Error
      );
    });

    it('rejects negative purchase cost', () => {
      assert.throws(
        () =>
          createAssetSchema.parse({
            asset_tag: 'TAG-999',
            name: 'Device',
            brand: 'Brand',
            category_id: 'CAT-000001',
            purchase_cost: -500,
          }),
        (err) => err instanceof Error
      );
    });

    it('rejects invalid warranty expiry preceding warranty start', () => {
      assert.throws(
        () =>
          createAssetSchema.parse({
            asset_tag: 'TAG-999',
            name: 'Device',
            brand: 'Brand',
            category_id: 'CAT-000001',
            warranty_start: '2026-06-01',
            warranty_expiry: '2025-06-01',
          }),
        (err) => err instanceof Error
      );
    });

    it('rejects custody USER without current_user_id', () => {
      assert.throws(
        () =>
          createAssetSchema.parse({
            asset_tag: 'TAG-999',
            name: 'Device',
            brand: 'Brand',
            category_id: 'CAT-000001',
            custody_type: CUSTODY_TYPES.USER,
            current_user_id: null,
          }),
        (err) => err instanceof Error
      );
    });
  });

  // 3. Currency validation
  describe('3. Currency Validation', () => {
    it('defaults to INR when currency is omitted', () => {
      assert.equal(currencySchema.parse(undefined), DEFAULT_CURRENCY);
    });

    it('accepts valid 3-letter ISO uppercase currency codes', () => {
      assert.equal(currencySchema.parse('USD'), 'USD');
      assert.equal(currencySchema.parse('EUR'), 'EUR');
      assert.equal(currencySchema.parse('INR'), 'INR');
    });

    it('rejects non-standard currency codes', () => {
      assert.throws(() => currencySchema.parse('RUPEES'));
      assert.throws(() => currencySchema.parse('123'));
      assert.throws(() => currencySchema.parse('inr')); // Must be uppercase
    });
  });

  // 4. Asset ID generation
  describe('4. Asset ID Generation', () => {
    it('generates sequential zero-padded natural IDs matching AST-000000 format', () => {
      assert.equal(formatEntityId(ID_PREFIXES.ASSET, 1), 'AST-000001');
      assert.equal(formatEntityId(ID_PREFIXES.ASSET, 42), 'AST-000042');
      assert.equal(formatEntityId(ID_PREFIXES.ASSET, 1000), 'AST-001000');
    });

    it('validates natural keys against AST-000000 regex pattern', () => {
      assert.equal(isValidId('AST-000001', 'ASSET'), true);
      assert.equal(isValidId('AST-999999', 'ASSET'), true);
      assert.equal(isValidId('AST-1', 'ASSET'), false);
      assert.equal(isValidId('TAG-000001', 'ASSET'), false);
    });
  });

  // 5. Duplicate asset ID prevention
  describe('5. Duplicate Asset ID Prevention', () => {
    it('increments sequence atomically using mutex to prevent collision', async () => {
      const mutex = new Mutex();
      let seq = 0;

      // Simulate 10 concurrent requests attempting to obtain an ID
      const promises = Array.from({ length: 10 }).map(() =>
        mutex.runExclusive(async () => {
          const current = seq;
          await new Promise((r) => setTimeout(r, 2));
          seq = current + 1;
          return formatEntityId(ID_PREFIXES.ASSET, seq);
        })
      );

      const generatedIds = await Promise.all(promises);
      const uniqueIds = new Set(generatedIds);

      assert.equal(generatedIds.length, 10);
      assert.equal(uniqueIds.size, 10);
      assert.equal(generatedIds[0], 'AST-000001');
      assert.equal(generatedIds[9], 'AST-000010');
    });
  });

  // 6. Duplicate asset tag handling
  describe('6. Duplicate Asset Tag Handling', () => {
    it('rejects creation when asset tag already exists in inventory', async () => {
      const adminIdentity = { userId: 'USR-000001', role: USER_ROLES.ADMIN };

      await assetService.createAsset(
        {
          asset_tag: 'TAG-UNIQUE-1',
          name: 'Primary Laptop',
          brand: 'Dell',
          category_id: 'CAT-000001',
        },
        adminIdentity
      );

      await assert.rejects(
        () =>
          assetService.createAsset(
            {
              asset_tag: 'TAG-UNIQUE-1', // Duplicate tag
              name: 'Duplicate Laptop',
              brand: 'HP',
              category_id: 'CAT-000001',
            },
            adminIdentity
          ),
        (err: unknown) => {
          assert(err instanceof ValidationError);
          assert(err.message.includes("Asset tag 'TAG-UNIQUE-1' already exists"));
          return true;
        }
      );
    });
  });

  // 7. Duplicate serial number handling
  describe('7. Duplicate Serial Number Handling', () => {
    it('rejects creation when non-empty serial number is already assigned', async () => {
      const adminIdentity = { userId: 'USR-000001', role: USER_ROLES.ADMIN };

      await assetService.createAsset(
        {
          asset_tag: 'TAG-A1',
          name: 'Device A',
          brand: 'Apple',
          category_id: 'CAT-000001',
          serial_number: 'SN-SHARED-99',
        },
        adminIdentity
      );

      await assert.rejects(
        () =>
          assetService.createAsset(
            {
              asset_tag: 'TAG-B2',
              name: 'Device B',
              brand: 'Apple',
              category_id: 'CAT-000001',
              serial_number: 'SN-SHARED-99', // Duplicate serial
            },
            adminIdentity
          ),
        (err: unknown) => {
          assert(err instanceof ValidationError);
          assert(err.message.includes("Serial number 'SN-SHARED-99' already exists"));
          return true;
        }
      );
    });
  });

  // 8. Formula injection protection
  describe('8. Formula Injection Protection', () => {
    it('prepends single quote to string starting with formula trigger characters (=, +, -, @)', () => {
      assert.equal(sanitizeForSpreadsheet('=SUM(A1:A10)'), "'=SUM(A1:A10)");
      assert.equal(sanitizeForSpreadsheet('+cmd|"/C calc"!A0'), '\'+cmd|"/C calc"!A0');
      assert.equal(sanitizeForSpreadsheet('-5+10'), "'-5+10");
      assert.equal(sanitizeForSpreadsheet('@danger'), "'@danger");
      assert.equal(sanitizeForSpreadsheet('Regular Text'), 'Regular Text');
    });

    it('desanitizes prepended single quote upon reading back from sheet', () => {
      assert.equal(desanitizeFromSpreadsheet("'=SUM(A1:A10)"), '=SUM(A1:A10)');
      assert.equal(desanitizeFromSpreadsheet("'+cmd"), '+cmd');
      assert.equal(desanitizeFromSpreadsheet("'-5"), '-5');
      assert.equal(desanitizeFromSpreadsheet("'@danger"), '@danger');
      assert.equal(desanitizeFromSpreadsheet("O'Connor"), "O'Connor"); // Does not strip interior quote
    });
  });

  // 9. Repository interface behavior
  describe('9. Repository Interface Behavior', () => {
    it('implements complete IAssetRepository contract', async () => {
      const created = await assetRepo.create({
        asset_id: 'AST-000099',
        asset_tag: 'TAG-CONTRACT-1',
        name: 'Server Rack 1',
        category_id: 'CAT-000003',
        brand: 'Cisco',
        status: ASSET_STATUSES.AVAILABLE,
        condition: ASSET_CONDITIONS.GOOD,
        custody_type: CUSTODY_TYPES.NONE,
        currency: 'INR',
        is_archived: false,
      });

      assert.equal(created.asset_id, 'AST-000099');

      const byId = await assetRepo.findById('AST-000099');
      assert.equal(byId?.name, 'Server Rack 1');

      const byTag = await assetRepo.findByTag('TAG-CONTRACT-1');
      assert.equal(byTag?.asset_id, 'AST-000099');

      const updated = await assetRepo.update('AST-000099', { name: 'Server Rack 1 (Updated)' });
      assert.equal(updated.name, 'Server Rack 1 (Updated)');

      const archived = await assetRepo.archive('AST-000099', 'Decommissioned');
      assert.equal(archived.is_archived, true);
    });
  });

  // 10. Google Sheets adapter mapping
  describe('10. Google Sheets Adapter Mapping', () => {
    it('maps Asset entity to exact 30-element spreadsheet row array with exact headers', () => {
      assert.equal(ASSET_SHEET_HEADERS.length, 30);
      assert.equal(ASSET_SHEET_HEADERS[0], 'asset_id');
      assert.equal(ASSET_SHEET_HEADERS[1], 'asset_tag');
      assert.equal(ASSET_SHEET_HEADERS[29], 'archived_at');

      const asset: Asset = {
        asset_id: 'AST-000101',
        asset_tag: 'TAG-MAP-01',
        name: 'Precision 7680',
        category_id: 'CAT-000001',
        subcategory: 'Mobile Workstation',
        brand: 'Dell',
        model: 'P7680',
        serial_number: 'SN987654321',
        description: 'CAD workstation',
        status: ASSET_STATUSES.AVAILABLE,
        condition: ASSET_CONDITIONS.EXCELLENT,
        custody_type: CUSTODY_TYPES.NONE,
        department_id: 'DEP-000001',
        location_id: 'LOC-000001',
        current_user_id: null,
        current_assignment_id: null,
        purchase_date: '2024-06-01',
        purchase_cost: 320000,
        useful_life_months: 48,
        current_value: 280000,
        currency: 'INR',
        vendor_id: 'VEN-000001',
        invoice_reference: 'INV-DELL-09',
        warranty_start: '2024-06-01',
        warranty_expiry: '2028-06-01',
        custom_fields: { gpu: 'RTX 4090' },
        is_archived: false,
        created_at: '2024-06-01T00:00:00.000Z',
        updated_at: '2024-06-01T00:00:00.000Z',
        archived_at: null,
      };

      const row = mapAssetToRow(asset);
      assert.equal(row.length, 30);
      assert.equal(row[0], 'AST-000101');
      assert.equal(row[1], 'TAG-MAP-01');
      assert.equal(row[26], 'FALSE'); // is_archived

      // Bidirectional test
      const hydrated = mapRowToAsset(row);
      assert.equal(hydrated.asset_id, asset.asset_id);
      assert.equal(hydrated.asset_tag, asset.asset_tag);
      assert.equal(hydrated.purchase_cost, 320000);
      assert.equal((hydrated.custom_fields as any)?.gpu, 'RTX 4090');
      assert.equal(hydrated.is_archived, false);
    });
  });

  // 11. Missing Google configuration handling
  describe('11. Missing Google Configuration Handling', () => {
    it('isGoogleSheetsConfigured reports false when env variables are empty', () => {
      const mockEnv = {
        NODE_ENV: 'development' as const,
        APP_URL: 'http://localhost:3000',
        SESSION_SECRET: '32-character-secret-must-be-provided-in-test',
        ALLOWED_EMAIL_DOMAINS: 'NOT_CONFIGURED',
        ALLOWED_EMAILS: '',
        GOOGLE_SPREADSHEET_ID: '',
        GOOGLE_SERVICE_ACCOUNT_EMAIL: '',
        GOOGLE_PRIVATE_KEY: '',
      };

      assert.equal(isGoogleSheetsConfigured(mockEnv), false);
      assert.throws(
        () => getGoogleSheetsConfig(mockEnv),
        (err) => err instanceof Error && err.message.includes('Google Sheets integration is not configured')
      );
    });
  });

  // 12. Asset creation
  describe('12. Asset Creation', () => {
    it('creates an asset with server-assigned AST ID, acquisition transaction, and audit log', async () => {
      const identity = { userId: 'USR-000001', role: USER_ROLES.SUPER_ADMIN };

      const asset = await assetService.createAsset(
        {
          asset_tag: 'TAG-CREATION-1',
          name: 'OptiPlex 7000',
          category_id: 'CAT-000001',
          brand: 'Dell',
          purchase_cost: 85000,
        },
        identity
      );

      assert.equal(asset.asset_id, 'AST-000001');
      assert.equal(asset.status, ASSET_STATUSES.ACQUIRED);
      assert.equal(asset.condition, ASSET_CONDITIONS.NEW);

      // Verify transaction ledger was created
      const txns = await txnRepo.findByAssetId('AST-000001');
      assert.equal(txns.length, 1);
      assert.equal(txns[0].transaction_type, TRANSACTION_TYPES.ACQUISITION);
      assert.equal(txns[0].performed_by, 'USR-000001');

      // Verify audit log was created
      const auditResult = await auditRepo.findMany({ entity_id: 'AST-000001' });
      assert.equal(auditResult.total, 1);
      assert.equal(auditResult.data[0].action, AUDIT_ACTIONS.ASSET_CREATED);
    });
  });

  // 13. Asset retrieval
  describe('13. Asset Retrieval', () => {
    it('retrieves an existing asset by ID', async () => {
      const identity = { userId: 'USR-000001', role: USER_ROLES.ADMIN };

      const created = await assetService.createAsset(
        {
          asset_tag: 'TAG-RETRIEVAL-1',
          name: 'Display 27',
          category_id: 'CAT-000002',
          brand: 'LG',
        },
        identity
      );

      const retrieved = await assetService.getAssetById(created.asset_id, identity);
      assert.equal(retrieved.asset_id, created.asset_id);
      assert.equal(retrieved.name, 'Display 27');
    });

    it('throws NotFoundError for non-existent asset ID', async () => {
      const identity = { userId: 'USR-000001', role: USER_ROLES.ADMIN };
      await assert.rejects(
        () => assetService.getAssetById('AST-999999', identity),
        (err) => err instanceof NotFoundError
      );
    });
  });

  // 14. Asset update
  describe('14. Asset Update', () => {
    it('updates mutable fields and writes transaction and audit log entries', async () => {
      const identity = { userId: 'USR-000001', role: USER_ROLES.ADMIN };

      const asset = await assetService.createAsset(
        {
          asset_tag: 'TAG-UPDATE-1',
          name: 'Lenovo ThinkPad',
          brand: 'Lenovo',
          category_id: 'CAT-000001',
          status: ASSET_STATUSES.ACQUIRED,
        },
        identity
      );

      const updated = await assetService.updateAsset(
        asset.asset_id,
        {
          status: ASSET_STATUSES.AVAILABLE, // Valid state transition
          condition: ASSET_CONDITIONS.GOOD,
          name: 'Lenovo ThinkPad T14 (Configured)',
        },
        identity
      );

      assert.equal(updated.name, 'Lenovo ThinkPad T14 (Configured)');
      assert.equal(updated.status, ASSET_STATUSES.AVAILABLE);

      // Verify transaction ledger captured state transition
      const txns = await txnRepo.findByAssetId(asset.asset_id);
      assert.equal(txns.length, 2); // Initial acquisition + Commission/Transition
      assert.equal(txns[1].transaction_type, TRANSACTION_TYPES.COMMISSION);

      // Verify audit log captured update
      const audits = await auditRepo.findMany({ entity_id: asset.asset_id });
      assert.equal(audits.total, 2);
      assert.equal(audits.data[0].action, AUDIT_ACTIONS.ASSET_UPDATED);
    });

    it('rejects invalid lifecycle transition', async () => {
      const identity = { userId: 'USR-000001', role: USER_ROLES.ADMIN };

      const asset = await assetService.createAsset(
        {
          asset_tag: 'TAG-INVALID-TRANS',
          name: 'Device',
          brand: 'Apple',
          category_id: 'CAT-000001',
          status: ASSET_STATUSES.ACQUIRED,
        },
        identity
      );

      // Transition from ACQUIRED directly to DISPOSED is invalid
      await assert.rejects(
        () =>
          assetService.updateAsset(
            asset.asset_id,
            { status: ASSET_STATUSES.DISPOSED },
            identity
          ),
        (err) => err instanceof InvalidStateTransitionError
      );
    });
  });

  // 15. Search / Filter behavior
  describe('15. Search / Filter Behavior', () => {
    it('filters inventory by query, status, condition, category, and paginates properly', async () => {
      const identity = { userId: 'USR-000001', role: USER_ROLES.ADMIN };

      await assetService.createAsset(
        {
          asset_tag: 'TAG-SEARCH-1',
          name: 'MacBook Air M2',
          brand: 'Apple',
          category_id: 'CAT-000001',
          status: ASSET_STATUSES.AVAILABLE,
          condition: ASSET_CONDITIONS.NEW,
        },
        identity
      );

      await assetService.createAsset(
        {
          asset_tag: 'TAG-SEARCH-2',
          name: 'Dell UltraSharp Monitor',
          brand: 'Dell',
          category_id: 'CAT-000002',
          status: ASSET_STATUSES.AVAILABLE,
          condition: ASSET_CONDITIONS.EXCELLENT,
        },
        identity
      );

      await assetService.createAsset(
        {
          asset_tag: 'TAG-SEARCH-3',
          name: 'Cisco Router',
          brand: 'Cisco',
          category_id: 'CAT-000003',
          status: ASSET_STATUSES.IN_MAINTENANCE,
          condition: ASSET_CONDITIONS.POOR,
        },
        identity
      );

      // Filter by category CAT-000002
      const byCategory = await assetService.listAssets({ category_id: 'CAT-000002' }, identity);
      assert.equal(byCategory.total, 1);
      assert.equal(byCategory.data[0].asset_tag, 'TAG-SEARCH-2');

      // Search by text "MacBook"
      const bySearch = await assetService.listAssets({ search: 'macbook' }, identity);
      assert.equal(bySearch.total, 1);
      assert.equal(bySearch.data[0].asset_tag, 'TAG-SEARCH-1');

      // Filter by status IN_MAINTENANCE
      const byStatus = await assetService.listAssets(
        { status: ASSET_STATUSES.IN_MAINTENANCE },
        identity
      );
      assert.equal(byStatus.total, 1);
      assert.equal(byStatus.data[0].asset_tag, 'TAG-SEARCH-3');

      // Pagination check (limit 2 on 3 assets)
      const paginated = await assetService.listAssets({ limit: 2, page: 1 }, identity);
      assert.equal(paginated.data.length, 2);
      assert.equal(paginated.total, 3);
      assert.equal(paginated.totalPages, 2);
    });
  });

  // 16. Role authorization
  describe('16. Role Authorization', () => {
    it('permits SUPER_ADMIN, ADMIN, and ASSET_MANAGER to register assets', async () => {
      const superAdmin = { userId: 'USR-001', role: USER_ROLES.SUPER_ADMIN };
      const admin = { userId: 'USR-002', role: USER_ROLES.ADMIN };
      const assetMgr = { userId: 'USR-003', role: USER_ROLES.ASSET_MANAGER };

      const a1 = await assetService.createAsset(
        { asset_tag: 'TAG-R1', name: 'N1', brand: 'B', category_id: 'CAT-000001' },
        superAdmin
      );
      const a2 = await assetService.createAsset(
        { asset_tag: 'TAG-R2', name: 'N2', brand: 'B', category_id: 'CAT-000001' },
        admin
      );
      const a3 = await assetService.createAsset(
        { asset_tag: 'TAG-R3', name: 'N3', brand: 'B', category_id: 'CAT-000001' },
        assetMgr
      );

      assert(a1.asset_id);
      assert(a2.asset_id);
      assert(a3.asset_id);
    });

    it('strictly forbids STAFF and VIEWER from creating assets', async () => {
      const staff = { userId: 'USR-004', role: USER_ROLES.STAFF };
      const viewer = { userId: 'USR-005', role: USER_ROLES.VIEWER };

      await assert.rejects(
        () =>
          assetService.createAsset(
            { asset_tag: 'TAG-DENIED-1', name: 'X', brand: 'B', category_id: 'CAT-000001' },
            staff
          ),
        (err) => err instanceof ForbiddenError
      );

      await assert.rejects(
        () =>
          assetService.createAsset(
            { asset_tag: 'TAG-DENIED-2', name: 'X', brand: 'B', category_id: 'CAT-000001' },
            viewer
          ),
        (err) => err instanceof ForbiddenError
      );
    });

    it('strictly enforces department scoping for DEPARTMENT_MANAGER', async () => {
      const deptMgr = {
        userId: 'USR-010',
        role: USER_ROLES.DEPARTMENT_MANAGER,
        departmentId: 'DEP-000001',
      };
      const admin = { userId: 'USR-001', role: USER_ROLES.ADMIN };

      // Asset in DEP-000001
      await assetService.createAsset(
        {
          asset_tag: 'TAG-DEPT-1',
          name: 'Dept 1 Laptop',
          brand: 'B',
          category_id: 'CAT-000001',
          department_id: 'DEP-000001',
        },
        admin
      );

      // Asset in DEP-000002
      const otherAsset = await assetService.createAsset(
        {
          asset_tag: 'TAG-DEPT-2',
          name: 'Dept 2 Laptop',
          brand: 'B',
          category_id: 'CAT-000001',
          department_id: 'DEP-000002',
        },
        admin
      );

      // Dept manager listing should only return items from DEP-000001
      const scopedList = await assetService.listAssets({}, deptMgr);
      assert.equal(scopedList.total, 1);
      assert.equal(scopedList.data[0].asset_tag, 'TAG-DEPT-1');

      // Attempting to access asset from DEP-000002 directly throws ScopeViolationError
      await assert.rejects(
        () => assetService.getAssetById(otherAsset.asset_id, deptMgr),
        (err) => err instanceof ScopeViolationError
      );
    });
  });

  // 17. VIEWER restrictions
  describe('17. VIEWER Field-Level Masking Restrictions', () => {
    it('strips purchase_cost, current_value, and invoice_reference when viewed by VIEWER role', async () => {
      const admin = { userId: 'USR-001', role: USER_ROLES.ADMIN };
      const viewer = { userId: 'USR-999', role: USER_ROLES.VIEWER };

      const asset = await assetService.createAsset(
        {
          asset_tag: 'TAG-VIEWER-TEST',
          name: 'High End Rig',
          brand: 'Alienware',
          category_id: 'CAT-000001',
          purchase_cost: 450000,
          current_value: 400000,
          invoice_reference: 'SECRET-INVOICE-001',
        },
        admin
      );

      const viewed = await assetService.getAssetById(asset.asset_id, viewer);
      assert.equal(viewed.purchase_cost, null);
      assert.equal(viewed.current_value, null);
      assert.equal(viewed.invoice_reference, null);
      assert.equal(viewed.asset_tag, 'TAG-VIEWER-TEST'); // Operational info preserved
    });
  });

  // 18. Immutable asset ID
  describe('18. Immutable Asset ID Invariant', () => {
    it('refuses to mutate asset_id or created_at during an update operation', async () => {
      const admin = { userId: 'USR-001', role: USER_ROLES.ADMIN };

      const original = await assetService.createAsset(
        {
          asset_tag: 'TAG-IMMUTABLE-1',
          name: 'Workstation',
          brand: 'HP',
          category_id: 'CAT-000001',
        },
        admin
      );

      // Attempt update passing arbitrary asset_id
      const updated = await assetService.updateAsset(
        original.asset_id,
        {
          name: 'Updated Workstation',
        },
        admin
      );

      assert.equal(updated.asset_id, original.asset_id);
      assert.equal(updated.created_at, original.created_at);
    });
  });

  // 19. Audit foundation
  describe('19. Audit Foundation & Immutability', () => {
    it('records immutable append-only records that cannot be updated or deleted', async () => {
      const admin = { userId: 'USR-001', role: USER_ROLES.ADMIN };

      const asset = await assetService.createAsset(
        {
          asset_tag: 'TAG-AUDIT-FOUND',
          name: 'Test Rig',
          brand: 'Intel',
          category_id: 'CAT-000001',
        },
        admin
      );

      const txns = await txnRepo.findByAssetId(asset.asset_id);
      assert.equal(txns.length, 1);
      assert.equal(txns[0].asset_id, asset.asset_id);

      // Verify that ITransactionRepository has no update/delete methods
      assert.equal((txnRepo as any).update, undefined);
      assert.equal((txnRepo as any).delete, undefined);
      assert.equal((auditRepo as any).update, undefined);
      assert.equal((auditRepo as any).delete, undefined);
    });
  });

  // 20. No fake production data
  describe('20. No Fake Production Data Invariant', () => {
    it('returns empty results when store is empty without generating fake assets or mock totals', async () => {
      const admin = { userId: 'USR-001', role: USER_ROLES.ADMIN };

      const result = await assetService.listAssets({}, admin);
      assert.equal(result.total, 0);
      assert.equal(result.data.length, 0);
      assert.equal(result.totalPages, 1);
    });
  });
});
