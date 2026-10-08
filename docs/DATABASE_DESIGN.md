# Database & Data Model Specification
## Asset Management Portal

**Document Version:** 1.0.0  
**Status:** Architectural Baseline & Schema Proposal  
**Storage Engine (Phase 1):** Google Sheets Tabular Workbook  
**Target Migration Target (Phase 2):** PostgreSQL Relational Database  

---

## 1. Data Design Principles & Requirements

1. **Non-Destructive History:** Historical actions (custody transfers, checkouts, returns, repairs, state changes) must never overwrite previous rows or fields. They are recorded as append-only records in transaction and audit ledgers.
2. **Explicit Foreign-Key Equivalents:** Because Google Sheets does not enforce database constraints, the application layer strictly validates reference integrity (e.g., verifying that `category_id` exists in the Categories sheet before writing an asset).
3. **Deterministic Identity Schemes:** Every entity possesses a human-readable, sequentially zero-padded identifier with a standardized prefix (e.g., `AST-000001`, `USR-000001`).
4. **Formula Injection Sanitization:** All text written to sheets is sanitized against spreadsheet formula injection (leading `=, +, -, @`).
5. **Decoupled Relational Semantics:** Types, relationships, nullability, and enums are modeled to transition directly into standard SQL DDL / migrations in Phase 2.

---

## 2. Entity Relationship Overview

```
 [Departments] <------- [Users] <------- [Assignments] -------> [Assets]
       ^                    |                   |                   |
       |                    |                   |                   v
 [Locations]                +-------> [Requests]             [Maintenance]
       ^                                                            |
       |                                                            v
 [Vendors] -------------------------------------------------> [Documents]
       |
       +--------------------> [Categories]
                                   |
                                   v
                             [Assets] <-----> [Transactions] (Append-only Ledger)
                                   |
                                   v
                             [Audit Logs] (Immutable Activity Log)
```

---

## 3. Entity Definitions & Candidate Field Catalog

### 3.1 Entity: `Assets` (Sheet: `Assets`)
Primary inventory entity representing physical or digital assets.

| Field Name | Type | Required? | Candidate Values / Format | Description & Business Rules |
|---|---|---|---|---|
| `asset_id` | String | **Yes** | Pattern: `AST-^[0-9]{6}$` | Primary Key. Immutable, system-generated. |
| `asset_tag` | String | **Yes** | Alphanumeric (e.g., `TAG-10492`) | Barcode/physical label tag. Unique across organization. |
| `name` | String | **Yes** | Max 120 chars | Standard descriptive name (e.g., "ThinkPad P1 Gen 5"). |
| `category_id` | String | **Yes** | Ref: `Categories.category_id` | Foreign key to Category. |
| `subcategory_id` | String | No | Ref: `Categories.subcategory_id` | Optional subcategory reference. |
| `brand` | String | **Yes** | Max 60 chars | Manufacturer/Brand (e.g., "Lenovo", "Dell", "Apple"). |
| `model` | String | No | Max 80 chars | Specific manufacturer model name/number. |
| `serial_number` | String | **Yes** | Alphanumeric | Manufacturer hardware serial number. Unique per brand. |
| `description` | String | No | Max 500 chars | Additional technical specifications, notes. |
| `status` | Enum | **Yes** | See Section 4.1 | Current lifecycle state (e.g., `AVAILABLE`, `ASSIGNED`). |
| `condition` | Enum | **Yes** | See Section 4.2 | Physical condition (e.g., `NEW`, `GOOD`, `DAMAGED`). |
| `department_id` | String | No | Ref: `Departments.department_id` | Owning department (cost center). |
| `location_id` | String | **Yes** | Ref: `Locations.location_id` | Current physical storage or operational location. |
| `assigned_user_id` | String | No | Ref: `Users.user_id` | Currently assigned user (denormalized fast lookup). |
| `purchase_date` | Date | No | ISO 8601 (`YYYY-MM-DD`) | Date acquired from vendor. |
| `purchase_cost` | Decimal | No | Numeric (`0.00`) | Original purchase price in base currency. |
| `current_value` | Decimal | No | Numeric (`0.00`) | Current book value after depreciation. |
| `vendor_id` | String | No | Ref: `Vendors.vendor_id` | Supplier from whom asset was purchased. |
| `invoice_reference`| String | No | Max 60 chars | Purchase order or vendor invoice number. |
| `warranty_expiry` | Date | No | ISO 8601 (`YYYY-MM-DD`) | Manufacturer warranty expiration date. |
| `qr_code_url` | String | No | URL | Stored QR image asset or encoded link. |
| `created_at` | DateTime | **Yes** | ISO 8601 UTC | Timestamp of initial registration. |
| `updated_at` | DateTime | **Yes** | ISO 8601 UTC | Timestamp of latest modification. |
| `is_archived` | Boolean | **Yes** | `TRUE` / `FALSE` | Soft-delete flag. Default `FALSE`. |

