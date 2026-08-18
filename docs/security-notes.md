# HealthGuide AI - Clinical Security & Governance Notes

## 1. Compliance Framework Alignment
HealthGuide AI is architected from Phase 1 to align with:
- **HIPAA (Health Insurance Portability and Accountability Act)**: Protected Health Information (PHI) segregation, audit trails, encryption at rest/transit.
- **GDPR (General Data Protection Regulation)**: Explicit user consent tracking (`apps.compliance`), data portability, right-to-erasure workflows.
- **Good Clinical Practice (GCP)**: Segregation of automated decision support tools with physician-in-the-loop validation.

---

## 2. Role-Based Access Control (RBAC) Matrix

| User Role | PHI Access | AI Triage | Doctor Consultation | EMR Modification | Audit Logs View |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Patient** | Own records only | Initiate | View own | Update personal profile | None |
| **Doctor** | Assigned patients | Review AI outputs | Conduct & Write SOAP | Sign e-prescriptions | None |
| **Admin** | System config only | Manage models | Manage providers | None (No raw PHI) | Operational only |
| **Auditor** | Anonymized logs | Review safety triggers | Review malpractice logs| None | Full read access |

---

## 3. Data Protection & Cryptography

1. **Transit Security**:
   - TLS 1.3 enforced on all endpoints in production (`SECURE_SSL_REDIRECT = True`).
   - Strict Transport Security (HSTS) with subdomains preloaded.
2. **Rest Security**:
   - Field-level database encryption for patient identifiers and emergency contact data.
   - Medical image files stored in encrypted cloud buckets with temporary pre-signed URLs.
3. **Audit Logging (`apps.audit`)**:
   - Every API invocation touching patient records emits a structured JSON log entry with timestamp, actor ID, client IP, action type, and cryptographic hash chain.

---

## 4. AI Clinical Safety Guardrails

- **Pre-Inference Triage**: The `safety` application evaluates user symptom input against critical emergency rules (e.g. cardiac arrest, acute stroke, respiratory distress) *before* prompting any AI/LLM models.
- **Mandatory Disclaimers**: All API responses provide explicit disclaimers: *"HealthGuide AI is an educational decision-support tool, not a substitute for clinical emergency care."*
- **No Direct Medication Prescriptions by AI**: AI models are architecturally restricted to differential suggestions; only licensed physicians (`apps.doctors`) can issue e-prescriptions (`apps.consultations`).
