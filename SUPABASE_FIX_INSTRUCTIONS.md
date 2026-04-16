# BhumiShop - Supabase Fix Instructions

## Problem Summary
- **Products not loading**: Supabase returning HTTP 401 (Row Level Security blocking anonymous reads)
- **i18n translations missing**: Locale files already exist at `src/i18n/locales/pt-BR.json` and `en.json`

## Solution

### Step 1: Fix Row Level Security (RLS) Policies

The `fix_rls_policies.sql` file has been created in the project root. This SQL script will:
- Enable anonymous (public) READ access to products, categories, and collections
- Preserve full access for authenticated admin users

**How to run it:**

1. Go to your Supabase Dashboard: https://app.supabase.com/project/pyidnhtwlxlyuwswaazf
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open the file `fix_rls_policies.sql` from your project root
5. Copy and paste the entire content into the SQL Editor
6. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
7. Check the output to verify policies were created

**Expected output:**
You should see 6 policies created:
- `Allow public read access to products` (SELECT for anon, authenticated)
- `Allow admin full access to products` (ALL for authenticated)
- `Allow public read access to categories` (SELECT for anon, authenticated)
- `Allow admin full access to categories` (ALL for authenticated)
- `Allow public read access to collections` (SELECT for anon, authenticated)
- `Allow admin full access to collections` (ALL for authenticated)

### Step 2: Rotate Supabase Service Role Key (Optional but Recommended)

Since you mentioned rotating the service role key, here's how to do it:

**Via Supabase Dashboard:**

1. Go to: https://app.supabase.com/project/pyidnhtwlxlyuwswaazf/settings/api
2. Scroll to **Project API keys**
3. Find the `service_role` key (this is the one with full access, bypasses RLS)
4. Click **Reveal** to see the current key
5. Click **Rotate** (or **Regenerate**)
6. **IMPORTANT**: Copy the new service role key immediately
7. Update your `.env` file with the new key if you're using it server-side

**Note:** The current anon key in your `.env` is valid until 2036, so rotation is only needed if you suspect it's compromised.

**Via Supabase CLI (if you have it installed locally):**

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref pyidnhtwlxlyuwswaazf

# Run the SQL migration
supabase db push

# To rotate keys (requires org admin permissions)
supabase projects api-keys rotate --key-type service_role
```

### Step 3: Verify the Fix

After running the SQL script:

1. **Clear your browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. **Restart the dev server**:
   ```bash
   cd /home/ubuntu/BhumisparshaSchool/BhumiShop
   npm run dev
   ```
3. **Open the app** and navigate to `/produtos`
4. **Check the browser console** (F12) for any errors

**Expected result:**
- Products should now load and display
- Categories should appear in the filter sidebar
- Collections should show up if any exist
- i18n translations should display properly (Portuguese by default)

### Step 4: Test the API Directly (Optional)

You can test if the RLS policies are working by making a direct API call:

```bash
# Test products endpoint
curl -X GET "https://pyidnhtwlxlyuwswaazf.supabase.co/rest/v1/products?select=*&is_active=eq.true&is_archived=eq.false" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5aWRuaHR3bHhseXV3c3dhYXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDEyOTYsImV4cCI6MjA5MTc3NzI5Nn0.4LAxeX9FAYNzrmYxejj5e4PHjkol9OJSAuGGYSamsNSTA" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5aWRuaHR3bHhseXV3c3dhYXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDEyOTYsImV4cCI6MjA5MTc3NzI5Nn0.4LAxeX9FAYNzrmYxejj5e4PHjkol9OJSAuGGYSamsNSTA"
```

**Expected response:** A JSON array of products (or `[]` if no products exist in the database)

### Troubleshooting

**If products still don't load after running the SQL:**

1. **Check if RLS is enabled on the tables:**
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('products', 'categories', 'collections');
   ```
   All should show `rowsecurity = true`

2. **Check existing policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename IN ('products', 'categories', 'collections');
   ```

3. **Check if there are any products in the database:**
   ```sql
   SELECT COUNT(*) FROM products;
   SELECT COUNT(*) FROM products WHERE is_active = true AND is_archived = false;
   ```

4. **Check browser console for specific error messages**

**If i18n still shows raw keys:**

1. Verify the locale files exist:
   ```bash
   ls -la src/i18n/locales/
   ```

2. Check the browser console for failed import errors

3. Verify `i18n/index.js` is loading messages correctly

## Files Created

- `fix_rls_policies.sql` - SQL script to fix RLS policies
- `SUPABASE_FIX_INSTRUCTIONS.md` - This file

## What Was Already Fixed

- i18n locale files already exist at `src/i18n/locales/pt-BR.json` and `en.json`
- All translation keys are present
- The frontend code is correctly configured to load these files
