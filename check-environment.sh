#!/bin/bash

# Environment Check Script
echo "🔍 Checking your environment..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js: NOT INSTALLED"
    echo "   Install: https://nodejs.org/ (v18+)"
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm: NOT INSTALLED"
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm: $(pnpm --version)"
else
    echo "❌ pnpm: NOT INSTALLED"
    echo "   Install: npm install -g pnpm@8.12.0"
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL: $(psql --version | head -n 1)"
else
    echo "❌ PostgreSQL: NOT INSTALLED"
    echo "   Install (macOS): brew install postgresql@15"
    echo "   Install (Linux): sudo apt install postgresql-15"
fi

# Check Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker: $(docker --version | cut -d ' ' -f3 | tr -d ',')"
else
    echo "⚠️  Docker: NOT INSTALLED (optional)"
    echo "   Install: https://www.docker.com/products/docker-desktop"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Provide next steps
MISSING=0
command -v node &> /dev/null || MISSING=1
command -v pnpm &> /dev/null || MISSING=1

if [ $MISSING -eq 1 ]; then
    echo "⚠️  Missing dependencies detected!"
    echo ""
    echo "📋 Quick Install (macOS):"
    echo ""
    echo "   # Install Homebrew (if not installed)"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo ""
    echo "   # Install Node.js"
    echo "   brew install node@18"
    echo ""
    echo "   # Install pnpm"
    echo "   npm install -g pnpm@8.12.0"
    echo ""
    echo "   # Install PostgreSQL"
    echo "   brew install postgresql@15"
    echo "   brew services start postgresql@15"
    echo ""
    echo "📋 Quick Install (Linux/Ubuntu):"
    echo ""
    echo "   # Install Node.js"
    echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "   sudo apt-get install -y nodejs"
    echo ""
    echo "   # Install pnpm"
    echo "   npm install -g pnpm@8.12.0"
    echo ""
    echo "   # Install PostgreSQL"
    echo "   sudo apt install postgresql-15 postgresql-contrib"
    echo "   sudo systemctl start postgresql"
    echo ""
    echo "Then run: ./setup.sh"
else
    echo "✅ All required dependencies are installed!"
    echo ""
    echo "🚀 Ready to set up the project!"
    echo ""
    echo "Run: ./setup.sh"
fi

echo ""
