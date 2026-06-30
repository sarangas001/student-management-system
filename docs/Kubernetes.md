# Kubernetes

## Cluster Setup (AWS EKS)

Two separate EKS clusters are used:

| Cluster | Workload | kubectl context |
|---------|----------|----------------|
| `student-server` | Backend API | `aws eks update-kubeconfig --name student-server --region ap-south-1` |
| `student-client` | Frontend Nginx | `aws eks update-kubeconfig --name student-client --region ap-south-1` |

## Manifests

| File | Description |
|------|-------------|
| `k8s/server/deployement.yaml` | Server Deployment + LoadBalancer Service |
| `k8s/server/app.yaml` | Alternate NodePort Service (for internal use) |
| `k8s/server/secret_env.yaml` | Secret template (do not commit real values) |
| `k8s/client/deployment.yaml` | Client Deployment + LoadBalancer Service |
| `k8s/client/client_app.yaml` | Alternate client config |
| `k8s/client/secret_env.yaml` | Secret template |

## Secrets

Secrets are created/updated by the CI/CD pipeline using `kubectl create secret --dry-run=client -o yaml | kubectl apply`:

```bash
kubectl create secret generic env-secrets \
  --from-literal=JWT_SECRET="..." \
  --from-literal=MONGO_URI="..." \
  --from-literal=CLIENT_URL="..." \
  --from-literal=NODE_ENV="production" \
  --from-literal=GEMINI_BASE_URL="..." \
  --from-literal=GEMINI_API_KEY="..." \
  --from-literal=GEMINI_MODEL="gemini-2.5-flash" \
  --dry-run=client -o yaml | kubectl apply -f -
```

## Probes

Both deployments include:

| Probe | Endpoint | Purpose |
|-------|----------|---------|
| `livenessProbe` | `GET /health` | Restart if app hangs |
| `readinessProbe` | `GET /ready` | Remove from load balancer until DB is connected |
| `startupProbe` | `GET /health` | Allow extra time on first boot |

## Resource Limits

| Workload | CPU Request | CPU Limit | Memory Request | Memory Limit |
|----------|-------------|-----------|----------------|--------------|
| server | 100m | 500m | 128Mi | 512Mi |
| client (nginx) | 50m | 200m | 64Mi | 256Mi |

## Rollout

```bash
# Deploy new version
kubectl apply -f k8s/server/deployement.yaml

# Monitor rollout
kubectl rollout status deployment/student-server

# Rollback
kubectl rollout undo deployment/student-server
```

## Remaining TODOs

- [ ] Add HorizontalPodAutoscaler (min: 2, max: 10, target CPU: 70%)
- [ ] Add NetworkPolicy to restrict pod-to-pod traffic
- [ ] Add Ingress + TLS via cert-manager (AWS ALB Ingress Controller)
- [ ] Add ConfigMap for non-secret env vars
- [ ] Add PodDisruptionBudget for zero-downtime deployments
