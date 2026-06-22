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

echo ""
# read -p "Enter MongoDB Cluster URI: " MONGO_URI

# # Remove trailing slash if exists

# MONGO_URI=${MONGO_URI%/}

# # Append database name

# MONGO_URI="${MONGO_URI}/student-management"

# Create Server ENV from .env.example

if [ -f "server/.env.example" ]; then
    cp server/.env.example server/.env
    echo "⚠️  Please edit server/.env with your actual credentials"
else
    echo "❌ server/.env.example not found!"
    exit 1
fi

# Create Client ENV

cat > client/.env << EOF
SERVER_URL=http://localhost:3001
EOF

echo ""
echo "✅ Environment files created successfully!"
echo ""
echo "MongoDB Database: student-management"
echo "🎉 Setup completed!"
