# User Roles, Permissions & Authorization Specification
## Asset Management Portal

**Document Version:** 2.0.0
**Status:** Approved & Finalized Information Architecture & Authorization Contract
**Access Control Model:** Granular Role-Based Access Control (RBAC) with Contextual Data Scoping

---

## 1. Approved System Roles & Boundary Contracts

The system enforces access control across exactly **six approved initial roles**. No additional roles are active in V1. (Future roles such as *IT Support Contractor* or *External Financial Auditor* may be created in subsequent phases through granular permission tokens without schema changes).

```
+----------------------------------------------------------------------------------------------------+
|                                    ROLE HIERARCHY & BOUNDARIES                                     |
+----------------------------------------------------------------------------------------------------+
|  SUPER_ADMIN          - System-wide authority, security policies, system configuration             |
|  ADMIN                - Global operational management, master data, user & department operations   |
|  ASSET_MANAGER        - Organization-wide physical & digital asset inventory, custody, maintenance |
|  DEPARTMENT_MANAGER   - Department-scoped asset oversight, requisition approvals, team custody    |
|  STAFF                - Self-service custody, personal asset requests, defect issue reporting      |
|  VIEWER               - Read-only audit observer, authorized operational & inventory views         |
+----------------------------------------------------------------------------------------------------+
```

### 1.1 Role Definitions & Invariant Safeguards

#### 1. SUPER_ADMIN (System & Security Administrator)
- **Authority:** Full global authority across all modules, configurations, users, and security settings.
- **Can:**
  - Manage all users, provision administrative roles, and assign permissions.
  - Manage organization profile, localization, currency, and system settings.
  - Configure Google OAuth authentication policy (`ALLOWED_EMAIL_DOMAINS`).
  - Manage assets, assignments, maintenance, requests, departments, locations, vendors, and categories.
  - Execute end-of-life actions: soft-archiving, retirement, and disposal certification.
  - View comprehensive reports, export system data, and inspect immutable audit logs.
  - Configure notification triggers and sequence counters.
- **Cannot:**
  - **Immutable Ledger Invariant:** SUPER_ADMIN cannot edit, modify, truncate, or delete historical rows in `Transactions` or `Audit Logs` through normal application interfaces.
  - Bypass server-side formula sanitization or foreign-key referential integrity checks.

#### 2. ADMIN (Operational Administrator)
- **Authority:** Organization-wide operational manager.
- **Can:**
  - Manage assets, assignments, maintenance, and requisitions globally.
  - Manage organizational master data: categories, locations, vendors, departments.
  - Provision standard users (`STAFF`, `VIEWER`, `DEPARTMENT_MANAGER`, `ASSET_MANAGER`).
  - View operational reports, export data, and review audit logs.
  - Manage non-security operational settings.
- **Cannot:**
  - Modify SUPER_ADMIN accounts, roles, or security credentials.
  - Modify authentication policies (`ALLOWED_EMAIL_DOMAINS`) or core security keys.
  - Alter or bypass immutable audit and transaction ledgers.
  - Override system safety rules or hard system invariants.

#### 3. ASSET_MANAGER (Inventory & Logistics Custodian)
- **Authority:** Day-to-day custodian of organizational inventory.
- **Can:**
  - Create, edit, and catalog assets; print and export QR tags.
  - Execute custody assignments, short-term checkouts, returns, and intake inspections.
  - Open, manage, assign, and close maintenance repair tickets; liaise with vendors.
  - Process and fulfill approved asset requests; allocate inventory.
  - Upload and link asset documentation (invoices, manuals, warranty cards).
  - View full asset lifecycle histories and operational inventory reports.
- **Cannot:**
  - Modify authentication policies or security settings.
  - Provision users or alter user system roles.
  - Modify department definitions or budget codes.
  - Edit or delete historical transaction ledger rows.

#### 4. DEPARTMENT_MANAGER (Department Unit Lead)
- **Authority:** Strictly department-scoped manager (cost center lead).
- **Can:**
  - View all assets currently assigned to or owned by their department.
  - View custody assignments and staff roster within their department.
  - Review, approve, or reject equipment requests originating from their department staff.
  - Submit department-level asset requests for shared equipment (e.g., projectors, lab rigs).
  - View department-level maintenance tickets, downtime, and operational summaries.
- **Cannot:**
  - Access, view, or modify assets, requests, or users belonging to other departments.
  - Directly check out, assign, or intake inventory (must be executed by Asset Manager).
  - Access system-wide audit logs, global settings, or vendor master contracts.
  - Modify or delete historical records.

