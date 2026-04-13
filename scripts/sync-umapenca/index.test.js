/**
 * Tests for UmaPenca sync script helper functions
 * Run with: npm test -- scripts/sync-umapenca/index.test.js
 */

import { describe, it, expect } from 'vitest';

// Import functions by temporarily mocking the Supabase parts
// We'll test the pure functions that don't require database connection

// Replicate the helper functions for testing (they're pure functions)
function slugify(text) {
  if (!text) return null;
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parsePrice(value) {
  const parsed = parseFloat(value);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

function parseWeight(value) {
  const parsed = parseFloat(value);
  return isNaN(parsed) || parsed <= 0 ? 0.3 : parsed;
}

function transformProduct(externalProduct) {
  const name = externalProduct.name || externalProduct.title || 'Unnamed Product';
  const slug = slugify(name) || `product-${externalProduct.id}`;

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
    images: Array.isArray(externalProduct.images) ? externalProduct.images : [],
    shipping_zones: Array.isArray(externalProduct.shipping_zones) ? externalProduct.shipping_zones : ['BR'],
    is_active: externalProduct.is_active !== false,
    third_party_product_id: externalProduct.id?.toString() || null,
    third_party_source: 'uma-penca',
    third_party_synced_at: new Date().toISOString(),
    third_party_raw_data: externalProduct,
    metadata: externalProduct.metadata || {}
  };
}

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

// Tests
describe('slugify', () => {
  it('should convert normal text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should handle Portuguese characters', () => {
    expect(slugify('Camiseta Algodão Orgânico')).toBe('camiseta-algodao-organico');
  });

  it('should handle special characters', () => {
    expect(slugify('Product #1 @ Store!')).toBe('product-1-store');
  });

  it('should handle multiple spaces and hyphens', () => {
    expect(slugify('Hello   World--Test')).toBe('hello-world-test');
  });

  it('should trim leading/trailing hyphens', () => {
    expect(slugify('-hello world-')).toBe('hello-world');
  });

  it('should return null for empty input', () => {
    expect(slugify('')).toBeNull();
    expect(slugify(null)).toBeNull();
    expect(slugify(undefined)).toBeNull();
  });
});

describe('parsePrice', () => {
  it('should parse valid price', () => {
    expect(parsePrice(79.90)).toBe(79.90);
    expect(parsePrice('45.00')).toBe(45);
  });

  it('should return 0 for negative values', () => {
    expect(parsePrice(-10)).toBe(0);
    expect(parsePrice('-5')).toBe(0);
  });

  it('should return 0 for NaN', () => {
    expect(parsePrice('invalid')).toBe(0);
    expect(parsePrice(null)).toBe(0);
  });

  it('should handle zero price', () => {
    expect(parsePrice(0)).toBe(0);
  });
});

describe('parseWeight', () => {
  it('should parse valid weight', () => {
    expect(parseWeight(0.2)).toBe(0.2);
    expect(parseWeight('0.35')).toBe(0.35);
  });

  it('should return default 0.3 for invalid values', () => {
    expect(parseWeight(-1)).toBe(0.3);
    expect(parseWeight('invalid')).toBe(0.3);
    expect(parseWeight(0)).toBe(0.3);
  });
});

describe('transformProduct', () => {
  it('should transform a complete product', () => {
    const external = {
      id: '123',
      name: 'Test Product',
      description: '<p>Description</p>',
      short_description: 'Short desc',
      price: 99.90,
      compare_at_price: 120.00,
      stock_type: 'print-on-demand',
      weight: 0.5,
      tags: ['tag1', 'tag2'],
      image: 'https://example.com/image.jpg',
      images: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
      artist: 'John Doe',
      is_active: true
    };

    const result = transformProduct(external);

    expect(result.name).toBe('Test Product');
    expect(result.slug).toBe('test-product');
    expect(result.price).toBe(99.90);
    expect(result.compare_at_price).toBe(120);
    expect(result.fulfillment_type).toBe('uma_penca');
    expect(result.third_party_product_id).toBe('123');
    expect(result.third_party_source).toBe('uma-penca');
    expect(result.tags).toEqual(['tag1', 'tag2']);
    expect(result.weight).toBe(0.5);
    expect(result.is_active).toBe(true);
  });

  it('should handle minimal product', () => {
    const external = {
      id: '456',
      name: 'Minimal Product'
    };

    const result = transformProduct(external);

    expect(result.name).toBe('Minimal Product');
    expect(result.slug).toBe('minimal-product');
    expect(result.price).toBe(0);
    expect(result.stock_type).toBe('print-on-demand');
    expect(result.fulfillment_type).toBe('uma_penca');
    expect(result.tags).toEqual([]);
    expect(result.images).toEqual([]);
    expect(result.is_active).toBe(true);
  });

  it('should use title as fallback for name', () => {
    const external = {
      id: '789',
      title: 'Product Title'
    };

    const result = transformProduct(external);

    expect(result.name).toBe('Product Title');
    expect(result.slug).toBe('product-title');
  });

  it('should handle non-array tags', () => {
    const external = {
      id: '101',
      name: 'Test',
      tags: 'not-an-array'
    };

    const result = transformProduct(external);

    expect(result.tags).toEqual([]);
  });

  it('should set third_party_synced_at', () => {
    const external = {
      id: '102',
      name: 'Test'
    };

    const result = transformProduct(external);

    expect(result.third_party_synced_at).toBeDefined();
    expect(new Date(result.third_party_synced_at).getTime()).toBeGreaterThan(0);
  });
});

describe('validateProduct', () => {
  it('should validate a correct product', () => {
    const product = {
      name: 'Valid Product',
      slug: 'valid-product',
      price: 99.90,
      stock_type: 'print-on-demand',
      fulfillment_type: 'uma_penca'
    };

    const errors = validateProduct(product);

    expect(errors).toEqual([]);
  });

  it('should catch missing name', () => {
    const product = {
      name: '',
      slug: 'valid-slug',
      price: 10
    };

    const errors = validateProduct(product);

    expect(errors).toContain('Product name is required');
  });

  it('should catch missing slug', () => {
    const product = {
      name: 'Test',
      slug: null,
      price: 10
    };

    const errors = validateProduct(product);

    expect(errors).toContain('Product slug is required');
  });

  it('should catch invalid price', () => {
    const product = {
      name: 'Test',
      slug: 'test',
      price: -5
    };

    const errors = validateProduct(product);

    expect(errors).toContain('Price must be a non-negative number');
  });

  it('should catch invalid stock_type', () => {
    const product = {
      name: 'Test',
      slug: 'test',
      price: 10,
      stock_type: 'invalid-type'
    };

    const errors = validateProduct(product);

    expect(errors).toContain('Invalid stock_type: invalid-type');
  });

  it('should catch invalid fulfillment_type', () => {
    const product = {
      name: 'Test',
      slug: 'test',
      price: 10,
      fulfillment_type: 'invalid'
    };

    const errors = validateProduct(product);

    expect(errors).toContain('Invalid fulfillment_type: invalid');
  });

  it('should allow valid stock_type values', () => {
    const validTypes = ['print-on-demand', 'in-stock', 'digital', 'dropshipping'];

    for (const type of validTypes) {
      const product = {
        name: 'Test',
        slug: 'test',
        price: 10,
        stock_type: type
      };

      const errors = validateProduct(product);
      expect(errors).not.toContain(`Invalid stock_type: ${type}`);
    }
  });

  it('should allow valid fulfillment_type values', () => {
    const validTypes = ['own', 'uma_penca', 'digital', 'third_party'];

    for (const type of validTypes) {
      const product = {
        name: 'Test',
        slug: 'test',
        price: 10,
        fulfillment_type: type
      };

      const errors = validateProduct(product);
      expect(errors).not.toContain(`Invalid fulfillment_type: ${type}`);
    }
  });
});
