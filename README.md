# HealthGuide AI - Enterprise Healthcare Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.0-green.svg)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/DRF-3.15-red.svg)](https://www.django-rest-framework.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io/)
[![Celery](https://img.shields.io/badge/Celery-5.3-green.svg)](https://docs.celeryq.dev/)

> **Phase 1: Architecture, Infrastructure & Modular Domain Blueprint**  
> An enterprise-grade AI healthcare platform combining evidence-based Allopathic medicine and Ayurvedic health wisdom with clinical safety guardrails and HIPAA-grade governance.

---

## Architecture Topology

HealthGuide AI is partitioned into **21 decoupled Django domain applications**:

- **Core & Identity**: `accounts`, `patients`, `doctors`, `compliance`, `audit`
- **Clinical Triage & Safety**: `symptoms`, `questionnaire`, `assessments`, `safety`
- **Medical & Ayurvedic Knowledge**: `medical`, `ayurveda`, `medicines`, `knowledge`
- **Intelligence Pipelines (Phase 2+)**: `rag`, `ai`, `image_analysis`
- **Provider & Practice**: `appointments`, `consultations`, `health_history`
- **Operations & Engagement**: `notifications`, `feedback`

---

## Quick Start (Docker Compose)

```bash
# 1. Clone & enter repository
cd healthguide-ai

# 2. Configure environment
cp .env.example .env

# 3. Start services (PostgreSQL, Redis, Django, Celery Worker, Celery Beat)
docker-compose up --build
```

Access:
- **API Gateway**: [http://localhost:8000/](http://localhost:8000/)
- **System Health Diagnostics**: [http://localhost:8000/api/v1/health/](http://localhost:8000/api/v1/health/)
- **Django Admin**: [http://localhost:8000/admin/](http://localhost:8000/admin/)

---

## Documentation Index

- [System Architecture & Future AI Connections](docs/architecture.md)
- [Development Roadmap (Phases 1-5)](docs/development-roadmap.md)
- [Environment Setup & Local Dev](docs/environment-setup.md)
- [Clinical Security & HIPAA/GDPR Governance](docs/security-notes.md)

---

## Running Verification Tests

```bash
python manage.py test
```
