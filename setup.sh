#!/bin/bash
set -euo pipefail

echo "================================="
echo " Student Management System Setup "
echo "================================="

# Verify directories
if [ ! -d "server" ]; then
    echo "❌ server directory not found!"
    exit 1
fi

if [ ! -d "client" ]; then
    echo "❌ client directory not found!"
    exit 1
fi

echo ""
read -rp "Enter MongoDB Cluster URI (without database name): " MONGO_URI
MONGO_URI="${MONGO_URI%/}/student-management"

echo ""
read -rp "Enter GEMINI_API_KEY: " GEMINI_API_KEY

# Generate a cryptographically secure JWT secret (64 random hex bytes = 128 char string)
if command -v node &>/dev/null; then
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
elif command -v openssl &>/dev/null; then
    JWT_SECRET=$(openssl rand -hex 64)
else
    echo "⚠️  Could not generate a random JWT_SECRET. Please replace CHANGE_ME below with a strong secret."
    JWT_SECRET="CHANGE_ME_$(date +%s)"
fi

echo ""
echo "✅ Generated a cryptographically secure JWT_SECRET."

# Create Server .env
cat > server/.env << EOF
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
JWT_SECRET=secretkey
MONGO_URI=${MONGO_URI}
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
GEMINI_API_KEY=${GEMINI_API_KEY}
GEMINI_MODEL=gemini-2.5-flash
EOF

# Create Client .env
cat > client/.env << EOF
VITE_BACKEND_URL=http://localhost:3001
EOF

echo ""
echo "✅ Environment files created successfully!"
echo "   server/.env  →  PORT, JWT_SECRET, MONGO_URI, GEMINI_*"
echo "   client/.env  →  VITE_BACKEND_URL"
echo ""
echo "Next steps:"
echo "  1. cd server && npm install"
echo "  2. cd client && npm install"
echo "  3. cd server && npm run dev"
echo "  4. cd client && npm run dev"
echo ""
echo "🎉 Setup complete!"
