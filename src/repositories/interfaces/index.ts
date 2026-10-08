import {
  Asset,
  Transaction,
  Assignment,
  MaintenanceTicket,
  AssetRequest,
  User,
  AuditLog,
  PaginatedResult,
} from "../../domain/models";
import {
  CreateAssetDTO,
  UpdateAssetDTO,
  AssetFilterCriteria,
} from "../../domain/validation";

export interface IAssetRepository {
  findById(assetId: string): Promise<Asset | null>;
  findByTag(assetTag: string): Promise<Asset | null>;
  findBySerial(serialNumber: string): Promise<Asset | null>;
  findMany(filters: AssetFilterCriteria): Promise<PaginatedResult<Asset>>;
  create(asset: CreateAssetDTO & { asset_id: string; created_at: string; updated_at: string; is_archived: boolean }): Promise<Asset>;
  update(assetId: string, updates: Partial<Asset>): Promise<Asset>;
  archive(assetId: string, reason: string): Promise<void>;
  count(): Promise<number>;
}

export interface ITransactionRepository {
  create(transaction: Omit<Transaction, "transaction_id">): Promise<Transaction>;
  findByAssetId(assetId: string): Promise<Transaction[]>;
  findRecent(limit: number): Promise<Transaction[]>;
}

export interface IAssignmentRepository {
  create(assignment: Omit<Assignment, "assignment_id">): Promise<Assignment>;
  findActiveByAssetId(assetId: string): Promise<Assignment | null>;
  findByUserId(userId: string): Promise<Assignment[]>;
  update(assignmentId: string, updates: Partial<Assignment>): Promise<Assignment>;
}

export interface IMaintenanceRepository {
  create(ticket: Omit<MaintenanceTicket, "maintenance_id">): Promise<MaintenanceTicket>;
  findById(maintenanceId: string): Promise<MaintenanceTicket | null>;
  findByAssetId(assetId: string): Promise<MaintenanceTicket[]>;
  update(maintenanceId: string, updates: Partial<MaintenanceTicket>): Promise<MaintenanceTicket>;
}

export interface IRequestRepository {
  create(request: Omit<AssetRequest, "request_id" | "request_number">): Promise<AssetRequest>;
  findById(requestId: string): Promise<AssetRequest | null>;
  findByUserId(userId: string): Promise<AssetRequest[]>;
  findPending(): Promise<AssetRequest[]>;
  update(requestId: string, updates: Partial<AssetRequest>): Promise<AssetRequest>;
}

export interface IUserRepository {
  findById(userId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(user: Omit<User, "user_id" | "created_at" | "updated_at">): Promise<User>;
}

export interface IAuditLogRepository {
  log(entry: Omit<AuditLog, "log_id" | "timestamp">): Promise<AuditLog>;
  findRecent(limit: number): Promise<AuditLog[]>;
}
