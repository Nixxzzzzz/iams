# Product Requirements Document (PRD)
## Asset Management Portal

**Document Version:** 1.0.0  
**Status:** Draft / Architectural Baseline  
**Project Classification:** Standalone Enterprise Web Application  
**Target Delivery Horizon:** Phase 1 Architecture & Specifications  

---

## 1. Executive Summary & Objective

The **Asset Management Portal** is an enterprise-grade platform engineered to provide end-to-end tracking, lifecycle management, financial accounting, maintenance scheduling, and custody management for both physical and digital organizational assets.

Modern organizations struggle with spreadsheet fragmentation, ghost assets, undocumented equipment handovers, missed warranty expirations, and unverified depreciation. The primary objective of this system is to establish a single, authoritative, audit-proof system of record that guarantees:
- Complete custody traceability (who holds an asset, where it is located, and its current physical/operational condition).
- Non-destructive historical transaction tracking (every assignment, transfer, repair, and check-in/check-out is immutably logged).
- Rigorous operational workflows (structured asset checkout, approval-based hardware requests, scheduled maintenance).
- Field-ready asset verification (mobile-friendly QR code generation, scanning, and physical audits).
- Clean data-layer abstraction (initially backed by Google Sheets via a hardened server API, built to transition seamlessly to a relational database such as PostgreSQL without altering UI or business logic).

---

## 2. Core Modules & Functional Scope

The system is partitioned into 20 core architectural modules:

| # | Module | Scope & Core Capabilities |
|---|---|---|
| **01** | **Dashboard** | Operational summary view: asset count by status, active checkouts, overdue returns, pending requests, upcoming maintenance, and depreciation totals. Strictly task-focused visualizations. |
| **02** | **Assets** | Primary asset registry: master list, search, multi-facet filtering (category, status, department, location, condition), single and bulk asset creation, asset tagging, and complete detail views. |
| **03** | **Categories** | Hierarchical categorization (Category & Subcategory), taxonomy definitions, depreciation rules per category, custom specification templates. |
| **04** | **Assignments** | Direct assignment of assets to personnel, contractors, or departments; custody acknowledgment; assignment duration; condition sign-off. |
| **05** | **Check-in / Check-out** | Daily operational custody transfers: short-term reservations, permanent assignments, returns, physical condition checks upon return, accessory checklists. |
| **06** | **Requests** | Self-service employee asset requests, automated routing to Department Managers and Asset Managers, multi-level approvals, rejection reasons, and fulfillment tracking. |
| **07** | **Maintenance** | Preventive and corrective maintenance tracking, repair tickets, vendor servicing, service contracts, cost recording, downtime duration, and maintenance histories. |
| **08** | **Users** | User management, organizational role assignment, department mapping, contact information, active custody roster, and Google Workspace SSO mapping. |
| **09** | **Departments** | Organizational structure, cost centers, department heads, asset allocation quotas, and department-level asset distribution metrics. |
| **10** | **Locations** | Multi-level physical hierarchy: Site / Building / Floor / Room / Rack / Desk; location transfers; physical verification audits. |
| **11** | **Vendors** | Supplier and manufacturer registry, contact points, service level agreements (SLAs), procurement history, linked warranties, and support contacts. |
| **12** | **Documents** | File storage metadata for invoices, receipts, warranty certificates, equipment manuals, and lease agreements (stored securely via Google Drive API). |
| **13** | **Notifications** | In-app alerts and email notifications for overdue checkouts, warranty expiration warnings, maintenance reminders, and pending request approvals. |
| **14** | **Reports** | Pre-built and customizable reporting: asset valuation, depreciation schedules, lost/damaged frequency, department utilization, and historical turnover. |
| **15** | **Audit Logs** | Comprehensive, immutable audit trail recording user identity, timestamp, IP/client info, action type, affected entity, before-state, and after-state. |
| **16** | **Google Sheets Sync** | Bidirectional synchronization engine, validation pipeline, schema enforcement, rate-limit queue management, and synchronization health telemetry. |
| **17** | **Import / Export** | Bulk CSV/XLSX data import with schema validation and dry-run preview; standard report exports (CSV, Excel, PDF asset tags). |
| **18** | **Settings** | Organization profile, currency, date formats, numbering schemes (e.g., `AST-000000`), custom field configurations, and automated alert thresholds. |
| **19** | **Roles & Permissions** | Fine-grained Role-Based Access Control (RBAC), capability matrix, permission overrides, and department-scoped access boundaries. |
| **20** | **Archive / Retirement** | Safe end-of-life workflow: write-offs, disposals, recycling certificates, asset buyouts, donations, with strict data-retention compliance. |

