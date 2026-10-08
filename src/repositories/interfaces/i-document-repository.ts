import { DocumentMetadata, DocumentType } from '@/domain/types/document';
import { PaginationParams, PaginatedResult } from './common';

export interface DocumentFilterCriteria extends PaginationParams {
  asset_id?: string;
  document_type?: DocumentType;
}

export type NewDocumentInput = Omit<DocumentMetadata, 'uploaded_at'>;

export interface IDocumentRepository {
  findById(documentId: string): Promise<DocumentMetadata | null>;
  findMany(filters?: DocumentFilterCriteria): Promise<PaginatedResult<DocumentMetadata>>;
  create(doc: NewDocumentInput): Promise<DocumentMetadata>;
  delete(documentId: string): Promise<void>;
}
