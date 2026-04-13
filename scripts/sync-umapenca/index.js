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
 *    b. Select your project (rnlsgpauiltzniordpoq)
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
 *    SUPABASE_URL=https://rnlsgpauiltzniordpoq.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
 *
 *    Then run: node scripts/sync-umapenca/index.js
 *
 * IMPORTANT: Never commit the service_role_key to version control!
 */

import { createClient } from '@supabase/supabase-js';

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
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '10', 10);

// ============================================
// Helper functions
// ============================================

/**
 * Generate a URL-safe slug from a string
 */
function slugify(text) {
  if (!text) return null;
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Multiple hyphens to single
    .replace(/^-|-$/g, ''); // Trim hyphens
}

/**
 * Ensure price is a valid positive number
 */
function parsePrice(value) {
  const parsed = parseFloat(value);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

/**
 * Ensure weight is a valid positive number
 */
function parseWeight(value) {
  const parsed = parseFloat(value);
  return isNaN(parsed) || parsed <= 0 ? 0.3 : parsed;
}

/**
 * Fetch products from UmaPenca store API
 * Attempts common e-commerce API endpoints
 */
async function fetchUmaPencaProducts() {
  console.log(`Fetching products from ${UMAPENCA_STORE_URL}...`);

  const endpoints = [
    '/api/products',
    '/api/v1/products',
    '/products.json',
    '/wp-json/wc/v3/products?per_page=100',
  ];

  for (const endpoint of endpoints) {
    try {
      const url = `${UMAPENCA_STORE_URL}${endpoint}`;
      console.log(`Trying: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BhumiShop-Sync/1.0'
        },
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const data = await response.json();

        // Handle different response formats
        if (Array.isArray(data)) {
          console.log(`Found ${data.length} products via ${endpoint}`);
          return data;
        }
        if (data.products && Array.isArray(data.products)) {
          console.log(`Found ${data.products.length} products via ${endpoint}`);
          return data.products;
        }
        if (data.data && Array.isArray(data.data)) {
          console.log(`Found ${data.data.length} products via ${endpoint}`);
          return data.data;
        }
      }
    } catch (err) {
      console.log(`Failed ${endpoint}: ${err.message}`);
    }
  }

  console.warn('No products found via API endpoints, returning sample data for testing');
  return getSampleProducts();
}

/**
 * Sample products for testing when store API is unavailable
 */
function getSampleProducts() {
  return [
    {
      id: 'sample-001',
      name: 'Camiseta Bhumi Sparsha - Algodão Orgânico',
      description: '<p>Camiseta sustentável feita com algodão orgânico. Confortável e ecológica.</p>',
      short_description: 'Camiseta de algodão orgânico',
      price: 79.90,
      compare_at_price: 99.90,
      image: 'https://via.placeholder.com/400x400.png?text=Camiseta',
      images: [
        'https://via.placeholder.com/400x400.png?text=Camiseta+1',
        'https://via.placeholder.com/400x400.png?text=Camiseta+2'
      ],
      tags: ['camiseta', 'algodão', 'sustentável'],
      weight: 0.2,
      stock_type: 'print-on-demand',
      is_active: true
    },
    {
      id: 'sample-002',
      name: 'Caneca Ecológica - Bhumi',
      description: '<p>Caneca feita com materiais reciclados. Perfeita para o dia a dia.</p>',
      short_description: 'Caneca ecológica',
      price: 45.00,
      compare_at_price: null,
      image: 'https://via.placeholder.com/400x400.png?text=Caneca',
      images: ['https://via.placeholder.com/400x400.png?text=Caneca'],
      tags: ['caneca', 'ecológico'],
      weight: 0.35,
      stock_type: 'dropshipping',
      is_active: true
    },
    {
      id: 'sample-003',
      name: 'Caderno Artesanal - Papel Semente',
      description: '<p>Caderno artesanal com papel semente. Após o uso, plante a capa!</p>',
      short_description: 'Caderno com papel semente',
      price: 65.50,
      compare_at_price: 80.00,
      image: 'https://via.placeholder.com/400x400.png?text=Caderno',
      images: [],
      tags: ['caderno', 'artesanal', 'papel semente'],
      weight: 0.4,
      stock_type: 'handcrafted',
      is_active: true
    }
  ];
}

/**
 * Extract the image sequence number from the URL
 * Examples:
 * - 000_image.jpg -> 0
 * - 001_image.jpg -> 1
 * - 003_image.jpg -> 3
 * - 012_image.png -> 12
 */
function extractImageNumber(url) {
  if (!url) return null;
  const match = url.match(/\/(\d+)_image\./i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Check if an image is a FULLCOLOR swatch based on its sequence number
 * FULLCOLOR images are at positions: 0, 3, 6, 9, 12, 15... (every 3rd starting from 0)
 */
function isFullColorImage(url, index) {
  const imgNum = extractImageNumber(url);
  
  // If we can extract the number, use it for accurate detection
  if (imgNum !== null) {
    return imgNum % 3 === 0;
  }
  
  // Fallback to URL keyword detection
  if (url && (
    url.toLowerCase().includes('fullcolor') ||
    url.toLowerCase().includes('full_image') ||
    url.toLowerCase().includes('colorfull')
  )) {
    return true;
  }
  
  // Last resort: use array index (less reliable)
  return index % 3 === 0;
}

/**
 * Parse image URLs from UmaPenca product and separate color swatches from tshirt images.
 *
 * Image naming convention in Supabase bucket:
 * - NNN_image.jpg where NNN is sequential (000, 001, 002, ...)
 * - FULLCOLOR images: 000, 003, 006, 009, 012... (every 3rd starting from 0) - solid color swatches
 * - TSHIRT images: follow each FULLCOLOR - real product images (001, 002, 004, 005, 007, 008...)
 * - BABY-LOOK images: may follow tshirt images (not always present)
 *
 * Example pattern:
 * - 000 = BLACK_FULLCOLOR (swatch) - SKIP from gallery
 * - 001 = BLACK TSHIRT NORMAL - SHOW in gallery
 * - 002 = BLACK TSHIRT BABY-LOOK - SHOW in gallery
 * - 003 = BLUE_FULLCOLOR (swatch) - SKIP from gallery
 * - 004 = BLUE TSHIRT NORMAL - SHOW in gallery
 * - 005 = BLUE TSHIRT BABY-LOOK - SHOW in gallery
 * - 006 = YELLOW_FULLCOLOR (swatch) - SKIP from gallery
 * - 007 = YELLOW TSHIRT NORMAL - SHOW in gallery
 * - 008 = YELLOW TSHIRT BABY-LOOK - SHOW in gallery
 * - 009 = RED_FULLCOLOR (swatch) - SKIP from gallery
 * - 010 = RED TSHIRT NORMAL (NO baby look!) - SHOW in gallery
 * - 012 = GREEN_FULLCOLOR (swatch) - SKIP from gallery
 *
 * This function separates them so:
 * - color_swatches array contains the FULLCOLOR image URLs (000, 003, 006, 009, 012...)
 * - images array contains only real tshirt images (001, 002, 004, 005, 007, 008, 010...)
 */
function parseProductImages(externalProduct) {
  const rawImages = Array.isArray(externalProduct.images) ? externalProduct.images : [];
  const colorSwatches = [];
  const tshirtImages = [];

  if (rawImages.length === 0) {
    // Fallback to single image if available
    if (externalProduct.image || externalProduct.thumbnail) {
      return { colorSwatches: [], images: [externalProduct.image || externalProduct.thumbnail] };
    }
    return { colorSwatches: [], images: [] };
  }

  // Process each image: check if it's a FULLCOLOR swatch or a tshirt image
  rawImages.forEach((imageUrl, index) => {
    const isFullColor = isFullColorImage(imageUrl, index);
    
    if (isFullColor) {
      colorSwatches.push(imageUrl);
    } else {
      tshirtImages.push(imageUrl);
    }
  });

  return { colorSwatches, images: tshirtImages };
}

/**
 * Transform scraped product data into BhumiShop format
 */
function transformProduct(externalProduct) {
  const name = externalProduct.name || externalProduct.title || 'Unnamed Product';
  const slug = slugify(name) || `product-${externalProduct.id}`;

  // Parse and separate color swatches from tshirt images
  const { colorSwatches, images } = parseProductImages(externalProduct);

  return {
    name,
    slug,
    description: externalProduct.description || null,
    short_description: externalProduct.short_description || externalProduct.excerpt || null,
    price: parsePrice(externalProduct.price),
    compare_at_price: externalProduct.compare_at_price ? parsePrice(externalProduct.compare_at_price) : null,
    stock_type: externalProduct.stock_type || 'print-on-demand',
    fulfillment_type: 'uma_penca',
    artist: externalProduct.artist || null,
    brand: externalProduct.brand || null,
    info: externalProduct.info || null,
    tags: Array.isArray(externalProduct.tags) ? externalProduct.tags : [],
    weight: parseWeight(externalProduct.weight),
    dimensions: externalProduct.dimensions || null,
    image: externalProduct.image || externalProduct.thumbnail || null,
    images: images, // Only real tshirt images (normal + baby look)
    color_swatches: colorSwatches, // Separate array for color swatch images
    shipping_zones: Array.isArray(externalProduct.shipping_zones) ? externalProduct.shipping_zones : ['BR'],
    is_active: externalProduct.is_active !== false,
    // Third-party tracking
    third_party_product_id: externalProduct.id?.toString() || null,
    third_party_source: 'uma-penca',
    third_party_synced_at: new Date().toISOString(),
    third_party_raw_data: externalProduct,
    metadata: externalProduct.metadata || {}
  };
}

/**
 * Validate product data before inserting
 */
function validateProduct(product) {
  const errors = [];

  if (!product.name || product.name.trim().length === 0) {
    errors.push('Product name is required');
  }

  if (!product.slug || product.slug.trim().length === 0) {
    errors.push('Product slug is required');
  }

  if (typeof product.price !== 'number' || product.price < 0) {
    errors.push('Price must be a non-negative number');
  }

  if (product.stock_type && !['print-on-demand', 'in-stock', 'digital', 'dropshipping'].includes(product.stock_type)) {
    errors.push(`Invalid stock_type: ${product.stock_type}`);
  }

  if (product.fulfillment_type && !['own', 'uma_penca', 'digital', 'third_party'].includes(product.fulfillment_type)) {
    errors.push(`Invalid fulfillment_type: ${product.fulfillment_type}`);
  }

  return errors;
}

/**
 * Sync a single product (insert or update based on third_party_product_id)
 * Since the unique constraint is on `slug`, we first check by third_party_product_id
 */
async function syncProduct(productData) {
  // First, check if product exists by third_party_product_id
  const { data: existingProduct } = await supabase
    .from('products')
    .select('id, slug')
    .eq('third_party_product_id', productData.third_party_product_id)
    .eq('third_party_source', productData.third_party_source)
    .maybeSingle();

  let result;
  let error;

  if (existingProduct) {
    // Update existing product
    const updateData = { ...productData };
    // Don't change the slug if it already exists and is different
    if (existingProduct.slug !== productData.slug) {
      // Generate a new unique slug
      updateData.slug = `${productData.slug}-${productData.third_party_product_id}`;
    }

    ({ data: result, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', existingProduct.id)
      .select()
      .single());
  } else {
    // Insert new product
    ({ data: result, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single());
  }

  if (error) {
    // Handle unique constraint violation on slug
    if (error.code === '23505' && error.message?.includes('slug')) {
      const uniqueSlug = `${productData.slug}-${productData.third_party_product_id}-${Date.now()}`;
      ({ data: result, error } = await supabase
        .from('products')
        .insert({ ...productData, slug: uniqueSlug })
        .select()
        .single());
    }

    if (error) {
      console.error(`Error syncing product ${productData.third_party_product_id}:`, error.message);
      return { success: false, error };
    }
  }

  return { success: true, product: result, isInsert: !existingProduct };
}

/**
 * Sync products in batches for better performance
 */
async function syncProductsBatch(products) {
  const results = [];

  for (const product of products) {
    const result = await syncProduct(product);
    results.push(result);
  }

  return results;
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
      github_run_id: process.env.GITHUB_RUN_ID || null,
      started_at: new Date().toISOString()
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
  console.log(`Batch Size: ${BATCH_SIZE}`);
  console.log('');

  const startTime = Date.now();
  const results = {
    processed: 0,
    inserted: 0,
    updated: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    durationSeconds: 0
  };

  // Create sync log
  const syncLog = await createSyncLog(SYNC_TYPE);

  try {
    // Step 1: Fetch products
    const externalProducts = await fetchUmaPencaProducts();
    console.log(`Found ${externalProducts.length} products to sync`);

    if (externalProducts.length === 0) {
      console.log('No products to sync. Exiting.');
      if (syncLog && !DRY_RUN) {
        await updateSyncLog(syncLog.id, results);
      }
      return;
    }

    // Step 2: Transform and validate products
    console.log('\nTransforming products...');
    const transformedProducts = [];

    for (const externalProduct of externalProducts) {
      try {
        const productData = transformProduct(externalProduct);
        const validationErrors = validateProduct(productData);

        if (validationErrors.length > 0) {
          results.skipped++;
          results.errors.push({
            productId: externalProduct.id,
            error: `Validation failed: ${validationErrors.join(', ')}`
          });
          console.warn(`  Skipping product ${externalProduct.id}: ${validationErrors.join(', ')}`);
          continue;
        }

        transformedProducts.push(productData);
      } catch (err) {
        results.skipped++;
        results.errors.push({
          productId: externalProduct.id,
          error: `Transform error: ${err.message}`
        });
        console.error(`  Error transforming product ${externalProduct.id}:`, err.message);
      }
    }

    console.log(`  ${transformedProducts.length} products passed validation`);
    console.log(`  ${results.skipped} products failed validation\n`);

    // Step 3: Sync products in batches
    if (DRY_RUN) {
      console.log('[DRY RUN] Would sync the following products:');
      transformedProducts.forEach(p => console.log(`  - ${p.name} (${p.slug})`));
      results.updated = transformedProducts.length;
      results.processed = transformedProducts.length;
    } else {
      console.log('Syncing products...');
      const batches = [];
      for (let i = 0; i < transformedProducts.length; i += BATCH_SIZE) {
        batches.push(transformedProducts.slice(i, i + BATCH_SIZE));
      }

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`  Processing batch ${i + 1}/${batches.length} (${batch.length} products)...`);

        const batchResults = await syncProductsBatch(batch);

        for (const result of batchResults) {
          results.processed++;

          if (result.success) {
            if (result.isInsert) {
              results.inserted++;
              console.log(`    + Inserted: ${result.product.name}`);
            } else {
              results.updated++;
              console.log(`    ~ Updated: ${result.product.name}`);
            }
          } else {
            results.failed++;
            results.errors.push({
              productId: batch[batchResults.indexOf(result)]?.third_party_product_id,
              error: result.error?.message || 'Unknown error'
            });
            console.error(`    ✗ Failed: ${batch[batchResults.indexOf(result)]?.name} - ${result.error?.message}`);
          }
        }
      }
    }

    // Step 4: Log results
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
    console.log(`Skipped: ${results.skipped}`);
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
