# Enterprise UI/UX Design System Specification
## Asset Management Portal

**Document Version:** 2.0.0
**Status:** Approved & Finalized Design System Contract
**Design Paradigm:** High-Density Enterprise Operational Software
**Aesthetic Archetype:** Neutral, Utilitarian, Institutional Workspace
**Deployment Context:** Corporate IT, University Administration, Enterprise Operations, Government Agencies

---

## 1. Executive Design Philosophy & Absolute Visual Rules

The **Asset Management Portal** is a mission-critical operational system designed for IT infrastructure engineers, facilities coordinators, logistics custodians, department administrators, and organizational leadership. The interface must look, feel, and behave like mature, dependable enterprise software deployed in institutional corporate, governmental, or educational environments.

### 1.1 The Absolute Visual Rule: Zero "AI" Aesthetic Contamination
There must be **ZERO visual or textual indication that this is an AI product**.
The software must look like serious, professional business software.

#### Prohibited Visual Tropes (Strictly Banned):
- ❌ **No AI gradients:** No purple-to-blue, magenta, violet, cyan, or rainbow gradients on backgrounds, buttons, borders, or text.
- ❌ **No glowing borders or neon effects:** No glowing CSS outlines, luminous pulse animations, or halo rings around active elements.
- ❌ **No glassmorphism or holographic surfaces:** No frosted acrylic panels with high-blur backdrops, floating translucent cards, or cyber glass effects.
- ❌ **No animated background artifacts:** No floating blobs, particle meshes, animated canvas nets, futuristic grid lines, or circuit traces.
- ❌ **No decorative oversized shadows:** No deep multi-layered shadows ($> 8\text{px}$) that make cards float or look like consumer landing pages.
- ❌ **No futuristic or gaming imagery:** No glowing icons, sci-fi scanner reticles, robot mascots, isometric 3D server illustrations, or cryptocurrency motifs.
- ❌ **No SaaS template / marketing gimmicks:** No oversized hero banners, animated testimonial carousels, or consumer-style onboarding popups inside operational pages.

#### Prohibited Buzzwords & Marketing Copy (Strictly Banned):
- ❌ **Banned Words:** `AI-powered`, `Smart`, `Intelligent`, `Copilot`, `AI Assistant`, `Insights Engine`, `Neural`, `Magic`, `Future of...`, `Predictive Brain`, `Cognitive`, `Next-Gen`, `Automagic`.
- ✅ **Required Operational Terminology:** The interface exclusively uses standard institutional, logistics, and IT inventory language:
  - `Register Asset` (never *Launch Asset* or *Smart Ingest*)
  - `Assign Asset` / `Custody Handover` (never *Smart Assign* or *Intelligent Allocation*)
  - `Check Out` / `Check In` (never *Auto-Borrow* or *Smart Return*)
  - `Report Issue` / `Open Service Ticket` (never *AI Diagnostics*)
  - `Submit Requisition` / `Approve Request` / `Reject Request` (never *Smart Approval*)
  - `Retire Asset` / `Record Disposal` (never *Smart Offboarding*)
  - `Audit Log` / `Transaction Ledger` (never *Insights Stream*)
  - `Valuation Summary` (never *Predictive Financial Intelligence*)

### 1.2 Core Enterprise Design Principles
1. **The Information Itself is the Visual Hierarchy:** Data density, typography contrast, clean borders, and disciplined spacing establish layout structure—never decorative colors, gradient fills, or graphic illustrations.
2. **Predictable & Habitual Workflows:** Buttons, inputs, drawers, dialogs, and tables behave consistently across all 20 modules without surprising micro-interactions.
3. **Scannability First:** Every data table, status pill, and detail card is engineered for rapid visual parsing during field warehouse stock audits, barcode verifications, and high-volume checkouts.
4. **Keyboard & Ergonomic Accessibility:** 100% of workflows are operable via keyboard navigation and screen readers, targeting strict **WCAG 2.2 AA** compliance.
5. **Restrained Semantic Color:** Primary UI surfaces are neutral. Color is never used for general decoration; it is reserved strictly for functional state differentiation (Available, Assigned, Overdue, Defective).
6. **Low Cognitive Load:** Eliminate extraneous visual noise, decorative icons, and nested dialogs. Complex workflows use dedicated multi-step forms or full pages rather than cramped modals.

---

## 2. Design Tokens Specification

The future implementation must consume these design tokens strictly. Hardcoded pixel values, random margins, or arbitrary hex colors are prohibited.

### 2.1 Semantic Color System

The color foundation is built on high-contrast neutral slate/zinc foundations with restrained, functional accents.

```
+----------------------------------------------------------------------------------------------------+
|                                    COLOR TOKEN PALETTE OVERVIEW                                    |
+----------------------------------------------------------------------------------------------------+
|  Base Canvas:       #F8FAFC (Slate 50)  /  #090D16 (Zinc 950 Dark)                                 |
|  Surface:           #FFFFFF (White)     /  #111827 (Gray 900 Dark)                                 |
|  Elevated Surface:  #F1F5F9 (Slate 100) /  #1F2937 (Gray 800 Dark)                                 |
|  Border:            #E2E8F0 (Slate 200) /  #1F2937 (Gray 800 Dark)                                 |
|  Text Primary:      #0F172A (Slate 900) /  #F9FAFB (Gray 50 Dark)                                  |
|  Text Secondary:    #475569 (Slate 600) /  #94A3B8 (Slate 400 Dark)                                |
|  Text Muted:        #94A3B8 (Slate 400) /  #64748B (Slate 500 Dark)                                |
|  Brand Action:      #0284C7 (Sky 600)   /  #38BDF8 (Sky 400 Dark)                                  |
|  Semantic Success:  #16A34A (Green 600) /  #22C55E (Green 500 Dark)                                 |
|  Semantic Warning:  #D97706 (Amber 600) /  #F59E0B (Amber 500 Dark)                                 |
|  Semantic Danger:   #DC2626 (Red 600)   /  #EF4444 (Red 500 Dark)                                  |
|  Semantic Info:     #475569 (Slate 600) /  #94A3B8 (Slate 400 Dark)                                |
|  Focus Ring:        #0284C7 (Sky 600)   /  #38BDF8 (Sky 400 Dark)                                  |
+----------------------------------------------------------------------------------------------------+
```

#### Complete Semantic Token Mapping (Light & Dark Theme)

