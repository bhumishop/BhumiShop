/**
 * UmaPenca Product Sync Script
 *
 * This script scrapes/syncs products from UmaPenca store and inserts them
 * into the BhumiShop Supabase database.
 *
 * HOW TO CONNECT TO THE DATABASE:
 *
 * 1. Environment Variables Required:
 *    - SUPABASE_URL: Your Supabase project URL
 *    - SUPABASE_SERVICE_ROLE_KEY: Service role key (NOT the anon key!)
 *
 * 2. Getting These Values:
 *    a. Go to https://supabase.com/dashboard
 *    b. Select your project (nuypyyxnacvglpqwqihx)
 *    c. Go to Settings > API
 *    d. Copy "Project URL" -> SUPABASE_URL
 *    e. Copy "service_role key (secret)" -> SUPABASE_SERVICE_ROLE_KEY
 *
 * 3. Setting Secrets in GitHub:
 *    a. Go to your repo Settings > Secrets and variables > Actions
 *    b. Add "SUPABASE_URL" secret
 *    c. Add "SUPABASE_SERVICE_ROLE_KEY" secret
 *    d. (Optional) Add "UMAPENCA_STORE_URL" secret
 *
 * 4. Local Testing:
 *    Create a .env file in the project root:
 *    SUPABASE_URL=https://nuypyyxnacvglpqwqihx.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
 *
 *    Then run: node scripts/sync-umapenca/index.js
 *
 * IMPORTANT: Never commit the service_role_key to version control!
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key (bypasses RLS)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration
const UMAPENCA_STORE_URL = process.env.UMAPENCA_STORE_URL || 'https://prataprint.bhumisparshaschool.org';
const DRY_RUN = process.env.DRY_RUN === 'true';
const SYNC_TYPE = process.env.SYNC_TYPE || 'incremental';

// ============================================
// Helper functions
// ============================================

/**
 * Scrape products from UmaPenca store
 * Replace this with your actual scraping logic
 */
async function scrapeUmaPencaProducts() {
  console.log(`Scraping products from ${UMAPENCA_STORE_URL}...`);

  // TODO: Implement your scraping logic here
  // Example using fetch/puppeteer/cheerio:
  //
  // const response = await fetch(`${UMAPENCA_STORE_URL}/api/products`);
  // const data = await response.json();
  // return data.products;

  // Placeholder - return empty array until you implement scraping
  console.log('TODO: Implement actual scraping logic');
  return [];
}

/**
 * Transform scraped product data into BhumiShop format
 */
function transformProduct(externalProduct) {
  return {
    name: externalProduct.name,
    slug: externalProduct.slug || null,
    description: externalProduct.description || null,
    short_description: externalProduct.short_description || null,
    price: parseFloat(externalProduct.price),
    compare_at_price: externalProduct.compare_at_price ? parseFloat(externalProduct.compare_at_price) : null,
    stock_type: externalProduct.stock_type || 'dropshipping',
    fulfillment_type: 'uma_penca',
    artist: externalProduct.artist || null,
    info: externalProduct.info || null,
    tags: externalProduct.tags || [],
    weight: externalProduct.weight || 0.2,
    dimensions: externalProduct.dimensions || null,
    image: externalProduct.image || null,
    images: externalProduct.images || [],
    shipping_zones: externalProduct.shipping_zones || ['BR'],
    is_active: externalProduct.is_active !== false,
    // Third-party tracking
    third_party_product_id: externalProduct.id?.toString(),
    third_party_source: 'uma-penca',
    third_party_raw_data: externalProduct,
    metadata: externalProduct.metadata || {}
  };
}

/**
 * Sync a single product (insert or update)
 */
async function syncProduct(productData) {
  const { data, error } = await supabase
    .from('products')
    .upsert(productData, {
      onConflict: 'third_party_product_id,third_party_source',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (error) {
    console.error(`Error syncing product ${productData.third_party_product_id}:`, error.message);
    return { success: false, error };
  }

  return { success: true, product: data };
}

/**
 * Create a sync log entry
 */
async function createSyncLog(syncType) {
  const { data, error } = await supabase
    .from('third_party_sync_log')
    .insert({
      source: 'uma-penca',
      sync_type: syncType,
      status: 'running',
      triggered_by: 'github-actions',
      github_run_id: process.env.GITHUB_RUN_ID || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating sync log:', error.message);
    return null;
  }

  return data;
}

/**
 * Update sync log with results
 */
async function updateSyncLog(syncLogId, results) {
  const { error } = await supabase
    .from('third_party_sync_log')
    .update({
      status: results.failed > 0 ? 'partial' : 'success',
      items_processed: results.processed,
      items_inserted: results.inserted,
      items_updated: results.updated,
      items_failed: results.failed,
      errors: results.errors,
      completed_at: new Date().toISOString(),
      duration_seconds: results.durationSeconds
    })
    .eq('id', syncLogId);

  if (error) {
    console.error('Error updating sync log:', error.message);
  }
}

// ============================================
// Main sync function
// ============================================

async function main() {
  console.log('=== UmaPenca Product Sync ===');
  console.log(`Sync Type: ${SYNC_TYPE}`);
  console.log(`Dry Run: ${DRY_RUN}`);
  console.log(`Store URL: ${UMAPENCA_STORE_URL}`);
  console.log('');

  const startTime = Date.now();
  const results = {
    processed: 0,
    inserted: 0,
    updated: 0,
    failed: 0,
    errors: [],
    durationSeconds: 0
  };

  // Create sync log
  const syncLog = await createSyncLog(SYNC_TYPE);

  try {
    // Step 1: Scrape products
    const externalProducts = await scrapeUmaPencaProducts();
    console.log(`Found ${externalProducts.length} products to sync`);

    // Step 2: Process each product
    for (const externalProduct of externalProducts) {
      results.processed++;

      try {
        const productData = transformProduct(externalProduct);

        if (DRY_RUN) {
          console.log(`[DRY RUN] Would sync product: ${productData.name}`);
          results.updated++; // Count as updated in dry run
          continue;
        }

        const result = await syncProduct(productData);

        if (result.success) {
          // Check if it was insert or update by comparing created_at and updated_at
          if (result.product.created_at === result.product.updated_at) {
            results.inserted++;
          } else {
            results.updated++;
          }
        } else {
          results.failed++;
          results.errors.push({
            productId: externalProduct.id,
            error: result.error.message
          });
        }
      } catch (err) {
        results.failed++;
        results.errors.push({
          productId: externalProduct.id,
          error: err.message
        });
        console.error(`Error processing product ${externalProduct.id}:`, err.message);
      }
    }

    // Step 3: Log results
    results.durationSeconds = (Date.now() - startTime) / 1000;

    if (syncLog && !DRY_RUN) {
      await updateSyncLog(syncLog.id, results);
    }

    // Summary
    console.log('');
    console.log('=== Sync Complete ===');
    console.log(`Processed: ${results.processed}`);
    console.log(`Inserted: ${results.inserted}`);
    console.log(`Updated: ${results.updated}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Duration: ${results.durationSeconds.toFixed(2)}s`);

    if (results.errors.length > 0) {
      console.log('');
      console.log('Errors:');
      results.errors.forEach(e => console.log(`  - Product ${e.productId}: ${e.error}`));
    }

    // Exit with error code if there were failures
    if (results.failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal sync error:', err);

    // Update sync log with failure
    if (syncLog && !DRY_RUN) {
      await updateSyncLog(syncLog.id, {
        ...results,
        status: 'failed',
        durationSeconds: (Date.now() - startTime) / 1000
      });
    }

    process.exit(1);
  }
}

// Run the sync
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
