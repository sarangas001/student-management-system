# Security

## Security Controls (implemented)

| Control | Implementation | Location |
|---------|---------------|----------|
| Secure headers | `helmet` | `server/app.js` |
| CORS restriction | `cors` + `CLIENT_URL` env var | `server/app.js` |
| Global rate limit | `express-rate-limit` 200 req/15 min | `server/app.js` |
| Auth rate limit | `express-rate-limit` 20 req/15 min | `server/app.js` |
| NoSQL injection | `express-mongo-sanitize` | `server/app.js` |
| Password hashing | `bcryptjs` — 12 salt rounds | `server/controllers/authController.js` |
| JWT auth | httpOnly cookie, `secure`, `sameSite` | `server/shared/jwt/jwt.repo.js` |
| Route protection | `protect` middleware | `server/shared/authMiddleware.js` |
| Body size limit | 10 kb max | `server/app.js` |
| Response compression | `compression` | `server/app.js` |
| Error message hiding | Generic messages in production | `server/middleware/errorHandler.js` |
| Generic auth errors | "Invalid credentials" (no enumeration) | `server/controllers/authController.js` |

## Known Remaining Gaps

| Gap | Severity | Recommendation |
|-----|----------|----------------|
| No CSRF token | Medium | Add `csurf` or use `SameSite=Strict` cookie in same-origin deployments |
| No refresh token | Medium | Implement rotating refresh tokens with 30-day TTL |
| No account lockout | Medium | Add failed-login counter in DB; lock after 10 failures |
| No email verification | Low | Integrate with Nodemailer (already a dependency) |
| No audit log | Medium | Log every write operation with actor + timestamp |
| Committed `.env` files | **Critical** | Run `git rm --cached server/.env client/.env` then `git commit` |
| Weak historical JWT_SECRET | **Critical** | Rotate immediately: generate new secret, invalidate all tokens |

## Immediately Required Actions

> These must be done BEFORE any production deployment.

1. **Rotate the MongoDB password** — credentials were committed to git history.
2. **Rotate the Gemini API key** — committed to git history.
3. **Generate a new strong JWT_SECRET** via `setup.sh` or:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
4. **Remove tracked secret files from git history**:
   ```bash
   git rm --cached server/.env client/.env
   git commit -m "chore: remove .env files from git tracking"
   ```
   Consider using `git filter-repo` to remove them from full history.
5. **Add all secrets as GitHub Actions Secrets**, not hardcoded in workflow YAML.

## Secret Inventory (GitHub Actions Secrets required)

| Secret | Used by |
|--------|---------|
| `DOCKER_USERNAME` | All workflows |
| `DOCKER_PASSWORD` | All workflows |
| `AWS_ACCESS_KEY_ID` | deployment_ci_cd.yaml |
| `AWS_SECRET_ACCESS_KEY` | deployment_ci_cd.yaml |
| `JWT_SECRET` | deployment_ci_cd.yaml → K8s secret |
| `MONGO_URI` | deployment_ci_cd.yaml → K8s secret |
| `CLIENT_URL` | deployment_ci_cd.yaml → K8s secret |
| `NODE_ENV` | deployment_ci_cd.yaml → K8s secret |
| `GEMINI_BASE_URL` | deployment_ci_cd.yaml → K8s secret |
| `GEMINI_API_KEY` | deployment_ci_cd.yaml → K8s secret |
| `GEMINI_MODEL` | deployment_ci_cd.yaml → K8s secret |
| `VITE_BACKEND_URL` | deployment_ci_cd.yaml, client_ci.yaml |