#### 5. STAFF (General Employee / Individual Custodian)
- **Authority:** Self-service operational user.
- **Can:**
  - View assets currently assigned to their personal custody (`current_user_id === self.user_id`).
  - View their personal assignment history and return due dates.
  - Submit equipment requisition requests for personal operational needs.
  - Track status of submitted requests.
  - Report defects or maintenance issues against assigned gear.
  - Scan physical asset QR codes to view authorized basic asset information.
  - View personal in-app notifications.
- **Cannot:**
  - Create, modify, or archive inventory assets.
  - Reassign equipment to other staff members or check out unassigned inventory.
  - Approve any equipment requests.
  - View other employees' assigned assets, financial purchase costs, or vendor contracts.
  - Access administration settings, user directories, or audit logs.

#### 6. VIEWER (Auditor & Observer)
- **Authority:** Global read-only operational role, with strict field-level restrictions.
- **Can View (General Operational Information):**
  - Asset tag, asset name, category, subcategory, brand, model.
  - Serial number where appropriate for physical identification.
  - Operational status (`status`) and physical condition (`condition`).
  - Current location (`location_id`) and location hierarchy.
  - Category taxonomy, departments, locations, and vendor listings.
  - General non-financial operational reports and read-only asset histories where permitted.
- **Cannot Access (Field-Restricted & Confidential Data):**
  - Purchase cost (`purchase_cost`) and current financial book value (`current_value`).
  - Sensitive vendor financial information and invoice references (`invoice_reference`).
  - Employee personal contact information (phone, personal email).
  - Authentication configuration and security settings (`ALLOWED_EMAIL_DOMAINS`).
  - Audit logs (`Audit Logs` sheet).
  - Private documents (invoices, receipts, disposal certificates).
  - Sensitive assignment information unless explicitly authorized.
- **Cannot Execute (No Mutation Capabilities):**
  - Create, edit, assign, check out, check in, archive, retire, or dispose of assets.
  - Submit or approve requests.
  - Open or modify maintenance tickets.
  - Modify users, roles, or settings.

---

## 2. Granular Permission Catalog & Capability Matrix

Permissions follow a clean dot-notation standard: `<module>.<action>`. The system evaluates permissions dynamically via capability checks rather than hardcoded role names.