| Token Name | Light Theme Value | Dark Theme Value | Functional Role & Application |
|---|---|---|---|
| `--color-canvas` | `#F8FAFC` (Slate 50) | `#090D16` (Zinc 950) | Root viewport background |
| `--color-surface` | `#FFFFFF` (White) | `#111827` (Gray 900) | Primary cards, tables, panels, dialogs |
| `--color-surface-elevated`| `#F1F5F9` (Slate 100) | `#1F2937` (Gray 800) | Tooltips, popovers, dropdown menus |
| `--color-surface-hover` | `#F8FAFC` (Slate 50) | `#1A2234` (Zinc 900) | Table row hover, menu item hover |
| `--color-border` | `#E2E8F0` (Slate 200) | `#273244` (Gray 800) | Card borders, table grid lines, inputs |
| `--color-border-subtle` | `#F1F5F9` (Slate 100) | `#1E293B` (Slate 800) | Inner card dividers, table inner dividers |
| `--color-text-primary` | `#0F172A` (Slate 900) | `#F8FAFC` (Slate 50) | Headings, primary table data, labels |
| `--color-text-secondary`| `#475569` (Slate 600) | `#94A3B8` (Slate 400) | Field labels, timestamps, metadata, captions |
| `--color-text-muted` | `#94A3B8` (Slate 400) | `#64748B` (Slate 500) | Empty placeholders, disabled hints |
| `--color-action-primary`| `#0284C7` (Sky 600) | `#38BDF8` (Sky 400) | Primary CTA buttons, active tabs, links |
| `--color-action-hover` | `#0369A1` (Sky 700) | `#0284C7` (Sky 600) | Primary CTA hover state |
| `--color-action-subtle` | `#E0F2FE` (Sky 100) | `#0C4A6E` (Sky 900) | Active nav item background, soft action pill |
| `--color-success` | `#16A34A` (Green 600) | `#22C55E` (Green 500) | Available status, approved badges |
| `--color-success-bg` | `#DCFCE7` (Green 100) | `#14532D` (Green 950) | Success badge / banner background |
| `--color-warning` | `#D97706` (Amber 600) | `#F59E0B` (Amber 500) | In maintenance, pending, expiring warranty |
| `--color-warning-bg` | `#FEF3C7` (Amber 100) | `#78350F` (Amber 950) | Warning badge / banner background |
| `--color-danger` | `#DC2626` (Red 600) | `#EF4444` (Red 500) | Missing gear, rejected, overdue, destructive |
| `--color-danger-bg` | `#FEE2E2` (Red 100) | `#7F1D1D` (Red 950) | Danger badge / banner background |
| `--color-info` | `#475569` (Slate 600) | `#94A3B8` (Slate 400) | Archived, retired, neutral status |
| `--color-info-bg` | `#F1F5F9` (Slate 100) | `#1E293B` (Slate 800) | Neutral badge background |
| `--color-focus-ring` | `#0284C7` (Sky 600) | `#38BDF8` (Sky 400) | Accessible high-contrast keyboard focus ring |

#### Dark Mode Rules
- Dark mode must look like serious operational IT software (resembling GitHub Dark, Linear, or AWS Console dark themes), **never cyberpunk or sci-fi**.
- Canvas is deep neutral `#090D16` / `#111827`, never pure pitch `#000000` or saturated purple.
- Borders remain subtle `#273244` to maintain table structural grids.
- Status badges use muted dark background fills (`#14532D`, `#78350F`, `#7F1D1D`) with legible bright text.

---

### 2.2 Typography Scale & Rules

Readability, tabular alignment, and fast scanning take absolute precedence over decorative typography. No oversized marketing headings are permitted inside the portal.

