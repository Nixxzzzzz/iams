# UI/UX & Enterprise Design Guidelines
## Asset Management Portal

**Document Version:** 1.0.0
**Design Standard:** Professional Enterprise Software
**Aesthetic Persona:** Clean, High-Density, Functional Utility

---

## 1. Core Design Philosophy: Serious Enterprise Software

The **Asset Management Portal** is a business-critical operational tool designed for inventory managers, sysadmins, finance controllers, and department leads who work in the system daily.

The software must feel **fast, predictable, highly legible, information-dense, and rock-solid**. Functionality, ergonomic keyboard navigation, and immediate data clarity always take precedence over decorative visuals.

---

## 2. Explicit Anti-Patterns & Aesthetic Prohibitions

### 2.1 Complete Ban on Generic "AI" Theming
The product is strictly an enterprise business portal. The following tropes are **prohibited**:
- ❌ **No AI-themed gradients** (specifically purple-to-indigo, cyan-to-violet, or magenta flares).
- ❌ **No glowing borders, neon drop-shadows, or pulsating ring effects.**
- ❌ **No holographic interfaces, sci-fi HUD frames, or angled tech accents.**
- ❌ **No robot, android, circuit board, or neural network illustrations.**
- ❌ **No floating particle canvases or animated mesh background gradients.**
- ❌ **No decorative glassmorphism** that compromises readability or contrast.
- ❌ **No fake 3D renders or isometric floating gadgets.**
- ❌ **No "AI-powered", "AI Insights", "AI Command Center", "Smart Asset Brain", or "Copilot" terminology.**
- ❌ **Do not use the word "AI" anywhere in the interface.**

### 2.2 Rejection of "Giant Card / Widget" Dashboards
Do not design pages that consist merely of four oversized colorful cards with huge numbers and empty space. Operational staff require dense tabular data, actionable filter bars, batch toolbars, and contextual detail panes.

---

## 3. Visual Design System & Design Tokens

### 3.1 Color Palette (Restrained, Semantic & Accessible)
The color system relies on high-contrast neutral slates with restrained semantic accents. All color pairs must exceed WCAG 2.1 AA contrast requirements (minimum 4.5:1 for body text, 3.0:1 for large headers).

| Semantic Role | Light Mode Value | Dark Mode Value | Usage Application |
|---|---|---|---|
| **Canvas Background** | `#F8FAFC` (Slate 50) | `#0B0F19` (Zinc 950) | Main viewport background. |
| **Surface / Card** | `#FFFFFF` (White) | `#111827` (Gray 900) | Tables, forms, panels, modals. |
| **Border / Divider** | `#E2E8F0` (Slate 200) | `#1F2937` (Gray 800) | Table rows, card outlines, inputs. |
| **Primary Text** | `#0F172A` (Slate 900) | `#F9FAFB` (Gray 50) | Primary data values, headers. |
| **Secondary Text** | `#64748B` (Slate 500) | `#9CA3AF` (Gray 400) | Field labels, timestamps, metadata. |
| **Brand / Action** | `#0284C7` (Sky 600) | `#38BDF8` (Sky 400) | Primary action buttons, active tabs. |
| **Success / Available** | `#16A34A` (Green 600) | `#22C55E` (Green 500) | Available status, approved badges. |
| **Warning / Maintenance**| `#D97706` (Amber 600) | `#F59E0B` (Amber 500) | In-repair, expiring warranties, reviews. |
| **Destructive / Lost** | `#DC2626` (Red 600) | `#EF4444` (Red 500) | Missing gear, rejected requests, errors. |
| **Neutral Status** | `#475569` (Slate 600) | `#94A3B8` (Slate 400) | Archived, retired, unassigned items. |

