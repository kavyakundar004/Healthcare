import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, Heart, FileText, CheckCircle2, Lock, Edit3, Settings, AlertTriangle } from 'lucide-react';

interface ProfileViewProps {
  onEditClick: () => void;
  onConsentClick: () => void;
}

export const PatientProfileView: React.FC<ProfileViewProps> = ({
  onEditClick,
  onConsentClick,
}) => {
  const { user, profile, consents } = useAuth();

  if (!user) {
    return (
      <div className="border-2 border-[#1A1A1A] bg-white p-8 text-center space-y-3">
        <Lock className="w-8 h-8 mx-auto text-[#666]" />
        <h3 className="font-mono font-bold text-sm uppercase">Authentication Required</h3>
        <p className="text-xs font-serif text-[#666]">Please login to view or maintain your patient profile.</p>
      </div>
    );
  }

  const doctorConsent = consents.find((c) => c.consentType === 'PHYSICIAN_DATA_SHARING' && c.isGranted);
  const aiConsent = consents.find((c) => c.consentType === 'AI_CLINICAL_ANALYSIS' && c.isGranted);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="border-2 border-[#1A1A1A] bg-[#1A1A1A] text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-emerald-400 block mb-1">
            HIPAA-Compliant Patient Record
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            {profile?.fullName || user.displayName || 'Anonymous Patient'}
          </h2>
          <p className="text-xs font-mono text-white/70 mt-1">
            Account UID: {user.uid} • Role: {user.role.toUpperCase()} • System ID: #{user.id}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onEditClick}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#1A1A1A] font-mono text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
          <button
            onClick={onConsentClick}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono text-xs font-bold uppercase hover:bg-emerald-900 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            Privacy & Consents
          </button>
        </div>
      </div>

      {/* Grid of Profile Attributes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Demographics & Medical Attributes */}
        <div className="border-2 border-[#1A1A1A] bg-white p-6 space-y-4">
          <div className="border-b border-[#1A1A1A] pb-2 flex items-center justify-between">
            <span className="font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <User className="w-4 h-4" />
              Demographic & Medically Relevant Identity
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
              MINIMIZED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <span className="text-[10px] text-[#666] uppercase block">Email</span>
              <span className="font-bold text-[#1A1A1A] truncate block">{user.email}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#666] uppercase block">Date of Birth</span>
              <span className="font-bold text-[#1A1A1A]">{profile?.dateOfBirth || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#666] uppercase block">Medically Relevant Sex</span>
              <span className="font-bold text-[#1A1A1A] uppercase">{profile?.gender?.replace('_', ' ') || 'Unspecified'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#666] uppercase block">Preferred Language</span>
              <span className="font-bold text-[#1A1A1A] uppercase">{profile?.preferredLanguage || 'EN'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Intake & Health Factors */}
        <div className="border-2 border-[#1A1A1A] bg-white p-6 space-y-4">
          <div className="border-b border-[#1A1A1A] pb-2 flex items-center justify-between">
            <span className="font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Clinical Factors & Health History
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <span className="text-[10px] text-[#666] uppercase block">Known Allergies</span>
              <p className="text-[#1A1A1A] font-semibold bg-[#FAF9F6] p-2 border border-[#1A1A1A]/10 mt-1">
                {profile?.allergies || 'No known drug or food allergies recorded.'}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-[#666] uppercase block">Existing Medical Conditions</span>
              <p className="text-[#1A1A1A] font-semibold bg-[#FAF9F6] p-2 border border-[#1A1A1A]/10 mt-1">
                {profile?.existingConditions || 'No chronic conditions reported.'}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-[#666] uppercase block">Current Medications & Supplements</span>
              <p className="text-[#1A1A1A] font-semibold bg-[#FAF9F6] p-2 border border-[#1A1A1A]/10 mt-1">
                {profile?.currentMedications || 'None recorded.'}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-[#666] uppercase block">Medical History Summary</span>
              <p className="text-[#1A1A1A] font-semibold bg-[#FAF9F6] p-2 border border-[#1A1A1A]/10 mt-1">
                {profile?.medicalHistorySummary || 'No significant prior surgeries or hospitalizations.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Consent & Privacy Status Banner */}
      <div className="border-2 border-[#1A1A1A] bg-[#FAF9F6] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666] block">
            Active Privacy Guardrails & Permissions
          </span>
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Patient Data Isolation Active
            </span>
            <span className="flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {aiConsent ? 'AI Inference Permitted' : 'AI Inference Restricted'}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {doctorConsent ? 'Physician Sharing: Enabled' : 'Physician Sharing: Private (Disabled)'}
            </span>
          </div>
        </div>

        <button
          onClick={onConsentClick}
          className="px-3 py-1.5 bg-white border border-[#1A1A1A] font-mono text-xs font-bold uppercase hover:bg-neutral-100 cursor-pointer"
        >
          Manage Permissions
        </button>
      </div>
    </div>
  );
};
