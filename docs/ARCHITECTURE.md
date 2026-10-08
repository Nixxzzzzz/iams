# System Architecture Specification
## Asset Management Portal

**Document Version:** 1.0.0  
**Status:** Approved Architectural Blueprint  
**System Paradigm:** Clean Modular Full-Stack Web Architecture  

---

## 1. High-Level Architectural Overview

The **Asset Management Portal** is architected according to **Clean Architecture** and **Domain-Driven Design (DDD)** principles. The system enforces strict separation of concerns, decoupling the Presentation Layer, Business Logic Layer, and Data Persistence Layer.

The initial persistence implementation leverages Google Sheets as an append-and-update tabular store, with Google Drive handling document assets. Crucially, **the application code never relies directly on Google Sheets primitives or SDK constructs inside business services or UI components**. All persistence operations are mediated through a strongly-typed **Repository Pattern**. This guarantees that the persistence mechanism can be seamlessly swapped to PostgreSQL (or another SQL database) in future iterations with zero breaking changes to client components, API routes, or domain logic.

```
+-----------------------------------------------------------------------------------+
|                                PRESENTATION LAYER                                 |
|          Next.js App Router (React 19 / TypeScript / Tailwind CSS / shadcn)       |
|          - Desktop Persistent Sidebar  - Mobile Responsive Layout - QR Scanner    |
+-----------------------------------------------------------------------------------+
                                         |
                                   HTTPS | JSON / Form-Data
                                         v
+-----------------------------------------------------------------------------------+
|                            APPLICATION / API LAYER                                |
|                        Next.js Server Handlers & Middleware                       |
|   +---------------------+   +---------------------+   +-----------------------+   |
|   | Authentication Auth |   | Request Validation  |   | RBAC Authorization    |   |
|   | (Google OAuth 2.0)  |   | (Zod Schemas)       |   | (Capability Matrix)   |   |
|   +---------------------+   +---------------------+   +-----------------------+   |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                             DOMAIN & BUSINESS LAYER                               |
|   - Asset Service         - Assignment Service    - Maintenance Service           |
|   - Request Service       - Audit Logger          - QR & Tag Generator            |
|   - Lifecycle State Machine                       - Depreciation Calculator       |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        DATA ACCESS / REPOSITORY ABSTRACTION                       |
|   <<interface>>           <<interface>>           <<interface>>                   |
|   IAssetRepository        IUserRepository         ITransactionRepository          |
|   IAssignmentRepository   IMaintenanceRepository  IAuditLogRepository             |
+-----------------------------------------------------------------------------------+
                     |                                           |
                     | (Current Implementation)                  | (Future Plug-in)
                     v                                           v
+-----------------------------------------+   +-------------------------------------+
|      GOOGLE SHEETS ADAPTER LAYER        |   |      POSTGRESQL ADAPTER LAYER       |
| - Sheets Client (Google APIs Node.js)   |   | - Prisma / Drizzle / Kysely ORM     |
| - Sheet Row Mapper & Serializer         |   | - Relational Migration Engine       |
| - Read Cache (Memory / In-Process LRU)  |   | - Acid Transactions & Connection    |
| - Request Queue & Rate-Limit Throttler  |   |   Pool                              |
+-----------------------------------------+   +-------------------------------------+
                     |
                     v
+-----------------------------------------------------------------------------------+
|                            EXTERNAL CLOUD SERVICES                                |
|       Google Sheets API (Spreadsheet)    |    Google Drive API (Doc Storage)      |
+-----------------------------------------------------------------------------------+
```

---

## 2. Architectural Layers & Responsibilities

### 2.1 Presentation Layer (Frontend)
- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Lucide React icons.
- **Role:** Pure presentation, client-side routing, accessibility handling, local UI state management, and field validation feedback.
- **Security Rule:** The frontend operates in an untrusted sandbox. It holds no API secrets, service account credentials, or direct network connections to Google Workspace. It interacts strictly with `/api/*` endpoints using secure, HTTP-only session cookies.

### 2.2 API & Middleware Layer (Edge & Node.js Runtime)
- **Role:** Request ingestion, session verification, rate limiting, and parameter parsing.
- **Middleware:** Intercepts every inbound request to verify the authenticated session, decode the user's role and permissions, and enforce route-level authorization.
- **Validation Pipeline:** Every request body, query parameter, and path variable is parsed against a strict **Zod** schema. If validation fails, the request is rejected with a standardized 400 Bad Request error before reaching domain services.

### 2.3 Domain & Business Logic Layer
- **Role:** Enforces all operational rules, state transitions, business invariants, and calculations.
- **Purity:** This layer contains zero HTTP-specific logic (no `NextRequest` or `NextResponse` dependencies) and zero persistence-specific logic. It receives pure domain models, executes business rules (e.g., verifying that an asset cannot be assigned if its current status is "In Maintenance"), and instructs repositories to persist state.
- **Audit Interceptor:** Every state mutation executed in the domain layer automatically fires an immutable audit record to the `IAuditLogRepository` and a ledger entry to the `ITransactionRepository`.

### 2.4 Data Access Layer (Repository Abstraction)
- **Role:** Provides strongly-typed CRUD and query abstractions for domain models.
- **Contracts:** Defined via TypeScript interfaces (`IAssetRepository`, etc.).
- **Swappability:** The domain and API layers depend exclusively on the interfaces, not the concrete classes. The active repository implementation is injected via a lightweight factory or dependency injection container:
  ```typescript
  // Example architectural contract (pseudo-code)
  export interface IAssetRepository {
    findById(id: string): Promise<Asset | null>;
    findByTag(assetTag: string): Promise<Asset | null>;
    findMany(filters: AssetFilterCriteria): Promise<PaginatedResult<Asset>>;
    create(asset: NewAssetInput): Promise<Asset>;
    update(id: string, updates: Partial<AssetUpdateInput>): Promise<Asset>;
    softDelete(id: string, reason: string): Promise<void>;
  }
  ```

