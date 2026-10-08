/**
 * Document Metadata Entity
 * Source of Truth: docs/DATABASE_DESIGN.md §3.11, docs/GOOGLE_SHEETS_INTEGRATION.md §5
 */

export const DOCUMENT_TYPES = {
  INVOICE: 'INVOICE',
  WARRANTY: 'WARRANTY',
  MANUAL: 'MANUAL',
  PHOTO: 'PHOTO',
  DISPOSAL_CERTIFICATE: 'DISPOSAL_CERTIFICATE',
  OTHER: 'OTHER',
} as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

export interface DocumentMetadata {
  document_id: string; // DOC-000001
  asset_id?: string | null; // AST-000001
  document_type: DocumentType;
  file_name: string;
  drive_file_id: string;
  mime_type: string;
  file_size_bytes: number;
  uploaded_by: string; // USR-000001
  uploaded_at: string;
  description?: string | null;
}