---

### 3.2 Entity: `Transactions` (Sheet: `Transactions`)
**Append-only ledger.** Records every lifecycle event, custody handover, check-in, check-out, and status mutation. Never edited or deleted.

| Field Name | Type | Required? | Candidate Values / Format | Description & Business Rules |
|---|---|---|---|---|
| `transaction_id` | String | **Yes** | Pattern: `TXN-^[0-9]{6}$` | Primary Key. Immutable. |
| `asset_id` | String | **Yes** | Ref: `Assets.asset_id` | Target asset. |
| `transaction_type` | Enum | **Yes** | See Section 4.3 | Type of transaction (e.g., `CHECK_OUT`, `CHECK_IN`, `TRANSFER`). |
| `from_user_id` | String | No | Ref: `Users.user_id` | Previous custodian (null if unassigned). |
| `to_user_id` | String | No | Ref: `Users.user_id` | New custodian (null if returned to inventory). |
| `from_location_id` | String | No | Ref: `Locations.location_id` | Previous location. |
| `to_location_id` | String | No | Ref: `Locations.location_id` | New location. |
| `from_status` | Enum | **Yes** | See Section 4.1 | Previous asset status. |
| `to_status` | Enum | **Yes** | See Section 4.1 | New asset status. |
| `condition_at_event`| Enum | **Yes** | See Section 4.2 | Condition evaluated at the time of event. |
| `action_by_user_id`| String | **Yes** | Ref: `Users.user_id` | The manager/admin who executed the action. |
| `timestamp` | DateTime | **Yes** | ISO 8601 UTC | Exact event timestamp. |
| `notes` | String | No | Max 500 chars | Reason, handover comments, condition remarks. |

---

### 3.3 Entity: `Assignments` (Sheet: `Assignments`)
Represents an active or historical custody contract between an asset and an assignee.

| Field Name | Type | Required? | Candidate Values / Format | Description & Business Rules |
|---|---|---|---|---|
| `assignment_id` | String | **Yes** | Pattern: `ASN-^[0-9]{6}$` | Primary Key. |
| `asset_id` | String | **Yes** | Ref: `Assets.asset_id` | Assigned asset. |
| `user_id` | String | No | Ref: `Users.user_id` | Assigned person (either user or department must be set). |
| `department_id` | String | No | Ref: `Departments.department_id` | Assigned department. |
| `assigned_by` | String | **Yes** | Ref: `Users.user_id` | Asset Manager who authorized assignment. |
| `assigned_date` | DateTime | **Yes** | ISO 8601 UTC | Handover timestamp. |
| `expected_return_date` | Date | No | ISO 8601 (`YYYY-MM-DD`) | Null for indefinite employee provisioning. |
| `actual_return_date` | DateTime | No | ISO 8601 UTC | Recorded upon check-in. |
| `status` | Enum | **Yes** | `ACTIVE`, `RETURNED`, `OVERDUE` | Assignment state. |
| `initial_condition` | Enum | **Yes** | See Section 4.2 | Condition at handover. |
| `return_condition` | Enum | No | See Section 4.2 | Condition upon check-in. |
| `custody_agreement_signed` | Boolean | **Yes** | `TRUE` / `FALSE` | Digital signature / acceptance flag. |
| `notes` | String | No | Max 500 chars | Allocation details. |

