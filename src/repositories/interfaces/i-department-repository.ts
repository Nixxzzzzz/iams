import { Department } from '@/domain/types/department';
import { PaginationParams, PaginatedResult } from './common';

export type NewDepartmentInput = Omit<Department, 'created_at' | 'updated_at'>;
export type DepartmentUpdateInput = Partial<Omit<Department, 'department_id' | 'created_at'>>;

export interface IDepartmentRepository {
  findById(departmentId: string): Promise<Department | null>;
  findByCode(code: string): Promise<Department | null>;
  findMany(filters?: PaginationParams): Promise<PaginatedResult<Department>>;
  create(dept: NewDepartmentInput): Promise<Department>;
  update(departmentId: string, updates: DepartmentUpdateInput): Promise<Department>;
}
