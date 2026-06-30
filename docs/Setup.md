# Local Setup

## Prerequisites

- Node.js 22 LTS
- npm 10+
- MongoDB Atlas account (or local `mongod`)
- Google AI Studio API key (Gemini)

## Quick Start

```bash
# 1. Clone
git clone https://github.com/saranaga/student-management-system.git
cd student-management-system

# 2. Run setup script (creates .env files with a secure JWT_SECRET)
chmod +x setup.sh && ./setup.sh

# 3. Install dependencies
(cd server && npm install)
(cd client && npm install)

# 4. Start development servers
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Server: http://localhost:3001  
Client: http://localhost:5173

## Manual Environment Setup

If you prefer not to use `setup.sh`:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` and fill in `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.

Generate a secure `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Docker Setup

```bash
cp server/.env.example server/.env
# fill in server/.env

docker compose up --build
```

- API: http://localhost:3001  
- App: http://localhost:80

## Available npm Scripts

### Server

| Script | Command |
|--------|---------|
| Dev (hot reload) | `npm run dev` |
| Production | `npm start` |
| Lint | `npm run lint` |
| Tests | `npm test` |
| Test coverage | `npm run test:coverage` |

### Client

| Script | Command |
|--------|---------|
| Dev | `npm run dev` |
| Build | `npm run build` |
| Preview build | `npm run preview` |
| Lint | `npm run lint` |

## Seed Data

See [docs/credentials/USER_CREDENTIALS.md](credentials/USER_CREDNTIALS.md) for test user credentials.

## Troubleshooting

See [docs/Troubleshooting.md](Troubleshooting.md).
