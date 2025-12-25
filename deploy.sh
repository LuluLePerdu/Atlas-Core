#!/bin/bash

# ===========================================
# ATLAS CORE - PRODUCTION DEPLOYMENT SCRIPT
# ===========================================

set -e

echo "🚀 Atlas Core - Deployment Script"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo -e "${RED}❌ Please do not run this script as root${NC}"
  exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker found: $(docker --version)${NC}"
echo -e "${GREEN}✅ Docker Compose found: $(docker-compose --version)${NC}"
echo ""

# Check .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    echo "Creating from .env.production.example..."
    
    if [ -f .env.production.example ]; then
        cp .env.production.example .env
        echo -e "${GREEN}✅ .env file created${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env with your secure values before continuing!${NC}"
        exit 1
    else
        echo -e "${RED}❌ .env.production.example not found${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ .env file found${NC}"

# Check for placeholder values
if grep -q "CHANGEME" .env; then
    echo -e "${YELLOW}⚠️  .env file contains CHANGEME placeholders!${NC}"
    echo "Please replace all CHANGEME values with secure secrets."
    exit 1
fi

echo -e "${GREEN}✅ .env file configured${NC}"
echo ""

# Prompt for deployment action
echo "Select deployment action:"
echo "1) First deployment (build & start)"
echo "2) Update deployment (rebuild & restart)"
echo "3) Stop all services"
echo "4) View logs"
echo "5) Run database migrations"
echo "6) Backup database"
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        echo ""
        echo "🏗️  Building and starting services..."
        docker-compose -f docker-compose.prod.yml up -d --build
        
        echo ""
        echo "⏳ Waiting for database to be ready..."
        sleep 10
        
        echo ""
        echo "🗄️  Running database migrations..."
        docker-compose -f docker-compose.prod.yml exec -T backend npm run migrate
        
        echo ""
        echo -e "${GREEN}✅ Deployment complete!${NC}"
        echo ""
        echo "Access your application at:"
        echo "  Frontend: https://$(grep DOMAIN .env | cut -d '=' -f2)"
        echo "  API: https://$(grep API_DOMAIN .env | cut -d '=' -f2)"
        echo "  Traefik Dashboard: http://YOUR_SERVER_IP:8080"
        echo ""
        echo "View logs with: docker-compose -f docker-compose.prod.yml logs -f"
        ;;
    
    2)
        echo ""
        echo "🔄 Updating deployment..."
        docker-compose -f docker-compose.prod.yml down
        docker-compose -f docker-compose.prod.yml up -d --build
        
        echo ""
        echo "🗄️  Running database migrations..."
        docker-compose -f docker-compose.prod.yml exec -T backend npm run migrate
        
        echo ""
        echo -e "${GREEN}✅ Update complete!${NC}"
        ;;
    
    3)
        echo ""
        echo "🛑 Stopping all services..."
        docker-compose -f docker-compose.prod.yml down
        echo -e "${GREEN}✅ All services stopped${NC}"
        ;;
    
    4)
        echo ""
        echo "📋 Showing logs (Ctrl+C to exit)..."
        docker-compose -f docker-compose.prod.yml logs -f
        ;;
    
    5)
        echo ""
        echo "🗄️  Running database migrations..."
        docker-compose -f docker-compose.prod.yml exec backend npm run migrate
        echo -e "${GREEN}✅ Migrations complete${NC}"
        ;;
    
    6)
        echo ""
        BACKUP_DIR="./backups"
        mkdir -p $BACKUP_DIR
        BACKUP_FILE="$BACKUP_DIR/atlas_$(date +%Y%m%d_%H%M%S).sql"
        
        echo "💾 Creating database backup..."
        docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U atlas_admin atlas_core_prod > $BACKUP_FILE
        
        echo -e "${GREEN}✅ Backup saved to: $BACKUP_FILE${NC}"
        
        # Keep only last 7 backups
        ls -t $BACKUP_DIR/atlas_*.sql | tail -n +8 | xargs -r rm
        echo "🧹 Old backups cleaned (keeping last 7)"
        ;;
    
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "=================================="
echo "🎉 Done!"
