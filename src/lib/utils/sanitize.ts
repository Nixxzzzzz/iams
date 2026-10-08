/**
 * Google Sheets Formula Injection Sanitization
 * Source of Truth: docs/GOOGLE_SHEETS_INTEGRATION.md §4.3, docs/PROJECT_RULES.md §2.4
 *
 * Any user-supplied text starting with =, +, -, or @ could be interpreted
 * as a spreadsheet formula. Prepending a single quote (') neutralizes evaluation.
 */

const FORMULA_TRIGGER_CHARS = ['=', '+', '-', '@'];

export function sanitizeForSpreadsheet(value: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    return value;
  }

  const firstChar = value.charAt(0);
  if (FORMULA_TRIGGER_CHARS.includes(firstChar)) {
    return `'${value}`;
  }

  return value;
}

export function desanitizeFromSpreadsheet(value: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    return value;
  }

  if (value.startsWith("'") && value.length > 1 && FORMULA_TRIGGER_CHARS.includes(value.charAt(1))) {
    return value.slice(1);
  }

  return value;
}