| Permission Code | Description | SUPER_ADMIN | ADMIN | ASSET_MANAGER | DEPT_MANAGER | STAFF | VIEWER |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **ASSETS** | | | | | | | |
| `assets.view` | View asset details (filtered by scope) | **Yes** | **Yes** | **Yes** | **Scoped** | **Scoped** | **Yes** |
| `assets.create` | Register new assets into inventory | **Yes** | **Yes** | **Yes** | No | No | No |
| `assets.edit` | Update asset attributes, specs, location | **Yes** | **Yes** | **Yes** | No | No | No |
| `assets.archive` | Flag asset as archived / soft-delete | **Yes** | **Yes** | **Yes** | No | No | No |
| `assets.retire` | Authorize decommission and retirement | **Yes** | **Yes** | No | No | No | No |
| `assets.dispose` | Record e-waste disposal, sale, donation | **Yes** | **Yes** | No | No | No | No |
| `assets.export` | Export asset inventories (CSV / Excel) | **Yes** | **Yes** | **Yes** | **Scoped** | No | **Yes** |
| `assets.qr_generate`| Generate and batch-print QR tags | **Yes** | **Yes** | **Yes** | No | No | No |
| **ASSIGNMENTS** | | | | | | | |
| `assignments.view` | View assignment custody records | **Yes** | **Yes** | **Yes** | **Scoped** | **Scoped** | **Yes** |
| `assignments.create` | Execute long-term custody assignment | **Yes** | **Yes** | **Yes** | No | No | No |
| `assignments.checkout`| Execute short-term operational checkout | **Yes** | **Yes** | **Yes** | No | No | No |
| `assignments.checkin` | Intake returned asset, record condition | **Yes** | **Yes** | **Yes** | No | No | No |
| `assignments.edit` | Update notes or expected return date | **Yes** | **Yes** | **Yes** | No | No | No |
| **REQUESTS** | | | | | | | |
| `requests.view` | View requisition tickets | **Yes** | **Yes** | **Yes** | **Scoped** | **Scoped** | No |
| `requests.create` | Submit an equipment request | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | No |
| `requests.approve_dept`| First-tier department cost approval | **Yes** | **Yes** | No | **Scoped** | No | No |
| `requests.approve_asset`| Final asset allocation & fulfillment sign-off | **Yes** | **Yes** | **Yes** | No | No | No |
| `requests.reject` | Reject request with mandatory reason | **Yes** | **Yes** | **Yes** | **Scoped** | No | No |
| `requests.cancel` | Cancel an unapproved request | **Yes** | **Yes** | **Yes** | **Scoped** | **Scoped** | No |
| **MAINTENANCE** | | | | | | | |
| `maintenance.view` | View repair tickets & diagnostic logs | **Yes** | **Yes** | **Yes** | **Scoped** | **Scoped** | **Yes** |
| `maintenance.create` | Report defect or open service ticket | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | No |
| `maintenance.edit` | Update ticket status, diagnostics, vendor | **Yes** | **Yes** | **Yes** | No | No | No |
| `maintenance.complete`| Close ticket, record actual costs/resolution | **Yes** | **Yes** | **Yes** | No | No | No |
| **USERS** | | | | | | | |
| `users.view` | View employee directory and rosters | **Yes** | **Yes** | **Yes** | **Scoped** | No | **Yes** |
| `users.create` | Provision new user account | **Yes** | **Yes** | No | No | No | No |
| `users.edit` | Edit user profile details and department | **Yes** | **Yes** | No | No | No | No |
| `users.deactivate` | Suspend or deactivate user access | **Yes** | **Yes** | No | No | No | No |
| `users.manage_roles`| Assign and modify user system roles | **Yes** | No | No | No | No | No |
| **MASTER DATA** | | | | | | | |
| `categories.manage` | Manage equipment categories & specs schema | **Yes** | **Yes** | **Yes** | No | No | No |
| `departments.manage`| Manage departments & budget codes | **Yes** | **Yes** | No | No | No | No |
| `locations.manage` | Manage physical sites, rooms, racks | **Yes** | **Yes** | **Yes** | No | No | No |
| `vendors.manage` | Manage hardware suppliers & repair shops | **Yes** | **Yes** | **Yes** | No | No | No |
| **DOCUMENTS** | | | | | | | |
| `documents.view` | View and download attached files | **Yes** | **Yes** | **Yes** | **Scoped** | **Scoped** | **Yes** |
| `documents.upload` | Upload invoices, warranties, manuals | **Yes** | **Yes** | **Yes** | No | No | No |
| `documents.delete` | Soft-archive linked document metadata | **Yes** | **Yes** | No | No | No | No |
| **REPORTS & AUDIT** | | | | | | | |
| `reports.view` | Access analytics and summaries | **Yes** | **Yes** | **Yes** | **Scoped** | No | **Yes** |
| `reports.export` | Export reports to CSV / Excel | **Yes** | **Yes** | **Yes** | **Scoped** | No | **Yes** |
| `audit.view` | View security & access audit logs | **Yes** | **Yes** | No | No | No | No |
| **SYSTEM & SETTINGS** | | | | | | | |
| `settings.view` | View organization parameters & keys | **Yes** | **Yes** | No | No | No | No |
| `settings.edit` | Update general system settings | **Yes** | No | No | No | No | No |
| `auth_policy.manage`| Configure OAuth domains & allowed lists | **Yes** | No | No | No | No | No |
| `notifications.manage`| Configure automated alert thresholds | **Yes** | No | No | No | No | No |

---

## 3. Strict 3-Tier Data Scoping Architecture

Authorization is evaluated at runtime by intersecting three dimensions:
$$\text{Access Granted} = \text{User Has Role} \land \text{Role Has Permission} \land \text{Target Record Within Scope}$$

```
+----------------------------------------------------------------------------------------------------+
|                                    DATA SCOPE CLASSIFICATIONS                                      |
+----------------------------------------------------------------------------------------------------+
|  GLOBAL SCOPE          - Complete unrestricted visibility across all records in the sheet          |
|  OPERATIONAL SCOPE     - Full visibility into operational assets, excluding security keys          |
|  DEPARTMENT SCOPE      - Constrained to records where record.department_id === user.department_id  |
|  SELF SCOPE            - Constrained to records where record.user_id === user.user_id              |
|  READ-ONLY SCOPE       - Unrestricted or department-filtered view without mutation rights          |
+----------------------------------------------------------------------------------------------------+
```

### 3.1 Scope Rules by Role
1. **SUPER_ADMIN:** `GLOBAL_SCOPE` across all entities.
2. **ADMIN:** `GLOBAL_OPERATIONAL_SCOPE` across assets, assignments, maintenance, and master data.
3. **ASSET_MANAGER:** `GLOBAL_ASSET_SCOPE` across inventory, physical assignments, checkouts, and maintenance.
4. **DEPARTMENT_MANAGER:** `DEPARTMENT_SCOPE`:
   - `Assets`: Visible if `Assets.department_id === user.department_id` OR `Assets.current_user_id` belongs to `user.department_id`.
   - `Assignments`: Visible if `Assignments.department_id === user.department_id` OR `Assignments.user_id` belongs to department.
   - `Requests`: Visible if `Requests.department_id === user.department_id`. Can approve requests where `Requests.status === 'PENDING_DEPT_APPROVAL'`.
   - `Users`: Visible if `Users.department_id === user.department_id`.