---

## 3. User Personas

### Persona 1: Super Admin (System & Security Administrator)
- **Focus:** System reliability, security posture, user access control, Google Workspace integration health, data integrity, and compliance.
- **Key Tasks:** Configuring OAuth, managing system settings, modifying global numbering schemes, auditing security logs, provisioning admin accounts.

### Persona 2: Asset Manager (IT / Facilities / Inventory Custodian)
- **Focus:** Complete operational control over physical and digital assets.
- **Key Tasks:** Registering new assets, printing QR labels, executing check-in/out, logging maintenance, reviewing audit trails, approving hardware requests, managing asset lifecycles.

### Persona 3: Department Manager (Functional Lead / Cost Center Owner)
- **Focus:** Oversight of equipment assigned to their department, budget tracking, and request authorization.
- **Key Tasks:** Reviewing and approving equipment requests from direct reports, reviewing department inventory, reporting lost/damaged equipment.

### Persona 4: Staff / General Employee
- **Focus:** Requesting equipment, viewing currently assigned gear, acknowledging receipt, and reporting faults.
- **Key Tasks:** Submitting an asset request, acknowledging custody via digital signature/checkbox, reporting broken equipment, initiating return check-in.

### Persona 5: Auditor / Viewer
- **Focus:** Compliance, verification, and financial reporting.
- **Key Tasks:** Generating asset depreciation summaries, viewing physical location audit reports, verifying serial numbers, exporting audit trails without modification rights.

---

## 4. Non-Functional Requirements (NFRs)

### 4.1 Performance & Responsiveness
- **API Latency:** Read requests served under 250ms under cached conditions; Google Sheets synchronized writes acknowledged under 1200ms with optimistic UI feedback.
- **Search & Filter:** Asset inventory list search and filtering must execute in under 150ms client-side or cached server-side.
- **Mobile QR Scanning:** Camera stream QR recognition within 300ms of label acquisition.

### 4.2 Security & Data Protection
- **Zero Direct Public Storage Access:** Frontend clients must never hold Google API service account keys or direct read/write tokens to the underlying Google Spreadsheet.
- **Server-Side Validation:** 100% of incoming mutations must be validated using Zod schemas on the Next.js server layer before reaching the business logic layer.
- **Authentication:** Hardened Google OAuth 2.0 with domain-restricted login capabilities.
- **Session Security:** HTTP-only, Secure, SameSite=Lax session cookies; protection against Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).

### 4.3 Reliability & Availability
- **Graceful Rate Limiting:** Built-in token bucket and request queue to respect Google Sheets API quotas (300 requests per minute per project, 60 requests per minute per user).
- **Transient Failure Resilience:** Exponential backoff with jitter on all Google API integrations.
- **Data Integrity:** Idempotent mutation handling to avoid duplicate row writes during network retries.

### 4.4 Accessibility & Compliance
- **WCAG 2.1 AA Compliance:** High-contrast text ratios (minimum 4.5:1), keyboard navigability for all tables and forms, screen-reader-friendly ARIA tags.
- **Auditability:** Immutable logging of all state transitions and permission changes.

---

## 5. Acceptance Criteria & Quality Gates

1. **Asset Identity Uniqueness:** No two assets can share the same `Asset ID`, `Asset Tag`, or active `Serial Number`.
2. **Historical Integrity:** Modifying an asset’s status, location, or assigned user must append an immutable entry to `Transactions` and `Audit Logs` without overwriting prior records.
3. **Custody Assurance:** An asset cannot be marked as "Assigned" without an explicit assignee (User ID or Department ID) and a recorded handover timestamp.
4. **Clean Decoupling:** The data access layer must expose an abstract repository interface (`IAssetRepository`, `ITransactionRepository`, etc.) such that switching to a PostgreSQL implementation requires zero alterations to the React frontend or API controller signatures.
5. **No AI Aesthetic Contamination:** Zero AI gradients, glowing borders, neural illustrations, or "smart/AI" buzzwords in the user interface.

---

## 6. Future Extensibility Roadmap (Out of Scope for Phase 1)
- Native PostgreSQL / relational database migration.
- Push notifications / Slack / Microsoft Teams incident webhooks.
- Multi-tenancy for distinct corporate entities or subsidiary organizations.
- Offline-first Service Worker caching for warehouse stock audits.
- RFID and Bluetooth Low Energy (BLE) beacon tracking.
