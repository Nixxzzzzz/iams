import { Asset, ASSET_STATUSES, ASSET_CONDITIONS, CUSTODY_TYPES } from '@/domain/types/asset';
import { TRANSACTION_TYPES } from '@/domain/types/transaction';
import { AUDIT_ACTIONS } from '@/domain/types/audit-log';
import { validateTransition, resolveTransactionType } from '@/domain/lifecycle/state-machine';
import { IAssetRepository } from '@/repositories/interfaces/i-asset-repository';
import { ITransactionRepository } from '@/repositories/interfaces/i-transaction-repository';
import { IAuditLogRepository } from '@/repositories/interfaces/i-audit-log-repository';
import { ISettingsRepository } from '@/repositories/interfaces/i-settings-repository';
import { RepositoryContainer, getRepositoryContainer } from '@/repositories/factory';
import { ScopedIdentity, resolveDataScope, SCOPE_TYPES, isWithinScope } from '@/security/scoping';
import { CAPABILITIES } from '@/security/capabilities';
import { hasCapability } from '@/security/permissions';
import { maskAssetForRole, maskAssetsForRole } from '@/security/field-masking';
import { formatEntityId } from '@/lib/utils/id-generator';
import { ID_PREFIXES, DEFAULT_CURRENCY } from '@/config/constants';
import {
  CreateAssetInput,
  UpdateAssetInput,
  AssetFilterInput,
  createAssetSchema,
  updateAssetSchema,
  assetFilterSchema,
} from '@/validation/asset.schema';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
  ScopeViolationError,
} from '@/lib/errors/app-error';
import { PaginatedResult } from '@/repositories/interfaces/common';

/**
 * Authoritative Domain Asset Service
 * Source of Truth: docs/ARCHITECTURE.md §2.3, docs/ASSET_LIFECYCLE.md, docs/USER_ROLES_AND_PERMISSIONS.md
 *
 * Enforces:
 * - Domain business rules
 * - Server-side validation
 * - Unique asset tags and serial numbers
 * - Server-side sequential AST-000000 ID generation
 * - Lifecycle state machine transitions
 * - Immutable append-only transaction ledger & audit log generation
 * - 3-tier RBAC data scoping
 * - VIEWER field-level masking
 */

export class AssetService {
  private assetRepo: IAssetRepository;
  private transactionRepo: ITransactionRepository;
  private auditLogRepo: IAuditLogRepository;
  private settingsRepo: ISettingsRepository;

  constructor(container?: RepositoryContainer) {
    const repos = container ?? getRepositoryContainer();
    this.assetRepo = repos.assetRepository;
    this.transactionRepo = repos.transactionRepository;
    this.auditLogRepo = repos.auditLogRepository;
    this.settingsRepo = repos.settingsRepository;
  }

  /**
   * Lists inventory assets filtered by query criteria, role permissions, and data scope.
   */
  async listAssets(
    rawFilters: AssetFilterInput = {},
    identity: ScopedIdentity
  ): Promise<PaginatedResult<Asset>> {
    // 1. Permission check
    const canViewAll = hasCapability(identity.role, CAPABILITIES.ASSETS_VIEW_ALL);
    const canViewDept = hasCapability(identity.role, CAPABILITIES.ASSETS_VIEW_DEPARTMENT);
    const canViewAssigned = hasCapability(identity.role, CAPABILITIES.ASSETS_VIEW_ASSIGNED);

    if (!canViewAll && !canViewDept && !canViewAssigned) {
      throw new ForbiddenError('You do not have permission to view asset inventory.');
    }

    // 2. Validate filters
    const filters = assetFilterSchema.parse(rawFilters);

    // 3. Apply data scoping
    const scope = resolveDataScope(identity);
    if (scope.scopeType === SCOPE_TYPES.DEPARTMENT) {
      filters.department_id = scope.departmentId;
    } else if (scope.scopeType === SCOPE_TYPES.SELF) {
      filters.current_user_id = scope.userId;
    }

    // 4. Retrieve from repository
    const result = await this.assetRepo.findMany(filters);

    // 5. Apply field-level masking for VIEWER
    const maskedData = maskAssetsForRole(result.data, identity.role);

    return {
      ...result,
      items: maskedData,
      data: maskedData,
    };
  }

  /**
   * Retrieves single asset by ID with scoping and field masking.
   */
  async getAssetById(assetId: string, identity: ScopedIdentity): Promise<Asset> {
    const asset = await this.assetRepo.findById(assetId);
    if (!asset) {
      throw new NotFoundError('Asset', assetId);
    }

    // Scoping check
    const inScope = isWithinScope(identity, {
      departmentId: asset.department_id,
      userId: asset.current_user_id,
    });

    if (!inScope) {
      throw new ScopeViolationError('This asset is outside your authorized organizational scope.');
    }

    return maskAssetForRole(asset, identity.role);
  }

