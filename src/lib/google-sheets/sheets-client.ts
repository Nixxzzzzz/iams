import * as jose from 'jose';
import { AppError, ERROR_CODES } from '@/lib/errors/app-error';
import { SheetCellValue } from './asset-row-mapper';

/**
 * Google Sheets API v4 REST Client
 * Source of Truth: docs/GOOGLE_SHEETS_INTEGRATION.md §1, §2, §4
 *
 * SERVER-ONLY: Enforces strict boundary.
 * Authenticates using Google Cloud Service Account JWT Assertion via 'jose'.
 * Zero extra client dependencies. Zero secrets exposed.
 */

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number; // Unix timestamp in seconds
}

export class GoogleSheetsClient {
  private config: GoogleSheetsConfig;
  private cachedToken: CachedToken | null = null;

  constructor(config: GoogleSheetsConfig) {
    if (!config.spreadsheetId || !config.clientEmail || !config.privateKey) {
      throw new AppError(
        ERROR_CODES.CONFIGURATION_ERROR,
        'Google Sheets client requires spreadsheetId, clientEmail, and privateKey.',
        500
      );
    }
    this.config = config;
  }

  /**
   * Generates or returns a valid OAuth 2.0 access token using a signed JWT assertion.
   */
  private async getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    // Reuse cached token if it has > 5 minutes of validity remaining
    if (this.cachedToken && this.cachedToken.expiresAt > now + 300) {
      return this.cachedToken.accessToken;
    }

    try {
      // Clean and normalize the PEM private key
      let privateKeyPem = this.config.privateKey.trim();
      // Handle escaped newlines in environment variable strings
      if (privateKeyPem.includes('\\n')) {
        privateKeyPem = privateKeyPem.replace(/\\n/g, '\n');
      }

      const importedKey = await jose.importPKCS8(privateKeyPem, 'RS256');

      const jwt = await new jose.SignJWT({
        scope: 'https://www.googleapis.com/auth/spreadsheets',
      })
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
        .setIssuer(this.config.clientEmail)
        .setAudience('https://oauth2.googleapis.com/token')
        .setIssuedAt(now)
        .setExpirationTime(now + 3600)
        .sign(importedKey);

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed with status ${tokenResponse.status}`);
      }

      const tokenData = (await tokenResponse.json()) as { access_token: string; expires_in: number };
      this.cachedToken = {
        accessToken: tokenData.access_token,
        expiresAt: now + (tokenData.expires_in || 3600),
      };

      return this.cachedToken.accessToken;
    } catch {
      throw new AppError(
        ERROR_CODES.CONFIGURATION_ERROR,
        'Failed to authenticate with Google Sheets Service Account. Verify service account credentials.',
        502
      );
    }
  }

  /**
   * Executes a Google Sheets API v4 request with exponential backoff on HTTP 429/503.
   */
  private async executeWithRetry<T>(
    endpoint: string,
    options: RequestInit,
    maxRetries = 3
  ): Promise<T> {
    const token = await this.getAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}${endpoint}`;

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 429 || response.status === 503) {
          if (attempt < maxRetries) {
            // Exponential backoff with jitter: 2^attempt * 500ms + jitter
            const delay = Math.pow(2, attempt) * 500 + Math.random() * 200;
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        if (!response.ok) {
          throw new Error(`Google Sheets API responded with status ${response.status}`);
        }

        return (await response.json()) as T;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt === maxRetries) break;
      }
    }

    throw new AppError(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Google Sheets storage operation could not be completed. Please try again later.',
      502,
      lastError ? { reason: lastError.message } : undefined
    );
  }

  /**
   * Reads cell values from a given range (e.g. 'Assets!A2:AD').
   */
  async getValues(range: string): Promise<SheetCellValue[][]> {
    const data = await this.executeWithRetry<{ values?: SheetCellValue[][] }>(
      `/values/${encodeURIComponent(range)}?majorDimension=ROWS`,
      { method: 'GET' }
    );
    return data.values ?? [];
  }

  /**
   * Reads multiple ranges in a single batch request.
   */
  async batchGet(ranges: string[]): Promise<Map<string, SheetCellValue[][]>> {
    const query = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join('&');
    const data = await this.executeWithRetry<{ valueRanges?: { range: string; values?: SheetCellValue[][] }[] }>(
      `/values:batchGet?${query}&majorDimension=ROWS`,
      { method: 'GET' }
    );

    const resultMap = new Map<string, SheetCellValue[][]>();
    if (data.valueRanges) {
      for (const item of data.valueRanges) {
        resultMap.set(item.range, item.values ?? []);
      }
    }
    return resultMap;
  }

  /**
   * Appends rows to the specified sheet.
   */
  async appendValues(
    range: string,
    values: SheetCellValue[][]
  ): Promise<{ updatedRange?: string; updatedRows?: number }> {
    const data = await this.executeWithRetry<{
      updates?: { updatedRange?: string; updatedRows?: number };
    }>(
      `/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        body: JSON.stringify({ values }),
      }
    );
    return data.updates ?? {};
  }

  /**
   * Overwrites values in a specified cell range.
   */
  async updateValues(
    range: string,
    values: SheetCellValue[][]
  ): Promise<void> {
    await this.executeWithRetry(
      `/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        body: JSON.stringify({ values }),
      }
    );
  }

  /**
   * Executes multiple batch updates in a single call.
   */
  async batchUpdate(
    updates: { range: string; values: SheetCellValue[][] }[]
  ): Promise<void> {
    await this.executeWithRetry(
      `/values:batchUpdate`,
      {
        method: 'POST',
        body: JSON.stringify({
          valueInputOption: 'USER_ENTERED',
          data: updates,
        }),
      }
    );
  }
}
