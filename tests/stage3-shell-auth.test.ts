import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextRequest } from 'next/server';

// Security & Auth imports
import { verifyEmailAgainstPolicy } from '../src/security/auth-policy';
import {
  createSessionToken,
  verifySessionToken,
  getSessionCookieOptions,
  SessionPayload,
} from '../src/security/session';
import { USER_ROLES, ALL_ROLES } from '../src/security/roles';
import { CAPABILITIES } from '../src/security/capabilities';
import {
  getVisibleNavigationForRole,
  isRouteAccessibleForRole,
  isItemVisibleForRole,
  NAVIGATION_STRUCTURE,
} from '../src/security/navigation';
import { proxy } from '../src/proxy';
import { AUTH_DEFAULTS } from '../src/config/constants';
import { getAuthConfigStatus } from '../src/config/env';
import { AuthConfigRequiredError, AppError, ERROR_CODES } from '../src/lib/errors/app-error';

// Error & Boundary components
import Unauthorized from '../src/app/unauthorized';
import Forbidden from '../src/app/forbidden';
import NotFound from '../src/app/not-found';
import RootError from '../src/app/error';
import Loading from '../src/app/loading';

describe('Stage 3 — Application Shell, Authentication Boundary & Navigation Test Suite', () => {
  describe('1. Authentication Configuration Fails Closed', () => {
    it('fails closed when policy is NOT_CONFIGURED', () => {
      assert.throws(
        () => verifyEmailAgainstPolicy('admin@enterprise.org', 'NOT_CONFIGURED'),
        (err: unknown) => {
          assert(err instanceof AuthConfigRequiredError);
          assert.equal(err.code, ERROR_CODES.AUTH_CONFIGURATION_REQUIRED);
          return true;
        }
      );
    });

    it('getAuthConfigStatus reports NOT_CONFIGURED by default', () => {
      assert.equal(getAuthConfigStatus('NOT_CONFIGURED'), 'NOT_CONFIGURED');
      assert.equal(getAuthConfigStatus(''), 'NOT_CONFIGURED');
    });

    it('strictly prohibits wildcard domain configurations', () => {
      assert.equal(getAuthConfigStatus('*'), 'INVALID');
      assert.equal(getAuthConfigStatus('*.company.com'), 'INVALID');

      assert.throws(
        () => verifyEmailAgainstPolicy('admin@company.com', '*'),
        (err: unknown) => {
          assert(err instanceof AppError);
          assert.equal(err.code, ERROR_CODES.CONFIGURATION_ERROR);
          return true;
        }
      );
    });
  });

  describe('2. Public vs. Protected Routes Invariants', () => {
    it('allows unauthenticated requests to public /login route', async () => {
      const request = new NextRequest('http://localhost:3000/login');
      const response = await proxy(request);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('location'), null);
    });

    it('allows unauthenticated requests to public /api/health route', async () => {
      const request = new NextRequest('http://localhost:3000/api/health');
      const response = await proxy(request);
      assert.equal(response.status, 200);
    });

    it('redirects unauthenticated requests on /dashboard to /login', async () => {
      const request = new NextRequest('http://localhost:3000/dashboard');
      const response = await proxy(request);
      assert.equal(response.status, 307);
      const location = response.headers.get('location');
      assert(location?.endsWith('/login'));
    });

    it('redirects unauthenticated requests on root / to /login', async () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = await proxy(request);
      assert.equal(response.status, 307);
      const location = response.headers.get('location');
      assert(location?.endsWith('/login'));
    });
  });

  describe('3. Cryptographic Session Verification & Route Access', () => {
    it('permits access to protected route when valid session token is provided', async () => {
      const payload: SessionPayload = {
        userId: 'USR-000001',
        name: 'Rahul Sharma',
        email: 'rahul@company.com',
        role: USER_ROLES.ASSET_MANAGER,
        departmentId: 'DEP-000001',
      };

      const token = await createSessionToken(payload);
      const request = new NextRequest('http://localhost:3000/dashboard', {
        headers: {
          cookie: `${AUTH_DEFAULTS.SESSION_COOKIE_NAME}=${token}`,
        },
      });

      const response = await proxy(request);
      assert.equal(response.status, 200);
      // Confirms verified identity headers were attached
      assert.equal(response.headers.get('x-user-id'), 'USR-000001');
      assert.equal(response.headers.get('x-user-role'), USER_ROLES.ASSET_MANAGER);
    });

    it('redirects authenticated user on /login to /dashboard', async () => {
      const payload: SessionPayload = {
        userId: 'USR-000002',
        name: 'Admin User',
        email: 'admin@company.com',
        role: USER_ROLES.ADMIN,
      };

      const token = await createSessionToken(payload);
      const request = new NextRequest('http://localhost:3000/login', {
        headers: {
          cookie: `${AUTH_DEFAULTS.SESSION_COOKIE_NAME}=${token}`,
        },
      });

      const response = await proxy(request);
      assert.equal(response.status, 307);
      const location = response.headers.get('location');
      assert(location?.endsWith('/dashboard'));
    });

    it('rejects tampered or malformed session tokens and redirects to /login', async () => {
      const request = new NextRequest('http://localhost:3000/dashboard', {
        headers: {
          cookie: `${AUTH_DEFAULTS.SESSION_COOKIE_NAME}=invalid.tampered.token`,
        },
      });

      const response = await proxy(request);
      assert.equal(response.status, 307);
      const location = response.headers.get('location');
      assert(location?.endsWith('/login'));
    });

    it('verifySessionToken returns null for forged token', async () => {
      const result = await verifySessionToken('forged-token-string');
      assert.equal(result, null);
    });
  });

  describe('4. Session Cookie Policy & Logout Boundary', () => {
    it('enforces HttpOnly, SameSite lax, and path / on session cookies', () => {
      const options = getSessionCookieOptions();
      assert.equal(options.name, AUTH_DEFAULTS.SESSION_COOKIE_NAME);
      assert.equal(options.httpOnly, true);
      assert.equal(options.sameSite, 'lax');
      assert.equal(options.path, '/');
      assert.equal(options.maxAge, AUTH_DEFAULTS.SESSION_MAX_AGE_SECONDS);
    });
  });

  describe('5. Role-Aware Navigation Foundation', () => {
    it('SUPER_ADMIN sees all navigation groups and modules including settings and audit logs', () => {
      const groups = getVisibleNavigationForRole(USER_ROLES.SUPER_ADMIN);
      const allItemIds = groups.flatMap((g) => g.items.map((i) => i.id));

      assert(allItemIds.includes('dashboard'));
      assert(allItemIds.includes('assets'));
      assert(allItemIds.includes('assignments'));
      assert(allItemIds.includes('requests'));
      assert(allItemIds.includes('maintenance'));
      assert(allItemIds.includes('users'));
      assert(allItemIds.includes('departments'));
      assert(allItemIds.includes('locations'));
      assert(allItemIds.includes('vendors'));
      assert(allItemIds.includes('reports'));
      assert(allItemIds.includes('audit-logs'));
      assert(allItemIds.includes('settings'));
    });

    it('ADMIN sees all operational modules, audit logs, and settings', () => {
      const groups = getVisibleNavigationForRole(USER_ROLES.ADMIN);
      const allItemIds = groups.flatMap((g) => g.items.map((i) => i.id));

      assert(allItemIds.includes('dashboard'));
      assert(allItemIds.includes('assets'));
      assert(allItemIds.includes('audit-logs'));
      assert(allItemIds.includes('settings'));
    });

    it('ASSET_MANAGER does NOT see Audit Logs, Departments, or Settings', () => {
      const groups = getVisibleNavigationForRole(USER_ROLES.ASSET_MANAGER);
      const allItemIds = groups.flatMap((g) => g.items.map((i) => i.id));

      assert(allItemIds.includes('assets'));
      assert(allItemIds.includes('assignments'));
      assert(allItemIds.includes('users'));
      assert(!allItemIds.includes('departments'), 'Asset Manager must not see Departments');
      assert(!allItemIds.includes('audit-logs'), 'Asset Manager must not see Audit Logs');
      assert(!allItemIds.includes('settings'), 'Asset Manager must not see Settings');
    });

    it('DEPARTMENT_MANAGER sees only department-scoped operations and reports', () => {
      const groups = getVisibleNavigationForRole(USER_ROLES.DEPARTMENT_MANAGER);
      const allItemIds = groups.flatMap((g) => g.items.map((i) => i.id));

      assert(allItemIds.includes('dashboard'));
      assert(allItemIds.includes('assets'));
      assert(allItemIds.includes('requests'));
      assert(allItemIds.includes('reports'));
      assert(!allItemIds.includes('users'), 'Dept Manager must not see Users');
      assert(!allItemIds.includes('audit-logs'), 'Dept Manager must not see Audit Logs');
      assert(!allItemIds.includes('settings'), 'Dept Manager must not see Settings');
    });

    it('STAFF sees only self-service items (Dashboard, Assets, Requests, Maintenance)', () => {
      const groups = getVisibleNavigationForRole(USER_ROLES.STAFF);
      const allItemIds = groups.flatMap((g) => g.items.map((i) => i.id));

      assert(allItemIds.includes('dashboard'));
      assert(allItemIds.includes('assets'));
      assert(allItemIds.includes('requests'));
      assert(allItemIds.includes('maintenance'));
      assert(!allItemIds.includes('users'));
      assert(!allItemIds.includes('reports'));
      assert(!allItemIds.includes('audit-logs'));
      assert(!allItemIds.includes('settings'));
    });

    it('VIEWER sees only Dashboard, Assets, and Reports', () => {
      const groups = getVisibleNavigationForRole(USER_ROLES.VIEWER);
      const allItemIds = groups.flatMap((g) => g.items.map((i) => i.id));

      assert(allItemIds.includes('dashboard'));
      assert(allItemIds.includes('assets'));
      assert(allItemIds.includes('reports'));
      assert(!allItemIds.includes('assignments'), 'Viewer must not see Assignments');
      assert(!allItemIds.includes('requests'), 'Viewer must not see Requests');
      assert(!allItemIds.includes('maintenance'), 'Viewer must not see Maintenance');
      assert(!allItemIds.includes('users'), 'Viewer must not see Users');
      assert(!allItemIds.includes('audit-logs'), 'Viewer must not see Audit Logs');
      assert(!allItemIds.includes('settings'), 'Viewer must not see Settings');
    });
  });

  describe('6. Viewer Restrictions & Route Authorization Checker', () => {
    it('isRouteAccessibleForRole denies Audit Logs to VIEWER', () => {
      assert.equal(isRouteAccessibleForRole('/audit-logs', USER_ROLES.VIEWER), false);
    });

    it('isRouteAccessibleForRole denies Settings to VIEWER', () => {
      assert.equal(isRouteAccessibleForRole('/settings', USER_ROLES.VIEWER), false);
    });

    it('isRouteAccessibleForRole denies Users management to VIEWER', () => {
      assert.equal(isRouteAccessibleForRole('/users', USER_ROLES.VIEWER), false);
    });

    it('isRouteAccessibleForRole allows Assets and Dashboard to VIEWER', () => {
      assert.equal(isRouteAccessibleForRole('/dashboard', USER_ROLES.VIEWER), true);
      assert.equal(isRouteAccessibleForRole('/assets', USER_ROLES.VIEWER), true);
      assert.equal(isRouteAccessibleForRole('/reports', USER_ROLES.VIEWER), true);
    });
  });

  describe('7. Error, Loading & Special Boundary Components', () => {
    it('renders Unauthorized 401 boundary with clean explanation and CTA', () => {
      const html = renderToStaticMarkup(React.createElement(Unauthorized));
      assert(html.includes('Authentication Required'));
      assert(html.includes('Sign In to Portal'));
      assert(!html.includes('stack'), 'No stack trace exposed');
    });

    it('renders Forbidden 403 boundary with operational guidance', () => {
      const html = renderToStaticMarkup(React.createElement(Forbidden));
      assert(html.includes('Access Restricted'));
      assert(html.includes('role capabilities'));
      assert(!html.includes('stack'), 'No stack trace exposed');
    });

    it('renders NotFound 404 boundary with return link', () => {
      const html = renderToStaticMarkup(React.createElement(NotFound));
      assert(html.includes('Resource Not Found'));
      assert(html.includes('Return to Dashboard'));
    });

    it('renders RootError boundary with retry CTA and zero secret leaks', () => {
      const html = renderToStaticMarkup(
        React.createElement(RootError, {
          error: new Error('Simulated operational failure'),
          reset: () => {},
        })
      );
      assert(html.includes('Operational Workspace Error'));
      assert(html.includes('Retry'));
      assert(!html.includes('Simulated operational failure'), 'Error message not leaked to client UI');
    });

    it('renders Loading boundary with operational loading spinner', () => {
      const html = renderToStaticMarkup(React.createElement(Loading));
      assert(html.includes('Loading operational workspace...'));
    });
  });

  describe('8. Zero Bypasses, Zero Fake Metrics & Invariants', () => {
    it('guarantees only the 6 authorized roles exist', () => {
      assert.equal(ALL_ROLES.length, 6);
      const expectedRoles = [
        'SUPER_ADMIN',
        'ADMIN',
        'ASSET_MANAGER',
        'DEPARTMENT_MANAGER',
        'STAFF',
        'VIEWER',
      ];
      for (const role of expectedRoles) {
        assert(ALL_ROLES.includes(role as (typeof ALL_ROLES)[number]));
      }
    });

    it('navigation structure has no hardcoded demo accounts or backdoor routes', () => {
      for (const group of NAVIGATION_STRUCTURE) {
        for (const item of group.items) {
          assert(!item.href.includes('?dev='), 'No dev bypass parameters in navigation');
          assert(!item.href.includes('mock'), 'No mock routes in navigation');
        }
      }
    });
  });
});
