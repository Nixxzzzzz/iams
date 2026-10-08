import {
  AssetStatus,
  AssetCondition,
  TransactionType,
  UserRole,
  UserStatus,
  AssignmentStatus,
  MaintenanceType,
  MaintenanceStatus,
  RequestStatus,
  RequestPriority,
  DocumentType,
  NotificationType,
  DepreciationMethod,
} from "../enums";

export interface Asset {
  asset_id: string;
  asset_tag: string;
  name: string;
  category_id: string;
  subcategory_id?: string | null;
  brand: string;
  model?: string | null;
  serial_number: string;
  description?: string | null;
  status: AssetStatus;
  condition: AssetCondition;
  department_id?: string | null;
  location_id: string;
  assigned_user_id?: string | null;
  purchase_date?: string | null; // ISO 8601 (YYYY-MM-DD)
  purchase_cost?: number | null;
  current_value?: number | null;
  vendor_id?: string | null;
  invoice_reference?: string | null;
  warranty_expiry?: string | null; // ISO 8601 (YYYY-MM-DD)
  qr_code_url?: string | null;
  created_at: string; // ISO 8601 UTC
  updated_at: string; // ISO 8601 UTC
  is_archived: boolean;
}

export interface Transaction {
  transaction_id: string;
  asset_id: string;
  transaction_type: TransactionType;
  from_user_id?: string | null;
  to_user_id?: string | null;
  from_location_id?: string | null;
  to_location_id?: string | null;
  from_status: AssetStatus;
  to_status: AssetStatus;
  condition_at_event: AssetCondition;
  action_by_user_id: string;
  timestamp: string; // ISO 8601 UTC
  notes?: string | null;
}

export interface Assignment {
  assignment_id: string;
  asset_id: string;
  user_id?: string | null;
  department_id?: string | null;
  assigned_by: string;
  assigned_date: string; // ISO 8601 UTC
  expected_return_date?: string | null; // ISO 8601 (YYYY-MM-DD)
  actual_return_date?: string | null; // ISO 8601 UTC
  status: AssignmentStatus;
  initial_condition: AssetCondition;
  return_condition?: AssetCondition | null;
  custody_agreement_signed: boolean;
  notes?: string | null;
}

export interface MaintenanceTicket {
  maintenance_id: string;
  asset_id: string;
  maintenance_type: MaintenanceType;
  vendor_id?: string | null;
  title: string;
  description: string;
  status: MaintenanceStatus;
  start_date: string; // ISO 8601 (YYYY-MM-DD)
  completion_date?: string | null; // ISO 8601 (YYYY-MM-DD)
  cost?: number | null;
  performed_by?: string | null;
  invoice_reference?: string | null;
  created_by: string;
  created_at: string; // ISO 8601 UTC
}

export interface AssetRequest {
  request_id: string;
  request_number: string;
  user_id: string;
  department_id: string;
  category_id: string;
  preferred_model?: string | null;
  reason: string;
  priority: RequestPriority;
  status: RequestStatus;
  dept_approver_id?: string | null;
  dept_approved_at?: string | null;
  asset_approver_id?: string | null;
  asset_approved_at?: string | null;
  rejection_reason?: string | null;
  allocated_asset_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: UserRole;
  department_id?: string | null;
  job_title?: string | null;
  phone?: string | null;
  status: UserStatus;
  google_sub_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  category_id: string;
  name: string;
  code: string;
  description?: string | null;
  parent_category_id?: string | null;
  depreciation_method: DepreciationMethod;
  useful_life_months?: number | null;
  is_active: boolean;
}

export interface Department {
  department_id: string;
  name: string;
  code: string;
  manager_user_id?: string | null;
  budget_code?: string | null;
  is_active: boolean;
}

export interface Location {
  location_id: string;
  name: string;
  site: string;
  building?: string | null;
  floor?: string | null;
  room_number?: string | null;
  parent_location_id?: string | null;
  is_active: boolean;
}

export interface Vendor {
  vendor_id: string;
  name: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  tax_identifier?: string | null;
  notes?: string | null;
  is_active: boolean;
}

export interface DocumentRecord {
  document_id: string;
  asset_id: string;
  title: string;
  document_type: DocumentType;
  drive_file_id?: string | null;
  mime_type: string;
  file_size_bytes?: number | null;
  uploaded_by: string;
  uploaded_at: string;
}

export interface NotificationRecord {
  notification_id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link_url?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  log_id: string;
  timestamp: string;
  actor_user_id: string;
  actor_email: string;
  action: string;
  entity_name: string;
  entity_id: string;
  before_payload_json?: string | null;
  after_payload_json?: string | null;
  client_ip?: string | null;
  user_agent?: string | null;
}

export interface SettingRecord {
  key: string;
  value: string;
  category: string;
  updated_by?: string | null;
  updated_at: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
