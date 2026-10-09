import { SystemSetting } from '@/domain/types/settings';
import { ISettingsRepository } from '@/repositories/interfaces/i-settings-repository';
import { GoogleSheetsClient } from '@/lib/google-sheets/sheets-client';
import { SheetCellValue } from '@/lib/google-sheets/asset-row-mapper';
import { sanitizeForSpreadsheet, desanitizeFromSpreadsheet } from '@/lib/utils/sanitize';
import { Mutex } from '@/lib/utils/mutex';

/**
 * Google Sheets System Settings & Atomic Sequence Repository Adapter
 * Source of Truth: docs/DATABASE_DESIGN.md §3.14, docs/GOOGLE_SHEETS_INTEGRATION.md §4.2
 */

export class GoogleSheetsSettingsRepository implements ISettingsRepository {
  private client: GoogleSheetsClient;
  private writeMutex = new Mutex();

  constructor(client: GoogleSheetsClient) {
    this.client = client;
  }

  private mapRowToSetting(row: SheetCellValue[]): SystemSetting {
    const getStr = (index: number): string | null => {
      const raw = row[index];
      if (raw === undefined || raw === null || raw === '') return null;
      return desanitizeFromSpreadsheet(String(raw).trim());
    };

    return {
      key: getStr(0) ?? '',
      value: getStr(1) ?? '',
      value_type: (getStr(2) ?? 'STRING') as SystemSetting['value_type'],
      category: (getStr(3) ?? 'GENERAL') as SystemSetting['category'],
      description: getStr(4),
      is_system: String(row[5] ?? '').trim().toUpperCase() === 'TRUE',
      updated_by: getStr(6) ?? 'SYSTEM',
      updated_at: getStr(7) ?? new Date().toISOString(),
    };
  }

  private mapSettingToRow(setting: SystemSetting): SheetCellValue[] {
    return [
      setting.key,
      sanitizeForSpreadsheet(setting.value),
      setting.value_type,
      setting.category,
      setting.description ? sanitizeForSpreadsheet(setting.description) : '',
      setting.is_system ? 'TRUE' : 'FALSE',
      sanitizeForSpreadsheet(setting.updated_by),
      setting.updated_at,
    ];
  }

  private async fetchAllSettings(): Promise<{ rows: SheetCellValue[][]; settings: SystemSetting[] }> {
    const rawRows = await this.client.getValues('Settings!A2:H');
    const settings = rawRows
      .filter((r) => r.length > 0 && r[0])
      .map((row) => this.mapRowToSetting(row));
    return { rows: rawRows, settings };
  }

  async get(key: string): Promise<SystemSetting | null> {
    const { settings } = await this.fetchAllSettings();
    return settings.find((s) => s.key === key) ?? null;
  }

  async getValue(key: string, defaultValue = ''): Promise<string> {
    const setting = await this.get(key);
    return setting ? setting.value : defaultValue;
  }

  async getAll(): Promise<SystemSetting[]> {
    const { settings } = await this.fetchAllSettings();
    return settings;
  }

  async set(setting: SystemSetting): Promise<SystemSetting> {
    return this.writeMutex.runExclusive(async () => {
      const { settings } = await this.fetchAllSettings();
      const index = settings.findIndex((s) => s.key === setting.key);
      const row = this.mapSettingToRow(setting);

      if (index === -1) {
        await this.client.appendValues('Settings!A:H', [row]);
      } else {
        const rowNumber = index + 2;
        await this.client.updateValues(`Settings!A${rowNumber}:H${rowNumber}`, [row]);
      }

      return setting;
    });
  }

  async nextSequence(prefixKey: string): Promise<number> {
    return this.writeMutex.runExclusive(async () => {
      const sequenceKey = `${prefixKey.toUpperCase()}_ID_SEQUENCE`;
      const { settings } = await this.fetchAllSettings();
      const index = settings.findIndex((s) => s.key === sequenceKey);

      let currentSeq = 0;
      if (index !== -1) {
        const parsed = parseInt(settings[index].value, 10);
        if (!isNaN(parsed)) {
          currentSeq = parsed;
        }
      }

      const nextSeq = currentSeq + 1;
      const updatedSetting: SystemSetting = {
        key: sequenceKey,
        value: String(nextSeq),
        value_type: 'NUMBER',
        category: 'SEQUENCE',
        description: `Sequential counter for ${prefixKey}`,
        is_system: true,
        updated_by: 'SYSTEM',
        updated_at: new Date().toISOString(),
      };

      const row = this.mapSettingToRow(updatedSetting);
      if (index === -1) {
        await this.client.appendValues('Settings!A:H', [row]);
      } else {
        const rowNumber = index + 2;
        await this.client.updateValues(`Settings!A${rowNumber}:H${rowNumber}`, [row]);
      }

      return nextSeq;
    });
  }
}
