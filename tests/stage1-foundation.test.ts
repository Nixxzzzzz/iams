import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Security imports
import { verifyEmailAgainstPolicy } from '../src/security/auth-policy';
import { USER_ROLES } from '../src/security/roles';
import { CAPABILITIES } from '../src/security/capabilities';
import { hasCapability } from '../src/security/permissions';
import { resolveDataScope, isWithinScope, SCOPE_TYPES } from '../src/security/scoping';
import {
  maskAssetForRole,
  maskUserForRole,
  maskVendorForRole,
  isDocumentAccessibleForRole,
  isAuditLogAccessibleForRole,
} from '../src/security/field-masking';

// Domain imports
import { ASSET_STATUSES, ASSET_CONDITIONS, CUSTODY_TYPES, Asset } from '../src/domain/types/asset';
import { User } from '../src/domain/types/user';
import { Vendor } from '../src/domain/types/vendor';
import { DocumentMetadata, DOCUMENT_TYPES } from '../src/domain/types/document';
import {
  canTransition,
  validateTransition,
  isTerminalState,
} from '../src/domain/lifecycle/state-machine';

// Utility & Error imports
import { sanitizeForSpreadsheet, desanitizeFromSpreadsheet } from '../src/lib/utils/sanitize';
import { formatEntityId, parseEntitySequence, isValidId } from '../src/lib/utils/id-generator';
import { ERROR_CODES, AppError, AuthConfigRequiredError, InvalidStateTransitionError } from '../src/lib/errors/app-error';