5. **STAFF:** `SELF_SCOPE`:
   - `Assets`: Visible only if `Assets.current_user_id === user.user_id`. (Also allowed to view basic public specs of any asset via QR lookup).
   - `Assignments`: Visible only if `Assignments.user_id === user.user_id`.
   - `Requests`: Visible only if `Requests.requester_user_id === user.user_id`.
6. **VIEWER:** `GLOBAL_READ_ONLY_OPERATIONAL_SCOPE` (with strict field-level masking):
   - Global read visibility across general operational fields (`asset_tag`, `name`, `category`, `brand`, `model`, `serial_number`, `status`, `condition`, `location`).
   - Strict field-level masking: Financial values (`purchase_cost`, `current_value`, `invoice_reference`), private documents, employee personal contact info, security settings, and audit logs are stripped at the API layer before serialization.

---

## 4. Application Navigation Architecture

The navigation system adapts dynamically based on the authenticated user's role and permission scope:

```
+----------------------------------------------------------------------------------------------------+
|                                 APPLICATION NAVIGATION STRUCTURE                                   |
+----------------------------------------------------------------------------------------------------+
|  [Dashboard]                 - Overview metrics, quick actions, role-adapted widgets               |
|                                                                                                    |
|  [Assets]                    - Asset Master Registry                                               |
|    ├── All Assets            - High-density tabular catalog (Filtered by scope)                    |
|    ├── Add Asset             - Intake form (Admin, Asset Manager)                                  |
|    ├── Categories            - Taxonomy & custom specification schemas                             |
|    ├── Asset History         - Master transaction audit ledger                                     |
|    └── QR / Asset Tags       - Print sheets & QR utility                                           |
|                                                                                                    |
|  [Assignments]              - Custody & Check-in / Check-out                                      |
|    ├── Active Assignments    - Real-time active custody contracts                                  |
|    ├── Check-out             - Check-out handover workflow modal/page                              |
|    ├── Check-in              - Return intake & physical inspection workflow                        |
|    ├── Custody History       - Complete assignment timeline                                        |
|    └── Overdue Assets        - Overdue returns tracking                                            |
|                                                                                                    |
|  [Requests]                  - Requisitions & Approvals                                            |
|    ├── My Requests           - Staff / requester view                                              |
|    ├── Pending Approvals     - Dedicated approval queue (Dept Mgr, Asset Mgr)                      |
|    └── All Requests          - Administrative master queue                                         |
|                                                                                                    |
|  [Maintenance]              - Maintenance & Repairs                                               |
|    ├── Active Tickets        - Open defect and repair tickets                                      |
|    ├── Preventive Schedule   - Upcoming scheduled servicing                                        |
|    └── Service Vendors       - External repair partners & SLAs                                     |
|                                                                                                    |
|  [Organization]              - Master Organization Data                                            |
|    ├── Users                 - Employee directory & role provisioning                              |
|    ├── Departments           - Cost centers & department heads                                     |
|    └── Locations             - Physical hierarchy (Site/Building/Floor/Room)                       |
|                                                                                                    |
|  [Documents]                 - Attached Drive files & certificates                                 |
|  [Reports]                   - Operational & inventory summary reports                             |
|  [Notifications]             - User alert inbox                                                    |
|  [Audit Logs]                - Immutable security & administrative activity trail                  |
|  [Settings]                  - Organization profile, currencies, OAuth domain security             |
+----------------------------------------------------------------------------------------------------+
```

### 4.1 Navigation Visibility by Role

