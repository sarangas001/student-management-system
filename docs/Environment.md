# Environment Variables

## Server (`server/.env`)

Copy `server/.env.example` → `server/.env` and fill in real values.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3001` | HTTP port the server listens on |
| `CLIENT_URL` | Yes | — | Comma-separated allowed CORS origins (e.g. `http://localhost:5173`) |
| `NODE_ENV` | Yes | `development` | `development` \| `production` |
| `JWT_SECRET` | Yes | — | 64-byte random hex string. **Never reuse across environments.** |
| `MONGO_URI` | Yes | — | Full MongoDB connection string incl. database name |
| `GEMINI_BASE_URL` | Yes | — | `https://generativelanguage.googleapis.com/v1beta/openai/` |
| `GEMINI_API_KEY` | Yes | — | Google AI Studio API key |
| `GEMINI_MODEL` | No | `gemini-2.5-flash` | Model ID |
| `LOG_LEVEL` | No | `info` | Winston log level: `error` \| `warn` \| `info` \| `http` \| `debug` |

## Client (`client/.env`)

Copy `client/.env.example` → `client/.env`.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_BACKEND_URL` | Yes | `http://localhost:3001` | Base URL of the API server |

## Validation Rules

- `JWT_SECRET` must be at least 32 characters. In production use ≥ 128 characters.
- `MONGO_URI` must include the database name segment (`/student-management`).
- `NODE_ENV=production` enables secure cookies, disables stack traces in API errors, and enables JSON-only Winston logs.
- `CLIENT_URL` supports multiple comma-separated values for multi-origin setups.

## Secret Generation

```bash
# JWT_SECRET (node)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# JWT_SECRET (openssl)
openssl rand -hex 64
```
