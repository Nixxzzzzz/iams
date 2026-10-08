import { SystemSetting } from '@/domain/types/settings';

/**
 * System Settings Repository Interface
 * Source of Truth: docs/DATABASE_DESIGN.md §3.14
 */

export interface ISettingsRepository {
  get(key: string): Promise<SystemSetting | null>;
  getValue(key: string, defaultValue?: string): Promise<string>;
  getAll(): Promise<SystemSetting[]>;
  set(setting: SystemSetting): Promise<SystemSetting>;
  /**
   * Atomically increments and retrieves a sequence number for natural key generation.
   */
  nextSequence(prefixKey: string): Promise<number>;
}
