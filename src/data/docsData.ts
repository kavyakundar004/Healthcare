import { DocFile } from '../types';

export const DOCS_CATALOG: DocFile[] = [
  {
    id: 'architecture',
    title: 'Google AI Studio Architecture Blueprint',
    filename: 'docs/architecture.md',
    category: 'Architecture',
    content: `# HealthGuide AI - Streamlined System Architecture Blueprint

## 1. Executive Architectural Overview
HealthGuide AI is an evidence-based clinical educational platform and health intelligence engine built specifically for Google AI Studio and Cloud Run container environments. It bridges modern allopathic medicine with holistic Ayurvedic wellness, safeguarded by deterministic emergency red-flag interceptors and server-side Gemini 3.7 Flash orchestration.

### Core Architectural Pillars:
- **Express 4 API Gateway & Vite Middleware**: Lightweight single-port Node.js server binding strictly to port 3000.
- **Server-Side Gemini 3.7 Flash Engine**: All LLM interactions are proxied securely through \`/api/assess\` and \`/api/chat\` with zero browser API key leaks.
- **Deterministic Red-Flag Interceptor**: Emergency symptom screening (chest pain, shortness of breath, stroke, severe trauma) executed prior to model inference.
- **Dual Medicine Synthesis**: Allopathic differential guidelines paired with Ayurvedic Tridosha (Vata, Pitta, Kapha) balancing and Ahara-Vihara dietetics.
- **Zero Unneeded Infrastructure**: Pure, cloud-native architecture without superfluous databases, Redis brokers, or Celery workers.

## 2. API Ingress & Server-Side Security
All traffic is routed through \`server.ts\` on port 3000:
- \`GET /api/health\`: Real-time health diagnostic showing latency, uptime, memory, and Gemini model status.
- \`POST /api/assess\`: Structured clinical intake assessment returning JSON schema-validated considerations, doctor questions, and lifestyle care.
- \`POST /api/chat\`: Conversational clinical educator with safety system instructions.`,
  },
  {
    id: 'clinical-safety',
    title: 'Clinical Safety & Educational Disclaimers',
    filename: 'docs/clinical-safety.md',
    category: 'Safety',
    content: `# HealthGuide AI - Clinical Safety Protocols

## 1. Non-Doctor / Educational Mandate
HealthGuide AI is fundamentally designed as an educational clinical information tool. It does NOT provide formal medical diagnoses, clinical prescriptions, or replace direct consultations with licensed healthcare providers.

## 2. Deterministic Emergency Screening
Before any generative AI model processes a user's prompt, the backend executes a deterministic keyword screening against acute medical emergencies:
- Acute coronary syndrome / chest pain
- Cerebrovascular accidents / sudden neurological deficits
- Respiratory distress / severe shortness of breath
- Severe allergic anaphylaxis / airway compromise
- Profuse bleeding / loss of consciousness

When detected, the system immediately returns a high-priority red-flag banner advising the patient to call 911 / 112 or visit an emergency room immediately.

## 3. Structured Doctor Discussion Prompts
Rather than presenting conclusive disease labels, HealthGuide AI generates targeted, high-utility questions for patients to bring to their primary care physician.`,
  },
  {
    id: 'development-spec',
    title: 'Development & Build Specification',
    filename: 'docs/development-spec.md',
    category: 'DevOps',
    content: `# HealthGuide AI - Development & Build Specification

## 1. Build and Run Commands
- **Development**: \`npm run dev\` (Boots \`tsx server.ts\` binding to \`0.0.0.0:3000\` with Vite middleware).
- **Production Build**: \`npm run build\` (\`vite build\` followed by \`esbuild server.ts\` bundling into \`dist/server.cjs\`).
- **Production Run**: \`npm start\` (\`node dist/server.cjs\`).
- **Type Checking**: \`npm run lint\` (\`tsc --noEmit\`).

## 2. Environment Variables
The application strictly minimizes secret requirements:
\`\`\`env
# Managed automatically via Google AI Studio Secrets UI
GEMINI_API_KEY=
\`\`\`

No Django, PostgreSQL, Redis, Celery, or SendGrid secrets are required.`,
  },
  {
    id: 'integrative-medicine',
    title: 'Integrative Allopathy & Ayurveda Framework',
    filename: 'docs/integrative-medicine.md',
    category: 'Clinical',
    content: `# Integrative Allopathy & Ayurveda Framework

## 1. Modern Allopathic Evidence
- Structured symptom ontological categorization.
- Standard ICD-10 anatomical classifications.
- Evidence-based self-care and hydration guidelines.
- Drug-herb cross-interaction vigilance.

## 2. Traditional Ayurvedic Wellness
- **Tridosha Assessment**: Identifying Vata (movement/nervous), Pitta (metabolism/heat), and Kapha (structure/fluid) imbalances.
- **Ahara (Dietetics)**: Recommending whole food nutrition and digestive spices (ginger, coriander, cumin).
- **Vihara (Lifestyle)**: Recommending circadian alignment, restorative sleep routines, and gentle Pranayama breathing.`,
  },
];