---

### 3.4 Entity: `Maintenance` (Sheet: `Maintenance`)
Tracks preventative servicing, hardware repair tickets, warranty claims, and costs.

| Field Name | Type | Required? | Candidate Values / Format | Description & Business Rules |
|---|---|---|---|---|
| `maintenance_id` | String | **Yes** | Pattern: `MNT-^[0-9]{6}$` | Primary Key. |
| `asset_id` | String | **Yes** | Ref: `Assets.asset_id` | Asset under service. |
| `maintenance_type` | Enum | **Yes** | `PREVENTIVE`, `CORRECTIVE`, `WARRANTY`, `UPGRADE` | Maintenance category. |
| `vendor_id` | String | No | Ref: `Vendors.vendor_id` | External service provider or internal IT. |
| `title` | String | **Yes** | Max 120 chars | Issue summary (e.g., "Screen replacement"). |
| `description` | String | **Yes** | Max 1000 chars | Detailed fault diagnostic or service report. |
| `status` | Enum | **Yes** | `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` | Ticket progress state. |
| `start_date` | Date | **Yes** | ISO 8601 (`YYYY-MM-DD`) | Date maintenance initiated. |
| `completion_date` | Date | No | ISO 8601 (`YYYY-MM-DD`) | Date service resolved. |
| `cost` | Decimal | No | Numeric (`0.00`) | Incurred parts and labor cost. |
| `performed_by` | String | No | Max 80 chars | Technician name or service center. |
| `invoice_reference`| String | No | Max 60 chars | Maintenance invoice number. |
| `created_by` | String | **Yes** | Ref: `Users.user_id` | User who logged ticket. |
| `created_at` | DateTime | **Yes** | ISO 8601 UTC | Creation timestamp. |

---

### 3.5 Entity: `Requests` (Sheet: `Requests`)
Workflow entity for employee hardware and equipment requests.

| Field Name | Type | Required? | Candidate Values / Format | Description & Business Rules |
|---|---|---|---|---|
| `request_id` | String | **Yes** | Pattern: `REQ-^[0-9]{6}$` | Primary Key. |
| `request_number`| String | **Yes** | Pattern: `R-^[0-9]{6}$` | Friendly request reference. |
| `user_id` | String | **Yes** | Ref: `Users.user_id` | Requesting employee. |
| `department_id` | String | **Yes** | Ref: `Departments.department_id` | Cost center charged. |
| `category_id` | String | **Yes** | Ref: `Categories.category_id` | Requested equipment category. |
| `preferred_model`| String | No | Max 80 chars | Specific requirement note. |
| `reason` | String | **Yes** | Max 500 chars | Business justification. |
| `priority` | Enum | **Yes** | `LOW`, `MEDIUM`, `HIGH`, `URGENT` | Operational urgency. |
| `status` | Enum | **Yes** | `PENDING_DEPT_APPROVAL`, `PENDING_ASSET_APPROVAL`, `APPROVED`, `REJECTED`, `FULFILLED`, `CANCELLED` | State machine status. |
| `dept_approver_id`| String | No | Ref: `Users.user_id` | Department Manager approver. |
| `dept_approved_at`| DateTime | No | ISO 8601 UTC | Timestamp of department approval. |
| `asset_approver_id`| String | No | Ref: `Users.user_id` | Asset Manager approver. |
| `asset_approved_at`| DateTime | No | ISO 8601 UTC | Timestamp of asset approval. |
| `rejection_reason`| String | No | Max 500 chars | Mandatory if status = `REJECTED`. |
| `allocated_asset_id`| String | No | Ref: `Assets.asset_id` | Linked asset upon fulfillment. |
| `created_at` | DateTime | **Yes** | ISO 8601 UTC | Submission timestamp. |
| `updated_at` | DateTime | **Yes** | ISO 8601 UTC | Last state change timestamp. |

