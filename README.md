<img src="frontend/public/Rift_Shield_github.psd.png" alt="Henrique Bisneto's banner">

# RiftShield — Threat Detection & AI Security Platform

<p align="center">
  <a href="README_PT.md"><img src="https://img.shields.io/badge/🇧🇷-Português-green" alt="Português"></a>
  <a href="README.md"><img src="https://img.shields.io/badge/🇺🇸-English-blue" alt="English"></a>
</p>

**RiftShield** is an AI-powered security platform for threat detection, vulnerability analysis, and security knowledge base management. Built with **FastAPI** (Python) and **React** (TypeScript), it integrates YOLO-based object detection for security monitoring, a STRIDE-based knowledge base, and a full authentication system with invite-code access control.

---

## Features

- **AI-Powered Threat Detection** — YOLO model inference for security image analysis
- **Vulnerability Knowledge Base** — STRIDE-classified vulnerabilities with CVSS scoring
- **Threat Reports** — Generate detailed security threat reports from inference results
- **Dataset Management** — Upload, list, and augment training datasets
- **Model Training** — Train and manage YOLO models with versioning and activation
- **Dashboard Analytics** — Usage stats, model performance, and security metrics
- **Invite-Only Registration** — Secure registration via one-time-use invite codes with role assignment
- **JWT Authentication** — Access + refresh token flow with automatic silent refresh
- **Dark/Light Theme** — Adaptive UI with theme persistence
- **Toast Notification System** — Non-blocking floating alerts with animations

---

## Technologies

### Backend

| Technology | Purpose |
|---|---|
| Python 3.11 + FastAPI | REST API framework |
| MongoDB + Beanie ODM | Document database with async ODM |
| Motor | Async MongoDB driver |
| PyJWT | Access & refresh token generation/verification |
| bcrypt | Password hashing |
| Ultralytics YOLO | Object detection model inference & training |
| Uvicorn | ASGI server with hot-reload |
| Pydantic | Schema validation & settings management |

### Frontend

| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite 8 | Build tool & dev server |
| Chakra UI v2 | Component library |
| Axios | HTTP client with auto-refresh interceptor |
| React Router DOM v7 | Client-side routing |
| Zustand | Lightweight state management |
| Framer Motion | Animations |
| Lucide React | Icons |

### Infrastructure

| Technology | Purpose |
|---|---|
| Docker & Docker Compose | Container orchestration |
| MongoDB 7 | Primary database |

---

## Project Structure