| Navigation Menu Item | SUPER_ADMIN | ADMIN | ASSET_MANAGER | DEPT_MANAGER | STAFF | VIEWER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Dashboard** | Full Org | Operational | Inventory | Department | Personal | Read-Only |
| **Assets > All Assets** | All | All | All | Dept Assets | My Assets | All |
| **Assets > Add Asset** | Visible | Visible | Visible | Hidden | Hidden | Hidden |
| **Assets > Categories** | Manage | Manage | Manage | View | Hidden | View |
| **Assets > Asset History** | Visible | Visible | Visible | Dept Scope | Hidden | Visible |
| **Assets > QR / Tags** | Manage | Manage | Manage | Hidden | Scan Only | Hidden |
| **Assignments > Active** | All | All | All | Dept Scope | My Custody | All |
| **Assignments > Check-out** | Visible | Visible | Visible | Hidden | Hidden | Hidden |
| **Assignments > Check-in** | Visible | Visible | Visible | Hidden | Hidden | Hidden |
| **Assignments > Overdue** | Visible | Visible | Visible | Dept Scope | My Overdue | Visible |
| **Requests > My Requests** | Visible | Visible | Visible | Visible | Visible | Hidden |
| **Requests > Approvals** | All | All | Asset Queue | Dept Queue | Hidden | Hidden |
| **Requests > All Requests** | Visible | Visible | Visible | Dept Scope | Hidden | Hidden |
| **Maintenance > Active** | Visible | Visible | Visible | Dept Scope | My Reports | Visible |
| **Maintenance > Vendors** | Manage | Manage | Manage | Hidden | Hidden | View |
| **Organization > Users** | Full Edit | Manage | View Only | Dept Roster | Hidden | View Only |
| **Organization > Depts** | Manage | Manage | View Only | View Own | Hidden | View Only |
| **Organization > Locations**| Manage | Manage | Manage | View Only | Hidden | View Only |
| **Documents** | All | All | All | Dept Scope | My Docs | View Only |
| **Reports** | Full | Full | Operations | Dept Reports | Hidden | View Only |
| **Notifications** | Personal | Personal | Personal | Personal | Personal | Personal |
| **Audit Logs** | Full | Filtered | Hidden | Hidden | Hidden | Hidden |
| **Settings** | Full Config| Read-Only | Hidden | Hidden | Hidden | Hidden |

---

## 5. Application Route Hierarchy & Specifications

```text
/
├── /dashboard                              # Role-adapted operational overview
│
├── /assets                                 # Asset master catalog (tabular, search, filter)
│   ├── /assets/new                         # Asset intake & registration form
│   ├── /assets/[assetId]                   # Master-detail asset dossier & quick actions
│   ├── /assets/[assetId]/edit              # Asset attribute & specification edit form
│   ├── /assets/[assetId]/history           # Chronological transaction ledger timeline
│   └── /assets/[assetId]/documents         # Attached Drive files, manuals, invoices
│
├── /categories                             # Category catalog & taxonomy manager
│   └── /categories/[categoryId]            # Category details & custom specs schema
│
├── /assignments                            # Custody overview & active allocations
│   ├── /assignments/checkout               # Check-out handover workflow
│   ├── /assignments/checkin                # Return intake & physical inspection workflow
│   └── /assignments/[assignmentId]         # Custody contract details & condition audit
│
├── /requests                               # Equipment requisitions
│   ├── /requests/new                       # Self-service request submission form
│   ├── /requests/approvals                 # Manager approval & allocation queue
│   └── /requests/[requestId]               # Requisition lifecycle & approval timeline
│
├── /maintenance                            # Maintenance tickets & service log
│   ├── /maintenance/new                    # Defect report submission form
│   └── /maintenance/[maintenanceId]        # Repair ticket diagnostics & cost resolution
│
├── /users                                  # Organizational directory
│   ├── /users/new                          # User provisioning form (Admin only)
│   └── /users/[userId]                     # User profile, active custody & request history
│
├── /departments                            # Department list & cost centers
│   └── /departments/[departmentId]         # Department details & allocated inventory
│
├── /locations                              # Hierarchical physical location browser
│   └── /locations/[locationId]             # Location space details & current gear
│
├── /vendors                                # Vendor registry & warranty partner list
│   └── /vendors/[vendorId]                 # Vendor contact details, SLAs & service history
│
├── /documents                              # Central document metadata index
│
├── /reports                                # Operational analytics, asset valuation, utilization
│
├── /notifications                          # User notifications inbox & alert preferences
│
├── /audit-logs                             # Immutable security & system audit log
│
└── /settings                               # System settings parent
    ├── /settings/general                   # Org profile, currency (INR), timezone, formats
    ├── /settings/authentication            # Google OAuth allowed domains & access policy
    ├── /settings/roles                     # Role permission catalog & capability matrix
    └── /settings/notifications             # Alert thresholds & automated reminder rules
```

---

## 6. Page Responsibilities & Information Architecture Contracts

For every route in the hierarchy, the functional contracts are defined below:

### 6.1 Route: `/dashboard`
- **Purpose:** Primary operational command hub tailored to the user's role.
- **Access:** All authenticated users (`SUPER_ADMIN`, `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_MANAGER`, `STAFF`, `VIEWER`).
- **Required Data:** Summary counts (Total Assets, Available, Assigned, In-Maintenance, Overdue, Pending Approvals), recent transactions, urgent alerts.
- **Available Actions:** Quick-action buttons (Check Out, Check In, New Request, Report Defect, Scan QR).
- **Empty State:** Clean slate card: "All systems nominal. No pending tasks or overdue equipment."
- **Mobile Behavior:** Collapses into a single-column card stack with top priority on Pending Actions and Scan QR.