  /**
   * Registers a new asset with server-side validation, unique constraints,
   * natural ID generation, and automatic audit/transaction ledger entries.
   */
  async createAsset(rawInput: CreateAssetInput, identity: ScopedIdentity): Promise<Asset> {
    // 1. Authorization check
    if (!hasCapability(identity.role, CAPABILITIES.ASSETS_CREATE)) {
      throw new ForbiddenError('You do not have permission to register new assets.');
    }

    // 2. Validate payload
    const input = createAssetSchema.parse(rawInput);

    // 3. Uniqueness checks
    const existingTag = await this.assetRepo.findByTag(input.asset_tag);
    if (existingTag) {
      throw new ValidationError(`Asset tag '${input.asset_tag}' already exists in inventory.`, {
        field: 'asset_tag',
      });
    }

    if (input.serial_number && input.serial_number.trim().length > 0) {
      const existingSerial = await this.assetRepo.findBySerialNumber(input.serial_number);
      if (existingSerial) {
        throw new ValidationError(
          `Serial number '${input.serial_number}' already exists in inventory.`,
          { field: 'serial_number' }
        );
      }
    }

    // 4. Server-Side Sequential ID Generation (AST-000001)
    const sequenceNumber = await this.settingsRepo.nextSequence('ASSET');
    const asset_id = formatEntityId(ID_PREFIXES.ASSET, sequenceNumber);

    // 5. Build authoritative asset entity
    const newAsset = {
      asset_id,
      asset_tag: input.asset_tag,
      name: input.name,
      category_id: input.category_id,
      subcategory: input.subcategory ?? null,
      brand: input.brand,
      model: input.model ?? null,
      serial_number: input.serial_number ?? null,
      description: input.description ?? null,
      status: input.status ?? ASSET_STATUSES.ACQUIRED,
      condition: input.condition ?? ASSET_CONDITIONS.NEW,
      custody_type: input.custody_type ?? CUSTODY_TYPES.NONE,
      department_id: input.department_id ?? null,
      location_id: input.location_id ?? null,
      current_user_id: input.current_user_id ?? null,
      current_assignment_id: null,
      purchase_date: input.purchase_date ?? null,
      purchase_cost: input.purchase_cost ?? null,
      useful_life_months: input.useful_life_months ?? 36,
      current_value: input.current_value ?? input.purchase_cost ?? 0,
      currency: input.currency ?? DEFAULT_CURRENCY,
      vendor_id: input.vendor_id ?? null,
      invoice_reference: input.invoice_reference ?? null,
      warranty_start: input.warranty_start ?? null,
      warranty_expiry: input.warranty_expiry ?? null,
      custom_fields: input.custom_fields ?? null,
      is_archived: false,
    };

    // 6. Persist to repository
    const createdAsset = await this.assetRepo.create(newAsset);

    // 7. Append immutable operational transaction
    const txnSeq = await this.settingsRepo.nextSequence('TRANSACTION');
    const txnId = formatEntityId(ID_PREFIXES.TRANSACTION, txnSeq);
    await this.transactionRepo.append({
      transaction_id: txnId,
      asset_id: createdAsset.asset_id,
      transaction_type: TRANSACTION_TYPES.ACQUISITION,
      performed_by: identity.userId,
      previous_state: null,
      new_state: JSON.stringify({
        status: createdAsset.status,
        condition: createdAsset.condition,
        custody_type: createdAsset.custody_type,
      }),
      related_assignment_id: null,
      notes: 'Initial asset acquisition & registration',
      metadata: {
        registered_by_role: identity.role,
        brand: createdAsset.brand,
      },
    });

    // 8. Append immutable security audit log
    const auditSeq = await this.settingsRepo.nextSequence('AUDIT');
    const auditId = formatEntityId(ID_PREFIXES.AUDIT_LOG, auditSeq);
    await this.auditLogRepo.append({
      audit_id: auditId,
      actor_user_id: identity.userId,
      action: AUDIT_ACTIONS.ASSET_CREATED,
      entity_type: 'Assets',
      entity_id: createdAsset.asset_id,
      before_state: null,
      after_state: JSON.stringify(createdAsset),
    });

    return createdAsset;
  }

