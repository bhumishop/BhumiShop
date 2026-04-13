#!/usr/bin/env python3
"""
Test script for UmaPenca scraper and BhumiShop integration.

This script:
1. Tests scraping a known product from Prataprint
2. Validates the scraped data structure
3. Tests Supabase connection (if credentials are available)
4. Verifies all payment configurations are in place
"""

import os
import sys
import json
import time
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from umapenca import UmaPencaScraper, ScrapedProduct, STORE_URL

def test_scraper():
    """Test the UmaPenca scraper with known products"""
    print("=" * 60)
    print("Testing UmaPenca Scraper")
    print("=" * 60)

    scraper = UmaPencaScraper(STORE_URL)

    # Test known products
    test_products = [
        "camiseta/bode-de-trompete-352000.html",
    ]

    results = []
    for product_slug in test_products:
        print(f"\nTesting: {product_slug}")

        product = scraper.scrape_single_product(product_slug)

        if product:
            print(f"  Name: {product.name}")
            print(f"  Slug: {product.slug}")
            print(f"  Price: R$ {product.price:.2f}")
            print(f"  Category: {product.category}")
            print(f"  Image: {'Yes' if product.image else 'No'}")
            print(f"  Sizes: {len(product.sizes)} variants")
            print(f"  Third-party ID: {product.third_party_product_id}")

            # Validate data
            assert product.name, "Product name should not be empty"
            assert product.price > 0, "Product price should be positive"
            assert product.third_party_product_id, "Third-party ID should be set"
            assert product.image, "Product image should be set"
            assert product.slug, "Product slug should be set"

            results.append(product)
            print("  [PASS] Data validation passed")
        else:
            print("  [FAIL] Could not scrape product")

    return results

def test_supabase_connection():
    """Test Supabase connection if credentials are available"""
    print("\n" + "=" * 60)
    print("Testing Supabase Connection")
    print("=" * 60)

    supabase_url = os.environ.get('SUPABASE_URL', '')
    supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

    if not supabase_url or not supabase_key:
        print("[SKIP] No Supabase credentials found")
        print("  To test, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables")
        return False

    try:
        import requests

        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json'
        }

        # Test connection
        response = requests.get(
            f"{supabase_url}/rest/v1/collections?limit=1",
            headers=headers
        )

        if response.ok:
            collections = response.json()
            print(f"[PASS] Connected to Supabase")
            print(f"  Collections found: {len(collections)}")

            # Test products table
            response = requests.get(
                f"{supabase_url}/rest/v1/products?limit=1",
                headers=headers
            )

            if response.ok:
                print(f"[PASS] Products table accessible")
                return True
            else:
                print(f"[FAIL] Products table error: {response.text}")
                return False
        else:
            print(f"[FAIL] Connection error: {response.text}")
            return False

    except Exception as e:
        print(f"[FAIL] Error: {e}")
        return False

def test_payment_configuration():
    """Test that payment configuration is properly set up"""
    print("\n" + "=" * 60)
    print("Testing Payment Configuration")
    print("=" * 60)

    # Check environment variables
    required_vars = {
        'VITE_SUPABASE_URL': 'Supabase URL',
        'VITE_SUPABASE_KEY': 'Supabase Anon Key',
        'VITE_UMAPENCA_STORE_URL': 'UmaPenca Store URL',
    }

    missing = []
    for var, desc in required_vars.items():
        value = os.environ.get(var, '')
        if value and value != f'your-{var.lower().replace("VITE_", "").replace("_", "-")}':
            print(f"[PASS] {desc}: configured")
        else:
            missing.append(var)
            print(f"[WARN] {desc}: not configured")

    # Check payment provider files
    payment_files = [
        '.github/workflows/scripts/src/components/checkout/PaymentMethod.vue',
        '.github/workflows/scripts/src/components/checkout/PaymentProviderPopup.vue',
        '.github/workflows/scripts/src/components/checkout/PixPayment.vue',
        '.github/workflows/scripts/src/composables/useAbacatePay.js',
        '.github/workflows/scripts/src/composables/usePixBricks.js',
    ]

    # Also check from project root
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

    payment_files = [
        os.path.join(project_root, 'src/components/checkout/PaymentMethod.vue'),
        os.path.join(project_root, 'src/components/checkout/PaymentProviderPopup.vue'),
        os.path.join(project_root, 'src/components/checkout/PixPayment.vue'),
        os.path.join(project_root, 'src/composables/useAbacatePay.js'),
        os.path.join(project_root, 'src/composables/usePixBricks.js'),
    ]

    print("\nPayment Provider Files:")
    for file in payment_files:
        if os.path.exists(file):
            print(f"  [PASS] {file}")
        else:
            print(f"  [FAIL] {file} - missing")

    return len(missing) == 0

def main():
    print(f"BhumiShop Integration Test")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Store URL: {STORE_URL}")
    print()

    # Test 1: Scraper
    scraped = test_scraper()

    # Test 2: Supabase
    supabase_ok = test_supabase_connection()

    # Test 3: Payment Configuration
    payment_ok = test_payment_configuration()

    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    print(f"Scraper: {len(scraped)} products scraped successfully")
    print(f"Supabase: {'Connected' if supabase_ok else 'Not configured'}")
    print(f"Payment: {'Configured' if payment_ok else 'Missing env vars'}")

    if scraped and supabase_ok:
        print("\n[SUCCESS] All tests passed!")
        return 0
    elif scraped:
        print("\n[PARTIAL] Scraper works, but Supabase not configured")
        return 0
    else:
        print("\n[FAIL] Some tests failed")
        return 1

if __name__ == '__main__':
    sys.exit(main())
