import {
  IAssetRepository,
  ITransactionRepository,
} from "../repositories/interfaces";
import { Asset, Transaction } from "../domain/models";
import {
  AssetStatus,
  AssetCondition,
  TransactionType,
} from "../domain/enums";
import {
  CreateAssetDTO,
  CheckOutAssetDTO,
  CheckInAssetDTO,
} from "../domain/validation";

export class AssetService {
  constructor(
    private assetRepo: IAssetRepository,
    private transactionRepo: ITransactionRepository
  ) {}

  /**
   * Registers a new asset in the system.
   * Enforces tag and serial number uniqueness, initializes status to AVAILABLE,
   * and logs the ACQUISITION event to the transaction ledger.
   */
  async registerAsset(
    input: CreateAssetDTO,
    actorUserId: string
  ): Promise<Asset> {
    const existingTag = await this.assetRepo.findByTag(input.asset_tag);
    if (existingTag) {
      throw new Error(`Asset Tag '${input.asset_tag}' is already registered in the system.`);
    }

    const existingSerial = await this.assetRepo.findBySerial(input.serial_number);
    if (existingSerial) {
      throw new Error(`Serial Number '${input.serial_number}' is already registered.`);
    }

    const count = await this.assetRepo.count();
    const assetId = `AST-${String(count + 1).padStart(6, "0")}`;
    const timestamp = new Date().toISOString();

    const created = await this.assetRepo.create({
      ...input,
      asset_id: assetId,
      created_at: timestamp,
      updated_at: timestamp,
      is_archived: false,
    });

    // Append to immutable transaction ledger
    await this.transactionRepo.create({
      asset_id: created.asset_id,
      transaction_type: TransactionType.ACQUISITION,
      from_status: AssetStatus.ACQUIRED,
      to_status: AssetStatus.AVAILABLE,
      condition_at_event: input.condition || AssetCondition.NEW,
      action_by_user_id: actorUserId,
      timestamp,
      notes: "Initial intake and cataloging.",
    });

    return created;
  }

  /**
   * Checks out an asset to a user or department.
   * Invariant: Asset must be AVAILABLE.
   */
  async checkOut(
    input: CheckOutAssetDTO,
    actorUserId: string
  ): Promise<Asset> {
    const asset = await this.assetRepo.findById(input.asset_id);
    if (!asset) {
      throw new Error(`Asset not found: ${input.asset_id}`);
    }

    if (asset.status !== AssetStatus.AVAILABLE) {
      throw new Error(`Asset ${asset.asset_tag} cannot be checked out because its current status is '${asset.status}'.`);
    }

    const targetStatus = input.expected_return_date ? AssetStatus.CHECKED_OUT : AssetStatus.ASSIGNED;
    const timestamp = new Date().toISOString();

    const updated = await this.assetRepo.update(input.asset_id, {
      status: targetStatus,
      assigned_user_id: input.to_user_id || null,
      department_id: input.to_department_id || asset.department_id,
    });

    await this.transactionRepo.create({
      asset_id: asset.asset_id,
      transaction_type: input.expected_return_date ? TransactionType.CHECK_OUT : TransactionType.ASSIGN,
      from_user_id: null,
      to_user_id: input.to_user_id || null,
      from_status: AssetStatus.AVAILABLE,
      to_status: targetStatus,
      condition_at_event: asset.condition,
      action_by_user_id: actorUserId,
      timestamp,
      notes: input.notes || "Custody handover executed.",
    });

    return updated;
  }

  /**
   * Checks in a returned asset back into inventory.
   * Re-assesses condition and updates physical location.
   */
  async checkIn(
    input: CheckInAssetDTO,
    actorUserId: string
  ): Promise<Asset> {
    const asset = await this.assetRepo.findById(input.asset_id);
    if (!asset) {
      throw new Error(`Asset not found: ${input.asset_id}`);
    }

    if (asset.status !== AssetStatus.ASSIGNED && asset.status !== AssetStatus.CHECKED_OUT) {
      throw new Error(`Asset ${asset.asset_tag} is not currently assigned or checked out (Status: '${asset.status}').`);
    }

    // Determine target status based on returned condition
    const isDamaged = input.return_condition === AssetCondition.DAMAGED || input.return_condition === AssetCondition.POOR;
    const targetStatus = isDamaged ? AssetStatus.IN_MAINTENANCE : AssetStatus.AVAILABLE;
    const timestamp = new Date().toISOString();
    const previousCustodian = asset.assigned_user_id;

    const updated = await this.assetRepo.update(input.asset_id, {
      status: targetStatus,
      condition: input.return_condition,
      location_id: input.location_id,
      assigned_user_id: null,
    });

    await this.transactionRepo.create({
      asset_id: asset.asset_id,
      transaction_type: TransactionType.CHECK_IN,
      from_user_id: previousCustodian,
      to_user_id: null,
      from_location_id: asset.location_id,
      to_location_id: input.location_id,
      from_status: asset.status,
      to_status: targetStatus,
      condition_at_event: input.return_condition,
      action_by_user_id: actorUserId,
      timestamp,
      notes: input.notes || `Returned in ${input.return_condition} condition.`,
    });

    return updated;
  }

  /**
   * Retrieves complete custody history for an asset.
   */
  async getAssetHistory(assetId: string): Promise<Transaction[]> {
    return this.transactionRepo.findByAssetId(assetId);
  }
}
