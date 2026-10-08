/**
 * Application Error Architecture
 * Source of Truth: docs/ARCHITECTURE.md §6, docs/PROJECT_RULES.md §4.5
 */

export const ERROR_CODES = {
  AUTH_CONFIGURATION_REQUIRED: 'AUTH_CONFIGURATION_REQUIRED',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_STATE_TRANSITION: 'INVALID_STATE_TRANSITION',
  SCOPE_VIOLATION: 'SCOPE_VIOLATION',
  IMMUTABLE_RECORD: 'IMMUTABLE_RECORD',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, statusCode: number = 400, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthConfigRequiredError extends AppError {
  constructor(message: string = 'Organization domain authentication policy is not configured. Access denied.') {
    super(ERROR_CODES.AUTH_CONFIGURATION_REQUIRED, message, 503);
  }
}

export class AuthenticationRequiredError extends AppError {
  constructor(message: string = 'Authentication required. Please sign in to continue.') {
    super(ERROR_CODES.AUTHENTICATION_REQUIRED, message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action.') {
    super(ERROR_CODES.FORBIDDEN, message, 403);
  }
}

export class ScopeViolationError extends AppError {
  constructor(message: string = 'Resource is outside of your authorized data scope.') {
    super(ERROR_CODES.SCOPE_VIOLATION, message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, identifier?: string) {
    const detail = identifier ? ` with identifier '${identifier}'` : '';
    super(ERROR_CODES.NOT_FOUND, `${entity}${detail} was not found.`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(ERROR_CODES.VALIDATION_ERROR, message, 422, details);
  }
}

export class InvalidStateTransitionError extends AppError {
  constructor(fromState: string, toState: string, reason?: string) {
    const msg = `Invalid state transition from '${fromState}' to '${toState}'.${reason ? ` Reason: ${reason}` : ''}`;
    super(ERROR_CODES.INVALID_STATE_TRANSITION, msg, 409);
  }
}

export class ImmutableRecordError extends AppError {
  constructor(ledgerName: string) {
    super(
      ERROR_CODES.IMMUTABLE_RECORD,
      `Modifications or deletions are prohibited on the immutable ${ledgerName} ledger.`,
      405
    );
  }
}
