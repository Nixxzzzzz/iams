import { Assignment, AssignmentStatus } from '@/domain/types/assignment';
import { PaginationParams, PaginatedResult } from './common';

export interface AssignmentFilterCriteria extends PaginationParams {
  asset_id?: string;
  user_id?: string;
  department_id?: string;
  status?: AssignmentStatus;
}

export type NewAssignmentInput = Omit<Assignment, 'created_at' | 'updated_at'>;
export type AssignmentUpdateInput = Partial<Omit<Assignment, 'assignment_id' | 'created_at'>>;

export interface IAssignmentRepository {
  findById(assignmentId: string): Promise<Assignment | null>;
  findActiveByAssetId(assetId: string): Promise<Assignment | null>;
  findMany(filters?: AssignmentFilterCriteria): Promise<PaginatedResult<Assignment>>;
  create(assignment: NewAssignmentInput): Promise<Assignment>;
  update(assignmentId: string, updates: AssignmentUpdateInput): Promise<Assignment>;
}
