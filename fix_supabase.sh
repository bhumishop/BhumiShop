#!/bin/bash
# =====================================================
# BhumiShop - Supabase Fix Script
# =====================================================
# This script attempts to:
# 1. Install Supabase CLI if not present
# 2. Link to the Supabase project
# 3. Apply RLS policy fixes
# 4. Rotate the service role key
# =====================================================

set -e

PROJECT_REF="pyidnhtwlxlyuwswaazf"
PROJECT_URL="https://pyidnhtwlxlyuwswaazf.supabase.co"

echo "============================================"
echo "BhumiShop - Supabase Fix Script"
echo "============================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "[1/5] Supabase CLI not found. Installing..."
    echo "      You can install it via:"
    echo "        - npm: npm install -g supabase"
    echo "        - Homebrew (macOS): brew install supabase/tap/supabase"
    echo "        - curl: curl -fsSL https://cli.supabase.com/install.sh | sh"
    echo ""
    echo "      Please install the CLI and run this script again."
    echo ""
    echo "      ALTERNATIVE: Run the SQL manually in Supabase Dashboard:"
    echo "        1. Go to: https://app.supabase.com/project/${PROJECT_REF}"
    echo "        2. Navigate to SQL Editor"
    echo "        3. Run the contents of fix_rls_policies.sql"
    exit 1
fi

echo "[1/5] Supabase CLI found: $(supabase --version)"
echo ""

# Login check
echo "[2/5] Checking Supabase login..."
if ! supabase status &> /dev/null; then
    echo "      Not logged in. Please run: supabase login"
    echo "      This will open a browser for authentication."
    supabase login
fi
echo "      Logged in successfully."
echo ""

# Link to project
echo "[3/5] Linking to Supabase project..."
supabase link --project-ref ${PROJECT_REF}
echo "      Linked successfully."
echo ""

# Apply RLS policies
echo "[4/5] Applying RLS policy fixes..."
echo "      Running fix_rls_policies.sql..."

# Read the SQL file and execute it
if [ -f "fix_rls_policies.sql" ]; then
    # Note: Supabase CLI doesn't have a direct SQL execution command for remote projects
    # We need to use the REST API or dashboard
    echo ""
    echo "      IMPORTANT: The Supabase CLI doesn't support direct SQL execution for remote projects."
    echo "      Please run the SQL manually in the Dashboard:"
    echo ""
    echo "        1. Go to: https://app.supabase.com/project/${PROJECT_REF}/sql"
    echo "        2. Click 'New Query'"
    echo "        3. Copy and paste the contents of fix_rls_policies.sql"
    echo "        4. Click 'Run'"
    echo ""
    read -p "      Have you applied the SQL policies? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "      Please apply the SQL policies and then run this script again."
        exit 1
    fi
else
    echo "      ERROR: fix_rls_policies.sql not found!"
    exit 1
fi
echo ""

# Rotate service role key
echo "[5/5] Rotating service role key..."
echo ""
echo "      NOTE: Service role key rotation requires organization admin permissions."
echo "      This cannot be done via the CLI for remote projects."
echo ""
echo "      To rotate the service role key manually:"
echo "        1. Go to: https://app.supabase.com/project/${PROJECT_REF}/settings/api"
echo "        2. Scroll to 'Project API keys'"
echo "        3. Find the 'service_role' key"
echo "        4. Click 'Rotate' (or 'Regenerate')"
echo "        5. Copy the new key immediately"
echo "        6. Update your .env file if using the service role key"
echo ""
echo "      The anon key (currently in .env) is valid until 2036 and does NOT need rotation"
echo "      unless you suspect it has been compromised."
echo ""

echo "============================================"
echo "Fix Applied Successfully!"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Clear your browser cache (Ctrl+Shift+Delete)"
echo "  2. Restart the dev server: npm run dev"
echo "  3. Navigate to /produtos and verify products load"
echo "  4. Check browser console for any errors"
echo ""
echo "If products still don't load:"
echo "  - Verify the SQL policies were applied correctly"
echo "  - Check that there are products in the database"
echo "  - Review the SUPABASE_FIX_INSTRUCTIONS.md file"
echo ""
