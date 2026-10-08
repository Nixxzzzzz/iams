import { Location, LocationType } from '@/domain/types/location';
import { PaginationParams, PaginatedResult } from './common';

export interface LocationFilterCriteria extends PaginationParams {
  location_type?: LocationType;
  parent_location_id?: string;
}

export type NewLocationInput = Omit<Location, 'created_at' | 'updated_at'>;
export type LocationUpdateInput = Partial<Omit<Location, 'location_id' | 'created_at'>>;

export interface ILocationRepository {
  findById(locationId: string): Promise<Location | null>;
  findMany(filters?: LocationFilterCriteria): Promise<PaginatedResult<Location>>;
  create(loc: NewLocationInput): Promise<Location>;
  update(locationId: string, updates: LocationUpdateInput): Promise<Location>;
}
