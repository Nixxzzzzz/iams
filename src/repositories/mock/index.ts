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
  AssetStatus,
  AssetCondition,
  TransactionType,
  UserRole,
  UserStatus,
  AssignmentStatus,
} from "../../domain/enums";
import {
  IAssetRepository,
  ITransactionRepository,
  IAssignmentRepository,
  IMaintenanceRepository,
  IRequestRepository,
  IUserRepository,
  IAuditLogRepository,
} from "../interfaces";
import { CreateAssetDTO, AssetFilterCriteria } from "../../domain/validation";

/**
 * Seed data for development and initial verification.
 */
const initialAssets: Asset[] = [
  {
    asset_id: "AST-000001",
    asset_tag: "TAG-10041",
    name: "ThinkPad P1 Gen 5",
    category_id: "CAT-0001",
    subcategory_id: null,
    brand: "Lenovo",
    model: "P1 Gen 5",
    serial_number: "PF-4K9182",
    description: "Engineering workstation laptop, 32GB RAM, 1TB SSD",
    status: AssetStatus.IN_USE,
    condition: AssetCondition.EXCELLENT,
    department_id: "DEP-0001",
    location_id: "LOC-0001",
    assigned_user_id: "USR-000001",
    purchase_date: "2024-01-15",
    purchase_cost: 2450.0,
    current_value: 1960.0,
    vendor_id: "VEN-0001",
    invoice_reference: "INV-2024-819",
    warranty_expiry: "2027-01-15",
    qr_code_url: null,
    created_at: "2024-01-16T09:00:00Z",
    updated_at: "2024-01-16T10:30:00Z",
    is_archived: false,
  },
  {
    asset_id: "AST-000002",
    asset_tag: "TAG-10042",
    name: "MacBook Pro 16\" M3 Max",
    category_id: "CAT-0001",
    subcategory_id: null,
    brand: "Apple",
    model: "A2991",
    serial_number: "C02G901XMD6R",
    description: "Design team primary workstation, 36GB Unified Memory",
    status: AssetStatus.AVAILABLE,
    condition: AssetCondition.NEW,
    department_id: "DEP-0002",
    location_id: "LOC-0002",
    assigned_user_id: null,
    purchase_date: "2024-03-01",
    purchase_cost: 3499.0,
    current_value: 3499.0,
    vendor_id: "VEN-0002",
    invoice_reference: "INV-APP-9912",
    warranty_expiry: "2027-03-01",
    qr_code_url: null,
    created_at: "2024-03-02T11:00:00Z",
    updated_at: "2024-03-02T11:00:00Z",
    is_archived: false,
  },
  {
    asset_id: "AST-000003",
    asset_tag: "TAG-10043",
    name: "Dell UltraSharp 32\" 4K",
    category_id: "CAT-0002",
    subcategory_id: null,
    brand: "Dell",
    model: "U3223QE",
    serial_number: "CN-098K1-72872",
    description: "IPS Black 4K USB-C Hub Monitor",
    status: AssetStatus.IN_MAINTENANCE,
    condition: AssetCondition.FAIR,
    department_id: "DEP-0001",
    location_id: "LOC-0003",
    assigned_user_id: null,
    purchase_date: "2023-06-10",
    purchase_cost: 850.0,
    current_value: 620.0,
    vendor_id: "VEN-0001",
    invoice_reference: "INV-2023-412",
    warranty_expiry: "2026-06-10",
    qr_code_url: null,
    created_at: "2023-06-12T14:20:00Z",
    updated_at: "2024-04-01T08:15:00Z",
    is_archived: false,
  },
];

