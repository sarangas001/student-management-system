# Architecture

## Overview

Student Management System is a three-tier web application:

```
Browser (React SPA)  →  Express REST API  →  MongoDB Atlas
                              ↕
                        Google Gemini AI
```

## Components

| Layer | Technology | Responsibility |
|-------|-----------|---------------|
| Frontend | React 19, Vite, TailwindCSS | SPA served via Nginx |
| Backend | Node.js 22, Express 5 | REST API, JWT auth, business logic |
| Database | MongoDB (Mongoose ODM) | Persistent storage |
| AI | Google Gemini 2.5 Flash (OpenAI-compat) | AI assistant feature |

## Role Model

Three user roles with separate collections:

- **Admin** — full platform management (students, teachers, courses, grades, attendance, reports)
- **Teacher** — view assigned courses, mark attendance, enter grades, view schedule
- **Student** — view own dashboard, grades, attendance, schedule

## Data Flow — Authentication

```
POST /api/auth/login
  → authController queries Admin, Student, Teacher in parallel
  → bcryptjs verifies password
  → JWT signed with HS256, stored in httpOnly cookie (1-day TTL)
  → Client calls GET /api/auth/isLoggedIn on boot to hydrate context
```

## Security Layers (server)

1. `helmet` — secure HTTP headers
2. `cors` — restricted to `CLIENT_URL`
3. `express-rate-limit` — global 200 req/15 min; auth 20 req/15 min
4. `express-mongo-sanitize` — strips `$` and `.` from request bodies
5. `compression` — gzip all responses
6. `bcryptjs` — password hashing (12 rounds)
7. JWT httpOnly cookie — not accessible from JavaScript
8. `protect` middleware — validates JWT on every protected route

## Directory Structure

```
student-management-system/
├── client/                  # React SPA
│   ├── src/
│   │   ├── components/      # Shared UI components
│   │   ├── context/         # React context (auth state)
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components (Admin/, Teacher/, student/)
│   │   └── util/
│   └── Dockerfile
│
├── server/                  # Express API
│   ├── controllers/         # Request handlers
│   ├── middleware/          # errorHandler, etc.
│   ├── module/              # Mongoose models
│   ├── routes/              # Express routers
│   ├── services/            # Business / AI services
│   ├── shared/              # JWT utilities, authMiddleware
│   ├── utils/               # logger
│   └── Dockerfile
│
├── k8s/                     # Kubernetes manifests
│   ├── client/
│   └── server/
│
├── .github/workflows/       # GitHub Actions CI/CD
├── docker-compose.yml       # Local container setup
├── docs/                    # Project documentation
└── setup.sh                 # First-run setup script
```
