# HealthGuide AI - System Architecture Documentation (Phase 1)

## 1. Executive Architectural Overview

**HealthGuide AI** is an enterprise-grade clinical decision support and health intelligence platform built with Python, Django REST Framework, PostgreSQL, Redis, and Celery. It is designed to combine modern evidence-based allopathic medicine with holistic Ayurvedic wellness, reinforced by clinical safety guardrails, verifiable citations, and rigorous compliance auditing.

```
                                    +-----------------------------------------------+
                                    |                CLIENT LAYER                   |
                                    |    React Web App / Mobile App / Telehealth    |
                                    +-----------------------+-----------------------+
                                                            | HTTPS / WSS / REST
                                                            v
+-------------------------------------------------------------------------------------------------------------------+
|                                          HEALTHGUIDE AI GATEWAY (Django 5)                                         |
|                                                                                                                   |
|  [Middleware: Security | CORS | WhiteNoise | JWT/Session Auth | Rate Limiter | Clinical Audit Interceptor]        |
|                                                                                                                   |
|  +---------------------------+  +---------------------------+  +---------------------------+                     |
|  |     IDENTITY & ACCESS     |  |     PATIENT DOMAIN        |  |     CLINICAL PRACTICE     |                     |
|  |  • accounts (RBAC/MFA)    |  |  • patients (Demographics)|  |  • doctors (Practitioners)|                     |
|  |  • compliance (HIPAA/GDPR)|  |  • health_history (EMR)   |  |  • appointments (Booking) |                     |
|  |  • audit (Immutable Logs) |  |  • feedback (Ratings)     |  |  • consultations (SOAP)   |                     |
|  +---------------------------+  +---------------------------+  +---------------------------+                     |
|                                                                                                                   |
|  +-----------------------------------------------------------------------------------------+                     |
|  |                                  TRIAGE & DIAGNOSTIC CORE                               |                     |
|  |  • symptoms (Ontology & Red Flags)        • questionnaire (Adaptive Intake Branching)  |                     |
|  |  • assessments (Risk Stratification)      • safety (Emergency Interceptor & Safeguards)|                     |
|  +-----------------------------------------------------------------------------------------+                     |
|                                                                                                                   |
|  +-----------------------------------------------------------------------------------------+                     |
|  |                                MEDICAL & HOLISTIC KNOWLEDGE                             |                     |
|  |  • medical (ICD-10 & Clinical Pathways)   • ayurveda (Dosha, Ahara/Vihara Guidelines)   |                     |
|  |  • medicines (Formulary & Cross-Interactions) • knowledge (Peer-Reviewed Medical Corpus)|                     |
|  +-----------------------------------------------------------------------------------------+                     |
|                                                                                                                   |
|  +-----------------------------------------------------------------------------------------+                     |
|  |                             INTELLIGENCE PIPELINE (Phase 2+ Contracts)                  |                     |
|  |  • rag (Vector Store & Semantic Retrieval) • ai (LLM Orchestration & Prompt Guardrails) |                     |
|  |  • image_analysis (Prescription / Skin AI) • notifications (SMS/Email/Push Escalations) |                     |
|  +-----------------------------------------------------------------------------------------+                     |
+-------------------------------------------------------------------------------------------------------------------+
        |                                       |                                       |
        v                                       v                                       v
+-----------------------+               +-----------------------+               +-----------------------+
|  POSTGRESQL DATABASE  |               |      REDIS STORE      |               |  ASYNC CELERY WORKERS |
| • Relational Data     |               | • Distributed Cache   |               | • critical_safety     |
| • JSONB Clinical Docs |               | • Celery Message Queue|               | • ai_inference        |
| • Audit Event History |               | • Throttling Counters |               | • rag_indexing        |
| • User & Consent EMR  |               | • Pub/Sub Notifications|              | • notifications       |
+-----------------------+               +-----------------------+               +-----------------------+
```

---

## 2. Modular Django App Topology

The architecture decouples responsibilities across 21 specialized Django applications:

| Category | Django App | Architectural Purpose |
| :--- | :--- | :--- |
| **Security & Identity** | `apps.accounts` | Custom User model with RBAC (Patient, Doctor, Admin, Auditor), auth tokens, password security. |
| | `apps.audit` | Non-repudiable audit trails for clinical queries, PHI access, and AI generation provenance. |
| | `apps.compliance` | HIPAA consent tracking, GDPR right-to-be-forgotten lifecycle, and data retention rules. |
| **Patient Care** | `apps.patients` | Demographics, vital baselines, emergency contacts, and personalized health settings. |
| | `apps.health_history`| Longitudinal records (allergies, chronic illnesses, surgical history, family history). |
| | `apps.feedback` | System accuracy feedback loops and patient satisfaction metrics. |
| **Triage & Safety** | `apps.symptoms` | Medical symptom ontology, ICD-10 anatomical mapping, and severity scoring. |
| | `apps.questionnaire`| Adaptive intake questionnaires with conditional dynamic branching schema. |
| | `apps.assessments` | Triage scoring, differential evaluations, and risk stratifications. |
| | `apps.safety` | Emergency red-flag detection, immediate hospital referral dispatchers, and clinical disclaimers. |
| **Medical Domain** | `apps.medical` | Standard allopathic knowledge, disease profiles, and evidence-based diagnostic pathways. |
| | `apps.ayurveda` | Dosha profiling (Vata, Pitta, Kapha), Prakriti assessment, and herbal wellness. |
| | `apps.medicines` | Comprehensive drug/herb catalog, dosages, side effects, and cross-interaction checking. |
| | `apps.knowledge` | Curated medical corpus, peer-reviewed journals (PubMed/WHO/AYUSH), and metadata tags. |
| **Intelligence Engine** | `apps.rag` | Embedding vector metadata, chunk indexing, similarity search pipelines, and source citations. |
| | `apps.ai` | LLM orchestration, structured output enforcement, hallucination verification, and token tracking. |
| | `apps.image_analysis`| Medical image ingestion (dermatology, prescriptions, lab scans) and preprocessing. |
| **Provider Practice** | `apps.doctors` | Practitioner credentials, verified medical licenses, and clinic profiles. |
| | `apps.appointments` | Real-time booking slots, calendar integration, and scheduling workflows. |
| | `apps.consultations` | Formal clinical SOAP notes (Subjective, Objective, Assessment, Plan) and telehealth records. |
| **System Operations** | `apps.notifications` | Asynchronous multi-channel alerts (SMS, push, email) for medication and red-flag alerts. |

---

## 3. Future AI, RAG & Vision Pipeline Integration

In Phase 2 and subsequent phases, the AI components will integrate into the Django architecture through strict contractual boundaries:

1. **Safety-First Interceptor (`apps.safety`)**:
   - Every patient query passes through the `safety` module *before* AI inference.
   - If emergency criteria are met (e.g. chest pain with radiating arm ache), the pipeline bypasses AI generation and immediately yields emergency protocol instructions.
2. **Context Retrieval (`apps.rag` + `apps.knowledge`)**:
   - The verified medical documents and Ayurvedic texts in `knowledge` are chunked and vectorized.
   - Vector search queries extract top-k verified snippets with exact source citations.
3. **Clinical Prompt Orchestration (`apps.ai`)**:
   - Assembles prompt with strict system guardrails, patient context, retrieved citations, and JSON schema constraints.
   - Dispatches inference asynchronously via Celery worker queue `ai_inference`.
4. **Audit and Non-Repudiation (`apps.audit`)**:
   - All prompts, responses, model versions, and timestamps are logged into immutable `AuditLogEntry` records for HIPAA compliance.