---

### 3.6 Supporting Operational Entities

#### Entity: `Users` (Sheet: `Users`)
- `user_id` (PK, `USR-^[0-9]{6}$`), `email` (Unique, required), `first_name` (Req), `last_name` (Req), `role_id` (Req), `department_id` (Ref), `job_title` (Opt), `phone` (Opt), `status` (`ACTIVE`, `SUSPENDED`, `DEACTIVATED`), `google_sub_id` (OAuth subject ID), `created_at`, `updated_at`.

#### Entity: `Categories` (Sheet: `Categories`)
- `category_id` (PK, `CAT-^[0-9]{4}$`), `name` (Req, e.g., "Laptops"), `code` (Req, e.g., "LAP"), `description` (Opt), `parent_category_id` (Opt, for subcategories), `depreciation_method` (`STRAIGHT_LINE`, `NONE`), `useful_life_months` (Integer), `is_active` (Boolean).

#### Entity: `Departments` (Sheet: `Departments`)
- `department_id` (PK, `DEP-^[0-9]{4}$`), `name` (Req, e.g., "Engineering"), `code` (Req, e.g., "ENG"), `manager_user_id` (Ref), `budget_code` (Opt), `is_active` (Boolean).

#### Entity: `Locations` (Sheet: `Locations`)
- `location_id` (PK, `LOC-^[0-9]{4}$`), `name` (Req, e.g., "HQ - Floor 3 - IT Storage"), `site` (Req), `building` (Opt), `floor` (Opt), `room_number` (Opt), `parent_location_id` (Opt), `is_active` (Boolean).

#### Entity: `Vendors` (Sheet: `Vendors`)
- `vendor_id` (PK, `VEN-^[0-9]{4}$`), `name` (Req), `contact_name` (Opt), `email` (Opt), `phone` (Opt), `website` (Opt), `address` (Opt), `tax_identifier` (Opt), `notes` (Opt), `is_active` (Boolean).

#### Entity: `Documents` (Sheet: `Documents`)
- `document_id` (PK, `DOC-^[0-9]{6}$`), `asset_id` (Ref), `title` (Req), `document_type` (`INVOICE`, `WARRANTY`, `MANUAL`, `DISPOSAL_CERT`, `OTHER`), `drive_file_id` (Google Drive File ID), `mime_type` (Req), `file_size_bytes` (Integer), `uploaded_by` (Ref), `uploaded_at` (DateTime).

#### Entity: `Notifications` (Sheet: `Notifications`)
- `notification_id` (PK, `NTF-^[0-9]{6}$`), `user_id` (Ref), `type` (`WARRANTY_EXPIRY`, `OVERDUE_RETURN`, `MAINTENANCE_DUE`, `REQUEST_STATUS`), `title` (Req), `message` (Req), `link_url` (Opt), `is_read` (Boolean), `created_at` (DateTime).

#### Entity: `Audit Logs` (Sheet: `Audit Logs`)
- `log_id` (PK, `AUD-^[0-9]{8}$`), `timestamp` (DateTime, Req), `actor_user_id` (Ref, Req), `actor_email` (Req), `action` (e.g., `CREATE_ASSET`, `CHECKOUT_ASSET`, `UPDATE_ROLE`), `entity_name` (e.g., `Assets`), `entity_id` (Req), `before_payload_json` (JSON String), `after_payload_json` (JSON String), `client_ip` (Opt), `user_agent` (Opt).