### 6.2 Route: `/assets`
- **Purpose:** Master high-density inventory data table.
- **Access:** All roles (scoped by user role: Global for Admins/Asset Managers; Department-scoped for Dept Managers; Self-scoped for Staff).
- **Required Data:** Paginated asset list, category lookup, department lookup, location lookup, status badges.
- **Available Actions:** Search, facet filter, multi-row export, click row to open Detail Drawer/Page, "Add Asset" button (authorized roles).
- **Filters:** Category, Status, Condition, Custody Type, Department, Location, Warranty Status.
- **Search:** Debounced keyword search across `asset_tag`, `name`, `serial_number`, `brand`, `model`.
- **Sorting:** By `asset_id`, `name`, `purchase_date`, `purchase_cost`, `status`, `updated_at`. Default: `updated_at DESC`.
- **Pagination:** Server/client paginated (25, 50, 100 rows per page).
- **Empty State:** "No assets match your search criteria. [Reset Filters]".

### 6.3 Route: `/assets/new`
- **Purpose:** Intake and registration form for new physical or digital assets.
- **Access:** `SUPER_ADMIN`, `ADMIN`, `ASSET_MANAGER`.
- **Required Data:** Categories (with `spec_schema_json`), Locations, Departments, Vendors.
- **Available Actions:** Form inputs grouped into logical fieldsets: Basic Info, Procurement & Financials, Physical Placement, Dynamic Specifications (rendered from category template), Submit.
- **Validation:** Server-side Zod validation on all fields before write.
- **Mobile Behavior:** Multi-column inputs collapse into single-column form.

### 6.4 Route: `/assets/[assetId]`
- **Purpose:** Comprehensive asset dossier (master-detail view).
- **Access:** Authorized users within data scope.
- **Required Data:** Asset record, active assignment, category, location hierarchy, vendor info, latest 5 transactions, attached documents.
- **Available Actions:** Print QR Tag, Edit, Assign/Check-Out, Return/Check-In, Open Maintenance Ticket, Retire/Dispose.
- **Mobile Behavior:** Sticky top header with Asset Tag and Status Badge; tabs for Overview, History, and Maintenance.

### 6.5 Route: `/assignments/checkout`
- **Purpose:** Structured handover workflow for short-term checkout or long-term assignment.
- **Access:** `SUPER_ADMIN`, `ADMIN`, `ASSET_MANAGER`.
- **Required Data:** Asset selector (or pre-selected asset), User directory (active users), Department directory, Accessory checklist template.
- **Available Actions:** Select Custody Type (`USER` or `DEPARTMENT`), Select Custodian, Set Assignment Type (`LONG_TERM` or `TEMPORARY_CHECKOUT`), Select Return Due Date, Sign-off Condition, Submit Handover.
- **Validation:** Pre-condition check: Asset status must be `AVAILABLE`. Exactly one custodian (user or department) must be selected.

### 6.6 Route: `/assignments/checkin`
- **Purpose:** Equipment intake, return inspection, and condition reassessment workflow.
- **Access:** `SUPER_ADMIN`, `ADMIN`, `ASSET_MANAGER`.
- **Required Data:** Active assignment record, expected accessory checklist, return location options.
- **Available Actions:** Scan QR tag to look up active assignment, verify accessories, select return condition (`NEW` to `DAMAGED`), select return storage location, flag defects (routes to maintenance if damaged), Submit Check-In.

### 6.7 Route: `/requests/approvals`
- **Purpose:** Dedicated approval queue for Department Managers and Asset Managers.
- **Access:** `SUPER_ADMIN`, `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_MANAGER`.
- **Required Data:** Pending requests requiring user's approval level (Dept Approval vs Asset Allocation).
- **Available Actions:** View requisition justification, Approve with comments, Reject with mandatory reason, Allocate specific inventory asset (Asset Manager).
- **Filters:** Approval stage (`PENDING_DEPT`, `PENDING_ASSET`), Urgency priority, Department.

### 6.8 Route: `/settings/authentication`
- **Purpose:** Security configuration for Google OAuth domain restrictions and user activation policies.
- **Access:** Strictly `SUPER_ADMIN`.
- **Required Data:** Current `Settings.ALLOWED_EMAIL_DOMAINS` value, authentication status.
- **Available Actions:** Add/remove allowed corporate domains (e.g., `organization.com`), add specific allowed email addresses, toggle domain enforcement.
- **Safety Invariant:** The system refuses to save a wildcard `*` allow-all policy in production.

---

## 7. Core Operational Workflows (End-to-End User Flows)

