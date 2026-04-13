#!/usr/bin/env python3
"""
Test script for UmaPenca scraper and BhumiShop integration.

This script:
1. Tests scraping products from configured stores (prataprint, bhumisprint)
2. Validates the scraped data structure
3. Tests Supabase connection (if credentials are available)
"""

import os
import sys
import json
from datetime import datetime

# Add parent directory to path so we can import umapenca
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(SCRIPT_DIR))

from umapenca import HtmlExtractor, Client, ProductConverter, ScrapedProduct, STORE_URL

# Store configurations for testing
STORES = {
    "prataprint": {
        "url": "https://prataprint.bhumisparshaschool.org",
        "store_id": "11210",
        "test_product_id": "352000",
    },
    "bhumisprint": {
        "url": "https://umapenca.com/bhumisprint",
        "store_id": "11205",
        "test_product_id": "141327",
    },
}


def test_store_scraper(store_name: str, store_config: dict) -> list:
    """Test scraping a store's product list."""
    print(f"\n{'=' * 60}")
    print(f"Testing store: {store_name}")
    print(f"URL: {store_config['url']}")
    print(f"{'=' * 60}")

    os.environ["UMAPENCA_STORE_URL"] = store_config["url"]
    os.environ["UMAPENCA_STORE_ID"] = store_config["store_id"]

    # Re-import to pick up new env vars
    import importlib
    import umapenca
    importlib.reload(umapenca)

    client = Client(delay=0.3)
    extractor = HtmlExtractor(client)
    raw_products = extractor.fetch_product_list()

    if not raw_products:
        print(f"  [FAIL] No products found for {store_name}")
        return []

    print(f"  Found {len(raw_products)} products")

    # Convert
    slugs = set()
    converter = ProductConverter(slugs)
    products = []
    for raw in raw_products[:5]:  # Test first 5
        try:
            p = converter.convert(raw)
            if p.name:
                products.append(p)
                print(f"  - {p.name} | R${p.price:.2f} | slug={p.slug} | source={p.third_party_source}")

                # Validate
                assert p.name, "Product name should not be empty"
                assert p.price > 0, "Product price should be positive"
                assert p.third_party_product_id, "Third-party ID should be set"
                assert p.slug, "Product slug should be set"
                assert p.third_party_source == store_name, f"Source should be '{store_name}', got '{p.third_party_source}'"
        except Exception as exc:
            print(f"  [WARN] Conversion error: {exc}")

    print(f"  [PASS] {len(products)}/5 products converted and validated")
    return products


def test_supabase_connection():
    """Test Supabase connection if credentials are available"""
    print(f"\n{'=' * 60}")
    print("Testing Supabase Connection")
    print(f"{'=' * 60}")

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

        response = requests.get(
            f"{supabase_url}/rest/v1/collections?limit=1",
            headers=headers
        )

        if response.ok:
            collections = response.json()
            print(f"[PASS] Connected to Supabase")
            print(f"  Collections found: {len(collections)}")

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


def test_products_json_files():
    """Test that generated products.json files are valid."""
    print(f"\n{'=' * 60}")
    print("Testing products.json files")
    print(f"{'=' * 60}")

    base_dir = os.path.dirname(SCRIPT_DIR)
    results = {}

    for store_name in STORES:
        json_path = os.path.join(base_dir, store_name, "products.json")
        if os.path.exists(json_path):
            with open(json_path) as f:
                data = json.load(f)
            total = data.get("total_products", 0)
            store_info = data.get("store", {})
            print(f"  [PASS] {store_name}/products.json — {total} products (store: {store_info.get('name', 'N/A')})")
            results[store_name] = True
        else:
            print(f"  [WARN] {store_name}/products.json not found (run scraper first)")
            results[store_name] = False

    return results


def main():
    print(f"BhumiShop Integration Test")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # Test 1: Store scrapers
    all_products = []
    for store_name, store_config in STORES.items():
        products = test_store_scraper(store_name, store_config)
        all_products.extend(products)

    # Test 2: Supabase
    supabase_ok = test_supabase_connection()

    # Test 3: Products JSON files
    json_results = test_products_json_files()

    # Summary
    print(f"\n{'=' * 60}")
    print("Test Summary")
    print(f"{'=' * 60}")
    print(f"Total products validated: {len(all_products)}")
    print(f"Supabase: {'Connected' if supabase_ok else 'Not configured'}")
    json_ok = sum(1 for v in json_results.values() if v)
    print(f"Products JSON: {json_ok}/{len(json_results)} files valid")

    if all_products:
        print(f"\n[SUCCESS] Scraper working for {len(STORES)} stores")
        return 0
    else:
        print(f"\n[FAIL] No products scraped")
        return 1


if __name__ == '__main__':
    sys.exit(main())
