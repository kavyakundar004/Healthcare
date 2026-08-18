import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, User, CheckCircle2, AlertCircle, X, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [allergies, setAllergies] = useState('');
  const [existingConditions, setExistingConditions] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [medicalHistorySummary, setMedicalHistorySummary] = useState('');

  // Explicit Consent checkboxes
  const [consentProcessing, setConsentProcessing] = useState(true);
  const [consentAi, setConsentAi] = useState(true);
  const [consentDoctor, setConsentDoctor] = useState(false);
  const [consentErasure, setConsentErasure] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'login') {
      const res = await login(email, password);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Invalid credentials');
      }
    } else if (mode === 'register') {
      if (!consentProcessing || !consentErasure) {
        setErrorMessage('You must review and accept the Health Data Processing and Data Erasure terms to register.');
        setIsLoading(false);
        return;
      }

      const res = await register({
        email,
        password,
        fullName,
        dateOfBirth: dateOfBirth || null,
        gender,
        preferredLanguage,
        allergies: allergies || null,
        existingConditions: existingConditions || null,
        currentMedications: currentMedications || null,
        medicalHistorySummary: medicalHistorySummary || null,
        consentsGranted: {
          HEALTH_DATA_PROCESSING: consentProcessing,
          AI_CLINICAL_ANALYSIS: consentAi,
          PHYSICIAN_DATA_SHARING: consentDoctor,
          DATA_RETENTION_ERASURE: consentErasure,
        },
      });

      if (res.success) {
        setSuccessMessage('Account registered successfully with Django PBKDF2 hashing.');
        setTimeout(() => onClose(), 1000);
      } else {
        setErrorMessage(res.error || 'Registration failed');
      }
    } else if (mode === 'forgot') {
      try {
        const res = await fetch('/api/v1/auth/password-reset-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        setSuccessMessage(data.message);
        if (data.simulatedResetToken) {
          setResetToken(data.simulatedResetToken);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Reset request failed');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF9F6] border-2 border-[#1A1A1A] w-full max-w-xl shadow-2xl relative my-8">
        {/* Modal Header */}
        <div className="bg-[#1A1A1A] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-mono font-bold text-xs uppercase tracking-widest">
              {mode === 'login' && 'Patient Authentication'}
              {mode === 'register' && 'Patient Registration & Consent'}
              {mode === 'forgot' && 'Password Reset Architecture'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-500 text-rose-900 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-500 text-emerald-900 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {resetToken && (
            <div className="p-3 bg-neutral-100 border border-[#1A1A1A] text-xs font-mono space-y-1">
              <span className="font-bold text-[#1A1A1A] block">Simulated Reset Token:</span>
              <code className="break-all text-neutral-700 bg-white p-1 block border">{resetToken}</code>
            </div>
          )}

          {/* Login Fields */}
          {mode === 'login' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@healthguide.ai"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#1A1A1A] text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A1A1A]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] font-mono text-[#666] hover:text-[#1A1A1A] underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2 bg-white border border-[#1A1A1A] text-xs font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#1A1A1A] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-neutral-100 border border-neutral-300 text-[11px] font-serif italic text-neutral-700">
                Security notice: Uses standard Django PBKDF2-SHA256 password hashing with constant-time verification.
              </div>

              {/* Quick Fill Demo Credentials */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666] block">
                  Quick Fill Test Credentials:
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('priya.sharma@example.com');
                      setPassword('PatientPassword123!');
                    }}
                    className="p-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-left cursor-pointer"
                  >
                    <span className="font-bold block text-emerald-800">Patient</span>
                    <span className="text-[9px] text-[#666]">Priya Sharma</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('dr.patel@healthguide.ai');
                      setPassword('DoctorPassword123!');
                    }}
                    className="p-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-left cursor-pointer"
                  >
                    <span className="font-bold block text-blue-800">Doctor</span>
                    <span className="text-[9px] text-[#666]">Dr. Arjun Patel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@healthguide.ai');
                      setPassword('AdminPassword123!');
                    }}
                    className="p-1.5 bg-white hover:bg-neutral-100 border border-neutral-300 text-left cursor-pointer"
                  >
                    <span className="font-bold block text-purple-800">Auditor</span>
                    <span className="text-[9px] text-[#666]">System Admin</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Registration Fields */}
          {mode === 'register' && (
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Jane Doe"
                    className="w-full px-3 py-1.5 bg-white border border-[#1A1A1A] text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane.doe@example.com"
                    className="w-full px-3 py-1.5 bg-white border border-[#1A1A1A] text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Password (min 8 characters) *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Strong password..."
                    className="w-full px-3 py-1.5 bg-white border border-[#1A1A1A] text-xs font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#1A1A1A] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Medically Relevant Attributes (Data Minimization) */}
              <div className="border-t border-[#1A1A1A]/20 pt-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#666] block mb-2">
                  Clinical Profile Attributes (Data Minimization)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-[#1A1A1A] mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-[#1A1A1A] text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-[#1A1A1A] mb-1">
                      Medically Relevant Sex
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-[#1A1A1A] text-xs font-mono"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="intersex">Intersex</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-[#1A1A1A] mb-1">
                      Preferred Language
                    </label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-[#1A1A1A] text-xs font-mono"
                    >
                      <option value="en">English</option>
                      <option value="es">Español (Spanish)</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="fr">Français (French)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-[#1A1A1A] mb-0.5">
                      Known Allergies & Sensitivities
                    </label>
                    <input
                      type="text"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      placeholder="e.g. Penicillin, Peanuts, Sulfa"
                      className="w-full px-2 py-1 bg-white border border-[#1A1A1A] text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-[#1A1A1A] mb-0.5">
                      Existing Conditions & Current Medications
                    </label>
                    <input
                      type="text"
                      value={existingConditions}
                      onChange={(e) => setExistingConditions(e.target.value)}
                      placeholder="e.g. Hypertension, Omeprazole 20mg daily"
                      className="w-full px-2 py-1 bg-white border border-[#1A1A1A] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Consent Disclosures */}
              <div className="border-2 border-[#1A1A1A] bg-white p-3 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1A1A1A] block">
                  Mandatory & Optional Privacy Consents
                </span>

                <label className="flex items-start gap-2 text-xs font-serif cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentProcessing}
                    onChange={(e) => setConsentProcessing(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    <strong>Health Information Collection:</strong> I agree to the collection and processing of my self-reported health intake data for educational guidance.
                  </span>
                </label>

                <label className="flex items-start gap-2 text-xs font-serif cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAi}
                    onChange={(e) => setConsentAi(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    <strong>AI Clinical Analysis:</strong> I understand AI models process queries server-side with strict de-identification and zero training on PHI.
                  </span>
                </label>

                <label className="flex items-start gap-2 text-xs font-serif cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentDoctor}
                    onChange={(e) => setConsentDoctor(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    <strong>Physician Data Sharing (Optional):</strong> Allow licensed healthcare providers in the system to view my clinical timeline.
                  </span>
                </label>

                <label className="flex items-start gap-2 text-xs font-serif cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentErasure}
                    onChange={(e) => setConsentErasure(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    <strong>Right to Erasure:</strong> I acknowledge that I may permanently delete all my profile and medical records at any time.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Forgot Password Fields */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Enter your registered Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@healthguide.ai"
                  className="w-full px-3 py-2 bg-white border border-[#1A1A1A] text-xs font-mono focus:outline-none"
                />
              </div>
              <p className="text-xs font-serif italic text-[#666]">
                Our password recovery architecture generates a cryptographically signed, 1-hour expiring recovery token adhering to HIPAA security rules.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#1A1A1A] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : mode === 'login' ? 'Secure Login' : mode === 'register' ? 'Register Account' : 'Generate Reset Token'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Footer Mode Switcher */}
          <div className="text-center pt-2 border-t border-[#1A1A1A]/10 font-mono text-xs">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold underline cursor-pointer"
                >
                  Create Patient Account
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold underline cursor-pointer"
                >
                  Back to Login
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