```
[1. ADD ASSET]
Admin/Asset Mgr -> /assets/new -> Validate Zod -> Generate AST-XXXXXX -> Write Sheet
-> Append Transactions (CREATED) -> Append Audit Logs -> Asset Status: AVAILABLE

[2. ASSIGN ASSET]
Asset Mgr -> Select Asset (AVAILABLE) -> Select Custody (USER or DEPT) -> Set Condition
-> Create ASN-XXXXXX -> Update Asset (ASSIGNED, current_custody) -> Append Transactions (ASSIGNED)
-> Append Audit Logs -> Send Notification to Custodian

[3. TEMPORARY CHECKOUT]
Asset Mgr -> Select Asset -> Select Borrower -> Set Expected Return Date
-> Create ASN-XXXXXX (TEMPORARY_CHECKOUT) -> Update Asset (CHECKED_OUT)
-> Append Transactions (CHECKED_OUT) -> Append Audit Logs

[4. CHECK-IN / RETURN]
Custodian returns gear -> Asset Mgr scans QR -> Intake Inspection (Functional + Cosmetic)
-> Update Assignment (RETURNED, return_condition) -> If Pristine: Status AVAILABLE
-> If Broken: Status IN_MAINTENANCE -> Append Transactions (CHECKED_IN) -> Append Audit Logs

[5. MAINTENANCE TICKET]
User/Staff reports fault -> /maintenance/new -> Create MNT-XXXXXX -> Asset Status: IN_MAINTENANCE
-> Append Transactions (MAINTENANCE_STARTED) -> Service Performed -> Close Ticket with Cost & Resolution
-> Inspection Passed -> Asset Status: AVAILABLE -> Append Transactions (MAINTENANCE_COMPLETED)

[6. ASSET REQUISITION]
Staff submits request (/requests/new) -> REQ-XXXXXX (PENDING_DEPT_APPROVAL)
-> Dept Mgr reviews -> Approves -> Status: PENDING_ASSET_APPROVAL -> Asset Mgr reviews
-> Allocates specific asset AST-XXXXXX -> Generates Assignment -> Request FULFILLED

[7. RETIREMENT]
Admin/Asset Mgr selects asset -> Validates decommission criteria (age, damage)
-> Records retirement justification -> Asset Status: RETIRED -> is_archived = TRUE
-> Append Transactions (RETIRED) -> Append Audit Logs

[8. DISPOSAL]
Admin selects retired asset -> Selects method (E-Waste Destruction / Liquidation Sale / Donation)
-> Links Disposal Certificate in Documents -> Asset Status: DISPOSED
-> Append Transactions (DISPOSED) -> Append Audit Logs

[9. LOST ASSET]
Staff/Manager reports missing asset -> Incident notes recorded -> Asset Status: LOST
-> Custodian cleared -> Append Transactions (LOST) -> Super Admin alert dispatched

[10. FOUND ASSET]
Asset Manager locates missing gear -> Scans physical tag -> Performs inspection
-> Records recovery notes -> Asset Status: AVAILABLE (or IN_MAINTENANCE)
-> Append Transactions (FOUND) -> Append Audit Logs
```

---

## 8. Multi-Stage Approval Model & Invariant Rules

| Workflow Action | Requester | Authorizing Approver | Self-Approval Allowed? | Admin Override? | System Ledgers Triggered |
|---|---|---|:---:|:---:|---|
| **Staff Hardware Requisition** | Staff Employee | 1. Department Manager (Budget)<br>2. Asset Manager (Inventory) | **No** (Cannot approve own request) | Yes (Super Admin / Admin can override) | `Audit Logs` |
| **Department Shared Equipment Request**| Department Manager | Asset Manager | **No** (Requires independent inventory sign-off)| Yes | `Audit Logs` |
| **Asset Check-Out / Assignment** | Employee or Dept | Asset Manager | No (Custodian cannot self-allocate without Asset Mgr) | Yes | `Transactions` + `Audit Logs` |
| **Asset Retirement** | Asset Manager | Admin or Super Admin | No (Requires 2nd-person administrative check) | Yes | `Transactions` + `Audit Logs` |
| **Asset Final Disposal** | Asset Manager / Admin | Super Admin | No | Super Admin is sole authority | `Transactions` + `Audit Logs` |
| **User Role Elevation (e.g. to Admin)** | Admin | Super Admin | **No** | Super Admin is sole authority | `Audit Logs` |
| **OAuth Domain Policy Changes** | Super Admin | Dual Confirmation Modal (Sole Authority) | N/A | N/A | `Audit Logs` |

---

## 9. Comprehensive Ledger Auditability Matrix

The system strictly delineates between **Asset Lifecycle Transactions** (`Transactions`) and **Administrative / Access Audit Logs** (`Audit Logs`):

