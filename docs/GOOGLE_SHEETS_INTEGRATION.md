# Google Sheets & Drive Integration Specification
## Asset Management Portal

**Document Version:** 1.0.0  
**Status:** Approved Architectural Blueprint  
**Primary Data Store (Phase 1):** Google Sheets API v4  
**Media & Document Store:** Google Drive API v3  

---

## 1. Architectural Strategy & Trust Boundaries

The **Asset Management Portal** leverages Google Sheets as an accessible, cost-effective initial tabular data store and Google Drive for document attachments. 

However, **Google Sheets is never accessed directly by client-side browser applications**. The system enforces a strict security perimeter where the Next.js API server acts as the authoritative intermediary:

```
[Untrusted Client Browser]
         |
         | HTTPS Request (with secure HTTP-only session cookie)
         v
[Next.js Server API Gateway]
  - Session verification & RBAC authorization
  - Zod payload validation
  - Formula injection sanitization
  - In-memory cache evaluation
         |
         | Google APIs Node.js Client (Authenticated via Server Service Account)
         v
[Google Cloud Platform APIs]
  - Google Sheets API v4 (Private corporate spreadsheet)
  - Google Drive API v3 (Private corporate storage folder)
```

---

## 2. Authentication & Credential Management

### 2.1 Service Account Configuration
- Access to the underlying Google Spreadsheet and Google Drive storage folder is granted exclusively to a dedicated **Google Cloud Service Account** (e.g., `asset-portal-daemon@organization-assets.iam.gserviceaccount.com`).
- The private Google Spreadsheet and the Google Drive document root folder are shared directly with the Service Account email address with **Editor** permissions.
- The credentials (`GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`) are stored in server-side environment variables on Vercel/Node.js runtime.
- **Strict Invariant:** These variables must never be prefixed with `NEXT_PUBLIC_` or included in client webpack bundles.

