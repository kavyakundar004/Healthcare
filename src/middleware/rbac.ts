import { Request, Response, NextFunction } from 'express';
import { verifyAuthToken, TokenPayload } from '../lib/auth-crypto.ts';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { users, consents, auditLogs } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';

export interface AuthenticatedUser {
  id: number;
  uid: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin' | 'auditor';
  displayName?: string | null;
}

export interface AuthenticatedRequest extends Request {
  authUser?: AuthenticatedUser;
}

/**
 * Audit Logging Helper
 */
export async function recordAuditLog(params: {
  userId?: number | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}) {
  try {
    await db.insert(auditLogs).values({
      userId: params.userId || null,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId || null,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
      detailsJson: params.details || null,
    });
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }
}

/**
 * Authentication Middleware:
 * Supports both custom signed JWTs (Django standard) and Firebase Auth ID tokens.
 */
export async function authenticateRequest(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication Required: Bearer token is missing or malformed.',
      code: 'UNAUTHENTICATED',
    });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  // 1. Try verifying as application JWT
  const jwtPayload = verifyAuthToken(token);
  if (jwtPayload) {
    // Verify user exists and is active in DB
    const [dbUser] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, jwtPayload.userId), eq(users.isActive, true)))
      .limit(1);

    if (!dbUser) {
      return res.status(401).json({
        error: 'User account is deactivated or not found.',
        code: 'USER_DEACTIVATED',
      });
    }

    req.authUser = {
      id: dbUser.id,
      uid: dbUser.uid,
      email: dbUser.email,
      role: dbUser.role as any,
      displayName: dbUser.displayName,
    };
    return next();
  }

  // 2. Try verifying as Firebase ID token (hybrid fallback)
  try {
    const decodedFirebase = await adminAuth.verifyIdToken(token);
    const [dbUser] = await db
      .select()
      .from(users)
      .where(and(eq(users.uid, decodedFirebase.uid), eq(users.isActive, true)))
      .limit(1);

    if (dbUser) {
      req.authUser = {
        id: dbUser.id,
        uid: dbUser.uid,
        email: dbUser.email,
        role: dbUser.role as any,
        displayName: dbUser.displayName,
      };
      return next();
    }
  } catch (firebaseErr) {
    // Invalid token
  }

  return res.status(401).json({
    error: 'Invalid or expired authentication credentials.',
    code: 'INVALID_TOKEN',
  });
}

/**
 * Role-Based Access Control (RBAC) Guard
 */
export function requireRole(...allowedRoles: ('patient' | 'doctor' | 'admin' | 'auditor')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.authUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.authUser.role)) {
      // Record unauthorized privilege escalation attempt
      recordAuditLog({
        userId: req.authUser.id,
        action: 'UNAUTHORIZED_PRIVILEGE_ATTEMPT',
        resourceType: 'role_guard',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: {
          userRole: req.authUser.role,
          requiredRoles: allowedRoles,
          endpoint: req.originalUrl,
        },
      });

      return res.status(403).json({
        error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]. Your role is '${req.authUser.role}'.`,
        code: 'FORBIDDEN_ROLE',
      });
    }

    next();
  };
}

/**
 * Strict Patient Data Isolation Guard:
 * A patient must NEVER be able to access another patient's records.
 * Doctors may only access if the patient has granted PHYSICIAN_DATA_SHARING consent.
 */
export async function checkPatientOwnership(
  req: AuthenticatedRequest,
  res: Response,
  targetPatientUserId: number
): Promise<boolean> {
  const current = req.authUser;
  if (!current) {
    res.status(401).json({ error: 'Authentication required' });
    return false;
  }

  // 1. Direct Patient Ownership (Self access)
  if (current.id === targetPatientUserId) {
    return true;
  }

  // 2. System Administrator / Auditor (Superuser with mandatory audit logging)
  if (current.role === 'admin' || current.role === 'auditor') {
    await recordAuditLog({
      userId: current.id,
      action: 'ADMIN_OVERRIDE_ACCESS',
      resourceType: 'patient_profile',
      resourceId: String(targetPatientUserId),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: {
        adminId: current.id,
        targetPatientId: targetPatientUserId,
        adminRole: current.role,
      },
    });
    return true;
  }

  // 3. Doctor access with explicit patient consent
  if (current.role === 'doctor') {
    const [doctorConsent] = await db
      .select()
      .from(consents)
      .where(
        and(
          eq(consents.userId, targetPatientUserId),
          eq(consents.consentType, 'PHYSICIAN_DATA_SHARING'),
          eq(consents.isGranted, true)
        )
      )
      .limit(1);

    if (doctorConsent) {
      await recordAuditLog({
        userId: current.id,
        action: 'DOCTOR_CONSENTED_ACCESS',
        resourceType: 'patient_profile',
        resourceId: String(targetPatientUserId),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { doctorId: current.id, targetPatientId: targetPatientUserId },
      });
      return true;
    }
  }

  // 4. Violation: Cross-patient access blocked!
  await recordAuditLog({
    userId: current.id,
    action: 'UNAUTHORIZED_CROSS_PATIENT_ACCESS_ATTEMPT',
    resourceType: 'patient_profile',
    resourceId: String(targetPatientUserId),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    details: {
      attemptedByUserId: current.id,
      attemptedRole: current.role,
      targetUserId: targetPatientUserId,
      path: req.originalUrl,
      method: req.method,
    },
  });

  res.status(403).json({
    error: 'Access Denied: You do not have permission to view or modify this patient record.',
    code: 'PATIENT_DATA_ISOLATION_RESTRICTION',
  });
  return false;
}
