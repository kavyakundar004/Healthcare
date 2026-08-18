import React, { useState, useEffect } from 'react';
import { ShieldCheck, Play, CheckCircle2, XCircle, RefreshCw, Lock, AlertTriangle, FileText, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TestResultItem {
  name: string;
  category: string;
  passed: boolean;
  message: string;
  details?: any;
}

interface TestSuiteResponse {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  timestamp: string;
  results: TestResultItem[];
}

export const SecurityCenter: React.FC = () => {
  const { token, user } = useAuth();
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [testReport, setTestReport] = useState<TestSuiteResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);

  const runSecurityTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch('/api/v1/security/run-tests', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setTestReport(data);
      }
    } catch (err) {
      console.error('Failed to run security tests:', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  const fetchAuditLogs = async () => {
    if (!token) return;
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/v1/audit-logs/my-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    runSecurityTests();
    if (token) {
      fetchAuditLogs();
    }
  }, [token]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="border-2 border-[#1A1A1A] bg-[#1A1A1A] text-white p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-emerald-400 block mb-1">
            Phase 3 Verification & Healthcare Security Engine
          </span>
          <h2 className="text-3xl font-black uppercase tracking-tight">Security, Isolation & Audit Center</h2>
          <p className="text-sm font-serif italic text-white/80 max-w-2xl mt-1">
            Automated verification of Django-standard PBKDF2 hashing, patient data isolation, RBAC permissions, and immutable audit logging.
          </p>
        </div>

        <button
          onClick={runSecurityTests}
          disabled={isRunningTests}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
          {isRunningTests ? 'Executing Test Suite...' : 'Run Security Tests'}
        </button>
      </div>

      {/* Test Suite Summary Banner */}
      {testReport && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border-2 border-[#1A1A1A] bg-white p-4 text-center">
            <span className="text-[10px] font-mono text-[#666] uppercase block">Total Security Tests</span>
            <span className="text-3xl font-black font-mono text-[#1A1A1A]">{testReport.totalTests}</span>
          </div>

          <div className="border-2 border-[#1A1A1A] bg-emerald-50 p-4 text-center">
            <span className="text-[10px] font-mono text-emerald-800 uppercase block">Passed Invariant Checks</span>
            <span className="text-3xl font-black font-mono text-emerald-700">{testReport.passedTests}</span>
          </div>

          <div className="border-2 border-[#1A1A1A] bg-white p-4 text-center">
            <span className="text-[10px] font-mono text-[#666] uppercase block">Security Violations / Failed</span>
            <span className={`text-3xl font-black font-mono ${testReport.failedTests === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {testReport.failedTests}
            </span>
          </div>
        </div>
      )}

      {/* Test Results Breakdown */}
      <div className="border-2 border-[#1A1A1A] bg-white">
        <div className="p-4 bg-[#FAF9F6] border-b-2 border-[#1A1A1A] flex items-center justify-between">
          <span className="font-bold text-xs uppercase font-mono tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Security & Patient Isolation Test Suite Matrix
          </span>
          <span className="text-[10px] font-mono text-[#666]">
            Executed at: {testReport ? new Date(testReport.timestamp).toLocaleTimeString() : '...'}
          </span>
        </div>

        <div className="divide-y divide-[#1A1A1A]/10">
          {testReport?.results.map((test, idx) => (
            <div key={idx} className="p-4 sm:p-5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-neutral-100 border border-neutral-300 text-neutral-800">
                    {test.category}
                  </span>
                  <h4 className="font-bold text-xs font-mono text-[#1A1A1A]">{test.name}</h4>
                </div>
                <p className="text-xs text-[#555] font-serif">{test.message}</p>
                {test.details && (
                  <pre className="text-[10px] font-mono text-[#666] bg-[#FAF9F6] p-2 border border-neutral-200 mt-2 overflow-x-auto">
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                )}
              </div>

              <div>
                {test.passed ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-300 whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    PASSED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 border border-rose-300 whitespace-nowrap">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    FAILED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User's Immutable Audit Log Trail */}
      {user && (
        <div className="border-2 border-[#1A1A1A] bg-white">
          <div className="p-4 bg-[#FAF9F6] border-b-2 border-[#1A1A1A] flex items-center justify-between">
            <span className="font-bold text-xs uppercase font-mono tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Patient Audit Trail ({auditLogs.length} Records)
            </span>
            <button
              onClick={fetchAuditLogs}
              className="p-1 border border-[#1A1A1A] hover:bg-neutral-100 cursor-pointer"
              title="Refresh Audit Logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto max-h-[300px] overflow-y-auto font-mono text-xs">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-[#666]">
                No security actions recorded yet. Login or update your profile to generate audit events.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-[#1A1A1A] text-white text-[10px] uppercase sticky top-0">
                  <tr>
                    <th className="p-2.5">Action</th>
                    <th className="p-2.5">Resource</th>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]/10 text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAF9F6]">
                      <td className="p-2.5 font-bold text-[#1A1A1A]">{log.action}</td>
                      <td className="p-2.5 text-[#555]">{log.resourceType}</td>
                      <td className="p-2.5 text-[#666] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-2.5 text-[#666] max-w-[200px] truncate">
                        {log.detailsJson ? JSON.stringify(log.detailsJson) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