| Operational Action | Append to `Transactions`? | Append to `Audit Logs`? | Ledger Payload Details Recorded |
|---|:---:|:---:|---|
| **User Authentication / Login** | No | **Yes** | User ID, email, timestamp, IP address, user-agent, session ID |
| **User Logout** | No | **Yes** | User ID, session termination timestamp |
| **Asset Intake / Registration** | **Yes** (`CREATED`) | **Yes** (`ASSET_CREATED`) | Full asset payload, initial status `AVAILABLE`, actor ID |
| **Asset Attribute Edit** | If status/loc/cond changed | **Yes** (`ASSET_UPDATED`) | Target field changes, `before_state`, `after_state` |
| **Asset Handover / Assignment** | **Yes** (`ASSIGNED`) | **Yes** (`ASSIGNMENT_CREATED`)| Custodian ID, custody type, handover condition, actor ID |
| **Short-Term Checkout** | **Yes** (`CHECKED_OUT`) | **Yes** (`CHECKOUT_PROCESSED`)| Borrower ID, return due date, accessories sign-off |
| **Asset Check-In / Return** | **Yes** (`CHECKED_IN`)| **Yes** (`CHECKIN_PROCESSED`)| Return condition, return location, inspection notes |
| **Location Transfer** | **Yes** (`LOCATION_CHANGED`)| **Yes** (`ASSET_UPDATED`)| `from_location_id`, `to_location_id`, reason |
| **Physical Condition Update**| **Yes** (`CONDITION_UPDATED`)| **Yes** (`ASSET_UPDATED`)| Previous condition, assessed condition, audit notes |
| **Maintenance Opened** | **Yes** (`MAINTENANCE_STARTED`)| **Yes** (`MAINTENANCE_OPENED`)| Defect summary, priority, reported by, ticket ID |
| **Maintenance Closed** | **Yes** (`MAINTENANCE_COMPLETED`)| **Yes** (`MAINTENANCE_CLOSED`)| Resolution, actual cost, technician, return status |
| **Asset Retired** | **Yes** (`RETIRED`) | **Yes** (`ASSET_ARCHIVED`)| Retirement reason, book value at retirement |
| **Asset Disposed / Sold / Donated**| **Yes** (`DISPOSED`)| **Yes** (`ASSET_ARCHIVED`)| Disposal method, sale proceeds, linked certificate |
| **Asset Reported Lost** | **Yes** (`LOST`) | **Yes** (`ASSET_UPDATED`)| Incident report notes, prior custodian |
| **Asset Recovered / Found** | **Yes** (`FOUND`) | **Yes** (`ASSET_UPDATED`)| Recovery location, physical condition upon recovery |
| **User Provisioned / Edited** | No | **Yes** (`USER_CREATED`/`UPDATED`)| Modified user attributes, department mapping |
| **User Role Elevated / Changed**| No | **Yes** (`ROLE_CHANGED`)| Old role, new role, authorizing Super Admin ID |
| **Settings Updated** | No | **Yes** (`SETTINGS_UPDATED`)| Target key, old value, new value, actor ID |
| **Inventory Data Exported** | No | **Yes** (`DATA_EXPORTED`)| Export criteria, format, record count, actor ID |

---

## 10. Mobile Information Architecture & Field Operational Priorities

The portal is designed as a fully responsive, mobile-first web interface tailored for technicians and inventory auditors carrying tablets or smartphones in server rooms and storage warehouses:

```
+----------------------------------------------------------------------------------------------------+
|                                      MOBILE PRIORITY WORKFLOWS                                     |
+----------------------------------------------------------------------------------------------------+
|  1. QR Scanner Quick Launch   - Persistent floating/header scan button; instant camera autofocus   |
|  2. Asset Identification      - Instant view of Asset Tag, Brand, Model, Status, and Custodian     |
|  3. Warehouse Audit Check     - Quick-confirm physical location and condition during stock counts  |
|  4. Field Check-In / Check-Out- Mobile intake inspection, accessory checklist, one-tap sign-off    |
|  5. Incident Defect Reporting - Snap photo of broken gear, describe fault, submit ticket in field  |
|  6. Mobile Requisition Approvals - Department manager review & one-tap approval on the go          |
|  7. My Assigned Custody       - Employee personal gear view with return due dates                  |
+----------------------------------------------------------------------------------------------------+
```

### Mobile Layout Adaptations
- **Persistent Bottom Action Bar:** Mobile viewports provide quick-access anchors: `[Dashboard]`, `[My Assets]`, `[Scan QR (Floating Center)]`, `[Requests]`, `[More]`.
- **Touch Targets:** All interactive elements maintain a minimum hit area of $44 \times 44\text{ px}$.
- **Tables to Cards:** Multi-column desktop tables seamlessly refactor into high-density touch cards displaying Asset Tag, Name, Status Badge, and Location.
- **Full Viewport Camera:** QR scanner utilizes the HTML5 Camera stream API with haptic vibration feedback upon label detection.
