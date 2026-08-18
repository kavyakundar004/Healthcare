import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Eye, Brain, Stethoscope, Trash2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const PrivacyConsentManager: React.FC = () => {
  const { user, consents, updateConsent, deleteAccount } = useAuth();
  const [updatingType, setUpdatingType] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  if (!user) return null;

  const isConsentGranted = (type: string, defaultVal = false): boolean => {
    const rec = consents.find((c) => c.consentType === type);
    return rec ? rec.isGranted : defaultVal;
  };

  const handleToggle = async (type: string, currentVal: boolean) => {
    setUpdatingType(type);
    setFeedbackNotice(null);
    const newVal = !currentVal;
    const res = await updateConsent(type, newVal);
    if (res.success) {
      setFeedbackNotice(`Consent policy for '${type}' updated to: ${newVal ? 'GRANTED' : 'REVOKED'}.`);
    } else {
      setFeedbackNotice(`Failed to update consent: ${res.error}`);
    }
    setUpdatingType(null);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeletingAccount(true);
    const res = await deleteAccount();
    if (!res.success) {
      setFeedbackNotice(`Deletion error: ${res.error}`);
      setIsDeletingAccount(false);
    }
  };

  const consentCategories = [
    {
      type: 'HEALTH_DATA_PROCESSING',
      title: '1. What Health Information Is Collected & Why',
      icon: Eye,
      description:
        'We collect strictly user-provided symptoms, self-reported vitals, chronic conditions, and medications. This information is utilized solely to provide relevant educational triage insights and highlight potential drug interactions. We enforce strict data minimization (no SSN, no unconsented trackers).',
      defaultState: true,
      canRevoke: false, // Mandatory for service use
      mandatoryNotice: 'Required for active health assessment features',
    },
    {
      type: 'AI_CLINICAL_ANALYSIS',
      title: '2. How AI May Process Your Information',
      icon: Brain,
      description:
        'Clinical prompts sent to Google Gemini 3.7 Flash run strictly through server-side authenticated APIs. Prompts are de-identified and are NEVER used to train foundational AI models or shared with commercial advertising brokers.',
      defaultState: true,
      canRevoke: true,
    },
    {
      type: 'PHYSICIAN_DATA_SHARING',
      title: '3. Whether Doctors Can Access Your Records',
      icon: Stethoscope,
      description:
        'By default, your health records are completely isolated and private to your account. Enabling this setting permits verified healthcare providers in the HealthGuide network to review your assessment logs during telehealth consultations.',
      defaultState: false,
      canRevoke: true,
    },
    {
      type: 'DATA_RETENTION_ERASURE',
      title: '4. Data Retention & Right to Erasure',
      icon: Trash2,
      description:
        'In compliance with GDPR and HIPAA data protection principles, you maintain the permanent right to erasure. Clicking "Permanently Erase My Data" below cascades an immediate hard delete across all database tables.',
      defaultState: true,
      canRevoke: false,
      isErasureCard: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="border-2 border-[#1A1A1A] bg-[#1A1A1A] text-white p-6 md:p-8">
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-emerald-400 block mb-1">
          Healthcare Privacy & Consent Governance
        </span>
        <h2 className="text-3xl font-black uppercase tracking-tight">Patient Rights & Data Control</h2>
        <p className="text-sm font-serif italic text-white/80 max-w-3xl mt-1">
          Complete transparency over health information collection, de-identification safeguards, physician data sharing, and full right to erasure.
        </p>
      </div>

      {feedbackNotice && (
        <div className="p-3 bg-emerald-50 border-2 border-emerald-600 text-emerald-900 font-mono text-xs flex items-center justify-between">
          <span>{feedbackNotice}</span>
          <button onClick={() => setFeedbackNotice(null)} className="font-bold cursor-pointer">×</button>
        </div>
      )}

      {/* Consent Category Cards */}
      <div className="space-y-4">
        {consentCategories.map((item) => {
          const Icon = item.icon;
          const granted = isConsentGranted(item.type, item.defaultState);
          const isPending = updatingType === item.type;

          return (
            <div key={item.type} className="border-2 border-[#1A1A1A] bg-white p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A1A1A]/20 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1A1A1A] text-white">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black font-mono text-sm uppercase text-[#1A1A1A]">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.mandatoryNotice ? (
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-1 bg-neutral-100 text-neutral-700 border border-neutral-300">
                      {item.mandatoryNotice}
                    </span>
                  ) : item.isErasureCard ? (
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Delete Account & Records
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggle(item.type, granted)}
                      disabled={isPending}
                      className={`px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors ${
                        granted
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
                      }`}
                    >
                      {isPending ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      {granted ? 'CONSENT GRANTED' : 'OPTED OUT / DISABLED'}
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-[#444] font-serif leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="bg-white border-2 border-rose-600 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-mono font-bold text-sm uppercase">Permanent Data Wipe</h3>
            </div>

            <p className="text-xs text-[#333] font-serif">
              This action is permanent and irreversible. Your user account, health profile, clinical assessments, and consent logs will be completely removed from Google Cloud SQL.
            </p>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-[#1A1A1A] mb-1">
                Type "DELETE" to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-1.5 bg-[#FAF9F6] border border-[#1A1A1A] text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-1.5 border border-[#1A1A1A] text-xs font-mono font-bold uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirmText !== 'DELETE' || isDeletingAccount}
                onClick={handleDeleteAccount}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-bold uppercase cursor-pointer disabled:opacity-50"
              >
                {isDeletingAccount ? 'Purging Records...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
