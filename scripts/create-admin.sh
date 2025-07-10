#!/bin/bash

# Simple script to create an admin user
# Usage: ./scripts/create-admin.sh <email> <password>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo "Please create a .env file with your Supabase configuration"
    echo "Copy from env.example and fill in your values"
    exit 1
fi

# Load environment variables
source .env

# Check required environment variables
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ Missing required environment variables${NC}"
    echo "Please ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file"
    exit 1
fi

# Check arguments
if [ $# -ne 2 ]; then
    echo -e "${YELLOW}Usage: $0 <email> <password>${NC}"
    echo "Example: $0 admin@theyaz.io admin123"
    exit 1
fi

EMAIL=$1
PASSWORD=$2

echo -e "${GREEN}🔧 Creating admin user: $EMAIL${NC}"

# Run the Node.js script
node scripts/create-admin-user.js "$EMAIL" "$PASSWORD"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Admin user created successfully!${NC}"
    echo -e "${YELLOW}💡 You can now log in to your app with these credentials${NC}"
else
    echo -e "${RED}❌ Failed to create admin user${NC}"
    exit 1
fi 