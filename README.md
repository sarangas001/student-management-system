# Student Management System

A full-stack web application for managing students, teachers, courses, grades, and attendance — with role-based access control and an AI assistant powered by Google Gemini.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TailwindCSS |
| Backend | Node.js 22, Express 5 |
| Database | MongoDB (Mongoose) |
| AI | Google Gemini 2.5 Flash (OpenAI-compat) |
| Auth | JWT — httpOnly cookie |
| Containers | Docker, Docker Compose |
| Orchestration | Kubernetes (AWS EKS) |
| CI/CD | GitHub Actions |

---

## Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Manage students, teachers, courses, grades, attendance, reports |
| **Teacher** | View schedule, mark attendance, enter grades |
| **Student** | View dashboard, grades, attendance, schedule |

All roles have access to the AI Assistant.

---

## Quick Start (Local)

### Prerequisites

- Node.js 22 LTS
- MongoDB Atlas URI or local `mongod`
- Google AI Studio API key

### Setup

```bash
# 1. Clone
git clone https://github.com/saranaga/student-management-system.git
cd student-management-system

# 2. Create environment files (generates a secure JWT_SECRET automatically)
chmod +x setup.sh && ./setup.sh

# 3. Install dependencies
(cd server && npm install)
(cd client && npm install)

# 4. Start development servers
cd server && npm run dev     # API on :3001
cd client && npm run dev     # App on :5173
```

---

## Docker Compose

```bash
# Copy and fill in server/.env
cp server/.env.example server/.env

# Build and run
docker compose up --build

# Access
#   App:    http://localhost
#   API:    http://localhost:3001
#   Health: http://localhost:3001/health
```

---

## Project Structure

```
student-management-system/
├── client/                   # React SPA (Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/       # Shared UI: SideBar, TopBar, AIFloatingPanel
│   │   ├── context/          # Auth context (AppContextProvider)
│   │   ├── hooks/            # useAIChat
│   │   └── pages/            # Admin/, Teacher/, student/, AIAssistant
│   └── Dockerfile
│
├── server/                   # Express REST API
│   ├── controllers/          # Request handlers per feature
│   ├── middleware/           # errorHandler, validate
│   ├── module/               # Mongoose models (Student, Teacher, Admin, Course, Grade, Attendance)
│   ├── routes/               # Express routers
│   ├── services/             # aiService, aiContextService
│   ├── shared/               # JWT repo+service, authMiddleware
│   ├── utils/                # Winston logger
│   └── Dockerfile
│
├── k8s/
│   ├── server/               # Server Deployment + Service manifests
│   └── client/               # Client Deployment + Service manifests
│
├── .github/workflows/        # GitHub Actions CI/CD
├── docker-compose.yml        # Local multi-container setup
├── setup.sh                  # First-run setup script
└── docs/                     # Full documentation
```

---

## API

Base URL: `http://localhost:3001`

| Group | Prefix |
|-------|--------|
| Auth | `/api/auth` |
| Admin | `/api/admin/*` |
| Teacher | `/api/teacher/*` |
| Student | `/api/student/*` |
| AI | `/api/ai-assistent` |
| Health | `/health`, `/ready`, `/metrics` |

See [docs/API.md](docs/API.md) for full endpoint reference.

---

## Security

- **Helmet** — secure HTTP response headers
- **Rate limiting** — 200 req/15 min globally; 20 req/15 min on auth routes
- **`express-mongo-sanitize`** — NoSQL injection protection
- **bcryptjs** — password hashing (12 rounds)
- **httpOnly cookies** — JWT inaccessible from JavaScript
- **Generic error messages** — no user enumeration on login

> **Important:** The `.env` files were previously committed to git. Before any production use, rotate your MongoDB password, Gemini API key, and JWT secret. See [docs/Security.md](docs/Security.md).

---

## Environment Variables

| File | Key Variables |
|------|--------------|
| `server/.env` | `PORT`, `CLIENT_URL`, `NODE_ENV`, `JWT_SECRET`, `MONGO_URI`, `GEMINI_*` |
| `client/.env` | `VITE_BACKEND_URL` |

Copy the `.env.example` files and fill in real values. See [docs/Environment.md](docs/Environment.md).

---

## CI/CD

| Workflow | Trigger |
|----------|---------|
| `server_ci.yaml` | Push to `server/**` |
| `client_ci.yaml` | Push to `client/**` |
| `deployment_ci_cd.yaml` | Manual (`workflow_dispatch`) |

Required GitHub secrets: `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `JWT_SECRET`, `MONGO_URI`, `GEMINI_API_KEY`, `VITE_BACKEND_URL`, and others.

See [docs/Deployment.md](docs/Deployment.md).

---

## Kubernetes

Deployed on two AWS EKS clusters (`student-server`, `student-client`) in `ap-south-1`.

Features:
- 2 replicas per workload
- Liveness, readiness, and startup probes
- CPU/memory resource limits
- Secrets injected via `kubectl create secret`

See [docs/Kubernetes.md](docs/Kubernetes.md).

---

## Logging & Monitoring

- **Winston** — structured logging, JSON in production, coloured in development
- **Morgan** — HTTP access logs piped to Winston
- **`/health`** — liveness probe
- **`/ready`** — readiness probe (checks DB connection)
- **`/metrics`** — memory and DB state

See [docs/Monitoring.md](docs/Monitoring.md).

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture.md](docs/Architecture.md) | System design, data flow, security layers |
| [API.md](docs/API.md) | Full REST API reference |
| [Security.md](docs/Security.md) | Controls, known gaps, required actions |
| [Environment.md](docs/Environment.md) | All environment variables |
| [Setup.md](docs/Setup.md) | Local development setup |
| [Docker.md](docs/Docker.md) | Docker images and Compose |
| [Kubernetes.md](docs/Kubernetes.md) | K8s manifests and operations |
| [Deployment.md](docs/Deployment.md) | CI/CD and manual deploy steps |
| [Monitoring.md](docs/Monitoring.md) | Logging, health endpoints, alerting |
| [Troubleshooting.md](docs/Troubleshooting.md) | Common issues and fixes |

---

## Author

Saranga Samarakoon

## License

ISC
