import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  role: 'patient' | 'doctor' | 'admin' | 'auditor';
  lastLogin?: string | null;
}

export interface PatientProfile {
  id?: number;
  userId: number;
  fullName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup?: string | null;
  preferredLanguage: string;
  allergies: string | null;
  existingConditions: string | null;
  currentMedications: string | null;
  medicalHistorySummary: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConsentRecord {
  id: number;
  userId: number;
  consentType: string;
  version: string;
  isGranted: boolean;
  grantedAt: string;
  revokedAt?: string | null;
  termsTextSummary: string;
}

interface AuthContextType {
  user: User | null;
  profile: PatientProfile | null;
  consents: ConsentRecord[];
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<PatientProfile>) => Promise<{ success: boolean; error?: string }>;
  updateConsent: (consentType: string, isGranted: boolean) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hg_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSession = async (authToken: string) => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);
        setConsents(data.consents || []);
      } else {
        // Token expired or invalid
        logout();
      }
    } catch (err) {
      console.warn('Session verification fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSession(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile);
      localStorage.setItem('hg_auth_token', data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const register = async (data: any) => {
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Registration failed' };
      }
      setToken(resData.token);
      setUser(resData.user);
      setProfile(resData.profile);
      localStorage.setItem('hg_auth_token', resData.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setConsents([]);
    setToken(null);
    localStorage.removeItem('hg_auth_token');
  };

  const updateProfile = async (data: Partial<PatientProfile>) => {
    if (!token) return { success: false, error: 'Unauthenticated' };
    try {
      const res = await fetch('/api/v1/patient/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Update failed' };
      }
      setProfile(resData.profile);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const updateConsent = async (consentType: string, isGranted: boolean) => {
    if (!token) return { success: false, error: 'Unauthenticated' };
    try {
      const res = await fetch('/api/v1/consents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ consentType, isGranted }),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Consent update failed' };
      }
      await fetchSession(token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const deleteAccount = async () => {
    if (!token) return { success: false, error: 'Unauthenticated' };
    try {
      const res = await fetch('/api/v1/patient/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        logout();
        return { success: true };
      }
      const data = await res.json();
      return { success: false, error: data.error || 'Deletion failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const refreshSession = async () => {
    if (token) {
      await fetchSession(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        consents,
        token,
        isLoading,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout,
        updateProfile,
        updateConsent,
        deleteAccount,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
