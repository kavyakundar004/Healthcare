import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Save, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProfileEditProps {
  onCancel: () => void;
  onSaved: () => void;
}

export const PatientProfileEdit: React.FC<ProfileEditProps> = ({
  onCancel,
  onSaved,
}) => {
  const { profile, user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.fullName || user?.displayName || '');
  const [dateOfBirth, setDateOfBirth] = useState(profile?.dateOfBirth || '');
  const [gender, setGender] = useState(profile?.gender || 'prefer_not_to_say');
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferredLanguage || 'en');
  const [allergies, setAllergies] = useState(profile?.allergies || '');
  const [existingConditions, setExistingConditions] = useState(profile?.existingConditions || '');
  const [currentMedications, setCurrentMedications] = useState(profile?.currentMedications || '');
  const [medicalHistorySummary, setMedicalHistorySummary] = useState(profile?.medicalHistorySummary || '');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    const res = await updateProfile({
      fullName,
      dateOfBirth: dateOfBirth || null,
      gender,
      preferredLanguage,
      allergies: allergies || null,
      existingConditions: existingConditions || null,
      currentMedications: currentMedications || null,
      medicalHistorySummary: medicalHistorySummary || null,
    });

    if (res.success) {
      setSuccessNotice('Patient profile updated successfully.');
      setTimeout(() => {
        onSaved();
      }, 800);
    } else {
      setErrorMessage(res.error || 'Failed to update profile.');
    }
    setIsSaving(false);
  };

  return (
    <div className="border-2 border-[#1A1A1A] bg-white p-6 sm:p-8 space-y-6">
      <div className="border-b-2 border-[#1A1A1A] pb-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#666]">
            Record Maintenance
          </span>
          <h2 className="text-2xl font-black uppercase tracking-tight">Edit Patient Profile</h2>
        </div>
        <button
          onClick={onCancel}
          className="p-2 border border-[#1A1A1A] hover:bg-neutral-100 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-500 text-rose-900 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-500 text-emerald-900 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
        {/* Basic Identification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#1A1A1A] mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#1A1A1A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#1A1A1A] mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#1A1A1A] focus:outline-none"
            />
          </div>
        </div>

        {/* Medically Relevant Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#1A1A1A] mb-1">
              Medically Relevant Sex
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#1A1A1A] focus:outline-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="intersex">Intersex</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#1A1A1A] mb-1">
              Preferred Language
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#1A1A1A] focus:outline-none"
            >
              <option value="en">English</option>
              <option value="es">Español (Spanish)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="fr">Français (French)</option>
              <option value="de">Deutsch (German)</option>
            </select>
          </div>
        </div>

        {/* Clinical Factors */}
        <div className="space-y-4 border-t border-[#1A1A1A]/20 pt-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#666] block">
            Health History (Only Relevant Clinical Data)
          </span>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#1A1A1A] mb-1">
              Known Allergies (Food, Environmental, Pharmaceuticals)
            </label>
            <textarea
              rows={2}
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin (anaphylaxis), Sulfa, Latex, Tree nuts"
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#1A1A1A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#1A1A1A] mb-1">
              Existing Medical Conditions (Chronic / Diagnosed)
            </label>
            <textarea
              rows={2}
              value={existingConditions}
              onChange={(e) => setExistingConditions(e.target.value)}
              placeholder="e.g. Essential Hypertension, Type 2 Diabetes, Acid Reflux"
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#1A1A1A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#1A1A1A] mb-1">
              Current Medications & Daily Supplements
            </label>
            <textarea
              rows={2}
              value={currentMedications}
              onChange={(e) => setCurrentMedications(e.target.value)}
              placeholder="e.g. Lisinopril 10mg daily, Metformin 500mg BID, Vitamin D3"
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#1A1A1A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#1A1A1A] mb-1">
              Relevant Medical History & Surgical Procedures
            </label>
            <textarea
              rows={2}
              value={medicalHistorySummary}
              onChange={(e) => setMedicalHistorySummary(e.target.value)}
              placeholder="e.g. Cholecystectomy (2018), Family history of myocardial infarction"
              className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#1A1A1A] focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A1A1A]/20">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-[#1A1A1A] bg-white hover:bg-neutral-100 font-bold uppercase cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-[#1A1A1A] text-white hover:bg-black font-bold uppercase flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