```
riftshield/
├── backend/
│   ├── src/
│   │   ├── main.py                          # FastAPI app entry point & lifespan
│   │   ├── conftest.py                      # Pytest configuration
│   │   │
│   │   ├── config/
│   │   │   ├── database.py                  # MongoDB + Beanie initialization
│   │   │   └── settings.py                  # Environment-based settings
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.py                      # Re-export of get_current_user
│   │   │   ├── dependencies.py              # JWT dependency injection
│   │   │   └── error_handler.py             # Global exception handlers
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/                        # Authentication module
│   │   │   │   ├── controllers/auth_controller.py
│   │   │   │   ├── models/
│   │   │   │   │   ├── user_model.py        # User document
│   │   │   │   │   └── invite_model.py      # Invite code document
│   │   │   │   ├── routes/auth_routes.py
│   │   │   │   ├── schemas/auth_schema.py
│   │   │   │   └── services/
│   │   │   │       ├── auth_service.py      # Register/login/refresh/logout
│   │   │   │       └── invite_service.py    # Create/validate/use invite codes
│   │   │   │
│   │   │   ├── dashboard/                   # Dashboard module
│   │   │   │   ├── controllers/dashboard_controller.py
│   │   │   │   ├── routes/dashboard_routes.py
│   │   │   │   ├── schemas/dashboard_schema.py
│   │   │   │   └── services/dashboard_service.py
│   │   │   │
│   │   │   ├── inference/                   # Core inference module
│   │   │   │   ├── agents/stride_kb.py      # STRIDE KB classification agent
│   │   │   │   ├── controllers/
│   │   │   │   │   ├── inference_controller.py
│   │   │   │   │   ├── kb_controller.py
│   │   │   │   │   └── training_controller.py
│   │   │   │   ├── dataset/                 # Dataset management
│   │   │   │   │   ├── dataset_controller.py
│   │   │   │   │   ├── dataset_model.py
│   │   │   │   │   ├── dataset_routes.py
│   │   │   │   │   ├── dataset_schema.py
│   │   │   │   │   └── dataset_service.py
│   │   │   │   ├── ml-workflow/
│   │   │   │   │   └── ml_train_yolo.py     # YOLO training pipeline
│   │   │   │   ├── models/
│   │   │   │   │   ├── inference_model.py   # Inference result document
│   │   │   │   │   ├── kb_model.py          # KB vulnerability/countermeasure docs
│   │   │   │   │   └── threat_model.py      # Threat report document
│   │   │   │   ├── routes/
│   │   │   │   │   ├── inference_routes.py
│   │   │   │   │   ├── kb_routes.py
│   │   │   │   │   └── training_routes.py
│   │   │   │   ├── schemas/
│   │   │   │   │   ├── inference_schema.py
│   │   │   │   │   ├── kb_schema.py
│   │   │   │   │   ├── threat_schema.py
│   │   │   │   │   └── training_schema.py
│   │   │   │   ├── services/
│   │   │   │   │   ├── inference_service.py # YOLO inference logic
│   │   │   │   │   ├── kb_service.py        # KB seeding & queries
│   │   │   │   │   ├── threat_service.py    # Threat report generation
│   │   │   │   │   └── training_service.py  # YOLO training orchestration
│   │   │   │   └── tests/
│   │   │   │       ├── test_dataset.py
│   │   │   │       ├── test_inference.py
│   │   │   │       ├── test_kb.py
│   │   │   │       └── test_training.py
│   │   │   │
│   │   │   ├── users/                       # User profile module
│   │   │   │   └── routes/user_routes.py    # GET /users/me
│   │   │   │
│   │   │   └── uploads/                     # Uploaded files storage
│   │   │
│   │   └── shared/
│   │       └── utils/
│   │           ├── errors.py                # Custom error classes
│   │           └── token.py                 # JWT encode/decode helpers
│   │
│   ├── .env.example
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                         # Entry point
│   │   ├── theme.ts                         # Chakra UI theme config
│   │   │
│   │   ├── components/
│   │   │   ├── App.tsx                      # Root component with router
│   │   │   ├── Auth/                        # Login & registration
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── components/AuthFields.tsx
│   │   │   │   ├── components/AuthToggle.tsx
│   │   │   │   ├── hooks/useAuthForm.ts
│   │   │   │   ├── services/auth-service.ts
│   │   │   │   ├── styles/theme-fx.ts
│   │   │   │   └── types/index.ts
│   │   │   ├── Layout/                      # App shell
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   ├── nav-config.ts
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── Theme/ThemeToggle.tsx
│   │   │   └── Toast/                       # Toast notification system
│   │   │       ├── Toast.tsx
│   │   │       ├── components/ToastContext.tsx
│   │   │       ├── components/CloseButton.tsx
│   │   │       ├── hooks/useToastAnimation.ts
│   │   │       ├── styles/theme-fx.ts
│   │   │       ├── types/index.ts
│   │   │       └── utils/
│   │   │           ├── constants.tsx
│   │   │           └── styles.ts
│   │   │
│   │   ├── context/AuthContext.tsx           # Auth state management
│   │   ├── middleware/api.ts                 # Axios with auto-refresh interceptor
│   │   ├── pages/                            # Route pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DatasetPage.tsx
│   │   │   ├── InferencePage.tsx
│   │   │   ├── TrainingPage.tsx
│   │   │   ├── ThreatsPage.tsx
│   │   │   ├── VulnerabilitiesPage.tsx
│   │   │   ├── CountermeasuresPage.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── Settings.tsx
│   │   ├── router/
│   │   │   ├── index.tsx                    # Route definitions
│   │   │   └── paths.ts                     # Route path constants
│   │   ├── services/                        # API service modules
│   │   │   ├── dashboard-service.ts
│   │   │   ├── dataset-service.ts
│   │   │   ├── inference-service.ts
│   │   │   ├── kb-service.ts
│   │   │   └── training-service.ts
│   │   └── styles/                          # Global theme effects
│   │       ├── app-theme-fx.ts
│   │       └── inference-theme-fx.ts
│   │
│   ├── Dockerfile
│   └── vite.config.js
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Setup

```bash
# Clone the repository
git clone https://github.com/bisnet0/RiftShield.git
cd RiftShield
```

#### Using Docker (recommended)

```bash
# Start backend (API on :3000, MongoDB on :27017)
cd backend
docker compose up -d --build

