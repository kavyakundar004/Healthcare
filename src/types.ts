export interface DjangoAppMeta {
  id: string;
  name: string;
  category: 'identity' | 'patient' | 'triage' | 'medical' | 'intelligence' | 'provider' | 'operations';
  categoryLabel: string;
  verboseName: string;
  description: string;
  endpoints: string[];
  models: {
    name: string;
    description: string;
    fields: { name: string; type: string; required?: boolean; note?: string }[];
  }[];
  securityLevel: 'Public' | 'Authenticated' | 'Clinical Provider' | 'HIPAA PHI Restricted' | 'Auditor Only';
  phase1Status: 'Ready' | 'Scaffolded' | 'Configured';
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  service: string;
  version: string;
  environment: string;
  architecture: {
    frontend: string;
    backend: string;
    aiEngine: string;
    storageStrategy: string;
  };
  components: {
    server: {
      status: 'up' | 'down';
      latencyMs: number;
      uptimeSeconds: number;
      memoryUsageMb: string;
    };
    geminiApi: {
      status: string;
      model: string;
      isServerSideOnly: boolean;
    };
    safetyGuardrail: {
      status: string;
      emergencyInterceptor: string;
      auditMiddleware: string;
    };
  };
}

export interface AssessmentResult {
  isEmergency: boolean;
  emergencyNotice?: string | null;
  triageLevel: string;
  summary: string;
  allopathicInsights: {
    potentialConsiderations: string[];
    recommendedQuestionsForDoctor: string[];
    generalCareTips: string[];
  };
  ayurvedicInsights: {
    doshaInfluence: string;
    dietaryGuidance: string;
    lifestyleSuggestions: string;
  };
  drugInteractionWarnings?: string;
  disclaimer: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  isEmergency?: boolean;
}

export interface DocFile {
  id: string;
  title: string;
  filename: string;
  category: string;
  content: string;
}
