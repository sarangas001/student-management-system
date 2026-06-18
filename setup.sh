#!/bin/bash

echo "================================="
echo " Student Management System Setup "
echo "================================="

# Check directories

if [ ! -d "server" ]; then
echo "❌ server directory not found!"
exit 1
fi

if [ ! -d "client" ]; then
echo "❌ client directory not found!"
exit 1
fi

# Ask Mongo URI

echo ""
read -p "Enter MongoDB URI: " MONGO_URI

# Create Server ENV

cat > server/.env << EOF
PORT=3001
CLIENT_URL=http://localhost:5173
MONGO_URI=$MONGO_URI
EOF

# Create Client ENV

cat > client/.env << EOF
SERVER_URL=http://localhost:3001
EOF

echo ""
echo "✅ Environment files created successfully!"
echo ""
echo "Server ENV:"
cat server/.env

echo ""
echo "Client ENV:"
cat client/.env

echo ""
echo "🎉 Setup completed!"
