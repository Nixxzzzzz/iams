import { AssetRequest, RequestStatus, RequestPriority } from '@/domain/types/request';
import { PaginationParams, PaginatedResult } from './common';

export interface RequestFilterCriteria extends PaginationParams {
  requester_user_id?: string;
  department_id?: string;
  category_id?: string;
  status?: RequestStatus;
  priority?: RequestPriority;
}

export type NewRequestInput = Omit<AssetRequest, 'created_at' | 'updated_at'>;
export type RequestUpdateInput = Partial<Omit<AssetRequest, 'request_id' | 'request_number' | 'created_at'>>;

export interface IRequestRepository {
  findById(requestId: string): Promise<AssetRequest | null>;
  findMany(filters?: RequestFilterCriteria): Promise<PaginatedResult<AssetRequest>>;
  create(request: NewRequestInput): Promise<AssetRequest>;
  update(requestId: string, updates: RequestUpdateInput): Promise<AssetRequest>;
}