### 3.2 Typography Hierarchy
- **Primary Typeface:** `Inter`, `Geist Sans`, or standard clean system sans-serif (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`).
- **Monospace Typeface:** `JetBrains Mono`, `Geist Mono`, or `"Fira Code"` for Asset IDs (`AST-000109`), serial numbers, IP addresses, and barcode representations.
- **Font Scale & Weights:**
  - Page Titles: `1.25rem (20px)`, SemiBold (`600`), tight tracking.
  - Section Headers: `1.0rem (16px)`, Medium (`500`).
  - Body Text & Table Cells: `0.875rem (14px)`, Regular (`400`).
  - Labels, Badges & Microcopy: `0.75rem (12px)`, Medium (`500`), uppercase tracking for badges.

---

## 4. Purpose-Driven Interface Patterns

Each operational workflow uses an interface tailored to the nature of the data:

| Workflow / Task | Dedicated Interface Pattern | Key UI Requirements |
|---|---|---|
| **Asset Inventory** | **Dense Data Table** | Sticky headers, multi-column sorting, column visibility toggle, inline status badges, row hover state, batch selection checkboxes, pagination with page-size selector. |
| **Inventory Search** | **Facet Filter Bar** | Instant debounced search (by Name, Tag, Serial), multi-select dropdowns for Category, Department, Status, Condition, and a clear-all button. |
| **Asset Intake / Edit** | **Structured Form with Sections** | Logical grouping: Basic Info, Financials, Location & Custody, Technical Specs. Inline validation errors, required field asterisks, no multi-step wizard unless >20 fields. |
| **Asset Overview** | **Master-Detail View** | Header with asset tag, name, status, and quick action toolbar (Check Out, Edit, Print QR, Retire). Tabbed panels: Overview, History Ledger, Maintenance Tickets, Attached Docs. |
| **Custody History** | **Vertical Audit Timeline** | Chronological events displaying timestamp, actor, transition type, condition at handover, and notes with connecting vertical indicator lines. |
| **Equipment Requests**| **Approval Queue Interface** | Split pane or prioritized list showing requesting employee, department, justification, and side-by-side Approve / Reject action bar with mandatory comment modal. |
| **Asset Verification** | **Mobile QR Scanner Modal** | Real-time camera viewfinder, manual tag fallback input field, audio/haptic confirmation chirp upon successful tag acquisition, immediate asset preview drawer. |

---

## 5. Responsive Layout Architecture

### 5.1 Desktop Layout (`>= 1024px`)
- **Navigation:** Persistent, collapsible left sidebar (240px expanded, 64px icon-only rail).
- **Header:** Global search bar (quick asset jump by tag), breadcrumb trail, notification center bell, and user profile avatar with role badge.
- **Content Canvas:** Full-width high-density container (`max-w-[1600px]`), utilizing data tables with 8–12 visible columns.

### 5.2 Tablet Layout (`768px - 1023px`)
- **Navigation:** Icon-rail sidebar with expandable flyout menus on tap.
- **Tables:** Horizontally scrollable data tables with fixed left column (Asset Tag & Name) and fixed right action menu.
- **Panels:** Two-column forms collapse to single-column stacked inputs.

### 5.3 Mobile Layout (`< 768px`)
- **Navigation:** Top navigation bar with hamburger drawer menu and floating primary action button (e.g., Quick Scan QR).
- **Tables to Cards:** Data tables transform into compact list items displaying:
  - Top line: Asset Name & Status Badge.
  - Sub line: Asset Tag (`AST-000109`) • Category • Assigned User.
  - Right: Quick detail chevron.
- **Touch Targets:** All interactive buttons and touch targets adhere to a minimum 44px x 44px clickable area.
- **Camera Viewfinder:** Full-screen camera stream for mobile QR label auditing with continuous scanning mode for bulk inventory counting.

---

## 6. Accessibility & Usability Standards (WCAG 2.1 AA)

1. **Full Keyboard Navigation:** Complete tab-order index across all interactive elements. Modals and drawers must trap focus and close on `Esc`.
2. **Form Accessibility:** Explicit `<label>` elements connected via `htmlFor` to corresponding inputs; error states communicated via `aria-invalid="true"` and `aria-describedby`.
3. **Screen Reader Semantic Structure:** Proper heading tree (`h1`, `h2`, `h3`), tables with `<th scope="col">` headers, and icon buttons equipped with `aria-label` tags.
4. **Motion Restraint:** All transitions configured with `@media (prefers-reduced-motion: reduce)` to disable unnecessary sliding animations.

---

## 7. Exhaustive Page Responsibilities & UI Specifications

Every proposed route is bound to a strict information architecture contract:

### 7.1 Page: `/dashboard`
- **Purpose:** Central operational overview tailored to user role.
- **Access:** All roles (`SUPER_ADMIN`, `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_MANAGER`, `STAFF`, `VIEWER`).
- **Required Data:** Asset count summaries, active checkouts, overdue return count, pending approval badges, recent activity feed.
- **Available Actions:** Quick-actions: "Scan QR", "New Asset Request", "Check Out Asset" (Manager), "Report Defect".
- **Empty State:** Clean banner: "All inventory operations are current. No pending approvals or overdue returns."
- **Loading State:** Neutral skeleton cards mimicking stat boxes and table layout.
- **Error State:** Standard Alert card with retry button: "Unable to load dashboard metrics. Check server connection."
- **Mobile Behavior:** Single-column stacked widgets; sticky quick-action bar at top with QR scan trigger.

### 7.2 Page: `/assets`
- **Purpose:** Master searchable, filterable high-density inventory data table.
- **Access:** All roles (scoped by role: Global for Admins/Asset Mgrs; Department-scoped for Dept Mgrs; Self-scoped for Staff).
- **Required Data:** Paginated assets, category dictionary, department dictionary, location dictionary.
- **Available Actions:** Row click opens Detail Drawer; multi-select export (CSV); "Add Asset" button (Admins/Asset Mgrs).
- **Filters:** Category (multi-select), Status (multi-select), Condition, Custody Type (`USER`/`DEPARTMENT`), Location, Department.
- **Search:** Instant debounced text input searching `asset_tag`, `name`, `serial_number`, `brand`, `model`.
- **Sorting:** By `asset_id`, `name`, `status`, `condition`, `purchase_date`, `purchase_cost`. Default: `updated_at DESC`.
- **Pagination:** Server-backed (25, 50, 100 rows per page) with total count and current range.
- **Empty State:** Centered state card: "No assets found matching your filter criteria. [Clear Filters]".
- **Loading State:** 10-row tabular shimmer skeleton.
- **Error State:** In-table error banner with retry trigger.
- **Mobile Behavior:** Transforms table rows into swipeable cards displaying Tag, Brand/Model, Status Badge, and Location.

### 7.3 Page: `/assets/new`
- **Purpose:** Data entry form for cataloging new physical or digital gear.
- **Access:** `SUPER_ADMIN`, `ADMIN`, `ASSET_MANAGER`.
- **Required Data:** Categories (with `spec_schema_json`), Locations, Departments, Vendors, Currency default (INR).
- **Available Actions:** Save & View, Save & Add Another, Cancel.
- **Validation:** Zod client & server validation on all mandatory fields; serial number uniqueness check.
- **Empty State:** N/A (Form).
- **Loading State:** Form field skeleton loader while reference dictionaries fetch.
- **Error State:** Top-level alert with inline red border highlights and error strings under failing inputs.
- **Mobile Behavior:** Stacked single-column input layout with sticky bottom save button.

### 7.4 Page: `/assets/[assetId]`
- **Purpose:** Complete master-detail dossier for a specific asset.
- **Access:** Authorized users within data scope.
- **Required Data:** Asset entity, active assignment, category, location hierarchy, vendor details, recent transactions, linked documents.
- **Available Actions:** Print QR Label, Edit Asset, Check Out / Assign, Check In (if in use), Open Maintenance Ticket, Archive / Retire.
- **Tabs:**
  1. Overview (Specifications, dynamic category fields, financial details).
  2. Custody & Assignments (Active holder, expected return, handover history).
  3. Maintenance (Ticket history, recorded costs, diagnostic notes).
  4. Documents (Drive invoices, warranty cards, manuals).
  5. Audit History (Immutable transaction timeline).
- **Mobile Behavior:** Horizontal scrollable tabs; sticky header displaying Tag (`AST-000001`) and Status badge.

### 7.5 Page: `/assignments/checkout`
- **Purpose:** Controlled workflow for checking out or assigning equipment.
- **Access:** `SUPER_ADMIN`, `ADMIN`, `ASSET_MANAGER`.
- **Required Data:** Available assets list, User directory, Department directory, Accessories checklist.
- **Available Actions:** Select Asset, Choose Custody Type (`USER` or `DEPARTMENT`), Select Assignee, Select Assignment Type (`LONG_TERM` or `TEMPORARY_CHECKOUT`), Set Expected Return Date, Condition Sign-off, Complete Checkout.
- **Validation:** Enforces asset is in `AVAILABLE` status. Exactly one assignee selected.
- **Mobile Behavior:** Step-by-step wizard style on mobile viewports for ergonomic touch completion.

### 7.6 Page: `/assignments/checkin`
- **Purpose:** Intake, return inspection, and condition reassessment workflow.
- **Access:** `SUPER_ADMIN`, `ADMIN`, `ASSET_MANAGER`.
- **Required Data:** Active assignments roster, QR lookup engine, return location hierarchy.
- **Available Actions:** Scan QR tag to pull active assignment, verify accessories returned, assess returned condition (`NEW` to `DAMAGED`), select return storage shelf/room, flag damage (opens maintenance ticket), Confirm Check-In.
- **Mobile Behavior:** Direct integration with mobile camera stream for instant scan-to-checkin.

### 7.7 Page: `/requests/approvals`
- **Purpose:** Consolidated requisition review queue for authorizing managers.
- **Access:** `SUPER_ADMIN`, `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_MANAGER`.
- **Required Data:** Requests matching manager's approval level (Dept approval vs Asset allocation).
- **Available Actions:** Approve request, Reject request (with mandatory comment modal), Allocate specific asset (Asset Mgr).
- **Filters:** Queue stage (`PENDING_DEPT`, `PENDING_ASSET`), Urgency (`LOW` to `URGENT`), Department.
- **Empty State:** "Your approval queue is clear. No pending equipment requisitions."
- **Mobile Behavior:** High-priority cards with explicit side-by-side green "Approve" and red "Reject" action buttons.

### 7.8 Page: `/maintenance`
- **Purpose:** Maintenance and defect tracking ledger.
- **Access:** `SUPER_ADMIN`, `ADMIN`, `ASSET_MANAGER` (Full); `DEPARTMENT_MANAGER`, `VIEWER` (Read); `STAFF` (View own reported issues).
- **Required Data:** Maintenance tickets, linked assets, assigned technicians, vendor directory.
- **Available Actions:** "Report Defect", Update Status (`SCHEDULED` -> `IN_PROGRESS` -> `COMPLETED`), Record Actual Cost, Close Ticket.
- **Filters:** Status, Priority, Maintenance Type, Vendor.
- **Mobile Behavior:** Compact cards with prominent priority pill badges (`CRITICAL`, `HIGH`).

### 7.9 Page: `/settings/authentication`
- **Purpose:** Google OAuth domain security policy manager.
- **Access:** Strictly `SUPER_ADMIN`.
- **Required Data:** Current `Settings.ALLOWED_EMAIL_DOMAINS` value.
- **Available Actions:** Add allowed domain, Remove allowed domain, Add individual allowed email, Save Domain Policy.
- **Safety Rule:** Disallows saving wildcard `*` allow-all policies in production. Displays clear notice that unset policies fail closed (`AUTH_CONFIGURATION_REQUIRED`).

---

## 8. Professional Operational Terminology & Lexicon

To maintain enterprise rigor and credibility, the system strictly enforces operational terminology across all labels, headers, and tooltips:

| Approved Enterprise Operational Term | Prohibited Casual / AI Buzzword | Rationale |
|---|---|---|
| **Operational Overview / Dashboard** | ~~AI Command Center~~, ~~AI Insights~~ | Professional, task-oriented clarity. |
| **Asset Master Registry** | ~~Smart Asset Brain~~, ~~Asset Intelligence Hub~~ | Standard enterprise asset inventory terminology. |
| **Hardware Requisition** | ~~AI Auto-Requisition~~ | Reflects formal organizational approval workflows. |
| **Defect / Service Ticket** | ~~Smart Diagnostics~~ | Standard ITIL maintenance terminology. |
| **Custody Handover / Allocation**| ~~Smart Ownership~~ | Legal and operational clarity for equipment custody. |
| **Inventory Verification / Audit**| ~~AI Stock Audit~~ | Focuses on verifiable physical barcode/QR scans. |
| **Depreciation & Valuation** | ~~Predictive Financial Intelligence~~ | Reflects explicit mathematical purchase cost data. |
| **Activity Audit Log** | ~~System Neural Trail~~ | Compliance and audit-standard naming. |

---

## 9. Mobile Information Architecture & Field Operational Layout

Technicians and warehouse managers require fast, tactile mobile interactions:

```
+----------------------------------------------------------------------------------------------------+
|                                    MOBILE WORKFLOW WIREFRAME (PWA)                                 |
+----------------------------------------------------------------------------------------------------+
|  [Header]  (Hamburger Menu)        ASSET PORTAL                  (User Avatar / Org)               |
|  ------------------------------------------------------------------------------------------------  |
|  [Sticky Bar]  [ Quick Scan QR 📷 ]                  [ + New Requisition ]                        |
|  ------------------------------------------------------------------------------------------------  |
|  [Operational Cards Stack]                                                                         |
|  +----------------------------------------------------------------------------------------------+  |
|  | AST-000109  •  ThinkPad P1 Gen 5                                    [ ASSIGNED ]             |  |
|  | Serial: PF-39X921  •  Category: Laptops  •  Condition: GOOD                                   |  |
|  | Custodian: Rahul Sharma (Computer Science)                                                   |  |
|  | [ Quick View ]                                                        [ Check-In / Return ]  |  |
|  +----------------------------------------------------------------------------------------------+  |
|  | AST-000204  •  Epson PowerLite 2250U                                [ AVAILABLE ]            |  |
|  | Serial: EP-992144  •  Location: Room 204 Cabinet A                  Condition: EXCELLENT     |  |
|  | [ Check-Out ]                                                         [ Print Tag ]          |  |
|  +----------------------------------------------------------------------------------------------+  |
|  ------------------------------------------------------------------------------------------------  |
|  [Bottom Bar]  (📊 Dashboard)   (📦 Assets)   (📷 Scan)   (📋 Requests)   (⚙️ More)                 |
+----------------------------------------------------------------------------------------------------+
```
