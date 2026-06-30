# Docker

## Images

| Image | Base | Stage | Purpose |
|-------|------|-------|---------|
| `server` | `node:22-alpine` | Multi-stage (deps → production) | Express API |
| `client` | `node:22-alpine` (build) + `nginx:alpine` (serve) | Multi-stage | React SPA |

## Local Development with Docker Compose

```bash
# 1. Copy and fill env files
cp server/.env.example server/.env
# edit server/.env with real values

# 2. Build and start all services
docker compose up --build

# 3. Access
#   Client:  http://localhost
#   API:     http://localhost:3001
#   Health:  http://localhost:3001/health
```

## Individual Image Builds

```bash
# Server
docker build -t sms-backend ./server

# Client (must pass the VITE_BACKEND_URL at build time)
docker build \
  --build-arg VITE_BACKEND_URL=http://localhost:3001 \
  -t sms-frontend ./client
```

## Docker Hub Tags

| Tag | When pushed |
|-----|-------------|
| `latest` | Every push to `server/**` or `client/**` on any branch (via CI) |
| `<git-sha>` | Same event — enables rollback to exact commit |

## Running in Production

```bash
# Pull latest
docker pull sarangasl/student-management-backend:latest
docker pull sarangasl/student-management-frontend:latest

# Run (pass env via file)
docker run -d \
  --env-file server/.env \
  -p 3001:3001 \
  sarangasl/student-management-backend:latest
```

## Health Check

The server Dockerfile includes a built-in `HEALTHCHECK`:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget -qO- http://localhost:3001/health || exit 1
```

## Security Notes

- Server container runs as non-root user `nodejs` (uid 1001).
- `.env` files are excluded via `.dockerignore` and must never be `COPY`ed into images.
- Secrets in production must be injected via environment variables at runtime (K8s secrets, AWS Secrets Manager, etc.).
