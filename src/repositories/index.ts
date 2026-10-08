import {
  IAssetRepository,
  IUserRepository,
  ITransactionRepository,
} from "./interfaces";
import {
  MockAssetRepository,
  MockUserRepository,
  MockTransactionRepository,
} from "./mock";

/**
 * Repository Factory Provider.
 * Mediates data access dependencies across domain services and API route handlers.
 * Allows transparent switching between in-memory mock, Google Sheets API, and PostgreSQL.
 */
class RepositoryRegistry {
  private static instance: RepositoryRegistry;

  public readonly assetRepository: IAssetRepository;
  public readonly userRepository: IUserRepository;
  public readonly transactionRepository: ITransactionRepository;

  private constructor() {
    // Current active adapter: Mock / Local development
    // (Swappable to GoogleSheetsAssetRepository once configured)
    this.assetRepository = new MockAssetRepository();
    this.userRepository = new MockUserRepository();
    this.transactionRepository = new MockTransactionRepository();
  }

  public static getInstance(): RepositoryRegistry {
    if (!RepositoryRegistry.instance) {
      RepositoryRegistry.instance = new RepositoryRegistry();
    }
    return RepositoryRegistry.instance;
  }
}

export const repositories = RepositoryRegistry.getInstance();
export * from "./interfaces";