# Start frontend (on :1999)
cd ../frontend
docker compose up -d --build
```

#### Local Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or: venv\Scripts\activate
pip install -r requirements.txt
cd src
uvicorn main:app --reload --port 3000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev -- --port 1999
```

### First Access (Invite Code System)

On first startup, the backend automatically generates an invite code and prints it to the logs:

```bash
docker logs riftshield-backend | grep "Invite code"
# 🔑 Invite code created: a1b2c3d4e5f6g7h8...
```

Use this code to register at `/api/auth/register` or through the login form.

Generate new invite codes (requires admin):

```bash
curl -X POST http://localhost:3000/api/auth/invite \
  -H "Cookie: accessToken=<your_token>"
# {"invite": {"code": "new-code...", "role": "ADMIN"}}
```

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register with invite code | No |
| `POST` | `/api/auth/login` | Login with email + password | No |
| `POST` | `/api/auth/refresh` | Refresh access token | Cookie |
| `POST` | `/api/auth/logout` | Logout and clear session | Cookie |
| `POST` | `/api/auth/invite` | Generate invite code | Admin |

### Users (`/api/users`)

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/api/users/me` | Get current user profile | Cookie |

### Dashboard (`/api/dashboard`)

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Dashboard KPIs & metrics | Cookie |

### Inference (`/api/inference`)

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/api/inference/analyze` | Run YOLO inference on image | Cookie |
| `POST` | `/api/inference/analyze-threat` | Analyze threat from inference | Cookie |
| `GET` | `/api/inference/reports` | List inference reports | Cookie |
| `GET` | `/api/inference/reports/{id}` | Get report details | Cookie |
| `DELETE` | `/api/inference/reports/{id}` | Delete a report | Cookie |
| `GET` | `/api/inference/threats` | List threat reports | Cookie |
| `GET` | `/api/inference/threats/{id}` | Get threat report detail | Cookie |

### Dataset (`/api/dataset`)

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/api/dataset/upload` | Upload images for dataset | Cookie |
| `GET` | `/api/dataset/entries` | List dataset entries | Cookie |
| `DELETE` | `/api/dataset/entries/{id}` | Delete an entry | Cookie |
| `POST` | `/api/dataset/entries/{id}/augment` | Apply augmentation | Cookie |
| `GET` | `/api/dataset/stats` | Dataset statistics | Cookie |

### Knowledge Base (`/api/kb`)

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/api/kb/vulnerabilities` | List vulnerabilities (searchable) | Cookie |
| `GET` | `/api/kb/countermeasures` | List countermeasures | Cookie |

### Training (`/api/training`)

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/api/training/train` | Start YOLO training job | Cookie |
| `GET` | `/api/training/models` | List trained models | Cookie |
| `GET` | `/api/training/models/{id}` | Get training log details | Cookie |
| `POST` | `/api/training/models/activate` | Activate a model version | Cookie |

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |

---

## Registration & Login Payloads

### `POST /api/auth/register`

```json
{
  "name": "Henrique Bisneto",
  "email": "user@email.com",
  "password": "strong_password",
  "invite_code": "a1b2c3d4e5f6g7h8...",
  "phone": "75988456875",
  "country": "Brasil",
  "state": "Bahia",
  "city": "Serrinha"
}
```

Required: `name`, `email`, `password`, `invite_code`
Optional: `phone`, `country`, `state`, `city`

### `POST /api/auth/login`

```json
{
  "email": "user@email.com",
  "password": "strong_password"
}
```

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
DATABASE_URL="mongodb://mongo:27017/riftshield"
JWT_SECRET="change-me-to-a-random-secret"
JWT_REFRESH_SECRET="change-me-to-another-random-secret"
PORT=3000
FRONTEND_URL="http://localhost:1999"
```

---

## Running Tests

```bash
cd backend
docker compose exec backend pytest src/ -v
```

Tests available for: Dashboard, Dataset, Inference, Knowledge Base, Training.

---

## To Do

- [ ] Add automated CI/CD pipeline
- [ ] Deploy to production environment
- [ ] Add frontend tests (Vitest)
- [ ] Add pagination to vulnerability/countermeasure lists
- [ ] Add role-based access control for admin endpoints
- [ ] Add WebSocket for real-time training progress
- [ ] Add dark mode persistence toggle
- [ ] Add export reports (PDF)
- [ ] Add user profile editing
- [ ] Add password recovery flow
- [ ] Add rate limiting on auth endpoints
- [ ] Add audit logging for security events

---

## License

This project is under the **MIT** license.
Created with by **Henrique Bisneto — 2026**