  /**
   * Updates an existing asset with lifecycle validation and audit logging.
   */
  async updateAsset(
    assetId: string,
    rawUpdates: UpdateAssetInput,
    identity: ScopedIdentity
  ): Promise<Asset> {
    // 1. Authorization check
    if (!hasCapability(identity.role, CAPABILITIES.ASSETS_EDIT)) {
      throw new ForbiddenError('You do not have permission to edit assets.');
    }

    // 2. Fetch existing record
    const existing = await this.assetRepo.findById(assetId);
    if (!existing) {
      throw new NotFoundError('Asset', assetId);
    }

    // 3. Scoping check
    const inScope = isWithinScope(identity, {
      departmentId: existing.department_id,
      userId: existing.current_user_id,
    });
    if (!inScope) {
      throw new ScopeViolationError('Cannot edit an asset outside your organizational scope.');
    }

    // 4. Validate updates
    const updates = updateAssetSchema.parse(rawUpdates);

    // 5. Unique checks if serial number changed
    if (
      updates.serial_number &&
      updates.serial_number !== existing.serial_number &&
      updates.serial_number.trim().length > 0
    ) {
      const duplicateSerial = await this.assetRepo.findBySerialNumber(updates.serial_number);
      if (duplicateSerial && duplicateSerial.asset_id !== assetId) {
        throw new ValidationError(
          `Serial number '${updates.serial_number}' is already assigned to another asset.`,
          { field: 'serial_number' }
        );
      }
    }

    // 6. Lifecycle State Machine Transition Check
    if (updates.status && updates.status !== existing.status) {
      validateTransition(existing.status, updates.status);
    }

    // 7. Persist update
    const updated = await this.assetRepo.update(assetId, updates);

    // 8. Record transaction if status or condition changed
    if (
      (updates.status && updates.status !== existing.status) ||
      (updates.condition && updates.condition !== existing.condition)
    ) {
      const txnSeq = await this.settingsRepo.nextSequence('TRANSACTION');
      const txnId = formatEntityId(ID_PREFIXES.TRANSACTION, txnSeq);
      const txnType = updates.status
        ? resolveTransactionType(existing.status, updates.status)
        : TRANSACTION_TYPES.CONDITION_UPDATE;

      await this.transactionRepo.append({
        transaction_id: txnId,
        asset_id: updated.asset_id,
        transaction_type: txnType,
        performed_by: identity.userId,
        previous_state: JSON.stringify({
          status: existing.status,
          condition: existing.condition,
        }),
        new_state: JSON.stringify({
          status: updated.status,
          condition: updated.condition,
        }),
        related_assignment_id: null,
        notes: `Asset attributes updated by ${identity.role}`,
      });
    }

    // 9. Record security audit log
    const auditSeq = await this.settingsRepo.nextSequence('AUDIT');
    const auditId = formatEntityId(ID_PREFIXES.AUDIT_LOG, auditSeq);
    await this.auditLogRepo.append({
      audit_id: auditId,
      actor_user_id: identity.userId,
      action: AUDIT_ACTIONS.ASSET_UPDATED,
      entity_type: 'Assets',
      entity_id: updated.asset_id,
      before_state: JSON.stringify(existing),
      after_state: JSON.stringify(updated),
    });

    return updated;
  }

  /**
   * Soft-archives an asset.
   */
  async archiveAsset(assetId: string, reason: string, identity: ScopedIdentity): Promise<Asset> {
    if (!hasCapability(identity.role, CAPABILITIES.ASSETS_ARCHIVE)) {
      throw new ForbiddenError('You do not have permission to archive assets.');
    }

    const existing = await this.assetRepo.findById(assetId);
    if (!existing) {
      throw new NotFoundError('Asset', assetId);
    }

    const archived = await this.assetRepo.archive(assetId, reason);

    const auditSeq = await this.settingsRepo.nextSequence('AUDIT');
    const auditId = formatEntityId(ID_PREFIXES.AUDIT_LOG, auditSeq);
    await this.auditLogRepo.append({
      audit_id: auditId,
      actor_user_id: identity.userId,
      action: AUDIT_ACTIONS.ASSET_DECOMMISSIONED,
      entity_type: 'Assets',
      entity_id: archived.asset_id,
      before_state: JSON.stringify(existing),
      after_state: JSON.stringify(archived),
    });

    return archived;
  }

  /**
   * Retrieves immutable transaction history for an asset.
   */
  async getAssetTransactions(assetId: string, identity: ScopedIdentity) {
    // Verify asset exists and is accessible
    await this.getAssetById(assetId, identity);
    return await this.transactionRepo.findByAssetId(assetId);
  }
}

let activeService: AssetService | null = null;

export function getAssetService(): AssetService {
  if (!activeService) {
    activeService = new AssetService();
  }
  return activeService;
}