const initialUsers: User[] = [
  {
    user_id: "USR-000001",
    email: "alex.chen@organization.com",
    first_name: "Alex",
    last_name: "Chen",
    role_id: UserRole.ASSET_MANAGER,
    department_id: "DEP-0001",
    job_title: "Lead Systems Administrator",
    phone: "+1-555-0192",
    status: UserStatus.ACTIVE,
    google_sub_id: "goog-998811",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
  {
    user_id: "USR-000002",
    email: "sarah.jenkins@organization.com",
    first_name: "Sarah",
    last_name: "Jenkins",
    role_id: UserRole.DEPARTMENT_MANAGER,
    department_id: "DEP-0002",
    job_title: "Head of Product Design",
    phone: "+1-555-0194",
    status: UserStatus.ACTIVE,
    google_sub_id: "goog-998812",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
];

export class MockAssetRepository implements IAssetRepository {
  private assets: Asset[] = [...initialAssets];

  async findById(assetId: string): Promise<Asset | null> {
    const item = this.assets.find((a) => a.asset_id === assetId && !a.is_archived);
    return item ? { ...item } : null;
  }

  async findByTag(assetTag: string): Promise<Asset | null> {
    const item = this.assets.find((a) => a.asset_tag.toLowerCase() === assetTag.toLowerCase() && !a.is_archived);
    return item ? { ...item } : null;
  }

  async findBySerial(serialNumber: string): Promise<Asset | null> {
    const item = this.assets.find((a) => a.serial_number.toLowerCase() === serialNumber.toLowerCase() && !a.is_archived);
    return item ? { ...item } : null;
  }

  async findMany(filters: AssetFilterCriteria): Promise<PaginatedResult<Asset>> {
    let result = this.assets.filter((a) => !a.is_archived);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.asset_tag.toLowerCase().includes(q) ||
          a.serial_number.toLowerCase().includes(q) ||
          a.brand.toLowerCase().includes(q)
      );
    }

    if (filters.category_id) {
      result = result.filter((a) => a.category_id === filters.category_id);
    }
    if (filters.status) {
      result = result.filter((a) => a.status === filters.status);
    }
    if (filters.condition) {
      result = result.filter((a) => a.condition === filters.condition);
    }
    if (filters.department_id) {
      result = result.filter((a) => a.department_id === filters.department_id);
    }
    if (filters.location_id) {
      result = result.filter((a) => a.location_id === filters.location_id);
    }

    const total = result.length;
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const pagedItems = result.slice(startIndex, startIndex + pageSize);

    return {
      items: pagedItems.map((a) => ({ ...a })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async create(asset: CreateAssetDTO & { asset_id: string; created_at: string; updated_at: string; is_archived: boolean }): Promise<Asset> {
    const newRecord: Asset = {
      ...asset,
      status: AssetStatus.AVAILABLE,
      current_value: asset.purchase_cost ?? null,
      assigned_user_id: null,
      qr_code_url: null,
    };
    this.assets.push(newRecord);
    return { ...newRecord };
  }

  async update(assetId: string, updates: Partial<Asset>): Promise<Asset> {
    const index = this.assets.findIndex((a) => a.asset_id === assetId);
    if (index === -1) {
      throw new Error(`Asset not found: ${assetId}`);
    }
    this.assets[index] = {
      ...this.assets[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return { ...this.assets[index] };
  }

  async archive(assetId: string, _reason: string): Promise<void> {
    const asset = await this.findById(assetId);
    if (!asset) throw new Error(`Asset not found: ${assetId}`);
    await this.update(assetId, { is_archived: true, status: AssetStatus.RETIRED });
  }

  async count(): Promise<number> {
    return this.assets.filter((a) => !a.is_archived).length;
  }
}

export class MockUserRepository implements IUserRepository {
  private users: User[] = [...initialUsers];

  async findById(userId: string): Promise<User | null> {
    const user = this.users.find((u) => u.user_id === userId);
    return user ? { ...user } : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  }

  async findAll(): Promise<User[]> {
    return this.users.map((u) => ({ ...u }));
  }

  async create(user: Omit<User, "user_id" | "created_at" | "updated_at">): Promise<User> {
    const newRecord: User = {
      ...user,
      user_id: `USR-${String(this.users.length + 1).padStart(6, "0")}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.push(newRecord);
    return { ...newRecord };
  }
}

export class MockTransactionRepository implements ITransactionRepository {
  private transactions: Transaction[] = [];

  async create(transaction: Omit<Transaction, "transaction_id">): Promise<Transaction> {
    const newRecord: Transaction = {
      ...transaction,
      transaction_id: `TXN-${String(this.transactions.length + 1).padStart(6, "0")}`,
    };
    this.transactions.push(newRecord);
    return { ...newRecord };
  }

  async findByAssetId(assetId: string): Promise<Transaction[]> {
    return this.transactions.filter((t) => t.asset_id === assetId).map((t) => ({ ...t }));
  }

  async findRecent(limit: number): Promise<Transaction[]> {
    return this.transactions.slice(-limit).reverse().map((t) => ({ ...t }));
  }
}
