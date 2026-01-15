#!/bin/bash

# School CRM Setup Script
# This script installs all dependencies and sets up the project

set -e  # Exit on error

echo "🚀 School CRM - Automated Setup"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect OS
OS="$(uname -s)"
echo "📋 Detected OS: $OS"

# Install Homebrew (macOS)
if [[ "$OS" == "Darwin" ]]; then
    if ! command -v brew &> /dev/null; then
        echo -e "${YELLOW}📦 Installing Homebrew...${NC}"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    else
        echo -e "${GREEN}✅ Homebrew already installed${NC}"
    fi
fi

# Install Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Node.js 18...${NC}"
    if [[ "$OS" == "Darwin" ]]; then
        brew install node@18
        brew link node@18
    else
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
else
    echo -e "${GREEN}✅ Node.js already installed: $(node --version)${NC}"
fi

# Install pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}📦 Installing pnpm...${NC}"
    npm install -g pnpm@8.12.0
else
    echo -e "${GREEN}✅ pnpm already installed: $(pnpm --version)${NC}"
fi

# Install PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PostgreSQL...${NC}"
    if [[ "$OS" == "Darwin" ]]; then
        brew install postgresql@15
        brew services start postgresql@15
    else
        sudo apt-get install -y postgresql-15 postgresql-contrib-15
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    fi
else
    echo -e "${GREEN}✅ PostgreSQL already installed: $(psql --version)${NC}"
fi

# Install Docker (optional but recommended)
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not installed. Install from: https://www.docker.com/products/docker-desktop${NC}"
    echo -e "${YELLOW}   We'll use local PostgreSQL instead.${NC}"
else
    echo -e "${GREEN}✅ Docker already installed: $(docker --version)${NC}"
fi

echo ""
echo -e "${GREEN}✅ All dependencies installed!${NC}"
echo ""

# Install project dependencies
echo "📦 Installing project dependencies..."
pnpm install

echo ""
echo "🗄️  Setting up database..."

# Create .env files if they don't exist
if [ ! -f "apps/backend/.env" ]; then
    cp apps/backend/.env.example apps/backend/.env
    echo -e "${GREEN}✅ Created apps/backend/.env${NC}"
fi

if [ ! -f "apps/frontend/.env.local" ]; then
    cp apps/frontend/.env.example apps/frontend/.env.local
    echo -e "${GREEN}✅ Created apps/frontend/.env.local${NC}"
fi

# Create PostgreSQL database
echo "Creating database..."
if command -v psql &> /dev/null; then
    createdb school_crm 2>/dev/null || echo "Database may already exist"
fi

# Run Prisma migrations
echo "Running database migrations..."
cd apps/backend
pnpm prisma generate
pnpm prisma migrate dev --name init

# Seed database
echo "Seeding database..."
pnpm prisma db seed

cd ../..

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "🚀 To start the application:"
echo ""
echo "   pnpm turbo run dev"
echo ""
echo "📱 Access the application:"
echo ""
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:3001/api/v1"
echo ""
echo "🔐 Login credentials:"
echo ""
echo "   Email:    admin@vidyamandir.com"
echo "   Password: admin123"
echo ""
echo "🎨 Test custom domains (after editing /etc/hosts):"
echo ""
echo "   http://portal.vidyamandir.local:3000"
echo ""
echo "📚 Read the docs: README.md"
echo ""
