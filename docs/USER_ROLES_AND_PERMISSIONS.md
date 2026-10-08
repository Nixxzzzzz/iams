# User Roles & Permissions Specification
## Asset Management Portal

**Document Version:** 1.0.0  
**Status:** Approved Architectural Specification  
**Access Control Model:** Granular Role-Based Access Control (RBAC) with Resource Scoping  

---

## 1. Access Control Philosophy

While users are assigned familiar administrative roles for ease of management, **the application layer enforces authorization strictly through fine-grained granular permissions (capabilities)** rather than hardcoded role names. 

This design provides:
1. **Separation of Policy and Mechanism:** Code checks `hasPermission(user, 'assets:checkout')` rather than `user.role === 'Asset Manager'`.
2. **Departmental & Resource Scoping:** Permissions can be evaluated in context (e.g., a Department Manager has `requests:approve:dept` scoped strictly to employees within their designated department).
3. **Future Custom Roles:** The organization can introduce hybrid or custom roles (e.g., "Facilities Auditor" or "IT Support Contractor") by combining existing granular permission tokens without refactoring UI or backend logic.

---

## 2. Standard System Roles

| Role Name | Description & Primary Organizational Responsibility |
|---|---|
| **Super Admin** | Full, unrestricted global access to all data, settings, system logs, security keys, Google Sheet mappings, and user role provisioning. |
| **Admin** | High-level system administrator. Manages organizational assets, categories, users, locations, departments, and vendors. Cannot modify Super Admin credentials or critical system settings. |
| **Asset Manager** | Day-to-day custodian of organizational inventory. Manages asset lifecycles, prints QR tags, conducts physical check-in/out, logs maintenance, and fulfills approved requests. |
| **Department Manager** | Manager of a business unit. Has operational visibility into all assets assigned to their department and direct reports; reviews and approves asset requests from their team. |
| **Staff / User** | General organizational employee. Views assets currently assigned to them, signs custody acknowledgments, submits asset requests, and reports maintenance defects. |
| **Viewer** | Read-only auditor or finance observer. Can view asset registries, history, valuation reports, and audit trails without any ability to create, edit, or delete records. |

---

## 3. Granular Permission Catalog & Role Capability Matrix

Permissions follow the standard convention: `<resource>:<action>` or `<resource>:<action>:<scope>`.

| Permission Token | Description | Super Admin | Admin | Asset Manager | Dept Manager | Staff / User | Viewer |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **`assets:view:all`** | View all assets across the organization | **Yes** | **Yes** | **Yes** | No | No | **Yes** |
| **`assets:view:dept`** | View assets within assigned department | **Yes** | **Yes** | **Yes** | **Yes** | No | **Yes** |
| **`assets:view:assigned`**| View only assets assigned to self | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** |
| **`assets:create`** | Register new assets in the system | **Yes** | **Yes** | **Yes** | No | No | No |
| **`assets:edit`** | Edit asset details, specs, values | **Yes** | **Yes** | **Yes** | No | No | No |
| **`assets:archive`** | Soft delete / archive / retire assets | **Yes** | **Yes** | **Yes** | No | No | No |
| **`assets:checkout`** | Check out assets to users/teams | **Yes** | **Yes** | **Yes** | No | No | No |
| **`assets:checkin`** | Check in assets back to inventory | **Yes** | **Yes** | **Yes** | No | No | No |
| **`assets:qr:generate`** | Generate and export QR tags | **Yes** | **Yes** | **Yes** | No | No | No |
| **`assets:qr:scan`** | Scan QR codes to look up details | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** |
| **`requests:create`** | Submit an asset request | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | No |
| **`requests:view:own`** | View requests submitted by self | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | No |
| **`requests:view:dept`**| View requests from department staff | **Yes** | **Yes** | **Yes** | **Yes** | No | No |
| **`requests:approve:dept`**| First-tier department approval | **Yes** | **Yes** | No | **Yes** | No | No |
| **`requests:approve:asset`**| Final asset allocation & fulfillment | **Yes** | **Yes** | **Yes** | No | No | No |
| **`maintenance:view`** | View maintenance tickets & costs | **Yes** | **Yes** | **Yes** | **Yes** | No | **Yes** |
| **`maintenance:manage`**| Create, update, close repair tickets | **Yes** | **Yes** | **Yes** | No | No | No |
| **`categories:manage`**| Create/edit categories & subcategories | **Yes** | **Yes** | **Yes** | No | No | No |
| **`locations:manage`** | Add/edit physical sites & rooms | **Yes** | **Yes** | **Yes** | No | No | No |
| **`departments:manage`**| Manage departments & budget codes | **Yes** | **Yes** | No | No | No | No |
| **`vendors:manage`** | Add/edit suppliers & warranty contacts | **Yes** | **Yes** | **Yes** | No | No | No |
| **`users:view`** | View employee directory and rosters | **Yes** | **Yes** | **Yes** | **Yes** | No | **Yes** |
| **`users:manage`** | Provision users, update status/roles | **Yes** | **Yes** | No | No | No | No |
| **`reports:view`** | View asset & depreciation reports | **Yes** | **Yes** | **Yes** | **Yes** | No | **Yes** |
| **`reports:export`** | Export data to CSV/Excel | **Yes** | **Yes** | **Yes** | **Yes** | No | **Yes** |
| **`audit:view`** | View immutable audit logs | **Yes** | **Yes** | No | No | No | **Yes** |
| **`settings:manage`** | Manage system settings & integrations | **Yes** | No | No | No | No | No |

