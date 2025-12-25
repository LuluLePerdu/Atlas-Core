#!/bin/bash

# Quick Setup Script for Atlas Core
# This script helps generate secure secrets and configure .env

set -e

echo "🔐 Atlas Core - Environment Setup"
echo "=================================="
echo ""

# Check if .env already exists
if [ -f .env ]; then
    read -p ".env file already exists. Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Copy example file
if [ ! -f .env.production.example ]; then
    echo "❌ .env.production.example not found"
    exit 1
fi

cp .env.production.example .env

echo "✅ .env file created"
echo ""

# Generate secure secrets
echo "🔑 Generating secure secrets..."

# Generate JWT secrets (64 bytes base64)
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')
SESSION_SECRET=$(openssl rand -base64 32 | tr -d '\n')

# Generate database password (32 chars alphanumeric)
DB_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=' | cut -c1-32)

echo "✅ Secrets generated"
echo ""

# Get domain configuration
echo "📝 Domain Configuration"
echo "----------------------"
read -p "Main domain (e.g., atlas.ludwig-emmanuel.dev): " DOMAIN
read -p "API domain (e.g., api.ludwig-emmanuel.dev): " API_DOMAIN
read -p "Admin email for Let's Encrypt: " ACME_EMAIL

# Replace values in .env
sed -i "s|CHANGEME_SECURE_PASSWORD_HERE|$DB_PASSWORD|g" .env
sed -i "s|CHANGEME_LONG_RANDOM_SECRET_MIN_32_CHARS|$JWT_SECRET|g" .env
sed -i "s|CHANGEME_DIFFERENT_LONG_RANDOM_SECRET_MIN_32_CHARS|$JWT_REFRESH_SECRET|g" .env
sed -i "s|CHANGEME_ANOTHER_RANDOM_SECRET|$SESSION_SECRET|g" .env
sed -i "s|atlas.ludwig-emmanuel.dev|$DOMAIN|g" .env
sed -i "s|api.ludwig-emmanuel.dev|$API_DOMAIN|g" .env
sed -i "s|admin@ludwig-emmanuel.dev|$ACME_EMAIL|g" .env

echo ""
echo "✅ Configuration complete!"
echo ""
echo "📋 Summary:"
echo "  Domain: $DOMAIN"
echo "  API: $API_DOMAIN"
echo "  Email: $ACME_EMAIL"
echo ""
echo "🔐 Secure secrets have been generated and saved to .env"
echo ""
echo "⚠️  IMPORTANT: Keep .env file secure and never commit it to git!"
echo ""
echo "Next steps:"
echo "  1. Review .env file: nano .env"
echo "  2. Deploy: ./deploy.sh"
echo ""
