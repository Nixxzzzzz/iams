import { User, UserRole, UserStatus } from '@/domain/types/user';
import { PaginationParams, PaginatedResult } from './common';

export interface UserFilterCriteria extends PaginationParams {
  role?: UserRole;
  department_id?: string;
  status?: UserStatus;
}

export type NewUserInput = Omit<User, 'created_at' | 'updated_at'>;
export type UserUpdateInput = Partial<Omit<User, 'user_id' | 'email' | 'created_at'>>;

export interface IUserRepository {
  findById(userId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByAuthProviderId(authProviderId: string): Promise<User | null>;
  findMany(filters?: UserFilterCriteria): Promise<PaginatedResult<User>>;
  create(user: NewUserInput): Promise<User>;
  update(userId: string, updates: UserUpdateInput): Promise<User>;
}
