#!/bin/bash

# Database Environment Switcher for iBudget
# Usage: ./scripts/switch-db.sh [local|production]

ENV=${1:-local}

if [ "$ENV" = "local" ]; then
  echo "🔄 Switching to LOCAL database..."
  cp .env.development .env.local
  echo "✅ Switched to LOCAL database (localhost:3306)"
  echo "   User: root"
  echo "   Database: ibudget"
  
elif [ "$ENV" = "production" ]; then
  echo "🔄 Switching to PRODUCTION database..."
  cp .env.production .env.local
  echo "✅ Switched to PRODUCTION database (TiDB Cloud)"
  echo "   Host: gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000"
  echo "   Database: ibudget"
  
else
  echo "❌ Invalid environment. Usage: ./scripts/switch-db.sh [local|production]"
  exit 1
fi

echo ""
echo "📝 Current configuration:"
grep "^DB_" .env.local | grep -v "DB_PASSWORD"