---

## 4. Scoping & Boundary Rules

### 4.1 Departmental Isolation for Department Managers
- When an employee with role `Department Manager` accesses the Asset inventory, query criteria automatically apply the constraint:
  `filter: { department_id: user.department_id }`
- Similarly, when viewing asset requests, they only receive pending approvals where `request.department_id === user.department_id`.

### 4.2 Self-Service Boundary for Staff / Users
- Employees with role `Staff / User` have access limited to:
  - Personal Dashboard (their assigned assets, return due dates).
  - Equipment Request Form (requesting items for themselves).
  - Request Status Page (tracking their own requests).
  - QR Scanner (used for verifying the tag of physical gear they hold).
- Direct access to unassigned inventory, financial purchase costs, vendor records, and audit logs is blocked at the API layer.

---

## 5. Authentication & Authorization Enforcement Pipeline

### 5.1 Google OAuth 2.0 Ingestion Flow
1. User clicks **"Sign in with Google"**.
2. **Domain Policy Validation:** The server evaluates `Settings.ALLOWED_EMAIL_DOMAINS`. If the setting is `["NOT_CONFIGURED"]` or empty, authentication is halted with a configuration required alert (`AUTH_CONFIGURATION_REQUIRED`). If configured, the handshake verifies that the authenticated Google email domain or exact address is present in the allowed list. Unrestricted/wildcard access is never permitted by default.
3. User profile is retrieved. If the email exists in the `Users` sheet and status is `ACTIVE`, the user’s `user_id`, `role_id`, and `department_id` are loaded.
4. A signed, encrypted JWT session token containing these claims is issued to an `HttpOnly, Secure, SameSite=Lax` cookie.
5. If the user does not exist in the `Users` sheet, the system rejects access or places them in a pending self-registration state based on system configuration.

### 5.2 Server-Side Authorization Guard
Every API route executes a centralized authorization guard:
```typescript
// Architecture pattern representation
export async function authorize(
  requiredPermission: PermissionToken,
  context?: { departmentId?: string; ownerUserId?: string }
): Promise<AuthenticatedUser> {
  const session = await getSession();
  if (!session) {
    throw new UnauthorizedError("Authentication required.");
  }

  const hasCapability = evaluatePermission(session.role, requiredPermission);
  if (!hasCapability) {
    throw new ForbiddenError(`Missing required permission: ${requiredPermission}`);
  }

  // Enforce resource-scoping constraints
  if (session.role === 'DEPARTMENT_MANAGER' && context?.departmentId) {
    if (session.departmentId !== context.departmentId) {
      throw new ForbiddenError("Access denied: Out-of-department resource.");
    }
  }

  if (session.role === 'STAFF' && context?.ownerUserId) {
    if (session.userId !== context.ownerUserId) {
      throw new ForbiddenError("Access denied: Personal resource mismatch.");
    }
  }

  return session;
}
```

### 5.3 UI Element Enforcement (Client-Side)
- Navigational links, action buttons (e.g., "Check Out", "Delete", "Approve"), and action menus are conditionally displayed using a `usePermission(token)` React hook.
- Client-side suppression is strictly for UX hygiene; the server always independently validates every mutation.
