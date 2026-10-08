import { USER_ROLES, UserRole } from './roles';
import { Asset } from '@/domain/types/asset';
import { User } from '@/domain/types/user';
import { Vendor } from '@/domain/types/vendor';
import { DocumentMetadata, DOCUMENT_TYPES } from '@/domain/types/document';

/**
 * Server-Side Field-Level Masking Interceptor for Restricted Roles (e.g. VIEWER)
 * Source of Truth: docs/USER_ROLES_AND_PERMISSIONS.md §1 & §4, docs/ARCHITECTURE.md §7.1
 *
 * CRITICAL SECURITY INVARIANT:
 * Restricted fields must be stripped at the server serialization boundary
 * before any payload is transmitted over the wire to untrusted clients.
 */

export function maskAssetForRole(asset: Asset, role: UserRole): Asset {
  if (role !== USER_ROLES.VIEWER) {
    return asset;
  }

  // Strip financial and procurement data for VIEWER
  return {
    ...asset,
    purchase_cost: null,
    current_value: null,
    invoice_reference: null,
  };
}

export function maskAssetsForRole(assets: Asset[], role: UserRole): Asset[] {
  if (role !== USER_ROLES.VIEWER) {
    return assets;
  }
  return assets.map((a) => maskAssetForRole(a, role));
}

export function maskUserForRole(user: User, role: UserRole): User {
  if (role === USER_ROLES.VIEWER) {
    // Strip personal contact information for VIEWER
    return {
      ...user,
      phone: null,
      auth_provider_id: null,
    };
  }
  return user;
}

export function maskVendorForRole(vendor: Vendor, role: UserRole): Vendor {
  if (role === USER_ROLES.VIEWER) {
    // Strip tax and financial identifiers for VIEWER
    return {
      ...vendor,
      tax_identifier: null,
    };
  }
  return vendor;
}

export function isDocumentAccessibleForRole(doc: DocumentMetadata, role: UserRole): boolean {
  if (role === USER_ROLES.VIEWER) {
    // Private financial / disposal documents are inaccessible to VIEWER
    if (doc.document_type === DOCUMENT_TYPES.INVOICE || doc.document_type === DOCUMENT_TYPES.DISPOSAL_CERTIFICATE) {
      return false;
    }
  }
  return true;
}

export function isAuditLogAccessibleForRole(role: UserRole): boolean {
  // Audit logs are restricted to SUPER_ADMIN and ADMIN
  return role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN;
}

export function isSettingsAccessibleForRole(role: UserRole): boolean {
  // Settings view is restricted to SUPER_ADMIN and ADMIN
  return role === USER_ROLES.SUPER_ADMIN || role === USER_ROLES.ADMIN;
}
