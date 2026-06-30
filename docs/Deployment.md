# Deployment

## CI/CD Overview

Three GitHub Actions workflows live in `.github/workflows/`:

| Workflow | Trigger | Steps |
|----------|---------|-------|
| `server_ci.yaml` | Push to `server/**` | Install → Lint → Test → Docker build+push |
| `client_ci.yaml` | Push to `client/**` | Install → Lint → Build → Docker build+push |
| `deployment_ci_cd.yaml` | `workflow_dispatch` | Both pipelines above + deploy to AWS EKS |

Docker images are tagged `:latest` **and** `:<git-sha>` on every run, enabling pinned rollbacks.

---

## Required GitHub Actions Secrets

Set these in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password or access token |
| `AWS_ACCESS_KEY_ID` | IAM access key for EKS |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key for EKS |
| `JWT_SECRET` | Production JWT secret (64+ chars) |
| `MONGO_URI` | Production MongoDB URI |
| `CLIENT_URL` | Production frontend URL (e.g. `https://app.yourdomain.com`) |
| `NODE_ENV` | `production` |
| `GEMINI_BASE_URL` | `https://generativelanguage.googleapis.com/v1beta/openai/` |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `VITE_BACKEND_URL` | Production API URL (e.g. `https://api.yourdomain.com`) |

---

## Manual Deployment to EKS

### Server

```bash
# 1. Authenticate
aws eks update-kubeconfig --name student-server --region ap-south-1

# 2. Push secrets
kubectl create secret generic env-secrets \
  --from-literal=JWT_SECRET="..." \
  --from-literal=MONGO_URI="..." \
  --from-literal=CLIENT_URL="..." \
  --from-literal=NODE_ENV="production" \
  --from-literal=GEMINI_BASE_URL="..." \
  --from-literal=GEMINI_API_KEY="..." \
  --from-literal=GEMINI_MODEL="gemini-2.5-flash" \
  --dry-run=client -o yaml | kubectl apply -f -

# 3. Apply manifests
kubectl apply -f k8s/server/deployement.yaml

# 4. Watch rollout
kubectl rollout status deployment/student-server --timeout=120s
kubectl get pods -l app=student-server
```

### Client

```bash
aws eks update-kubeconfig --name student-client --region ap-south-1
kubectl apply -f k8s/client/deployment.yaml
kubectl rollout status deployment/student-client --timeout=120s
```

---

## Rollback

```bash
# Instant rollback to previous revision
kubectl rollout undo deployment/student-server

# Rollback to a specific SHA-tagged image
kubectl set image deployment/student-server \
  student-server=sarangasl/student-management-backend:<sha>
```

---

## Post-Deploy Verification

```bash
# Get the LoadBalancer external IP
kubectl get svc student-server

# Hit health and readiness endpoints
curl http://<EXTERNAL-IP>/health
curl http://<EXTERNAL-IP>/ready
```

Expected responses:

```json
{ "status": "ok", "timestamp": "...", "uptime": 42.3, "hostname": "..." }
{ "status": "ready", "db": "connected" }
```