### 2.5 Storage Adapter Layer (Google Sheets Implementation)
- **Adapter Logic:** Translates domain entity objects into rectangular row arrays (`(string | number | boolean | null)[]`) and vice versa.
- **Metadata Management:** Maintains a deterministic column index mapping (e.g., Column `A` = `asset_id`, Column `B` = `asset_tag`, etc.).
- **ID Generation:** Manages sequential natural keys (e.g., `AST-000001`, `TXN-000001`) atomically to avoid collisions.

---

## 3. Security Boundary & Authentication Architecture

```
User Browser                      Next.js API Gateway                Google OAuth / Google Cloud
    |                                     |                                       |
    | 1. Initiate Login                   |                                       |
    |------------------------------------>| 2. Redirect to Google Accounts        |
    |                                     |-------------------------------------->|
    | 3. User Consents & Authenticates    |                                       |
    |<----------------------------------------------------------------------------|
    |                                     |                                       |
    | 4. OAuth Callback with Auth Code    |                                       |
    |------------------------------------>| 5. Exchange Code for ID & User Info    |
    |                                     |-------------------------------------->|
    |                                     | 6. Return Google Profile              |
    |                                     |<--------------------------------------|
    |                                     |                                       |
    |                                     | 7. Match / Provision User in Sheet    |
    |                                     | 8. Sign Secure JWT Session Cookie     |
    | 9. Set-Cookie: (HTTP-Only, Secure)  |                                       |
    |<------------------------------------|                                       |
    |                                     |                                       |
    | 10. Authenticated API Call          |                                       |
    |     (Cookie automatically attached) |                                       |
    |------------------------------------>| 11. Verify Session & RBAC Capability  |
    |                                     | 12. Query Sheet via Service Account   |
    |                                     |-------------------------------------->|
    |                                     | 13. Return Sheet Data                 |
    |                                     |<--------------------------------------|
    | 14. Return JSON Response            |                                       |
    |<------------------------------------|                                       |
```

### Security Invariants:
1. **Google Service Account Isolation:** The private Google Service Account key (`client_email`, `private_key`) is stored exclusively in server-side environment variables (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`). It is never bundled into client-side code (`NEXT_PUBLIC_*`).
2. **Session Hardening:** User sessions use cryptographically signed tokens stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
3. **Role & Permission Guard:** Role claims inside the session token are matched against the granular permission matrix on every API request.
4. **Input Sanitization:** Formula injection defense: any user-submitted string beginning with `=, +, -, @` is escaped before writing to Google Sheets to prevent formula execution vulnerabilities in the spreadsheet.

---

## 4. Google Sheets API Constraints & Mitigation Strategy

Google Sheets API has strict operational limits:
- **Rate Limit:** 300 requests per minute per project; 60 requests per minute per user.
- **Latency:** Individual read/write calls often take 400ms – 1,200ms.
- **Concurrency:** Concurrent row insertions without locking can produce race conditions or duplicate IDs.

To achieve sub-second enterprise response times and 100% data reliability, the adapter layer incorporates the following engineering patterns:

### 4.1 In-Memory Read Caching with Time-To-Live (TTL)
- Low-churn entities (Categories, Departments, Locations, Vendors, Roles) are cached in-memory with a 5-minute TTL.
- Write operations to these entities immediately invalidate their respective cache keys.
- Fast-churn entities (Assets, Assignments, Check-in/out) utilize a short 15-to-30-second cache with stale-while-revalidate (SWR) semantics, significantly decreasing API call consumption.

### 4.2 Batch Operations (`batchGet` and `batchUpdate`)
- Rather than reading or writing single cells or rows consecutively, the adapter bundles bulk operations using `spreadsheets.values.batchGet` and `spreadsheets.values.batchUpdate`.
- Page requests fetch contiguous chunks of data (e.g., `Assets!A2:Z1000`).

### 4.3 Request Queue & Mutex Lock for ID Generation
- A server-side sequential queue with a mutex lock ensures that ID increments (e.g., generating `AST-000102` followed by `AST-000103`) execute atomically without race conditions during concurrent asset creation.

---

## 5. Storage Migration Path: Google Sheets to PostgreSQL

To execute a seamless future migration to PostgreSQL:
1. **Zero Frontend Code Changes:** The frontend consumes REST/RPC endpoints like `GET /api/assets` and `POST /api/assets/checkout`. It does not know or care how data is stored.
2. **Repository Swap:**
   - Develop `PostgresAssetRepository`, `PostgresUserRepository`, etc., implementing the exact same TypeScript interfaces (`IAssetRepository`).
   - Update the Repository Factory configuration to load the PostgreSQL adapters instead of the Google Sheets adapters.
3. **ETL Migration Utility:** A one-time script reads all rows from the Google Spreadsheet, validates them against Zod domain schemas, and writes them into PostgreSQL relational tables with complete foreign-key integrity.

---

## 6. Observability, Logging & Error Handling

- **Standardized Error Envelope:** All API responses adhere to a consistent contract:
  ```json
  {
    "success": false,
    "error": {
      "code": "ASSET_ALREADY_ASSIGNED",
      "message": "Asset AST-000128 is currently assigned to user USR-000042 and must be returned before reassignment.",
      "details": []
    }
  }
  ```
- **Structured Logging:** Server logs record request ID, duration, caller user ID, HTTP method, status code, and any adapter latency metrics.