### 2.2 Scopes Required
Only minimal least-privilege scopes are requested during server initialization:
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/drive.file` (limits Drive access strictly to files created or explicitly opened by the application)

---

## 3. Final Workbook Structure & Exact Tab Header Catalog

The primary Google Spreadsheet consists of 14 dedicated tabs. **Row 1 of every sheet contains the exact column headers in the precise order specified below. No title banners, merged cells, or decorative rows are permitted.**

| Sheet Tab Name | Primary Key | Total Columns | Purpose & Row Model |
|---|---|:---:|---|
| `Assets` | `asset_id` | 30 | Master asset inventory registry (1 row per asset). |
| `Users` | `user_id` | 12 | Employee & admin directory, roles, auth identifiers (1 row per user). |
| `Categories` | `category_id` | 10 | Equipment taxonomy catalog, default life, custom specs template (1 row per category). |
| `Departments` | `department_id` | 9 | Organizational cost centers & departmental custody holders (1 row per department). |
| `Locations` | `location_id` | 9 | Hierarchical physical locations: Site -> Building -> Floor -> Room -> Storage Area (1 row per location). |
| `Assignments` | `assignment_id` | 17 | Custody contracts for User OR Department (1 row per assignment). |
| `Transactions` | `transaction_id` | 10 | **Append-only operational history ledger** (1 row per event, immutable). |
| `Maintenance` | `maintenance_id` | 19 | Repair tickets, preventive maintenance, vendor RMAs, costs (1 row per ticket). |
| `Requests` | `request_id` | 18 | Multi-stage hardware requisition workflow (1 row per request). |
| `Vendors` | `vendor_id` | 13 | Suppliers, repair contractors, warranty contacts (1 row per vendor). |
| `Documents` | `document_id` | 10 | File attachments linked to Google Drive File IDs (1 row per document). |
| `Notifications` | `notification_id`| 9 | In-app user notifications queue (1 row per alert). |
| `Audit Logs` | `audit_id` | 11 | **Append-only security and administrative audit log** (1 row per audit event, immutable). |
| `Settings` | `key` | 8 | Organization parameters, sequence counters, OAuth domain policies (1 row per key). |

### 3.1 Exact Row 1 Column Headers per Sheet

1. **`Assets`**  
   `asset_id`, `asset_tag`, `name`, `category_id`, `subcategory`, `brand`, `model`, `serial_number`, `description`, `status`, `condition`, `custody_type`, `department_id`, `location_id`, `current_user_id`, `current_assignment_id`, `purchase_date`, `purchase_cost`, `useful_life_months`, `current_value`, `currency`, `vendor_id`, `invoice_reference`, `warranty_start`, `warranty_expiry`, `custom_fields`, `is_archived`, `created_at`, `updated_at`, `archived_at`

2. **`Users`**  
   `user_id`, `email`, `first_name`, `last_name`, `phone`, `role`, `department_id`, `job_title`, `status`, `auth_provider_id`, `created_at`, `updated_at`

3. **`Categories`**  
   `category_id`, `name`, `code`, `description`, `parent_category_id`, `default_useful_life_months`, `spec_schema_json`, `status`, `created_at`, `updated_at`

4. **`Departments`**  
   `department_id`, `name`, `code`, `description`, `manager_user_id`, `budget_code`, `status`, `created_at`, `updated_at`

5. **`Locations`**  
   `location_id`, `name`, `location_type`, `parent_location_id`, `code`, `address`, `status`, `created_at`, `updated_at`

6. **`Assignments`**  
   `assignment_id`, `asset_id`, `custody_type`, `user_id`, `department_id`, `assignment_type`, `assigned_at`, `expected_return_at`, `returned_at`, `assigned_condition`, `returned_condition`, `assigned_by`, `returned_by`, `status`, `notes`, `created_at`, `updated_at`

7. **`Transactions`**  
   `transaction_id`, `asset_id`, `transaction_type`, `timestamp`, `performed_by`, `previous_state`, `new_state`, `related_assignment_id`, `notes`, `metadata`

8. **`Maintenance`**  
   `maintenance_id`, `asset_id`, `maintenance_type`, `issue`, `description`, `priority`, `status`, `reported_by`, `assigned_to`, `vendor_id`, `reported_at`, `started_at`, `completed_at`, `estimated_cost`, `actual_cost`, `resolution`, `notes`, `created_at`, `updated_at`

9. **`Requests`**  
   `request_id`, `request_number`, `requester_user_id`, `department_id`, `category_id`, `requested_asset_id`, `reason`, `priority`, `status`, `dept_approver_user_id`, `dept_approved_at`, `asset_approver_user_id`, `asset_approved_at`, `rejection_reason`, `fulfilled_asset_id`, `fulfilled_assignment_id`, `created_at`, `updated_at`

10. **`Vendors`**  
    `vendor_id`, `name`, `vendor_type`, `contact_name`, `email`, `phone`, `address`, `website`, `tax_identifier`, `notes`, `status`, `created_at`, `updated_at`

11. **`Documents`**  
    `document_id`, `asset_id`, `document_type`, `file_name`, `drive_file_id`, `mime_type`, `file_size_bytes`, `uploaded_by`, `uploaded_at`, `description`

12. **`Notifications`**  
    `notification_id`, `user_id`, `type`, `title`, `message`, `link_url`, `is_read`, `read_at`, `created_at`

13. **`Audit Logs`**  
    `audit_id`, `timestamp`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `before_state`, `after_state`, `ip_address`, `user_agent`, `session_id`

14. **`Settings`**  
    `key`, `value`, `value_type`, `category`, `description`, `is_system`, `updated_by`, `updated_at`

---

## 4. Google Sheets API Constraints & Mitigation Engineering

Google Sheets API has fundamental constraints that must be handled gracefully in software:

### 4.1 Rate Limiting & Quota Management
- **Google Quotas:** 300 requests per minute per project; 60 requests per minute per user.
- **Engineered Mitigation:**
  1. **In-Memory Cache (LRU with TTL):** Low-turnover sheets (`Categories`, `Departments`, `Locations`, `Vendors`, `Settings`) are held in server memory for 5 minutes. Writes invalidate the cache key immediately.
  2. **Short-Window Query Caching:** Asset searches and inventory lists use a 15-second TTL cache with Stale-While-Revalidate (SWR) logic to collapse identical reads across users.
  3. **Batch Operations:** All bulk reading and updating uses `spreadsheets.values.batchGet` and `spreadsheets.values.batchUpdate` instead of iterative single-row operations.
  4. **Exponential Backoff:** All API calls wrap Google client invocations in a retry loop handling HTTP 429 (Too Many Requests) and 503 (Service Unavailable) using jittered backoff (`delay = 2^attempt * 500ms + random(100ms)`).

### 4.2 Concurrency & Atomic ID Generation
- Because Google Sheets lacks ACID row-locking transactions, concurrent asset creations could compute conflicting sequential IDs (e.g., two processes generating `AST-000100` at the same instant).
- **Engineered Mitigation:**
  - A server-side mutex lock (`async-mutex`) ensures that sequence reads and increments in the `Settings` sheet execute in an isolated, atomic queue.
  - All row insertions append to the bottom of the target tab using `spreadsheets.values.append` with `insertDataOption: 'INSERT_ROWS'`, which Google handles sequentially.

### 4.3 Data Serialization & Schema Sanitization
- **Spreadsheet Formula Injection Defense:** Any incoming string starting with `=`, `+`, `-`, or `@` is prepended with a single quote (`'`) before persisting, neutralizing formula evaluation.
- **Type Coercion:**
  - Strings: Preserved as raw text.
  - Dates: Standardized as ISO-8601 strings (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`).
  - Booleans: Serialized as `TRUE` or `FALSE`.
  - Empty Values: Converted to empty string `""` on write; hydrated as `null` in domain objects.
  - Numbers: Parsed to fixed floats or integers; null if invalid.

---

## 5. Google Drive Integration for Document Storage

Asset invoices, warranty contracts, hardware spec sheets, and disposal certificates are stored in Google Drive:
1. **Upload Pipeline:** 
   - Frontend uploads file to Next.js API route (`POST /api/documents/upload`) via `multipart/form-data`.
   - Next.js server validates MIME type (PDF, PNG, JPG, WEBP) and file size (max 15MB).
   - Server streams file into a designated private Google Drive folder using `drive.files.create`.
2. **Access Control:**
   - Files are stored privately in Google Drive (not shared publicly).
   - When an authenticated user requests to view or download a document, the server generates a time-limited signed URL or streams the file proxy through `/api/documents/[id]/download` after verifying user authorization.

---

## 6. Swappable Repository Interface (PostgreSQL Migration Guarantee)

The application architecture isolates all Google Sheets SDK calls within concrete repository implementations. Below is the structural contract demonstrating how domain services interact with repositories:

```typescript
// Shared domain repository interface
export interface IAssetRepository {
  findById(assetId: string): Promise<Asset | null>;
  findByTag(assetTag: string): Promise<Asset | null>;
  findMany(filters: AssetFilterQuery): Promise<PaginatedResult<Asset>>;
  create(asset: CreateAssetDTO): Promise<Asset>;
  update(assetId: string, updates: UpdateAssetDTO): Promise<Asset>;
  archive(assetId: string, reason: string): Promise<void>;
}

// Google Sheets implementation (Phase 1)
export class GoogleSheetsAssetRepository implements IAssetRepository {
  constructor(private sheetsClient: GoogleSpreadsheetClient) {}
  // Reads and writes rows in the 'Assets' tab
}

// PostgreSQL implementation (Phase 2)
export class PostgresAssetRepository implements IAssetRepository {
  constructor(private db: DatabaseClient) {}
  // Executes SELECT/INSERT/UPDATE queries against PostgreSQL
}
```

The domain service requests an `IAssetRepository` instance from a dependency factory. Swapping from Google Sheets to PostgreSQL requires updating the factory provider without changing a single line of business logic or UI code.
