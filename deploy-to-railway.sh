#!/bin/bash

# AI Crypto Monitoring System - Railway Deployment Script
set -e

echo "🚀 Starting Railway deployment for AI Crypto Monitoring System"
echo "================================================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "railway-server.js" ]; then
    echo -e "${RED}❌ Error: railway-server.js not found${NC}"
    echo "Please run this script from the ai-crypto-monitoring-system directory"
    exit 1
fi

# Step 1: Update Git
echo -e "\n${YELLOW}📦 Step 1: Pushing latest changes to GitHub...${NC}"
git add -A
git commit -m "🚀 Deploy to Railway - $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push origin main --force

echo -e "${GREEN}✅ GitHub updated${NC}"

# Step 2: Check Railway CLI
echo -e "\n${YELLOW}🔧 Step 2: Checking Railway CLI...${NC}"
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found${NC}"
    echo "Installing Railway CLI..."
    curl -fsSL https://railway.app/install.sh | sh
fi

# Step 3: Railway deployment options
echo -e "\n${YELLOW}🚂 Step 3: Railway Deployment${NC}"
echo "================================================================"

# Option 1: Direct API deployment (if token exists)
if [ ! -z "$RAILWAY_API_TOKEN" ]; then
    echo -e "${GREEN}✅ Railway token found${NC}"
    echo "Attempting API deployment..."
    
    # Try to create/update project via API
    curl -X POST "https://backboard.railway.app/graphql/v2" \
        -H "Authorization: Bearer $RAILWAY_API_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "query": "mutation { projectCreate(input: { name: \"ai-crypto-monitoring\", repo: { fullRepoName: \"sdem88/ai-crypto-monitoring-system-v2\" } }) { id } }"
        }' 2>/dev/null || true
fi

# Step 4: Generate deployment links
echo -e "\n${GREEN}🎯 DEPLOYMENT LINKS READY:${NC}"
echo "================================================================"
echo ""
echo -e "${GREEN}Option 1 - Direct GitHub Deploy:${NC}"
echo "https://railway.app/new/github/sdem88/ai-crypto-monitoring-system-v2"
echo ""
echo -e "${GREEN}Option 2 - Template Deploy:${NC}"
echo "https://railway.app/new/template?template=https://github.com/sdem88/ai-crypto-monitoring-system-v2"
echo ""
echo -e "${GREEN}Option 3 - Manual Deploy:${NC}"
echo "1. Go to: https://railway.app/new"
echo "2. Select 'Deploy from GitHub repo'"
echo "3. Choose: sdem88/ai-crypto-monitoring-system-v2"
echo "4. Click 'Deploy'"
echo ""
echo "================================================================"

# Step 5: Auto-open browser
echo -e "\n${YELLOW}🌐 Opening Railway deployment page...${NC}"
open "https://railway.app/new/github/sdem88/ai-crypto-monitoring-system-v2"

echo -e "\n${GREEN}✅ DEPLOYMENT INITIATED!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Click 'Deploy Now' in the browser window"
echo "2. Wait 2-3 minutes for deployment"
echo "3. Get your public URL from Railway dashboard"
echo ""
echo "🔗 Your API endpoints will be:"
echo "   • /health - Health check"
echo "   • /api/rates - Current USDT rates"
echo "   • /api/arbitrage - Arbitrage opportunities"
echo "   • /api/history - Historical data"
echo ""
echo -e "${GREEN}🎉 Happy monitoring!${NC}"