import { db } from './index.ts';
import { users, patientProfiles, doctors, consents } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string, role: 'patient' | 'doctor' | 'admin' | 'auditor' = 'patient') {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        role,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || undefined,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('getOrCreateUser error:', error);
    throw new Error('Database operation failed for user synchronization.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const found = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return found[0] || null;
  } catch (error) {
    console.error('getUserByUid error:', error);
    throw new Error('Failed to retrieve user by UID.', { cause: error });
  }
}

export async function getUserProfile(userId: number) {
  try {
    const profile = await db.select().from(patientProfiles).where(eq(patientProfiles.userId, userId)).limit(1);
    return profile[0] || null;
  } catch (error) {
    console.error('getUserProfile error:', error);
    throw new Error('Failed to retrieve patient profile.', { cause: error });
  }
}
