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

## 3. Initial Workbook Structure & Tab Catalog

The primary Google Spreadsheet consists of 14 dedicated tabs:

| Sheet Tab Name | Initial Primary Key | Row Model | Purpose & Data Volume Estimate |
|---|---|---|---|
| `Assets` | `asset_id` | 1 row per physical/digital asset | Master registry (1,000 - 50,000 rows). |
| `Users` | `user_id` | 1 row per organizational user | Employee & admin directory (50 - 5,000 rows). |
| `Categories` | `category_id` | 1 row per asset category | Taxonomy catalog (20 - 100 rows). Cached. |
| `Departments` | `department_id` | 1 row per department/cost center | Org unit hierarchy (10 - 50 rows). Cached. |
| `Locations` | `location_id` | 1 row per physical room/rack | Physical site layout (20 - 200 rows). Cached. |
| `Assignments` | `assignment_id` | 1 row per custody agreement | Active and historical custody links. |
| `Transactions` | `transaction_id` | **Append-only ledger** | Every state/custody event. High volume. |
| `Maintenance` | `maintenance_id` | 1 row per service ticket | Repair, RMA, and scheduled PM tickets. |
| `Requests` | `request_id` | 1 row per equipment request | Multi-stage requisition workflow tickets. |
| `Vendors` | `vendor_id` | 1 row per supplier/vendor | Vendor directory & SLA records. Cached. |
| `Documents` | `document_id` | 1 row per attached document | Metadata linked to Google Drive File IDs. |
| `Notifications` | `notification_id`| 1 row per user alert | In-app notification queue. |
| `Audit Logs` | `log_id` | **Append-only ledger** | Security, auth, and state mutation audits. |
| `Settings` | `key` | 1 row per system key-value pair | Org parameters, sequence counters. Cached. |

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