#### Entity: `Settings` (Sheet: `Settings`)
- Key-Value store: `key` (PK, e.g., `ORGANIZATION_NAME`, `DEFAULT_CURRENCY`, `ASSET_ID_SEQUENCE`, `WARRANTY_ALERT_DAYS_BEFORE`), `value` (String), `category` (String), `updated_by` (Ref), `updated_at` (DateTime).

---

## 4. Controlled Enumerations & Standards

### 4.1 Asset Status Values (`Assets.status`)
1. `ACQUIRED`: Purchased, received, pending initial asset tagging and commissioning.
2. `AVAILABLE`: Ready in inventory for assignment or checkout.
3. `RESERVED`: Held for an approved equipment request.
4. `ASSIGNED`: Formally assigned to a user or department for long-term use.
5. `CHECKED_OUT`: Temporarily checked out for short-term operational use.
6. `IN_MAINTENANCE`: Under scheduled repair, diagnostic, or warranty service.
7. `LOST`: Unaccounted for following audit or reported missing.
8. `DAMAGED`: Structurally or operationally broken; awaiting repair evaluation.
9. `PENDING_RETIREMENT`: Scheduled for disposal, sale, or donation.
10. `RETIRED`: Decommissioned from organizational asset base.
11. `DISPOSED`: Permanently destroyed or recycled.
12. `SOLD`: Transferred to third party via financial sale.
13. `DONATED`: Transferred to charity or non-profit organization.

### 4.2 Asset Condition Values (`Assets.condition`)
- `NEW`: Pristine factory condition in original packaging.
- `EXCELLENT`: Barely used, no cosmetic or functional flaws.
- `GOOD`: Standard operational condition, normal minor wear.
- `FAIR`: Operates normally, noticeable cosmetic wear or battery degradation.
- `POOR`: Degraded performance, requires servicing soon.
- `DAMAGED`: Non-functional or physically damaged.

### 4.3 Transaction Types (`Transactions.transaction_type`)
- `ACQUISITION`: Initial creation and intake.
- `CHECK_OUT`: Temporary checkout to a staff member.
- `CHECK_IN`: Return of checked-out asset to inventory.
- `ASSIGN`: Long-term assignment to an employee or department.
- `UNASSIGN`: Revocation of long-term assignment.
- `TRANSFER_LOCATION`: Physical move between sites/rooms.
- `SEND_TO_MAINTENANCE`: Status change to in-maintenance.
- `RETURN_FROM_MAINTENANCE`: Re-entry into available stock after repair.
- `STATUS_CHANGE`: Generic administrative status update.
- `CONDITION_UPDATE`: Condition re-assessment during physical audit.
- `RETIREMENT`: End-of-life decommission.

---

## 5. Items Requiring Formal Product Decision

Before finalizing database implementations, the following design decisions require stakeholder sign-off:

1. **Sequential vs Random IDs:**  
   - *Option A (Default Proposed):* Sequential human-readable IDs (`AST-000101`, `AST-000102`). Requires a central atomic counter in `Settings`.
   - *Option B:* Nanoid / UUID short strings (`AST-K8X92M`). Eliminates sequence race conditions in Google Sheets without locks, but less familiar on physical asset labels.
2. **Denormalized User in `Assets`:**  
   - *Decision:* We proposed keeping `assigned_user_id` denormalized on `Assets` row for fast filtering, while keeping historical records in `Assignments` and `Transactions`. Must confirm whether to allow department-only custody without a named user.
3. **Depreciation Computation Model:**  
   - *Decision:* Should current book value be calculated on-the-fly dynamically (based on category straight-line monthly depreciation) or stored and updated via a monthly batch job?
4. **Custom Dynamic Attributes:**  
   - *Decision:* Do certain categories require custom key-value pairs (e.g., RAM size for laptops, vehicle license plate for company cars)? If yes, should we store this as a JSON string column in `Assets`?
