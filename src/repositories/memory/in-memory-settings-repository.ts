import { SystemSetting } from '@/domain/types/settings';
import { ISettingsRepository } from '@/repositories/interfaces/i-settings-repository';

/**
 * In-Memory Settings & Sequence Repository Test Double
 * Source of Truth: docs/DATABASE_DESIGN.md §3.14
 */

export class InMemorySettingsRepository implements ISettingsRepository {
  private settings = new Map<string, SystemSetting>();
  private sequences = new Map<string, number>();

  constructor(initialSettings: SystemSetting[] = []) {
    for (const s of initialSettings) {
      this.settings.set(s.key, { ...s });
    }
  }

  clear(): void {
    this.settings.clear();
    this.sequences.clear();
  }

  async get(key: string): Promise<SystemSetting | null> {
    const match = this.settings.get(key);
    return match ? { ...match } : null;
  }

  async getValue(key: string, defaultValue = ''): Promise<string> {
    const setting = this.settings.get(key);
    return setting ? setting.value : defaultValue;
  }

  async getAll(): Promise<SystemSetting[]> {
    return Array.from(this.settings.values()).map((s) => ({ ...s }));
  }

  async set(setting: SystemSetting): Promise<SystemSetting> {
    const copy = { ...setting, updated_at: new Date().toISOString() };
    this.settings.set(setting.key, copy);
    return { ...copy };
  }

  async nextSequence(prefixKey: string): Promise<number> {
    const current = this.sequences.get(prefixKey) ?? 0;
    const next = current + 1;
    this.sequences.set(prefixKey, next);
    return next;
  }
}