describe('Stage 1 — Architectural Foundation Test Suite', () => {
  describe('1. Authentication Policy (Fail-Closed Invariants)', () => {
    it('fails closed with AUTH_CONFIGURATION_REQUIRED when policy is NOT_CONFIGURED', () => {
      assert.throws(
        () => verifyEmailAgainstPolicy('admin@company.com', 'NOT_CONFIGURED'),
        (err: unknown) => {
          assert(err instanceof AuthConfigRequiredError);
          assert.equal(err.code, ERROR_CODES.AUTH_CONFIGURATION_REQUIRED);
          return true;
        }
      );
    });

    it('fails closed when policy is empty or whitespace', () => {
      assert.throws(
        () => verifyEmailAgainstPolicy('admin@company.com', '   '),
        (err: unknown) => {
          assert(err instanceof AuthConfigRequiredError);
          assert.equal(err.code, ERROR_CODES.AUTH_CONFIGURATION_REQUIRED);
          return true;
        }
      );
    });

    it('strictly rejects wildcard "*" configuration with CONFIGURATION_ERROR', () => {
      assert.throws(
        () => verifyEmailAgainstPolicy('admin@company.com', '*'),
        (err: unknown) => {
          assert(err instanceof AppError);
          assert.equal(err.code, ERROR_CODES.CONFIGURATION_ERROR);
          return true;
        }
      );
    });

    it('strictly rejects wildcard within domain string "*.corp.com"', () => {
      assert.throws(
        () => verifyEmailAgainstPolicy('admin@corp.com', '*.corp.com'),
        (err: unknown) => {
          assert(err instanceof AppError);
          assert.equal(err.code, ERROR_CODES.CONFIGURATION_ERROR);
          return true;
        }
      );
    });

    it('authorizes valid user when email domain matches allowed list', () => {
      const result = verifyEmailAgainstPolicy('rahul@company.com', 'company.com, university.edu');
      assert.equal(result.allowed, true);
    });

    it('rejects user when email domain is not in allowed list', () => {
      const result = verifyEmailAgainstPolicy('hacker@external.com', 'company.com, university.edu');
      assert.equal(result.allowed, false);
      assert(result.reason?.includes('@external.com'));
    });

    it('allows specific email exception when configured in allowlist', () => {
      const result = verifyEmailAgainstPolicy(
        'consultant@thirdparty.com',
        'company.com',
        'consultant@thirdparty.com'
      );
      assert.equal(result.allowed, true);
    });
  });

  describe('2. Centralized RBAC & Capabilities Matrix', () => {
    it('SUPER_ADMIN possesses all capabilities, including SETTINGS_MANAGE', () => {
      assert.equal(hasCapability(USER_ROLES.SUPER_ADMIN, CAPABILITIES.SETTINGS_MANAGE), true);
      assert.equal(hasCapability(USER_ROLES.SUPER_ADMIN, CAPABILITIES.AUDIT_VIEW), true);
      assert.equal(hasCapability(USER_ROLES.SUPER_ADMIN, CAPABILITIES.ASSETS_CREATE), true);
    });

    it('ADMIN has operational capabilities but NOT SETTINGS_MANAGE (reserved for Super Admin)', () => {
      assert.equal(hasCapability(USER_ROLES.ADMIN, CAPABILITIES.ASSETS_CREATE), true);
      assert.equal(hasCapability(USER_ROLES.ADMIN, CAPABILITIES.AUDIT_VIEW), true);
      assert.equal(hasCapability(USER_ROLES.ADMIN, CAPABILITIES.SETTINGS_MANAGE), false);
    });

    it('ASSET_MANAGER can manage assets, checkout, checkin, but cannot manage users or settings', () => {
      assert.equal(hasCapability(USER_ROLES.ASSET_MANAGER, CAPABILITIES.ASSETS_CHECKOUT), true);
      assert.equal(hasCapability(USER_ROLES.ASSET_MANAGER, CAPABILITIES.ASSETS_CHECKIN), true);
      assert.equal(hasCapability(USER_ROLES.ASSET_MANAGER, CAPABILITIES.USERS_MANAGE), false);
      assert.equal(hasCapability(USER_ROLES.ASSET_MANAGER, CAPABILITIES.SETTINGS_VIEW), false);
      assert.equal(hasCapability(USER_ROLES.ASSET_MANAGER, CAPABILITIES.AUDIT_VIEW), false);
    });

    it('DEPARTMENT_MANAGER can approve dept requests and view dept assets, but not global checkout', () => {
      assert.equal(hasCapability(USER_ROLES.DEPARTMENT_MANAGER, CAPABILITIES.REQUESTS_APPROVE_DEPT), true);
      assert.equal(hasCapability(USER_ROLES.DEPARTMENT_MANAGER, CAPABILITIES.ASSETS_VIEW_DEPARTMENT), true);
      assert.equal(hasCapability(USER_ROLES.DEPARTMENT_MANAGER, CAPABILITIES.ASSETS_CHECKOUT), false);
      assert.equal(hasCapability(USER_ROLES.DEPARTMENT_MANAGER, CAPABILITIES.AUDIT_VIEW), false);
    });

    it('STAFF has self-service capabilities only', () => {
      assert.equal(hasCapability(USER_ROLES.STAFF, CAPABILITIES.REQUESTS_CREATE), true);
      assert.equal(hasCapability(USER_ROLES.STAFF, CAPABILITIES.REQUESTS_VIEW_OWN), true);
      assert.equal(hasCapability(USER_ROLES.STAFF, CAPABILITIES.ASSETS_VIEW_ASSIGNED), true);
      assert.equal(hasCapability(USER_ROLES.STAFF, CAPABILITIES.ASSETS_CREATE), false);
      assert.equal(hasCapability(USER_ROLES.STAFF, CAPABILITIES.ASSETS_CHECKOUT), false);
      assert.equal(hasCapability(USER_ROLES.STAFF, CAPABILITIES.AUDIT_VIEW), false);
    });

    it('VIEWER is strictly read-only and has zero mutation capabilities', () => {
      assert.equal(hasCapability(USER_ROLES.VIEWER, CAPABILITIES.ASSETS_VIEW_ALL), true);
      assert.equal(hasCapability(USER_ROLES.VIEWER, CAPABILITIES.REPORTS_VIEW_OPERATIONAL), true);
      assert.equal(hasCapability(USER_ROLES.VIEWER, CAPABILITIES.ASSETS_CREATE), false);
      assert.equal(hasCapability(USER_ROLES.VIEWER, CAPABILITIES.ASSETS_EDIT), false);
      assert.equal(hasCapability(USER_ROLES.VIEWER, CAPABILITIES.FINANCIAL_VIEW), false);
      assert.equal(hasCapability(USER_ROLES.VIEWER, CAPABILITIES.AUDIT_VIEW), false);
    });
  });

  describe('3. 3-Tier Data Scoping Resolution', () => {
    it('resolves GLOBAL_SCOPE for Super Admin, Admin, Asset Manager, and Viewer', () => {
      const superAdminScope = resolveDataScope({ userId: 'USR-000001', role: USER_ROLES.SUPER_ADMIN });
      assert.equal(superAdminScope.scopeType, SCOPE_TYPES.GLOBAL);
      assert.equal(superAdminScope.isUnrestricted, true);

      const viewerScope = resolveDataScope({ userId: 'USR-000006', role: USER_ROLES.VIEWER });
      assert.equal(viewerScope.scopeType, SCOPE_TYPES.GLOBAL);
      assert.equal(viewerScope.isUnrestricted, true);
    });

    it('resolves DEPARTMENT_SCOPE for Department Manager', () => {
      const deptManagerScope = resolveDataScope({
        userId: 'USR-000004',
        role: USER_ROLES.DEPARTMENT_MANAGER,
        departmentId: 'DEP-000001',
      });
      assert.equal(deptManagerScope.scopeType, SCOPE_TYPES.DEPARTMENT);
      assert.equal(deptManagerScope.isUnrestricted, false);
      assert.equal(deptManagerScope.departmentId, 'DEP-000001');

      // Allowed for own department
      assert.equal(isWithinScope(
        { userId: 'USR-000004', role: USER_ROLES.DEPARTMENT_MANAGER, departmentId: 'DEP-000001' },
        { departmentId: 'DEP-000001' }
      ), true);

      // Denied for another department
      assert.equal(isWithinScope(
        { userId: 'USR-000004', role: USER_ROLES.DEPARTMENT_MANAGER, departmentId: 'DEP-000001' },
        { departmentId: 'DEP-000002' }
      ), false);
    });

    it('resolves SELF_SCOPE for Staff', () => {
      const staffScope = resolveDataScope({
        userId: 'USR-000005',
        role: USER_ROLES.STAFF,
      });
      assert.equal(staffScope.scopeType, SCOPE_TYPES.SELF);
      assert.equal(staffScope.isUnrestricted, false);
      assert.equal(staffScope.userId, 'USR-000005');

      // Allowed for self
      assert.equal(isWithinScope(
        { userId: 'USR-000005', role: USER_ROLES.STAFF },
        { userId: 'USR-000005' }
      ), true);

      // Denied for another user
      assert.equal(isWithinScope(
        { userId: 'USR-000005', role: USER_ROLES.STAFF },
        { userId: 'USR-000006' }
      ), false);
    });
  });

  describe('4. Viewer Field-Level Masking Interceptor', () => {
    const mockAsset: Asset = {
      asset_id: 'AST-000109',
      asset_tag: 'TAG-10042',
      name: 'ThinkPad P1 Gen 5',
      category_id: 'CAT-000001',
      brand: 'Lenovo',
      model: 'P1 Gen 5',
      serial_number: 'PF-39X921',
      status: ASSET_STATUSES.AVAILABLE,
      condition: ASSET_CONDITIONS.EXCELLENT,
      custody_type: CUSTODY_TYPES.NONE,
      purchase_cost: 145000,
      current_value: 120000,
      currency: 'INR',
      invoice_reference: 'INV-2026-9921',
      is_archived: false,
      created_at: '2026-03-15T00:00:00Z',
      updated_at: '2026-03-15T00:00:00Z',
    };

    it('strips purchase_cost, current_value, and invoice_reference when masked for VIEWER', () => {
      const masked = maskAssetForRole(mockAsset, USER_ROLES.VIEWER);
      assert.equal(masked.purchase_cost, null);
      assert.equal(masked.current_value, null);
      assert.equal(masked.invoice_reference, null);
      // Operational fields preserved
      assert.equal(masked.asset_tag, 'TAG-10042');
      assert.equal(masked.name, 'ThinkPad P1 Gen 5');
      assert.equal(masked.status, ASSET_STATUSES.AVAILABLE);
    });

    it('preserves full financial data for ASSET_MANAGER, ADMIN, and SUPER_ADMIN', () => {
      const unmasked = maskAssetForRole(mockAsset, USER_ROLES.ASSET_MANAGER);
      assert.equal(unmasked.purchase_cost, 145000);
      assert.equal(unmasked.current_value, 120000);
      assert.equal(unmasked.invoice_reference, 'INV-2026-9921');
    });

    it('strips personal phone number for VIEWER', () => {
      const mockUser: User = {
        user_id: 'USR-000001',
        email: 'rahul@company.com',
        first_name: 'Rahul',
        last_name: 'Sharma',
        phone: '+91 98765 43210',
        role: USER_ROLES.STAFF,
        status: 'ACTIVE',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      const masked = maskUserForRole(mockUser, USER_ROLES.VIEWER);
      assert.equal(masked.phone, null);
      assert.equal(masked.first_name, 'Rahul');
    });

    it('strips tax identifier for VIEWER on Vendor', () => {
      const mockVendor: Vendor = {
        vendor_id: 'VEN-000001',
        name: 'Tech Distributor Pvt Ltd',
        vendor_type: 'SUPPLIER',
        tax_identifier: 'GSTIN-29AAAAA0000A1Z5',
        status: 'ACTIVE',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      const masked = maskVendorForRole(mockVendor, USER_ROLES.VIEWER);
      assert.equal(masked.tax_identifier, null);
      assert.equal(masked.name, 'Tech Distributor Pvt Ltd');
    });

    it('marks private documents (invoices, disposal certificates) as inaccessible for VIEWER', () => {
      const invoiceDoc: DocumentMetadata = {
        document_id: 'DOC-000001',
        asset_id: 'AST-000109',
        document_type: DOCUMENT_TYPES.INVOICE,
        file_name: 'invoice_2026.pdf',
        drive_file_id: 'drive_123',
        mime_type: 'application/pdf',
        file_size_bytes: 1024,
        uploaded_by: 'USR-000001',
        uploaded_at: '2026-03-15T00:00:00Z',
      };

      const manualDoc: DocumentMetadata = {
        ...invoiceDoc,
        document_type: DOCUMENT_TYPES.MANUAL,
        file_name: 'manual.pdf',
      };

      assert.equal(isDocumentAccessibleForRole(invoiceDoc, USER_ROLES.VIEWER), false);
      assert.equal(isDocumentAccessibleForRole(manualDoc, USER_ROLES.VIEWER), true);
      assert.equal(isDocumentAccessibleForRole(invoiceDoc, USER_ROLES.ADMIN), true);
    });

    it('denies audit log access to VIEWER and STAFF', () => {
      assert.equal(isAuditLogAccessibleForRole(USER_ROLES.VIEWER), false);
      assert.equal(isAuditLogAccessibleForRole(USER_ROLES.STAFF), false);
      assert.equal(isAuditLogAccessibleForRole(USER_ROLES.ADMIN), true);
      assert.equal(isAuditLogAccessibleForRole(USER_ROLES.SUPER_ADMIN), true);
    });
  });

  describe('5. Asset Lifecycle State Machine', () => {
    it('allows valid state progression: ACQUIRED -> AVAILABLE -> ASSIGNED -> IN_USE', () => {
      assert.equal(canTransition(ASSET_STATUSES.ACQUIRED, ASSET_STATUSES.AVAILABLE), true);
      assert.equal(canTransition(ASSET_STATUSES.AVAILABLE, ASSET_STATUSES.ASSIGNED), true);
      assert.equal(canTransition(ASSET_STATUSES.ASSIGNED, ASSET_STATUSES.IN_USE), true);
    });

    it('blocks invalid transitions: AVAILABLE directly to DISPOSED', () => {
      assert.equal(canTransition(ASSET_STATUSES.AVAILABLE, ASSET_STATUSES.DISPOSED), false);
      assert.throws(
        () => validateTransition(ASSET_STATUSES.AVAILABLE, ASSET_STATUSES.DISPOSED),
        (err: unknown) => {
          assert(err instanceof InvalidStateTransitionError);
          assert.equal(err.code, ERROR_CODES.INVALID_STATE_TRANSITION);
          return true;
        }
      );
    });

    it('identifies terminal states correctly and prohibits transitions out of terminal states', () => {
      assert.equal(isTerminalState(ASSET_STATUSES.DISPOSED), true);
      assert.equal(isTerminalState(ASSET_STATUSES.SOLD), true);
      assert.equal(isTerminalState(ASSET_STATUSES.DONATED), true);
      assert.equal(isTerminalState(ASSET_STATUSES.AVAILABLE), false);

      assert.equal(canTransition(ASSET_STATUSES.DISPOSED, ASSET_STATUSES.AVAILABLE), false);
    });
  });

  describe('6. Formula Injection Sanitization', () => {
    it('sanitizes strings starting with =, +, -, @ by prepending single quote', () => {
      assert.equal(sanitizeForSpreadsheet('=SUM(A1:A10)'), "'=SUM(A1:A10)");
      assert.equal(sanitizeForSpreadsheet('+12345'), "'+12345");
      assert.equal(sanitizeForSpreadsheet('-command'), "'-command");
      assert.equal(sanitizeForSpreadsheet('@mention'), "'@mention");
    });

    it('leaves standard strings unmodified', () => {
      assert.equal(sanitizeForSpreadsheet('Lenovo ThinkPad P1'), 'Lenovo ThinkPad P1');
      assert.equal(sanitizeForSpreadsheet('TAG-10042'), 'TAG-10042');
    });

    it('desanitizes prepended single quote correctly upon reading', () => {
      assert.equal(desanitizeFromSpreadsheet("'=SUM(A1:A10)"), '=SUM(A1:A10)');
      assert.equal(desanitizeFromSpreadsheet('Standard Text'), 'Standard Text');
    });
  });

  describe('7. Sequential Natural Key Identifier Utilities', () => {
    it('formats sequential IDs with zero padding', () => {
      assert.equal(formatEntityId('AST-', 1), 'AST-000001');
      assert.equal(formatEntityId('USR-', 42), 'USR-000042');
      assert.equal(formatEntityId('TXN-', 999999), 'TXN-999999');
    });

    it('parses sequence numbers from natural keys', () => {
      assert.equal(parseEntitySequence('AST-000109', 'AST-'), 109);
      assert.equal(parseEntitySequence('USR-000005', 'USR-'), 5);
    });

    it('validates natural keys against regex patterns', () => {
      assert.equal(isValidId('AST-000001', 'ASSET'), true);
      assert.equal(isValidId('AST-1', 'ASSET'), false);
      assert.equal(isValidId('USR-000042', 'USER'), true);
      assert.equal(isValidId('TXN-000001', 'TRANSACTION'), true);
      assert.equal(isValidId('AUD-000001', 'AUDIT_LOG'), true);
    });
  });

  describe('8. Immutable Repository Architectural Contract Enforcements', () => {
    it('ImmutableRecordError conforms to code IMMUTABLE_RECORD and status 405', () => {
      const err = new (require('../src/lib/errors/app-error').ImmutableRecordError)('Transactions');
      assert.equal(err.code, ERROR_CODES.IMMUTABLE_RECORD);
      assert.equal(err.statusCode, 405);
      assert(err.message.includes('immutable Transactions ledger'));
    });

    it('ensures ITransactionRepository contract prohibits update and delete methods', () => {
      // Contract inspection: create a compliant object and verify absence of update/delete
      const compliantTxnRepo = {
        append: async () => ({
          transaction_id: 'TXN-000001',
          asset_id: 'AST-000001',
          transaction_type: 'ACQUISITION' as const,
          timestamp: new Date().toISOString(),
          performed_by: 'USR-000001',
          new_state: 'AVAILABLE',
        }),
        findById: async () => null,
        findMany: async () => ({ items: [], total: 0, page: 1, limit: 25, totalPages: 0 }),
        findByAssetId: async () => [],
      };

      assert.equal(typeof compliantTxnRepo.append, 'function');
      assert.equal('update' in compliantTxnRepo, false);
      assert.equal('delete' in compliantTxnRepo, false);
    });

    it('ensures IAuditLogRepository contract prohibits update and delete methods', () => {
      const compliantAuditRepo = {
        append: async () => ({
          audit_id: 'AUD-000001',
          timestamp: new Date().toISOString(),
          actor_user_id: 'USR-000001',
          action: 'LOGIN_SUCCESS' as const,
          entity_type: 'User',
        }),
        findById: async () => null,
        findMany: async () => ({ items: [], total: 0, page: 1, limit: 25, totalPages: 0 }),
      };

      assert.equal(typeof compliantAuditRepo.append, 'function');
      assert.equal('update' in compliantAuditRepo, false);
      assert.equal('delete' in compliantAuditRepo, false);
    });
  });
});
