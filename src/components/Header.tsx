import React, { useState } from 'react';
import {
  Activity,
  Shield,
  Terminal,
  BookOpen,
  Layers,
  CheckCircle2,
  Sparkles,
  Database,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Lock,
  ShieldCheck,
  ClipboardList,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './auth/AuthModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemStatus: 'healthy' | 'degraded' | 'down';
  onRunDiagnostics: () => void;
  isDiagnosticRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  systemStatus,
  onRunDiagnostics,
  isDiagnosticRunning,
}) => {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const tabs = [
    { id: 'assessment-workflow', label: 'Complete Assessment', icon: Sparkles, badge: 'Phase 7 • AI Live' },
    { id: 'phase7-tests', label: 'Phase 7 AI Test Suite', icon: ShieldCheck, badge: '10 Suites' },
    { id: 'patient-dashboard', label: 'Patient Dashboard', icon: ClipboardList, badge: isAuthenticated ? 'Active' : 'Guest' },
    { id: 'phase6-tests', label: 'Phase 6 Test Suite', icon: FileText, badge: '5 Suites' },
    { id: 'questionnaire', label: 'Adaptive Engine', icon: Terminal, count: '21 Domains' },
    { id: 'profile', label: 'Patient Profile', icon: User },
    { id: 'privacy', label: 'Consent & Privacy', icon: Shield, count: 'HIPAA' },
    { id: 'database', label: 'PostgreSQL Models', icon: Database, count: 24 },
    { id: 'architecture', label: 'Architecture & Rules', icon: Layers },
    { id: 'health', label: 'System Diagnostics', icon: Activity },
    { id: 'docs', label: 'Documentation', icon: BookOpen, count: 4 },
  ];

  return (
    <header className="border-b-2 border-[#1A1A1A] bg-[#FAF9F6]">
      {/* Top Editorial Ribbon */}
      <div className="bg-[#1A1A1A] text-white px-4 md:px-8 py-2 text-[10px] uppercase font-bold tracking-[0.25em] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="bg-purple-600 text-white px-2 py-0.5 font-mono">PHASE 07</span>
          <span>Google AI Studio • LLM Conversation & Explanation Layer (Gemini 3.7 Flash)</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline opacity-70">
            Structured 8-Field JSON • Non-Diagnostic Guardrails • PII Scrubbing • Anti-Prompt Injection • Safety Engine Primacy
          </span>
          <div className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 px-2 py-0.5 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[9px]">LLM READY</span>
          </div>
        </div>
      </div>

      {/* Main Masthead Banner */}
      <div className="px-4 md:px-8 py-6 border-b border-[#1A1A1A]/20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#666] mb-1">
              Structured Symptom Taxonomy & Dynamic Question Engine
            </p>
            <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tight leading-none text-[#1A1A1A]">
              HEALTHGUIDE AI
            </h1>
            <p className="mt-2 text-sm text-[#444] max-w-3xl font-serif italic text-lg leading-snug">
              21 expandable symptom domains, adaptive one-by-one dynamic branching, comprehensive measurement validation, bilingual English/Hindi localization, and structured clinical intake records.
            </p>
          </div>

          {/* User Auth Bar & Diagnostics */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-end">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 border-2 border-[#1A1A1A] bg-white p-1.5">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 px-2.5 py-1 text-xs font-mono font-bold text-[#1A1A1A] hover:bg-[#FAF9F6] cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>{profile?.fullName || user.displayName || user.email}</span>
                  <span className="text-[9px] bg-neutral-100 px-1.5 py-0.5 uppercase border border-neutral-300">
                    {user.role}
                  </span>
                </button>
                <button
                  onClick={logout}
                  title="Logout session"
                  className="p-1.5 text-[#666] hover:text-rose-600 border-l border-[#1A1A1A]/20 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-2 bg-white border border-[#1A1A1A] hover:bg-neutral-100 text-[#1A1A1A] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#1A1A1A] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register Patient
                </button>
              </div>
            )}

            <button
              onClick={onRunDiagnostics}
              disabled={isDiagnosticRunning}
              className="px-3 py-2 bg-white border border-[#1A1A1A] hover:bg-neutral-100 text-[#1A1A1A] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Activity className={`w-3.5 h-3.5 ${isDiagnosticRunning ? 'animate-spin' : ''}`} />
              Probe Gateway
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Matrix Tabs */}
      <nav className="flex overflow-x-auto px-4 md:px-8 bg-[#FAF9F6]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2.5 whitespace-nowrap border-r border-[#1A1A1A]/20 transition-all border-b-2 cursor-pointer ${
                isActive
                  ? 'bg-[#1A1A1A] text-white border-b-[#1A1A1A]'
                  : 'text-[#555] hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 border-b-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 font-bold uppercase border ${
                    isActive
                      ? 'bg-emerald-500 text-black border-emerald-400'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-none border ${
                    isActive
                      ? 'bg-white text-[#1A1A1A] border-white'
                      : 'bg-[#1A1A1A]/10 text-[#1A1A1A] border-[#1A1A1A]/20'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
};
