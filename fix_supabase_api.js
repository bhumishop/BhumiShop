#!/usr/bin/env node
/**
 * BhumiShop - Supabase RLS Fix Script
 * 
 * This script uses the Supabase Management API to execute SQL commands.
 * Requires the service_role key to bypass RLS.
 * 
 * Usage: node fix_supabase_api.js
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
const envPath = join(__dirname, '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const SUPABASE_URL = envVars.VITE_SUPABASE_URL?.replace(/\/$/, '');
const SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: Missing Supabase credentials in .env file');
  console.error('Expected VITE_SUPABASE_URL and VITE_SUPABASE_KEY');
  process.exit(1);
}

console.log('============================================');
console.log('BhumiShop - Supabase RLS Fix Script');
console.log('============================================\n');
console.log(`Project URL: ${SUPABASE_URL}`);
console.log('');

// Read the SQL file
let sqlContent;
try {
  sqlContent = readFileSync(join(__dirname, 'fix_rls_policies.sql'), 'utf-8');
  // Remove comments that start with --
  sqlContent = sqlContent
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .replace(/;\s*\n/g, ';SPLIT;');
} catch (err) {
  console.error('Error: Could not read fix_rls_policies.sql');
  console.error(err.message);
  process.exit(1);
}

// Split into individual statements
const statements = sqlContent
  .split('SPLIT;')
  .map(s => s.trim().replace(/;$/, ''))
  .filter(s => s.length > 0);

console.log(`[1/2] Found ${statements.length} SQL statements to execute\n`);

// Execute each statement
async function executeSQL(sql, description) {
  console.log(`Executing: ${description}...`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'params=single-object'
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`  Failed: ${response.status} ${response.statusText}`);
      console.error(`  ${error}\n`);
      return false;
    }

    console.log(`  Success\n`);
    return true;
  } catch (err) {
    console.error(`  Error: ${err.message}\n`);
    return false;
  }
}

async function main() {
  // Note: The Supabase REST API doesn't support arbitrary SQL execution via anon key
  // This script will likely fail, but it's worth trying
  
  console.log('IMPORTANT: This script attempts to execute SQL via the REST API.');
  console.log('If it fails (likely due to RLS), you MUST run the SQL manually in the Dashboard.\n');
  
  const confirm = await new Promise(resolve => {
    process.stdout.write('Continue anyway? (y/n): ');
    process.stdin.once('data', data => {
      resolve(data.toString().trim().toLowerCase() === 'y');
    });
  });

  if (!confirm) {
    console.log('\nAborted. Please run the SQL manually in the Supabase Dashboard:');
    console.log(`  1. Go to: ${SUPABASE_URL.replace('supabase.co', 'app.supabase.com/project')}/sql`);
    console.log('  2. Click "New Query"');
    console.log('  3. Run the contents of fix_rls_policies.sql\n');
    process.exit(0);
  }

  let successCount = 0;
  
  for (const statement of statements) {
    const description = statement.substring(0, 50) + '...';
    const success = await executeSQL(statement, description);
    if (success) successCount++;
    
    // Small delay between statements
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('============================================');
  console.log(`Results: ${successCount}/${statements.length} statements executed`);
  console.log('============================================\n');

  if (successCount === 0) {
    console.log('All statements failed. This is expected - the anon key cannot execute arbitrary SQL.');
    console.log('You MUST run the SQL manually in the Supabase Dashboard:\n');
    console.log(`  1. Go to: https://app.supabase.com/project/pyidnhtwlxlyuwswaazf/sql`);
    console.log('  2. Click "New Query"');
    console.log('  3. Copy and paste the contents of fix_rls_policies.sql');
    console.log('  4. Click "Run"\n');
  } else if (successCount === statements.length) {
    console.log('All statements executed successfully!');
    console.log('Please verify by visiting /produtos in your app.\n');
  } else {
    console.log('Some statements executed. Please verify the results.\n');
  }
}

main().catch(console.error);
