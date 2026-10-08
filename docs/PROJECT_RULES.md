# Project Rules & Engineering Standards
## Asset Management Portal

**Document Version:** 1.0.0  
**Status:** Mandatory Engineering Contract  
**Enforcement:** Automated CI Linters, Code Reviews & Architectural Audits  

---

## 1. Project Identity & Isolation Rules

1. **Complete Standalone Project:** This project is completely independent from every previous project, repository, application, database, Supabase project, Google Sheet, UI system, authentication system, or codebase.
2. **Zero Reuse of Previous Code:** Do not reuse, reference, import, copy, infer, or connect anything from any prior project or past workspace.
3. **No Unrelated Dependencies:** Do not install dependencies that are not directly required to fulfill documented features. Every npm package must be justified.
4. **No Premature Implementation:** Do not create fake/demo screens, placeholder mock databases, or unconfigured cloud connections before the architectural phase is formally approved.

---

## 2. Security & Credentials Rules

1. **Zero Hardcoded Secrets:** No API keys, Google Cloud private keys, OAuth client secrets, or JWT secrets may ever be committed to git or hardcoded in source files.
2. **No Exposed Credentials in Frontend:** Google Service Account credentials, private keys, and administrative tokens must never be accessible on the client side. The `NEXT_PUBLIC_` prefix must never be used on sensitive configuration.
3. **No Direct Google Sheets Access from Client:** The browser frontend must never call Google Sheets API directly or possess credentials to do so. All reads and writes must pass through the Next.js API server layer.
4. **Formula Injection Sanitization:** Every user-supplied string written to Google Sheets must be sanitized against formula execution (escaping leading `=`, `+`, `-`, `@`).
5. **Secure Session Cookies:** Session tokens must be stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies.
6. **Strict Authentication Policy Default:** Production authentication must never default to unrestricted/open access (`*`). The initial domain policy is strictly `ALLOWED_EMAIL_DOMAINS = NOT_CONFIGURED`. Unrestricted access is refused until explicitly configured by an administrator.

---

## 3. Data Integrity & Historical Auditability Rules

1. **No Destructive Deletion of Historical Records:** Historical records, custody events, maintenance logs, and past assignments must never be permanently deleted or overwritten.
2. **Soft Deletion Only:** If an asset, category, or location is deactivated, it must be flagged with `is_archived = true` or `is_active = false`. Raw SQL `DELETE` or sheet row deletions are strictly prohibited on business entities.
3. **Mandatory Immutable Ledgers:** Every custody handover, check-in, check-out, repair, or status transition must append a row to `Transactions` and `Audit Logs`.
4. **Referential Validation:** Because Google Sheets does not enforce database constraints, the server-side business logic layer must explicitly validate all foreign references before committing changes.

---

## 4. Architectural & Code Quality Standards

1. **Repository Pattern Abstraction:** Application logic and API controllers must never directly call Google APIs SDK methods. All data persistence operations must be executed through abstract repository interfaces (`IAssetRepository`, `IUserRepository`, etc.) to guarantee zero-friction migration to PostgreSQL.
2. **TypeScript Strict Mode:** 
   - `strict: true` is mandatory in `tsconfig.json`.
   - The use of `any` is strictly prohibited. Use explicit types, generics, or `unknown` with type narrowing.
3. **Server-Side Validation:** All inbound payloads (REST bodies, query params, form submissions) must be parsed and validated using **Zod** schemas before reaching business logic.
4. **Domain Purity:** Business services must remain pure TypeScript functions or classes free from direct dependencies on HTTP request/response objects (`NextRequest`, `NextResponse`).
5. **Deterministic Error Handling:** Standardize all API error responses into predictable error objects containing machine-readable error codes and descriptive messages.

---

## 5. UI/UX & Aesthetic Rules

1. **Absolute Ban on AI-Themed Aesthetics:**
   - Do NOT use purple/blue "AI" gradients, neon glows, glowing borders, holographic interfaces, futuristic HUDs, robot imagery, neural network decorations, particle backgrounds, or excessive glassmorphism.
   - Do NOT use the word "AI" or phrases like "AI-powered", "AI Command Center", "AI Insights", or "Smart Asset Brain" anywhere in the UI.
2. **Enterprise Utility Focus:** The user interface must be clean, neutral, modern, information-dense, and fast. Functionality and readability take precedence over visual decoration.
3. **Appropriate Interface for Tasks:**
   - Tables for inventory management.
   - Forms for data entry.
   - Master-detail pages for asset information.
   - Timelines for history and audit events.
   - Dedicated queues for approvals.
4. **Accessibility (WCAG 2.1 AA):** High-contrast color ratios (minimum 4.5:1), keyboard-navigable tables and forms, and appropriate ARIA attributes for screen readers are required.
5. **Responsive Design:** Interfaces must adapt cleanly across Desktop (persistent sidebar), Tablet (adaptive layout), and Mobile (touch controls, mobile QR scanning).

---

## 6. Scope Discipline

1. **No Invented Features:** Implement only features documented in the Product Requirements Document and Architectural Blueprint. Do not invent unrequested functionality or external integrations without explicit sign-off.
2. **Document First, Verify Next:** All structural and schema changes must be documented in `/docs` before implementation.