#### Font Stacks
- **Primary UI Text:** `Inter`, `Geist Sans`, or native system sans-serif (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Monospace Identification:** `JetBrains Mono`, `Geist Mono`, or `"SF Mono"` for Asset IDs (`AST-000001`), Serial Numbers, IP addresses, MAC addresses, and barcode tags.

#### Typography Scale Tokens

| Token | Size | Line Height | Weight | Application |
|---|---|---|---|---|
| `--font-title-page` | `1.25rem (20px)` | `1.75rem (28px)` | `600` (SemiBold) | Page titles (H1), top shell title |
| `--font-title-section`| `1.0rem (16px)` | `1.5rem (24px)` | `600` (SemiBold) | Panel headers, card section titles (H2) |
| `--font-title-sub` | `0.875rem (14px)` | `1.25rem (20px)` | `600` (SemiBold) | Fieldset group titles, table column headers |
| `--font-body-regular` | `0.875rem (14px)` | `1.25rem (20px)` | `400` (Regular) | Primary table cells, form inputs, body text |
| `--font-body-medium` | `0.875rem (14px)` | `1.25rem (20px)` | `500` (Medium) | Table row primary text, buttons, active items |
| `--font-caption` | `0.75rem (12px)` | `1.0rem (16px)` | `400` (Regular) | Timestamps, helper hints, breadcrumb links |
| `--font-badge` | `0.75rem (12px)` | `1.0rem (16px)` | `500` (Medium) | Status pills, condition indicators, tags |
| `--font-mono-code` | `0.8125rem (13px)`| `1.125rem (18px)`| `500` (Medium) | Asset tags (`AST-000109`), serials, IDs |
| `--font-tabular-nums` | Inherit | Inherit | Inherit | Enforced `font-variant-numeric: tabular-nums` for alignment |

---

### 2.3 Spacing, Radius, Shadow & Control Tokens

| Token Category | Token Name | Value | Purpose & Usage |
|---|---|---|---|
| **Spacing** | `--space-1` | `0.25rem (4px)` | Micro-gap between icon and badge text |
| | `--space-2` | `0.5rem (8px)` | Compact control padding, button inner gap |
| | `--space-3` | `0.75rem (12px)` | Form control vertical padding, table cell vertical |
| | `--space-4` | `1.0rem (16px)` | Standard card padding, table cell horizontal |
| | `--space-6` | `1.5rem (24px)` | Section gap, page margin gutters |
| | `--space-8` | `2.0rem (32px)` | Major module layout separation |
| **Radius** | `--radius-sm` | `0.25rem (4px)` | Badges, pills, inner inputs |
| | `--radius-md` | `0.375rem (6px)` | Standard buttons, form fields, cards |
| | `--radius-lg` | `0.5rem (8px)` | Modals, slide-out drawers, large panels |
| **Borders** | `--border-width` | `1px` | Crisp structural line definition |
| **Shadows** | `--shadow-sm` | `0 1px 2px 0 rgba(0,0,0,0.05)`| Cards, table containers |
| | `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)`| Dropdown menus, popovers |
| | `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)`| Slide-out drawers, modal overlays |
| **Control Heights**| `--control-height`| `2.25rem (36px)` | Uniform height for text inputs, selects, buttons |
| | `--control-height-sm`| `1.875rem (30px)`| Compact table action buttons, filter selects |
| | `--table-row-h` | `2.5rem (40px)` | Dense, readable inventory row height |

---

## 3. Application Shell & Structural Layout

The application shell provides an efficient, persistent operational frame designed to maximize data visibility and eliminate navigational friction.

```
+----------------------------------------------------------------------------------------------------+
|  [Sidebar 240px]  |  [Header: 56px Height - Breadcrumbs, Search, Alert Bell, User Profile]        |
|  -----------------|--------------------------------------------------------------------------------|
|  📦 Assets        |  Assets / Master Inventory                    [+ Register Asset] [Export CSV]  |
|  📋 Assignments   |  ----------------------------------------------------------------------------  |
|  ⚡ Requests      |  [ Filter Bar: Search, Category, Status, Condition, Location | Clear All ]    |
|  🛠️ Maintenance   |  ----------------------------------------------------------------------------  |
|  👥 Users         |  High-Density Data Table                                                      |
|  🏢 Departments   |  (Paginated 25 / 50 / 100 rows, sticky column headers, dense 40px rows)         |
|  📍 Locations     |                                                                                |
|  🤝 Vendors       |                                                                                |
|  📄 Documents     |                                                                                |
|  📊 Reports       |                                                                                |
|  🔒 Audit Logs    |  ----------------------------------------------------------------------------  |
|  ⚙️ Settings       |  Pagination: Showing 1-25 of 1,482 assets                  [< Prev] [Next >]   |
+----------------------------------------------------------------------------------------------------+
```

### 3.1 Shell Elements Specification
1. **Persistent Sidebar ($240\text{px}$ width):**
   - Brand mark (Top-left, non-distracting institutional logo and "Asset Portal" text, $36\text{px}$ height).
   - Navigation links grouped logically:
     - **Core Operations:** Assets, Assignments, Requests, Maintenance.
     - **Organization:** Users, Departments, Locations, Vendors.
     - **Records & Compliance:** Documents, Reports, Audit Logs (Admin only).
     - **Administration:** Settings (Admin only).
   - Sidebar can collapse to an icon-rail ($64\text{px}$) on desktop via a bottom toggle.
2. **Top Header ($56\text{px}$ height):**
   - Left: Dynamic Breadcrumb trail (e.g., `Assets / Laptops / AST-000109`).
   - Center: Quick Global Search input (`Cmd+K` / `Ctrl+K` shortcut to search asset tags, serials, and staff).
   - Right:
     - Notification Bell with unread counter badge.
     - Theme Toggle (Light / Dark).
     - User Profile Pill displaying user avatar, name, and role badge (e.g., `ASSET_MANAGER`).
3. **Main Content Canvas:**
   - Consistent maximum width: $1600\text{px}$, centered with $24\text{px}$ page gutters.
   - Clean page header with title (H1, 20px), contextual subtitle, and primary right-aligned action buttons.
   - Optional contextual toolbar for page-specific filters and batch actions.

### 3.2 Responsive Layout Standards & Breakpoints

| Viewport | Breakpoint Range | Shell & Layout Behavior |
|---|---|---|
| **Desktop** | `>= 1024px` | Persistent $240\text{px}$ sidebar (or $64\text{px}$ icon-rail); full tabular data display; multi-column forms (2 or 3 columns). |
| **Tablet** | `768px - 1023px` | Collapsed $64\text{px}$ sidebar rail (expands to overlay drawer on menu click); horizontal table scrolling with sticky left asset tag column; two-column forms collapse to single column. |
| **Mobile** | `< 768px` | Sidebar hidden behind hamburger menu; top header compact ($48\text{px}$); bottom navigation bar ($60\text{px}$) with quick actions (`Dashboard`, `My Assets`, `Quick Scan QR`, `Requests`, `More`); data tables transform into card stacks with $44\text{px}$ touch targets. |

---

## 4. Role-Adapted Dashboards

Dashboards are strictly operational workload summaries—never decorative marketing analytics. Every widget must represent an actionable queue or status summary.

### 4.1 Super Admin & Admin Dashboard
- **Operational KPI Cards (Row 1):**
  - Total Assets (`1,482`)
  - Available in Stock (`942`)
  - Active Assignments (`480`)
  - In Maintenance (`38`)
  - Overdue Returns (`22`)
  - Pending Hardware Requests (`12`)
- **Workload Queues (Row 2):**
  - Left Panel ($60\%$ width): **Requisitions Requiring Final Approval** (list of pending hardware requests with one-click review).
  - Right Panel ($40\%$ width): **Warranties Expiring Within 30 Days** (asset tag, model, vendor, expiry date).
- **Recent System Ledger (Row 3):**
  - Dense real-time table of the last 10 transactions from `Transactions` (timestamp, actor, event, asset tag, notes).

### 4.2 Asset Manager Dashboard
- **Operational Workload Cards:**
  - Assets Requiring Attention (`14`)
  - Pending Check-ins (`9`)
  - Overdue Returns (`8`)
  - Open Service Tickets (`19`)
  - Pending Allocation Requests (`12`)
  - Recently Added Assets (`7` this week)
- **Quick Action Bar:** Direct one-click access: `[+ Register Asset]`, `[Check Out]`, `[Process Return]`, `[Batch Print QR]`.

### 4.3 Department Manager Dashboard
- **Department Roster Inventory:** Summary count of assets assigned to department staff and shared department assets.
- **Pending Requisitions Queue:** High-priority cards showing requester name, requested item/category, reason, urgency, and direct `[Approve]` and `[Reject]` actions.
- **Department Maintenance & Overdue Summary:** Active issues and overdue returns within the manager's department.

### 4.4 Staff Dashboard
- **My Assigned Assets:** Card roster of items currently held by the logged-in user, showing asset tag, model, serial, checkout date, expected return, and condition.
- **Upcoming Returns:** Warning card if any item has an upcoming return date within 7 days.
- **My Requisitions:** Status tracking for submitted requests (`Submitted`, `Dept Approved`, `Fulfilled`, `Rejected`).
- **Self-Service Actions:** `[Request Equipment]`, `[Report Issue/Defect]`.

### 4.5 Viewer Dashboard (Field-Restricted Read-Only Summary)
- **Read-Only Operational Summary:** Total assets by category, available stock counts, assets by physical location, and general non-sensitive status breakdown.
- **Strict Masking:** **Zero financial figures** (no purchase costs, book values, or expenditure totals), zero audit logs, zero security configuration details, and zero personal contact numbers.

---

## 5. Asset Master Inventory Table Specifications

The master inventory view is the core workhorse of the application. It is optimized for high-density reading, rapid sorting, multi-facet filtering, and bulk operations.

```
+-----------------------------------------------------------------------------------------------------------------------------------+
| [Search Tag/Name/Serial...] [Category: All v] [Status: All v] [Condition: All v] [Location: All v] [Custody: All v] [Reset Filters] |
+-----------------------------------------------------------------------------------------------------------------------------------+
| [x] | Asset Tag   | Name                  | Category  | Brand / Model  | Serial Number | Status       | Condition | Custodian     |
|-----|-------------|-----------------------|-----------|----------------|---------------|--------------|-----------|---------------|
| [ ] | AST-000109  | ThinkPad P1 Gen 5     | Laptops   | Lenovo P1 G5   | PF-39X921     | [ASSIGNED]   | [GOOD]    | Rahul Sharma  |
| [ ] | AST-000110  | Latitude 7430         | Laptops   | Dell 7430      | 88X-1992      | [AVAILABLE]  | [EXCELLENT]| In IT Storage |
| [ ] | AST-000204  | PowerLite 2250U       | Projector | Epson 2250U    | EP-992144     | [ASSIGNED]   | [FAIR]    | CS Dept (Lab) |
| [ ] | AST-000311  | MacBook Pro 16"       | Laptops   | Apple M3 Max   | C02-X9921     | [MAINTENANCE]| [DAMAGED] | Vendor RMA    |
+-----------------------------------------------------------------------------------------------------------------------------------+
```

### 5.1 Default Columns Specification

The table does not overload the screen with every attribute by default. The standard 11 default columns are:

1. **Selection Checkbox:** Multi-select for bulk actions (Export, Batch Print QR, Bulk Location Transfer).
2. **`Asset Tag` (Monospace, bold):** Primary natural identifier (`AST-000109`). Clickable link opening the Asset Detail Dossier.
3. **`Name`:** Primary asset name string (Max 35 characters, truncated with tooltip on hover).
4. **`Category`:** Category name pill (`Laptops`, `Monitors`, `Networking`).
5. **`Brand / Model`:** Combined secondary text (e.g., `Lenovo ThinkPad P1 Gen 5`).
6. **`Serial Number` (Monospace):** Hardware serial number.
7. **`Status`:** Visual status badge (Semantic tint + icon + text label).
8. **`Condition`:** Physical wear indicator badge (`New`, `Good`, `Fair`, `Damaged`).
9. **`Custodian`:** Current holder with icon indicator (`👤 User Name` or `🏢 Department Name`). If in storage, displays location storage shelf.
10. **`Location`:** Physical room or storage site (`HQ - Room 102`).
11. **`Warranty`:** Expiry date (`YYYY-MM-DD`) with amber warning indicator if within 30 days.
12. **`Updated`:** Relative timestamp of last update (`2h ago`, `3d ago`).
13. **`Actions` (Fixed Right Column):** Contextual menu (`View Details`, `Check Out`, `Edit`, `Print QR`).

### 5.2 Table Interactions & Behaviors
- **Row Height:** Uniform $40\text{px}$ dense height (`--table-row-h`).
- **Row Hover:** Background tints smoothly to `--color-surface-hover`.
- **Keyboard Navigation:** Arrow keys move row focus; `Enter` opens detail drawer/dossier; `Space` toggles checkbox.
- **Sorting:** Clickable column headers with sort direction indicators ($\uparrow\downarrow$). Server-side / cached sort.
- **Filtering:** Instant multi-facet filter bar: Category, Status, Condition, Department, Location. Clear button resets all.
- **Debounced Search:** Global keyword input debounced at $250\text{ms}$ across Tag, Name, Serial Number, and Custodian.
- **Column Visibility:** Dropdown permitting users to toggle optional columns (e.g., Purchase Date, Vendor, Subcategory).
- **Pagination:** Bottom pagination toolbar: Showing $1-25$ of $1,482$ assets; page size selector ($25$, $50$, $100$).
- **Bulk Selection Toolbar:** Appears when $\ge 1$ row is checked: `[X items selected] | [Print QR Labels] [Export CSV] [Transfer Location] [Clear Selection]`.

---

## 6. Asset Detail Dossier Specifications

The Asset Dossier provides a complete, 360-degree operational record for an asset.

### 6.1 Header Card
- **Breadcrumb:** `Assets / Laptops / AST-000109`
- **Identity:** Bold monospace tag (`AST-000109`), prominent asset name (`ThinkPad P1 Gen 5`), Status Badge, Condition Badge.
- **Primary Actions (Right):**
  - `[ Print QR Label ]` (Opens print preview modal)
  - `[ Check Out / Assign ]` (Enabled if Available; disabled with explanation if Assigned)
  - `[ Check In ]` (Enabled if Assigned)
  - `[ Report Issue ]` (Opens maintenance ticket)
  - `[ Edit ]` (Admin / Asset Manager only)

### 6.2 Five Dossier Tabs

#### 1. Overview Tab
- **Identification & Hardware Specs:** Category, Subcategory, Brand, Model, Serial Number, Barcode Tag.
- **Dynamic Specifications:** Two-column key-value grid rendering custom fields from the category schema (e.g., Processor, RAM GB, Storage GB, OS, MAC Address).
- **Procurement & Financials:**
  - Purchase Date, Purchase Cost (`₹`), Current Book Value (`₹`), Vendor Name, Invoice Reference.
  - **Viewer Security Enforcement:** This entire financial block is **completely hidden and omitted from the DOM** when accessed by a `VIEWER`.
- **Warranty Information:** Expiration date, warranty status badge (`Active`, `Expiring Soon`, `Expired`), coverage provider.
- **Physical Placement:** Site, Building, Floor, Room, Storage Shelf/Rack/Desk.

#### 2. Custody Tab
- **Current Custody Status:**
  - Custodian: User Name or Department Name.
  - Handover Date & Expected Return Date.
  - Assignment Type: `PERMANENT`, `TEMPORARY`, or `DEPARTMENT_SHARED`.
  - Condition at checkout and recorded handover notes.
- **Custody Contract History:** Chronological table of all previous holders, checkout dates, return dates, turn-in condition, and checking-in technician.

#### 3. Maintenance Tab
- **Open Service Tickets:** Active tickets with defect description, priority badge, assigned technician/vendor, and logged date.
- **Repair History:** Table of completed repairs, parts replaced, downtime duration, resolution summary, and maintenance costs (costs hidden for `VIEWER`).

#### 4. Documents Tab
- **Attached Files Grid:** Invoices, warranty certificates, equipment manuals, photographic condition evidence, disposal certificates (hosted securely via Google Drive).
- Shows file name, file type icon, upload date, file size, and secure preview/download links.
- Private documents (invoices, receipts) are restricted from `VIEWER`.

#### 5. History Tab (Immutable Transaction Ledger)
- Chronological vertical timeline rendering every state transition from `Transactions`:
  - Handover events, return check-ins, maintenance openings/closings, location transfers, condition updates.
  - Each item displays: Timestamp, Actor Name (`Rahul Sharma`), Action Type Badge (`CHECK_OUT`), Previous State $\to$ New State, and Notes.

---

## 7. Form Design Standards & Fieldset Layouts

Forms are structured into logical, clear fieldset sections to prevent visual fatigue and ensure fast, error-free data entry.

```
+----------------------------------------------------------------------------------------------------+
|  FORM SECTION: 1. Identification & Classification                                                 |
|  Asset Name *                      Asset Tag *                      Category *                     |
|  [ ThinkPad P1 Gen 5             ] [ TAG-10492                    ] [ Laptops                    v ] |
|  ------------------------------------------------------------------------------------------------  |
|  FORM SECTION: 2. Dynamic Specifications (Loaded from Category Template)                          |
|  Processor (CPU) *                 RAM (GB) *                       Storage (GB) *                 |
|  [ Intel Core i7-13700H          ] [ 32                         ] [ 1024                         ] |
|  ------------------------------------------------------------------------------------------------  |
|  FORM SECTION: 3. Procurement & Operational Placement                                              |
|  Purchase Date                     Purchase Cost (INR) *            Storage Location *             |
|  [ 2026-03-15                  📅 ] [ ₹ 1,45,000.00               ] [ HQ - Room 102 (IT Storage) v ] |
|  ------------------------------------------------------------------------------------------------  |
|  [ Cancel ]                                                            [ Save Asset Record ]       |
+----------------------------------------------------------------------------------------------------+
```

### 7.1 Form Standards
- **Standard Fieldset Groupings:**
  1. *Asset Information* (Name, Tag, Brand, Model, Serial Number, Category)
  2. *Specifications* (Dynamic fields from category schema)
  3. *Financial Information* (Purchase Date, Purchase Cost in INR ₹, Vendor, Invoice Reference)
  4. *Warranty* (Expiry Date, Terms, Support Contact)
  5. *Location & Storage* (Site, Building, Room, Rack/Desk)
  6. *Initial Custody* (Available in Storage vs Direct Assignment)
  7. *Documents* (Attachment uploads)
- **Mandatory Indicators:** Clear red asterisk (`*`) on required field labels.
- **Inline Validation:** Validates upon field blur (`onBlur`). Displays red border (`--color-danger`) and compact $12\text{px}$ error text beneath input.
- **Sensible Defaults:** Dropdowns pre-select default location, current date, standard currency (`INR`), and standard operational status (`AVAILABLE`).
- **Keyboard Traversal:** Natural tab order (`Tab` / `Shift+Tab`) across all fields; `Enter` submits; `Escape` closes dropdowns/modals.
- **Error Summary Banner:** If form submission fails, a top alert banner summarizes all invalid fields with clickable jump links to the offending inputs.
- **Unsaved Changes Protection:** Navigation interceptor warns: *"You have unsaved changes. Are you sure you want to discard them?"* if the user navigates away from a dirty form.

---

## 8. Hardware Requisitions & Approval Queue UI

### 8.1 Requisition Workflows & Lists
- **Request List:** Tabbed view: `[ My Requests ]` (All staff) and `[ Approval Queue ]` (Managers & Admins).
- **Request Card / Row:**
  - Requester Name & Avatar
  - Department
  - Requested Equipment / Category
  - Urgency Pill (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
  - Submission Timestamp
  - Current Status Badge (`SUBMITTED`, `DEPT_APPROVED`, `FULFILLED`, `REJECTED`)

### 8.2 Approval Queue UI Specification
The approval interface must provide complete operational context on a single screen without nested dialogs:
- **Approval Detail Card:**
  - **Requester Context:** Employee name, job title, department, current equipment count.
  - **Requisition Reason:** Justification text submitted by requester.
  - **Approval History:** Visual stepper showing step 1 (Department Manager Approval) and step 2 (Asset Manager Fulfillment).
- **Direct Operational Actions:**
  - **Approve Button:** Primary green button (`[ Approve Requisition ]`).
  - **Reject Button:** Outlined red button (`[ Reject ]`).
- **Mandatory Rejection Reason:** Clicking "Reject" opens a focused inline input requiring a mandatory reason: *"Please specify reason for rejection (required)"*. Reject button remains disabled until text is provided.
- **No Superfluous Modals:** Simple approval does not trigger an unnecessary confirmation pop-up.

---

## 9. Assignments & Custody Workflows UI

### 9.1 Check-Out (Handover) Workflow Screen
The checkout form ensures unambiguous custody transfer:
- **Asset Identification:** Read-only summary card of the asset (Tag, Name, Category, Serial Number, Current Condition).
- **Assignee Selection:**
  - Radio toggle: `[● Individual Employee]` or `[○ Department Shared]`.
  - Searchable user combobox or department dropdown.
- **Assignment Details:**
  - Assignment Type: `PERMANENT` or `TEMPORARY`.
  - Expected Return Date: Mandatory if `TEMPORARY`.
- **Physical Inspection Sign-Off:**
  - Initial Physical Condition selector (`New`, `Excellent`, `Good`, `Fair`).
  - Accessory Checklist checkboxes (e.g., `[x] Power Adapter`, `[x] Laptop Sleeve`, `[x] HDMI Cable`).
  - Handover Notes text field.
- **Primary CTA:** `[ Confirm Check-Out & Sign Custody ]`.

### 9.2 Check-In (Return & Inspection) Workflow Screen
The return workflow focuses on physical inspection and next operational routing:
- **Asset Summary:** Asset Tag, Name, Current Custodian, Original checkout date, Duration out.
- **Return Checklist:**
  - Accessory Return Verification (e.g., `[x] Power Adapter Returned`, `[ ] Laptop Sleeve Missing`).
- **Physical Condition Assessment:**
  - Returning Condition rating dropdown (`Excellent`, `Good`, `Fair`, `Damaged`).
  - Damage / Defect Notes: Mandatory if condition is marked `Damaged` or `Poor`.
- **Storage & Next State Routing:**
  - Storage Location dropdown (pre-filled with default IT room).
  - Next Operational State selector:
    - `● Return to Available Inventory`
    - `○ Route to Maintenance / Repair` (automatically creates service ticket)
    - `○ Route to Decommission / Retirement`
- **Primary CTA:** `[ Complete Check-In & Restock ]`.

---

## 10. Maintenance & Service Ticket UI

Service tickets manage hardware defects, vendor RMAs, and preventive maintenance:
- **Service Ticket Table Columns:**
  - Ticket ID (`MNT-000042`, monospace)
  - Asset Tag (`AST-000109`) & Name
  - Defect Summary (e.g., *"Cracked screen, display flickering"*)
  - Priority Badge (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
  - Status Badge (`REPORTED`, `IN_PROGRESS`, `WAITING_PARTS`, `RESOLVED`, `CANCELLED`)
  - Assigned Technician / Service Vendor
  - Opened Date & Target Completion Date
  - Repair Cost (in INR `₹`, hidden for `VIEWER`)
- **Ticket Closure Panel:**
  - Resolution Summary text
  - Replaced Parts log
  - Final Incurred Cost
  - Asset Post-Repair Condition (`Good`, `Fair`)
  - Return to Available Inventory button.

---

## 11. QR Code Asset Tagging & Scanner Experience

### 11.1 Desktop Tag Generation & Batch Printing
- **Physical Tag Preview:** Renders physical barcode labels sized to standard industrial thermal label rolls ($2.0\text{ in} \times 1.0\text{ in}$ or $50\text{mm} \times 25\text{mm}$).
- **Label Contents:**
  - Organization Name (Top, $8\text{pt}$ bold).
  - High-Contrast QR Code (Left, $0.75\text{ in}$ square, error correction level `M`).
  - Monospace Asset Tag (`AST-000109`, $11\text{pt}$ bold).
  - Serial Number & Brand/Model (Right, $7\text{pt}$ uppercase).
- **Batch Print Utility:** Generates printable grid sheets formatted for standard multi-label paper (e.g., Avery 5160, 30 labels per sheet).

### 11.2 Mobile QR Scanner Experience
- **Practical Operational Scanner:**
  - Clean video viewfinder stream.
  - **Zero Sci-Fi Nonsense:** **No glowing lasers, futuristic HUD targeting rings, or neon animations.**
  - Subtle corner reticle markings to guide barcode alignment.
- **Fast Acquisition ($< 300\text{ms}$):**
  - Instant tactile feedback upon barcode recognition.
  - Slides up an immediate Asset Preview Drawer showing:
    - Asset Tag, Name, Category, Current Status, Condition, Location.
    - Quick actions tailored to user role:
      - Asset Manager: `[ Check In ]`, `[ Check Out ]`, `[ Open Maintenance ]`.
      - Staff: `[ Report Issue ]`, `[ Verify Custody ]`.
      - Viewer: Read-only specifications (financials masked).

---

## 12. Operational Reports UI Specification

Reports focus on actionable operational data. Charts are utilized **only when they communicate useful trends or distributions**; purely decorative charts are prohibited.

### 12.1 Core Operational Reports
1. **Asset Master Inventory Report:** Complete tabular export with custom column selector.
2. **Custody & Assignment Report:** Active checkouts, loan durations, and utilization by department.
3. **Overdue Assets Report:** Actionable list of unreturned equipment with days overdue and custodian contact.
4. **Maintenance & Repair Expenditure Report:** Historical repair tickets, downtime hours, and cumulative costs per asset category.
5. **Warranty Expiration Report:** Upcoming expirations across 30, 60, and 90-day horizons.
6. **Department Asset Allocation Report:** Distribution of hardware assets across organizational units.
7. **Asset Lifecycle & Turnover Report:** Age distribution of hardware assets and replacement forecasting.
8. **Disposal & Decommissioning History:** Audit report of retired, recycled, or sold hardware assets.

### 12.2 Report UI Standards
- High-density data tables with sorting, date-range filtering, and instant CSV/Excel export buttons.
- Clean, monochrome bar charts or segment charts for distribution summaries (e.g., assets by category); zero 3D charts or animated pie charts.

---

## 13. Notifications & Activity Feed UI

- **Notification Drawer / Popover:** Accessed via header bell icon.
- **Notification Item Structure:**
  - Severity indicator dot:
    - Red dot: Overdue return, critical defect reported.
    - Amber dot: Pending requisition approval, warranty expiring.
    - Blue dot: Asset assigned to you, ticket updated.
  - Clear operational title (e.g., *"Requisition REQ-000104 Approved"*).
  - Descriptive summary text.
  - Timestamp (`10m ago`, `2h ago`).
  - Contextual link (`[ View Asset ]`, `[ Review Request ]`).
- **Low Visual Noise:** No animated popups or sound effects. Unread state is indicated by a subtle background tint and bold title.

---

## 14. Audit Logs UI Specification

Designed specifically for system administrators and compliance auditors.

- **Chronological Dense Table:**
  - **Timestamp:** ISO 8601 formatted date and time (`YYYY-MM-DD HH:mm:ss`, monospace).
  - **Actor:** User Name and Email (`Rahul Sharma (rahul@company.com)`).
  - **Action:** Event badge (`ASSET_CREATED`, `CHECKOUT_COMPLETED`, `STATUS_CHANGED`, `PERMISSION_MODIFIED`).
  - **Entity:** Affected entity type (`Asset`, `Assignment`, `User`, `Setting`).
  - **Entity ID:** Monospace identifier (`AST-000109`).
  - **Result:** Status badge (`SUCCESS` in green, `FAILURE` in red).
  - **Reference / Notes:** Additional context or reason string.
- **Search & Filters:** Date range picker, actor filter, action dropdown, entity search.
- **Zero Decorative Animation:** Standard paginated table, no timeline curves or floating cards.
- **Access Rule:** Strictly inaccessible to `STAFF` and `VIEWER`.

---

## 15. Administrative Settings UI

Settings are organized into four dedicated administrative sections:

```
+----------------------------------------------------------------------------------------------------+
|  [ Settings Navigation:  1. General  |  2. Authentication  |  3. Roles  |  4. Notifications ]      |
+----------------------------------------------------------------------------------------------------+
|  SECTION: Authentication Configuration (Google OAuth & Domain Security)                            |
|  Current Policy:          [ RESTRICTED_DOMAIN_ALLOWLIST                                          v ] |
|  Allowed Domains:         [ example.com, subsidiary.org                                          ] |
|  Allowed Email Addresses: [ admin.external@consultant.com                                       ] |
|  Configuration Status:    [ ● ACTIVE & ENFORCED ]                                                  |
|  ------------------------------------------------------------------------------------------------  |
|  ⚠️ Security Notice: Changes to domain access take effect immediately for all subsequent logins.    |
|  [ Save Security Policy ]                                                                          |
+----------------------------------------------------------------------------------------------------+
```

### 15.1 Settings Modules
1. **General Settings:**
   - Organization Name & Logo.
   - Default Currency: Configurable (Default: `INR` / `₹`).
   - Date Format: `YYYY-MM-DD` or `DD/MM/YYYY`.
   - Asset Tag Prefix & Numbering Scheme (`AST-000000`).
2. **Authentication Settings:**
   - Current Authentication Policy display.
   - Allowed Email Domains (comma-separated list).
   - Allowed Individual Email Addresses.
   - Configuration Status badge (`NOT_CONFIGURED` vs `CONFIGURED_AND_ENFORCED`).
   - **Zero Secret Exposure:** Google OAuth client secrets and service account private keys are **never displayed** in the UI.
3. **Roles & Capabilities Inspector:**
   - Read-only capability matrix displaying granular permissions for each of the 6 roles.
4. **Notification Rules:**
   - Threshold configurations: Warranty expiration alert window (days), Overdue return reminder schedule.

---

## 16. Reusable Table Design Rules

Tables are the primary presentation vehicle across the application.

1. **Sorting:** Clickable column headers with sort direction arrows ($\uparrow\downarrow$).
2. **Filtering:** Multi-facet filter bar above table with quick reset button.
3. **Pagination:** Fixed bottom pagination footer with current range display, page jumper, and page-size selector ($25$, $50$, $100$).
4. **Column Visibility:** User-selectable column toggling persisted to local storage.
5. **Row Actions:** Fixed right column with uniform 3-dot dropdown menu.
6. **Bulk Selection:** Multi-row checkboxes activating sticky batch toolbar.
7. **Mobile Card Transformation:** On screens $< 768\text{px}$, tables transform into card stacks with primary identifiers and key status badges prominently displayed.
8. **Consistent Density:** Default row height is $40\text{px}$ on desktop.

---

## 17. Status & Condition Indicator Design

Status and condition indicators **must never rely on color alone**. Every badge pairs a semantic tint with an explicit text label and an accessible icon.

```
+----------------------------------------------------------------------------------------------------+
|                                    STATUS BADGE SPECIFICATION                                      |
+----------------------------------------------------------------------------------------------------+
|  [ ● AVAILABLE ]       - Green-100 bg, Green-700 text, solid green dot                             |
|  [ 👤 ASSIGNED ]        - Sky-100 bg, Sky-700 text, user icon                                      |
|  [ ⏱️ CHECKED OUT ]    - Amber-100 bg, Amber-700 text, clock icon                                  |
|  [ 🛠️ IN MAINTENANCE ] - Orange-100 bg, Orange-700 text, wrench icon                               |
|  [ ⚠️ OVERDUE ]         - Red-100 bg, Red-700 text, alert triangle icon                             |
|  [ ✖️ LOST ]            - Rose-100 bg, Rose-800 text, cross icon                                    |
|  [ 📦 RETIRED ]         - Slate-100 bg, Slate-700 text, archive box icon                            |
|  [ ♻️ DISPOSED ]        - Zinc-100 bg, Zinc-700 text, recycle icon                                  |
+----------------------------------------------------------------------------------------------------+
```

### 17.1 Physical Condition Ratings
- `[ NEW ]`: Factory sealed / unused. Blue badge.
- `[ EXCELLENT ]`: Zero cosmetic wear. Green badge.
- `[ GOOD ]`: Standard operational condition, normal minor wear. Emerald badge.
- `[ FAIR ]`: Noticeable cosmetic wear or battery degradation. Amber badge.
- `[ POOR ]`: Functional degradation; requires repair soon. Orange badge.
- `[ DAMAGED ]`: Non-operational or physically broken. Red badge.

### 17.2 Requisition & Maintenance Statuses
- `[ SUBMITTED ]`: Blue badge (Pending review).
- `[ DEPT_APPROVED ]`: Amber badge (Awaiting asset allocation).
- `[ FULFILLED ]`: Green badge (Equipment handed over).
- `[ REJECTED ]`: Red badge (Requisition declined with reason).
- `[ REPORTED ]`: Blue badge (Defect logged).
- `[ IN_PROGRESS ]`: Amber badge (Technician repairing).
- `[ WAITING_PARTS ]`: Orange badge (Awaiting replacement parts).
- `[ RESOLVED ]`: Green badge (Repair verified and closed).

---

## 18. Empty, Loading & Error States Specification

Every major view defines explicit, helpful states rather than generic placeholders:

| State | Visual Treatment | Explicit User Copy | Primary Call-to-Action |
|---|---|---|---|
| **Inventory Empty** | Centered clean card with box icon | "No assets have been registered in this repository." | `[ + Register First Asset ]` |
| **No Search Results** | Search icon with filter summary | "No assets match search query. Try clearing active filters." | `[ Reset All Filters ]` |
| **Approval Queue Clear** | Checkmark circle badge | "Approval queue is clear. No pending requisitions require your review." | `[ Return to Dashboard ]` |
| **Permission Denied** | Shield lock icon | "Access Restricted. You do not possess the required permission to view this resource." | `[ Back to Safety ]` |
| **API Error / Quota** | Warning alert triangle | "Failed to synchronize with server. Google Sheets quota may be throttled." | `[ Retry Synchronization ]` |
| **Loading State** | Neutral tabular skeleton | Shimmering 10-row skeleton matching actual column widths | N/A |

---

## 19. Modals vs. Drawers Architecture

To maintain low cognitive load and prevent cramped interfaces:

### 19.1 Use Modals Exclusively For:
- Destructive action confirmations (e.g., *"Confirm Asset Decommission"*).
- Short, focused single-step inputs (e.g., *"Input Rejection Reason"*).
- Single-purpose utilities (e.g., *"Print QR Tag Preview"*).
- **Rule:** Never embed complex, multi-field workflows into a modal window.

### 19.2 Use Slide-Out Drawers Exclusively For:
- Quick detail inspection (e.g., clicking an asset row to view specs without navigating away from the table).
- Event transaction history feeds.
- Contextual side-by-side verification during barcode scanning.
- **Rule:** Drawers slide in from the right edge ($480\text{px}$ to $600\text{px}$ width on desktop; $100\%$ width on mobile).

---

## 20. Feedback, Toast & Alert Rules

- **Toast Behavior:** Toasts appear in the bottom-right corner ($16\text{px}$ offset). They auto-dismiss after $4\text{ seconds}$.
- **Toast Purpose:** Strictly for non-critical confirmations: *"Asset AST-000109 updated successfully"*, *"QR label sent to printer"*.
- **Alert Banners:** Used inside the page flow for actionable warnings (e.g., *"5 assets in your department are currently overdue for return"*).
- **Destructive Confirmations:** Require typing the Asset Tag or clicking an explicit red confirmation button inside a modal.

---

## 21. Accessibility Standards (WCAG 2.2 AA)

1. **Color Contrast:** All text pairs exceed $4.5:1$ contrast against their surfaces ($7.0:1$ for tabular data).
2. **Keyboard Focus Rings:** Every interactive button, link, and input receives an explicit, high-contrast focus outline: `outline: 2px solid #0284C7; outline-offset: 2px;`.
3. **Screen Reader Semantics:** ARIA attributes (`aria-expanded`, `aria-haspopup`, `aria-invalid`, `role="status"`, `aria-live`) are enforced on all dynamic components.
4. **Touch Target Size:** All touch targets on mobile viewports adhere to a minimum bounding box of $44\text{px} \times 44\text{px}$.
5. **Reduced Motion:** If `@media (prefers-reduced-motion: reduce)` is detected, all CSS transitions and drawer slide animations are deactivated ($0\text{ms}$).

---

## 22. Restrained Motion Rules

Motion in enterprise operational software must be subtle and functional:
- **Allowed Transitions:**
  - Micro-transitions on button hover ($150\text{ms}$ ease-out).
  - Drawer slide-in and slide-out ($200\text{ms}$ ease-out).
  - Dropdown menu fade-in ($100\text{ms}$ ease-out).
  - Tab switch cross-fade ($150\text{ms}$).
- **Prohibited Motion:**
  - ❌ No floating card hover animations (no translateY jumps).
  - ❌ No bouncing icons or pulsing buttons.
  - ❌ No animated background blobs or particle effects.
  - ❌ No parallax scrolling.

---

## 23. Design Consistency Rules

To ensure the portal feels like a unified, singular product:
1. **No Random Spacing:** Use only tokens from the 4px spacing scale (`--space-1` through `--space-8`).
2. **No Arbitrary Colors:** All colors must reference established semantic tokens; never introduce ad-hoc hex codes.
3. **Uniform Buttons:** All primary action buttons share uniform height ($36\text{px}$), font weight ($500$), and radius ($6\text{px}$).
4. **Consistent Table Styling:** Every table across all modules shares the exact same header style, row height ($40\text{px}$), and hover treatment.
5. **Unified Status Colors:** The same status (e.g., `IN_MAINTENANCE`) must display with the exact same badge color across tables, dossiers, and reports.

---

## 24. Reusable Component Inventory

The planned component library adheres strictly to clean modular architecture:

```
src/components/
├── shell/
│   ├── app-shell.tsx                 # Root layout container
│   ├── sidebar.tsx                   # Role-filtered persistent sidebar
│   ├── header.tsx                    # Top bar with breadcrumbs and user profile pill
│   ├── breadcrumbs.tsx               # Dynamic path breadcrumb trail
│   └── mobile-nav.tsx                # Bottom operational navigation bar
├── data-table/
│   ├── data-table.tsx                # Core high-density table container
│   ├── table-header.tsx              # Sortable column header cells
│   ├── table-pagination.tsx          # 25/50/100 page-size and page jumper
│   ├── table-filter-bar.tsx          # Multi-facet filter controls and reset
│   ├── table-column-toggle.tsx       # Dropdown to toggle column visibility
│   ├── table-bulk-actions.tsx        # Sticky toolbar for batch actions
│   └── table-empty-state.tsx         # Actionable empty state card
├── ui/
│   ├── status-badge.tsx              # Icon + label status indicator
│   ├── condition-indicator.tsx       # Physical wear rating badge
│   ├── drawer.tsx                    # Slide-over detail inspection panel
│   ├── modal.tsx                     # Focused action and confirmation dialog
│   ├── button.tsx                    # Restrained action button with variants
│   ├── form-input.tsx                # Text, number, date inputs with labels
│   ├── form-select.tsx               # Native / accessible dropdown select
│   ├── form-section.tsx              # Section wrapper with title and divider
│   └── dynamic-spec-fields.tsx       # Renders inputs from category schema
├── feedback/
│   ├── toast.tsx                     # Quiet bottom-right action acknowledgment
│   ├── alert-banner.tsx              # In-page warning / error container
│   └── confirmation-modal.tsx        # Destructive action double-check
└── asset/
    ├── asset-dossier-header.tsx      # Top summary card for asset detail
    ├── custody-timeline.tsx          # Vertical history ledger
    ├── qr-code-display.tsx           # Printable barcode label preview
    └── mobile-qr-scanner.tsx         # Functional video reticle scanner
```

---

## 25. Operational Copy & Terminology Guide

| Approved Operational Copy | Prohibited AI / Marketing Buzzwords | Operational Context |
|---|---|---|
| **Register Asset** | ~~Launch Asset~~, ~~Smart Ingest~~ | Adding new hardware to inventory |
| **Assign Asset** / **Custody Handover** | ~~Smart Assign~~, ~~AI Delegation~~ | Allocating gear to a staff member |
| **Check In / Return** | ~~Auto-Reclaim~~, ~~Smart Restock~~ | Receiving equipment back to storage |
| **Hardware Requisition** | ~~AI Equipment Request~~ | Employee equipment requisition ticket |
| **Approve Requisition** | ~~Auto-Approve~~ | Manager sign-off on request |
| **Reject Requisition** | ~~Decline Request~~ | Declining request with mandatory reason |
| **Service / Repair Ticket** | ~~Smart Maintenance~~, ~~AI Diagnostics~~| Maintenance tracking ticket |
| **Decommission / Retire** | ~~Smart Offboarding~~ | End-of-life hardware status update |
| **Disposal Record** | ~~Smart E-Waste~~ | Documenting final recycling or sale |
| **Audit Ledger** | ~~Neural Activity Trail~~ | Immutable record of system events |
| **Valuation Summary** | ~~Predictive Financial Intelligence~~ | Standard purchase cost and book value |
