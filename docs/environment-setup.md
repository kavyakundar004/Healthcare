# HealthGuide AI - Environment Setup & Installation Guide

## 1. Prerequisites
- Python 3.10 or higher
- PostgreSQL 14+ (or Docker)
- Redis 6+ (or Docker)
- Docker & Docker Compose (Optional but recommended)
- Git

---

## 2. Option A: Quickstart with Docker Compose (Recommended)

The easiest way to run the full stack (Django, PostgreSQL, Redis, Celery Worker, Celery Beat):

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd healthguide-ai

# 2. Copy the environment file
cp .env.example .env

# 3. Build and launch all containerized services
docker-compose up --build

# 4. In a separate terminal, apply migrations and create a superuser
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

Services will be accessible at:
- **Django REST API Gateway**: `http://localhost:8000/`
- **Health Check Endpoint**: `http://localhost:8000/api/v1/health/`
- **Django Admin Portal**: `http://localhost:8000/admin/`
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`

---

## 3. Option B: Local Python Virtual Environment Setup

### Step 1: Create and Activate Virtual Environment
```bash
# On Linux / macOS
python3 -m venv venv
source venv/bin/activate

# On Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Step 2: Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements/development.txt
```

### Step 3: Configure Environment Variables
```bash
cp .env.example .env
# Edit .env to set your database credentials and secret key
```

### Step 4: Run PostgreSQL & Redis Locally
If you have Docker installed, you can start only the database and cache:
```bash
docker run -d --name healthguide_pg -e POSTGRES_DB=healthguide_db -e POSTGRES_USER=healthguide_user -e POSTGRES_PASSWORD=healthguide_secure_password_2026 -p 5432:5432 postgres:15-alpine
docker run -d --name healthguide_redis -p 6379:6379 redis:7-alpine
```

### Step 5: Database Migrations & Initial User
```bash
python manage.py makemigrations accounts patients symptoms questionnaire assessments safety medical ayurveda medicines knowledge rag ai image_analysis doctors appointments consultations health_history notifications feedback audit compliance
python manage.py migrate
python manage.py createsuperuser
```

### Step 6: Start Celery Async Worker
```bash
# Terminal 2:
celery -A healthguide worker -l INFO -Q critical_safety,notifications,compliance_audit,ai_inference,rag_indexing,celery
```

### Step 7: Start Django Development Server
```bash
# Terminal 1:
python manage.py runserver 0.0.0.0:8000
```

---

## 4. Running the Test Suite

```bash
# Run all tests across the 21 modular apps
python manage.py test

# Or run with pytest & coverage
pytest --cov=apps
```
