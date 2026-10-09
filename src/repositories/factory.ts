import { IAssetRepository } from './interfaces/i-asset-repository';
import { ITransactionRepository } from './interfaces/i-transaction-repository';
import { IAuditLogRepository } from './interfaces/i-audit-log-repository';
import { ISettingsRepository } from './interfaces/i-settings-repository';
import { GoogleSheetsClient } from '@/lib/google-sheets/sheets-client';
import { GoogleSheetsAssetRepository } from './google-sheets/google-sheets-asset-repository';
import { GoogleSheetsTransactionRepository } from './google-sheets/google-sheets-transaction-repository';
import { GoogleSheetsAuditLogRepository } from './google-sheets/google-sheets-audit-log-repository';
import { GoogleSheetsSettingsRepository } from './google-sheets/google-sheets-settings-repository';
import { InMemoryAssetRepository } from './memory/in-memory-asset-repository';
import { InMemoryTransactionRepository } from './memory/in-memory-transaction-repository';
import { InMemoryAuditLogRepository } from './memory/in-memory-audit-log-repository';
import { InMemorySettingsRepository } from './memory/in-memory-settings-repository';
import { isGoogleSheetsConfigured, getGoogleSheetsConfig, getEnv } from '@/config/env';
import { AppError, ERROR_CODES } from '@/lib/errors/app-error';

/**
 * Repository Container & Swappable Factory
 * Source of Truth: docs/ARCHITECTURE.md §2.4, docs/GOOGLE_SHEETS_INTEGRATION.md §6
 *
 * Guarantees decoupling between domain business logic and Google Sheets persistence.
 */

export interface RepositoryContainer {
  assetRepository: IAssetRepository;
  transactionRepository: ITransactionRepository;
  auditLogRepository: IAuditLogRepository;
  settingsRepository: ISettingsRepository;
}

let activeContainer: RepositoryContainer | null = null;

export function setRepositoryContainer(container: RepositoryContainer | null): void {
  activeContainer = container;
}

/**
 * Creates an unconfigured stub repository that fails clearly when invoked in production.
 */
function createUnconfiguredRepository<T extends object>(repoName: string): T {
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      if (typeof prop === 'string') {
        return () => {
          throw new AppError(
            ERROR_CODES.CONFIGURATION_ERROR,
            `Asset storage is not configured. An administrator must configure server-side Google Sheets environment variables to enable ${repoName}.`,
            503
          );
        };
      }
      return undefined;
    },
  };
  return new Proxy({}, handler) as T;
}

export function getRepositoryContainer(): RepositoryContainer {
  if (activeContainer) {
    return activeContainer;
  }

  const env = getEnv();
  const configured = isGoogleSheetsConfigured(env);

  if (configured) {
    const config = getGoogleSheetsConfig(env);
    const client = new GoogleSheetsClient(config);

    activeContainer = {
      assetRepository: new GoogleSheetsAssetRepository(client),
      transactionRepository: new GoogleSheetsTransactionRepository(client),
      auditLogRepository: new GoogleSheetsAuditLogRepository(client),
      settingsRepository: new GoogleSheetsSettingsRepository(client),
    };

    return activeContainer;
  }

  // In test environment, provide in-memory double if not configured
  if (env.NODE_ENV === 'test') {
    activeContainer = {
      assetRepository: new InMemoryAssetRepository(),
      transactionRepository: new InMemoryTransactionRepository(),
      auditLogRepository: new InMemoryAuditLogRepository(),
      settingsRepository: new InMemorySettingsRepository(),
    };
    return activeContainer;
  }

  // In development/production without configuration:
  // Strictly refuse to fall back to silent in-memory data
  return {
    assetRepository: createUnconfiguredRepository<IAssetRepository>('Asset Repository'),
    transactionRepository: createUnconfiguredRepository<ITransactionRepository>('Transaction Ledger'),
    auditLogRepository: createUnconfiguredRepository<IAuditLogRepository>('Audit Log'),
    settingsRepository: createUnconfiguredRepository<ISettingsRepository>('Settings Store'),
  };
}

export function isStorageConfigured(): boolean {
  if (activeContainer && !(activeContainer.assetRepository instanceof Proxy)) {
    return true;
  }
  return isGoogleSheetsConfigured();
}
