# Troubleshooting

## Server won't start

**Symptom:** `Error: Cannot find module 'helmet'` (or any new package)

**Fix:** New dependencies were added. Run:
```bash
cd server && npm install
```

---

**Symptom:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Fix:** Check `MONGO_URI` in `server/.env`. Ensure:
- Atlas cluster is running and your IP is in the network allowlist.
- The URI includes the database name: `.../student-management`.

---

**Symptom:** `Error: JWT_SECRET is not defined`

**Fix:** The `.env` file is missing or not loaded. Run `setup.sh` or manually copy `.env.example` → `.env` and fill in `JWT_SECRET`.

---

## Login always returns "Invalid credentials"

**Likely causes:**
1. Password was hashed with old rounds — re-register the user.
2. `MONGO_URI` points to the wrong cluster/database.
3. `.env` has the wrong `MONGO_URI` (development vs. production mixed up).

---

## CORS errors in browser

**Symptom:** `Access-Control-Allow-Origin` header missing or wrong.

**Fix:** Set `CLIENT_URL` in `server/.env` to the exact origin the browser uses, e.g. `http://localhost:5173`. Multiple origins can be comma-separated.

---

## CI/CD pipeline fails

**`Error: Unrecognized action 'actions/checkout@v6'`**  
All workflows now use `@v4`. If you see this error it means you're running an old cached workflow. Re-trigger the workflow.

**`VITE_BACKEND_URL is EMPTY`**  
Add the `VITE_BACKEND_URL` secret in GitHub → Settings → Secrets → Actions.

**`ImagePullBackOff` in Kubernetes**  
The Docker image was not pushed or the tag is wrong. Check:
```bash
kubectl describe pod -l app=student-server
```

---

## Rate limit errors (HTTP 429)

Auth endpoints are limited to 20 requests per 15 minutes per IP. In development, clear the rate limit by restarting the server or wait 15 minutes.

---

## Docker Compose issues

**`service "server" is not healthy`**  
The server container failed to start. Check logs:
```bash
docker compose logs server
```

**`port is already allocated`**  
Change the host port in `docker-compose.yml` (e.g. `3002:3001`) or stop the conflicting process.

---

## Kubernetes pod stuck in `CrashLoopBackOff`

```bash
# Check logs
kubectl logs -l app=student-server --previous

# Describe for events
kubectl describe pod -l app=student-server
```

Common cause: missing `env-secrets` secret. Re-run the secret creation step from [Deployment.md](Deployment.md).
