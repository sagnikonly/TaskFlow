#!/bin/bash

# Script to check if Supabase database is properly set up

echo "🔍 Checking Supabase setup..."
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed"
    echo ""
    echo "Install it with:"
    echo "  brew install supabase/tap/supabase"
    echo "  OR"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI is installed"
echo ""

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Project is not linked to Supabase"
    echo ""
    echo "Link it with:"
    echo "  supabase link --project-ref twwnovstkvhpoxvjrnwn"
    echo ""
    exit 1
fi

echo "✅ Project is linked to Supabase"
echo ""

# Check migrations
echo "📋 Checking migrations..."
if [ -d "supabase/migrations" ]; then
    migration_count=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
    echo "   Found $migration_count migration file(s)"
    
    if [ $migration_count -gt 0 ]; then
        echo ""
        echo "   Migration files:"
        ls -1 supabase/migrations/*.sql | while read file; do
            echo "   - $(basename "$file")"
        done
    fi
else
    echo "❌ No migrations directory found"
    exit 1
fi

echo ""
echo "🚀 Ready to push migrations!"
echo ""
echo "Run this command to apply migrations:"
echo "  supabase db push"
echo ""
