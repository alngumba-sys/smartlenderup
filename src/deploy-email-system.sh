#!/bin/bash

# Deploy Email System to Supabase
# BV Funguo Ltd Microfinance Platform

echo "📧 ==============================================="
echo "📧  BV Funguo Email System Deployment"
echo "📧 ==============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo -e "${RED}❌ Supabase CLI not found!${NC}"
    echo ""
    echo "Install it with:"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# Project reference
PROJECT_REF="yrsnylrcgejnrxphjvtf"

echo "🔗 Project: $PROJECT_REF"
echo ""

# Check if logged in
echo "🔐 Checking Supabase login status..."
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Supabase${NC}"
    echo ""
    echo "Please login now..."
    supabase login
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Login failed${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Logged in to Supabase${NC}"
echo ""

# Link to project
echo "🔗 Linking to project..."
supabase link --project-ref $PROJECT_REF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to link to project${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Project linked${NC}"
echo ""

# Deploy send-email function
echo "📤 Deploying send-email function..."
supabase functions deploy send-email --no-verify-jwt

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to deploy send-email function${NC}"
    exit 1
fi

echo -e "${GREEN}✅ send-email function deployed${NC}"
echo ""

# Deploy send-scheduled-emails function
echo "📤 Deploying send-scheduled-emails function..."
supabase functions deploy send-scheduled-emails

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Warning: send-scheduled-emails deployment failed (optional)${NC}"
else
    echo -e "${GREEN}✅ send-scheduled-emails function deployed${NC}"
fi

echo ""
echo "📧 ==============================================="
echo -e "${GREEN}✅  Email System Deployed Successfully!${NC}"
echo "📧 ==============================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Set your Resend API key:"
echo "   • Go to: https://supabase.com/dashboard/project/$PROJECT_REF/settings/functions"
echo "   • Add environment variable:"
echo "     Name: RESEND_API_KEY"
echo "     Value: re_xxxxxxxxxxxxx (your key)"
echo ""
echo "2. Get a Resend API key:"
echo "   • Sign up at: https://resend.com"
echo "   • Generate API key from dashboard"
echo "   • Free tier: 100 emails/day"
echo ""
echo "3. Test the function:"
echo "   • Go to Edge Functions in Supabase dashboard"
echo "   • Click 'send-email' → 'Invoke Function'"
echo "   • Use test payload from EMAIL_SYSTEM_SETUP_COMPLETE.md"
echo ""
echo "4. Integrate into your app:"
echo "   • See INTEGRATION_EXAMPLE_EMAIL.md for code examples"
echo "   • Import from /services/emailService.ts"
echo ""
echo -e "${GREEN}📚 Full documentation: /EMAIL_SYSTEM_SETUP_COMPLETE.md${NC}"
echo ""
