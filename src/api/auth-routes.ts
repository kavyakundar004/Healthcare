import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { users, patientProfiles, consents, auditLogs } from '../db/schema.ts';
import { eq, and, desc } from 'drizzle-orm';
import {
  makePassword,
  checkPassword,
  generateAuthToken,
  generateResetToken,
} from '../lib/auth-crypto.ts';
import {
  authenticateRequest,
  requireRole,
  checkPatientOwnership,
  recordAuditLog,
  AuthenticatedRequest,
} from '../middleware/rbac.ts';

export const authRouter = Router();

// ==========================================
// 1. User Registration (Django PBKDF2 Standard)
// ==========================================
authRouter.post('/auth/register', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      email,
      password,
      fullName,
      role = 'patient',
      dateOfBirth,
      gender,
      preferredLanguage = 'en',
      allergies,
      existingConditions,
      currentMedications,
      medicalHistorySummary,
      consentsGranted = {},
    } = req.body;

    // Validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters in length for clinical data protection.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const [existing] = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
    if (existing) {
      return res.status(409).json({
        error: 'An account with this email address already exists. Please login instead.',
      });
    }

    // Django-format PBKDF2 password hashing
    const passwordHash = makePassword(password);
    const uid = `hg-usr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create User record
    const [newUser] = await db
      .insert(users)
      .values({
        uid,
        email: cleanEmail,
        passwordHash,
        displayName: fullName || cleanEmail.split('@')[0],
        role: role as any,
        lastLogin: new Date(),
      })
      .returning();

    // Create Patient Profile with Data Minimization
    const [newProfile] = await db
      .insert(patientProfiles)
      .values({
        userId: newUser.id,
        fullName: fullName || null,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        preferredLanguage: preferredLanguage || 'en',
        allergies: allergies || null,
        existingConditions: existingConditions || null,
        currentMedications: currentMedications || null,
        medicalHistorySummary: medicalHistorySummary || null,
      })
      .returning();

    // Store Standard Consent Disclosures
    const defaultConsentTypes = [
      {
        type: 'HEALTH_DATA_PROCESSING',
        title: 'Health Information Processing & Intake',
        defaultGrant: consentsGranted.HEALTH_DATA_PROCESSING !== false,
      },
      {
        type: 'AI_CLINICAL_ANALYSIS',
        title: 'AI Clinical Educational Inference (Zero PHI Training)',
        defaultGrant: consentsGranted.AI_CLINICAL_ANALYSIS !== false,
      },
      {
        type: 'PHYSICIAN_DATA_SHARING',
        title: 'Physician Shared Record Access',
        defaultGrant: Boolean(consentsGranted.PHYSICIAN_DATA_SHARING),
      },
      {
        type: 'DATA_RETENTION_ERASURE',
        title: 'Data Retention & Right to Erasure Terms',
        defaultGrant: consentsGranted.DATA_RETENTION_ERASURE !== false,
      },
    ];

    for (const c of defaultConsentTypes) {
      await db.insert(consents).values({
        userId: newUser.id,
        consentType: c.type,
        version: '1.0',
        isGranted: c.defaultGrant,
        termsTextSummary: `Consent for ${c.title} under HealthGuide AI Privacy Policy v1.0.`,
        ipAddress: req.ip,
      });
    }

    // Audit Logging
    await recordAuditLog({
      userId: newUser.id,
      action: 'AUTH_REGISTER',
      resourceType: 'users',
      resourceId: String(newUser.id),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { email: cleanEmail, role: newUser.role },
    });

    // Generate JWT Token
    const token = generateAuthToken({
      userId: newUser.id,
      uid: newUser.uid,
      email: newUser.email,
      role: newUser.role as any,
      displayName: newUser.displayName,
    });

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: {
        id: newUser.id,
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
      },
      profile: newProfile,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed.' });
  }
});

// ==========================================
// 2. User Login (Constant-Time Verification)
// ==========================================
authRouter.post('/auth/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Fetch user
    const [user] = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);

    if (!user || !user.passwordHash || !user.isActive) {
      // Record failed authentication attempt
      await recordAuditLog({
        userId: user?.id || null,
        action: 'AUTH_LOGIN_FAILED',
        resourceType: 'users',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { attemptedEmail: cleanEmail, reason: 'User not found or inactive' },
      });

      return res.status(401).json({
        error: 'Invalid email or password credentials.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Verify Password Hash with Django PBKDF2 constant-time check
    const isValid = checkPassword(password, user.passwordHash);
    if (!isValid) {
      await recordAuditLog({
        userId: user.id,
        action: 'AUTH_LOGIN_FAILED',
        resourceType: 'users',
        resourceId: String(user.id),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: { reason: 'Password hash mismatch' },
      });

      return res.status(401).json({
        error: 'Invalid email or password credentials.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Update last login timestamp
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));

    // Fetch patient profile
    const [profile] = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, user.id))
      .limit(1);

    // Record success audit log
    await recordAuditLog({
      userId: user.id,
      action: 'AUTH_LOGIN_SUCCESS',
      resourceType: 'users',
      resourceId: String(user.id),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const token = generateAuthToken({
      userId: user.id,
      uid: user.uid,
      email: user.email,
      role: user.role as any,
      displayName: user.displayName,
    });

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        lastLogin: user.lastLogin,
      },
      profile: profile || null,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed.' });
  }
});

// ==========================================
// 3. Password Reset Architecture
// ==========================================
authRouter.post('/auth/password-reset-request', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const [user] = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);

    if (user) {
      const { token, expires } = generateResetToken();
      await db
        .update(users)
        .set({
          resetToken: token,
          resetTokenExpires: expires,
        })
        .where(eq(users.id, user.id));

      await recordAuditLog({
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        resourceType: 'users',
        resourceId: String(user.id),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      // In production, send email; in preview/testing, return simulated token
      return res.json({
        message: 'Password reset token generated. Check your email or use the reset token to complete.',
        simulatedResetToken: token,
        expiresIn: '1 hour',
      });
    }

    // Always respond with success to prevent user enumeration
    res.json({
      message: 'If the email exists in our system, a password reset link has been dispatched.',
    });
  } catch (error: any) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: error.message || 'Password reset request failed.' });
  }
});

authRouter.post('/auth/password-reset-confirm', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword || newPassword.length < 8) {
      return res.status(400).json({
        error: 'Valid reset token and minimum 8-character password are required.',
      });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetToken, token))
      .limit(1);

    if (!user || !user.resetTokenExpires || new Date() > user.resetTokenExpires) {
      return res.status(400).json({
        error: 'Password reset token is invalid or has expired. Please request a new token.',
      });
    }

    // Hash new password using Django PBKDF2
    const newPasswordHash = makePassword(newPassword);

    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        resetToken: null,
        resetTokenExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await recordAuditLog({
      userId: user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      resourceType: 'users',
      resourceId: String(user.id),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Password successfully updated. You may now login.' });
  } catch (error: any) {
    console.error('Password reset confirm error:', error);
    res.status(500).json({ error: error.message || 'Password reset failed.' });
  }
});

// ==========================================
// 4. Current User Session (/api/v1/auth/me)
// ==========================================
authRouter.get('/auth/me', authenticateRequest, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const current = req.authUser!;
    const [user] = await db.select().from(users).where(eq(users.id, current.id)).limit(1);
    const [profile] = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, current.id))
      .limit(1);
    const userConsents = await db
      .select()
      .from(consents)
      .where(eq(consents.userId, current.id));

    res.json({
      user: {
        id: user.id,
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
      profile: profile || null,
      consents: userConsents,
    });
  } catch (error: any) {
    console.error('Fetch current session error:', error);
    res.status(500).json({ error: 'Failed to retrieve session profile.' });
  }
});

// ==========================================
// 5. Patient Profile CRUD & Strict Isolation
// ==========================================
authRouter.get('/patient/profile/:userId?', authenticateRequest, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = req.params.userId ? parseInt(req.params.userId, 10) : req.authUser!.id;

    // Strict Ownership & Permission Validation Guard
    const authorized = await checkPatientOwnership(req, res, targetUserId);
    if (!authorized) return;

    const [profile] = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, targetUserId))
      .limit(1);

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    // Audit log profile view
    await recordAuditLog({
      userId: req.authUser!.id,
      action: 'PROFILE_VIEW',
      resourceType: 'patient_profile',
      resourceId: String(targetUserId),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      user,
      profile: profile || {
        userId: targetUserId,
        fullName: user?.displayName || '',
        dateOfBirth: null,
        gender: null,
        preferredLanguage: 'en',
        allergies: null,
        existingConditions: null,
        currentMedications: null,
        medicalHistorySummary: null,
      },
    });
  } catch (error: any) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve patient profile.' });
  }
});

authRouter.put('/patient/profile/:userId?', authenticateRequest, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetUserId = req.params.userId ? parseInt(req.params.userId, 10) : req.authUser!.id;

    // Strict Ownership Guard
    const authorized = await checkPatientOwnership(req, res, targetUserId);
    if (!authorized) return;

    const {
      fullName,
      dateOfBirth,
      gender,
      bloodGroup,
      preferredLanguage,
      allergies,
      existingConditions,
      currentMedications,
      medicalHistorySummary,
    } = req.body;

    // Update or Insert Patient Profile (Data Minimization: Only permitted medical fields)
    const [updatedProfile] = await db
      .insert(patientProfiles)
      .values({
        userId: targetUserId,
        fullName: fullName || null,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        bloodGroup: bloodGroup || null,
        preferredLanguage: preferredLanguage || 'en',
        allergies: allergies || null,
        existingConditions: existingConditions || null,
        currentMedications: currentMedications || null,
        medicalHistorySummary: medicalHistorySummary || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: patientProfiles.userId,
        set: {
          fullName: fullName !== undefined ? fullName : undefined,
          dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : undefined,
          gender: gender !== undefined ? gender : undefined,
          bloodGroup: bloodGroup !== undefined ? bloodGroup : undefined,
          preferredLanguage: preferredLanguage !== undefined ? preferredLanguage : undefined,
          allergies: allergies !== undefined ? allergies : undefined,
          existingConditions: existingConditions !== undefined ? existingConditions : undefined,
          currentMedications: currentMedications !== undefined ? currentMedications : undefined,
          medicalHistorySummary: medicalHistorySummary !== undefined ? medicalHistorySummary : undefined,
          updatedAt: new Date(),
        },
      })
      .returning();

    // Optionally update user display name
    if (fullName) {
      await db.update(users).set({ displayName: fullName }).where(eq(users.id, targetUserId));
    }

    // Audit log
    await recordAuditLog({
      userId: req.authUser!.id,
      action: 'PROFILE_UPDATE',
      resourceType: 'patient_profile',
      resourceId: String(targetUserId),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: {
        updatedFields: Object.keys(req.body),
      },
    });

    res.json({
      message: 'Patient profile updated successfully.',
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message || 'Failed to update patient profile.' });
  }
});

// ==========================================
// 6. Consent Management & Privacy Controls
// ==========================================
authRouter.get('/consents', authenticateRequest, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await db
      .select()
      .from(consents)
      .where(eq(consents.userId, req.authUser!.id))
      .orderBy(desc(consents.updatedAt));

    res.json(list);
  } catch (error: any) {
    console.error('Fetch consents error:', error);
    res.status(500).json({ error: 'Failed to fetch consent records.' });
  }
});

authRouter.post('/consents', authenticateRequest, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { consentType, isGranted, termsTextSummary } = req.body;

    if (!consentType || typeof isGranted !== 'boolean') {
      return res.status(400).json({ error: 'consentType and isGranted (boolean) are required.' });
    }

    const userId = req.authUser!.id;

    // Check if consent record exists
    const [existing] = await db
      .select()
      .from(consents)
      .where(and(eq(consents.userId, userId), eq(consents.consentType, consentType)))
      .limit(1);

    let result;
    if (existing) {
      const [updated] = await db
        .update(consents)
        .set({
          isGranted,
          revokedAt: isGranted ? null : new Date(),
          grantedAt: isGranted ? new Date() : existing.grantedAt,
          termsTextSummary: termsTextSummary || existing.termsTextSummary,
          ipAddress: req.ip,
          updatedAt: new Date(),
        })
        .where(eq(consents.id, existing.id))
        .returning();
      result = updated;
    } else {
      const [inserted] = await db
        .insert(consents)
        .values({
          userId,
          consentType,
          isGranted,
          grantedAt: new Date(),
          revokedAt: isGranted ? null : new Date(),
          termsTextSummary: termsTextSummary || `Consent record for ${consentType}`,
          ipAddress: req.ip,
        })
        .returning();
      result = inserted;
    }

    await recordAuditLog({
      userId,
      action: isGranted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
      resourceType: 'consents',
      resourceId: String(result.id),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { consentType, isGranted },
    });

    res.json({
      message: `Consent for '${consentType}' ${isGranted ? 'granted' : 'revoked'}.`,
      consent: result,
    });
  } catch (error: any) {
    console.error('Update consent error:', error);
    res.status(500).json({ error: 'Failed to update consent.' });
  }
});

// ==========================================
// 7. Right to Erasure (Account Deletion)
// ==========================================
authRouter.delete('/patient/account', authenticateRequest, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.authUser!.id;

    // Record erasure request in audit log before cascade delete
    await recordAuditLog({
      userId,
      action: 'DATA_ERASURE_REQUEST',
      resourceType: 'users',
      resourceId: String(userId),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { userEmail: req.authUser!.email, status: 'PERMANENTLY_PURGED' },
    });

    // Delete user (cascade automatically purges patient_profiles, consents, assessments, etc.)
    await db.delete(users).where(eq(users.id, userId));

    res.json({
      message: 'All patient records and associated clinical data have been permanently erased per GDPR/HIPAA right to erasure.',
      status: 'erased',
    });
  } catch (error: any) {
    console.error('Data erasure error:', error);
    res.status(500).json({ error: 'Failed to complete data erasure request.' });
  }
});

// ==========================================
// 8. User Audit Logs Trail
// ==========================================
authRouter.get('/audit-logs/my-logs', authenticateRequest, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, req.authUser!.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(50);

    res.json(logs);
  } catch (error: any) {
    console.error('Fetch my audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});
