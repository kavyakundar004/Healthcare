import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PatientDashboardItem, StructuredAssessmentResult, FollowUpStatus, RiskLevel } from '../../types/assessment';
import { AssessmentResultCard } from './AssessmentResultCard';
import {
  Clock,
  Shield,
  Activity,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  PlusCircle,
  User,
  Lock,
  ExternalLink,
  Calendar,
  X,
} from 'lucide-react';

interface PatientDashboardProps {
  onStartNewAssessment: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ onStartNewAssessment }) => {
  const { user, profile, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState<{
    currentAssessment: PatientDashboardItem | null;
    previousAssessments: PatientDashboardItem[];
  }>({
    currentAssessment: null,
    previousAssessments: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedAssessmentDetail, setSelectedAssessmentDetail] = useState<StructuredAssessmentResult | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('hg_auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/v1/assessments/patient-dashboard', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.dashboard) {
          setDashboardData(data.dashboard);
        }
      }
    } catch (err) {
      console.warn('Dashboard fetch notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  const handleViewAssessment = async (item: PatientDashboardItem) => {
    setIsDetailLoading(true);
    try {
      const token = localStorage.getItem('hg_auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/v1/assessments/${item.id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        // Construct structured result view for previous record
        const detail = data.assessment;
        const risk = detail.riskAssessment;
        const rLevel: RiskLevel = item.riskLevel;

        const reconstructed: StructuredAssessmentResult = {
          metadata: {
            assessmentId: detail.assessment.id,
            sessionId: `record_${detail.assessment.id}`,
            patientId: detail.assessment.patientId,
            conductedAt: detail.assessment.conductedAt,
            language: 'en',
            engineVersion: '6.0.0-safety-engine',
            isStoredInDb: true,
          },
          symptomSummary: {
            selectedSymptoms: [
              {
                id: 'symptom_history',
                name: item.primarySymptomSummary.split('.')[0] || 'Historical Assessment',
                nameHi: 'ऐतिहासिक मूल्यांकन',
                bodySystem: 'systemic',
              },
            ],
            primaryComplaint: item.primarySymptomSummary,
            narrative: item.primarySymptomSummary,
          },
          relevantInformationCollected: [
            { category: 'symptom', label: 'Primary Assessment Summary', value: item.primarySymptomSummary },
            { category: 'vital', label: 'Triage Classification', value: item.triageLevel.toUpperCase() },
          ],
          riskLevel: rLevel,
          riskExplanation:
            risk?.clinicalSummary || `Evaluated under clinical safety standards as ${rLevel} priority.`,
          missingInformation: [],
          redFlags: detail.redFlags.map((rf: any) => ({
            ruleCode: rf.ruleCode,
            triggerPhrase: rf.triggerPhrase,
            severity: 'high',
            urgencyLevel: rf.urgencyLevel,
            actionDirectives: rf.actionDirectives,
          })),
          recommendedNextStep:
            rLevel === 'RED'
              ? 'Seek urgent medical attention.'
              : rLevel === 'ORANGE'
              ? 'Prompt medical evaluation is recommended.'
              : rLevel === 'YELLOW'
              ? 'Consider consulting a healthcare professional.'
              : 'General health information may be appropriate.',
          professionalConsultationRecommended: rLevel !== 'GREEN',
          guidanceQuote:
            rLevel === 'RED'
              ? 'Seek urgent medical attention.'
              : rLevel === 'ORANGE'
              ? 'Prompt medical evaluation is recommended.'
              : rLevel === 'YELLOW'
              ? 'Consider consulting a healthcare professional.'
              : 'General health information may be appropriate.',
          disclaimer: {
            noDiagnosisNotice: 'HealthGuide AI is an educational tool and does NOT provide a medical diagnosis.',
            noPrescriptionNotice: 'This system does NOT provide prescriptions.',
            educationalOnlyNotice: 'Review with a qualified medical provider.',
          },
          followUp: {
            status: item.followUpStatus,
            suggestedDate: item.followUpDate || new Date().toISOString(),
            instructions: 'Follow-up status recorded.',
          },
          rawAnswers: {},
          vitalsAndMeasurements: {},
        };

        setSelectedAssessmentDetail(reconstructed);
      }
    } catch (err) {
      console.error('Error fetching detail:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleUpdateStatus = async (assessmentId: number, status: FollowUpStatus) => {
    try {
      const token = localStorage.getItem('hg_auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/v1/assessments/${assessmentId}/follow-up`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setStatusMessage(`Follow-up status updated to ${status}`);
        setTimeout(() => setStatusMessage(null), 3000);
        fetchDashboard();
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'RED':
        return <span className="bg-rose-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 border border-rose-700">RED PRIORITY</span>;
      case 'ORANGE':
        return <span className="bg-orange-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 border border-orange-500">ORANGE</span>;
      case 'YELLOW':
        return <span className="bg-amber-500 text-white font-mono text-[10px] font-bold px-2 py-0.5 border border-amber-400">YELLOW</span>;
      case 'GREEN':
      default:
        return <span className="bg-emerald-700 text-white font-mono text-[10px] font-bold px-2 py-0.5 border border-emerald-600">GREEN</span>;
    }
  };

  const getFollowUpBadge = (status: FollowUpStatus) => {
    switch (status) {
      case 'urgent_care_visited':
        return <span className="bg-rose-100 text-rose-800 border border-rose-300 font-mono text-[9px] px-1.5 py-0.2">ER VISITED</span>;
      case 'scheduled_consultation':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 font-mono text-[9px] px-1.5 py-0.2">DOC SCHEDULED</span>;
      case 'self_monitored':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 font-mono text-[9px] px-1.5 py-0.2">SELF-MONITORED</span>;
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[9px] px-1.5 py-0.2">COMPLETED</span>;
      case 'pending':
      default:
        return <span className="bg-neutral-100 text-neutral-800 border border-neutral-300 font-mono text-[9px] px-1.5 py-0.2">PENDING REVIEW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Patient Context & Data Isolation Banner */}
      <div className="border-2 border-[#1A1A1A] bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#1A1A1A] text-white flex items-center justify-center font-mono font-bold text-lg">
            <User className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666]">
                PATIENT PORTAL • HIPAA DATA ISOLATION ACTIVE
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-[#1A1A1A]">
              {profile?.fullName || user?.displayName || 'Active Patient Intake Record'}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#555] mt-1">
              <span>Patient ID: #{user?.id || '101'}</span>
              <span>•</span>
              <span>Email: {user?.email || 'patient@healthguide.ai'}</span>
              <span>•</span>
              <span className="bg-neutral-100 px-1.5 py-0.2 border border-neutral-300 uppercase">
                {user?.role || 'patient'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={fetchDashboard}
            disabled={isLoading}
            className="px-3 py-2 bg-white border border-[#1A1A1A] hover:bg-neutral-100 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh History
          </button>
          <button
            type="button"
            onClick={onStartNewAssessment}
            className="px-5 py-2 bg-[#1A1A1A] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            Start Assessment
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-400 text-emerald-900 font-mono text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {statusMessage}
        </div>
      )}

      {/* 1. Current Assessment Section */}
      {dashboardData.currentAssessment && (
        <div className="border-2 border-[#1A1A1A] bg-white shadow-sm overflow-hidden">
          <div className="bg-[#1A1A1A] text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Current Assessment (Latest Session)</span>
            </div>
            <span className="text-xs font-mono text-white/70">
              #{dashboardData.currentAssessment.id}
            </span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {getRiskBadge(dashboardData.currentAssessment.riskLevel)}
                {getFollowUpBadge(dashboardData.currentAssessment.followUpStatus)}
                <span className="text-xs font-mono text-[#666] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(dashboardData.currentAssessment.conductedAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm font-serif text-[#222] leading-relaxed">
                {dashboardData.currentAssessment.primarySymptomSummary}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2 justify-end">
              <button
                type="button"
                onClick={() => handleViewAssessment(dashboardData.currentAssessment!)}
                className="px-4 py-2.5 bg-[#FAF9F6] hover:bg-neutral-100 border border-[#1A1A1A] font-mono text-xs font-bold uppercase tracking-wider text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                View Full Result Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Previous Assessments History Table */}
      <div className="border-2 border-[#1A1A1A] bg-white shadow-sm overflow-hidden">
        <div className="bg-neutral-100 border-b-2 border-[#1A1A1A] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-wider text-[#1A1A1A]">
            <Clock className="w-4 h-4 text-[#1A1A1A]" />
            <span>Previous Clinical Assessments History ({dashboardData.previousAssessments.length})</span>
          </div>
          <span className="text-[10px] font-mono text-[#666] uppercase">
            Strict Per-Patient Data Isolation
          </span>
        </div>

        {dashboardData.previousAssessments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-8 h-8 text-[#999] mx-auto" />
            <h4 className="font-mono font-bold text-sm text-[#444] uppercase">No Assessment Records Found</h4>
            <p className="text-xs font-serif text-[#666] max-w-md mx-auto">
              You do not have any recorded symptom assessments yet. Click &quot;Start Assessment&quot; to begin the structured intake workflow.
            </p>
            <button
              type="button"
              onClick={onStartNewAssessment}
              className="mt-2 px-5 py-2 bg-[#1A1A1A] text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Start First Assessment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] border-b border-neutral-200 font-mono text-[10px] uppercase font-bold text-[#555]">
                <tr>
                  <th className="p-3.5">ID & Date</th>
                  <th className="p-3.5">Primary Symptoms & Clinical Summary</th>
                  <th className="p-3.5">Risk Level</th>
                  <th className="p-3.5">Follow-Up Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-serif">
                {dashboardData.previousAssessments.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] whitespace-nowrap">
                      <div className="font-bold text-[#1A1A1A]">#{item.id}</div>
                      <div className="text-[10px] text-[#666]">
                        {new Date(item.conductedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="p-3.5 text-xs text-[#222] max-w-md">
                      <div className="line-clamp-2 leading-relaxed">{item.primarySymptomSummary}</div>
                      {item.redFlagsCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-rose-700 font-bold mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          {item.redFlagsCount} Red Flag Trigger{item.redFlagsCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-mono">{getRiskBadge(item.riskLevel)}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="space-y-1">
                        <div>{getFollowUpBadge(item.followUpStatus)}</div>
                        <select
                          value={item.followUpStatus}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value as FollowUpStatus)}
                          className="text-[10px] font-mono bg-white border border-neutral-300 p-0.5 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="scheduled_consultation">Doc Scheduled</option>
                          <option value="self_monitored">Self-Monitored</option>
                          <option value="completed">Completed</option>
                          <option value="urgent_care_visited">ER Visited</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleViewAssessment(item)}
                        className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-[#1A1A1A] font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for detailed assessment view */}
      {selectedAssessmentDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#1A1A1A] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Historical Assessment Record Detail #{selectedAssessmentDetail.metadata.assessmentId}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAssessmentDetail(null)}
                className="p-1 text-[#666] hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AssessmentResultCard
              result={selectedAssessmentDetail}
              language="en"
              onRestart={() => {
                setSelectedAssessmentDetail(null);
                onStartNewAssessment();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
