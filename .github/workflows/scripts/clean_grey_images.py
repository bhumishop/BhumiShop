#!/usr/bin/env python3
"""
Clean up grey/empty images from Supabase Storage for t-shirt products.

This script:
1. Lists all images in the product-images bucket using SQL
2. Downloads and checks each image for grey/empty content
3. Deletes grey images for t-shirt products
4. Renames remaining images to maintain sequential ordering (000, 001, 002...)

Usage:
    python clean_grey_images.py [--dry-run] [--product-ids ID1 ID2]
    
Environment Variables:
    SUPABASE_URL              Supabase project URL
    SUPABASE_SERVICE_ROLE_KEY Service role key (storage writes)
"""

import os
import sys
import io
import argparse
import logging
from typing import Optional
from dataclasses import dataclass
from collections import defaultdict

import requests

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("ERROR: Pillow library is required. Install with: pip install Pillow")
    sys.exit(1)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


class SupabaseStorageCleaner:
    """Cleans up grey/empty images from Supabase Storage."""

    def __init__(self, url: str, key: str, bucket: str = "product-images"):
        self.base_url = url.rstrip("/")
        self.key = key
        self.bucket = bucket
        self.storage_url = f"{self.base_url}/storage/v1/object"
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
        }
        self.stats = {
            "total_scanned": 0,
            "tshirt_images": 0,
            "grey_detected": 0,
            "grey_deleted": 0,
            "images_renamed": 0,
            "errors": 0,
        }

    def get_all_images_sql(self) -> list[dict]:
        """Get all images from storage using SQL query."""
        url = f"{self.base_url}/rest/v1/rpc/exec_sql"
        query = f"""
        SELECT name 
        FROM storage.objects 
        WHERE bucket_id = '{self.bucket}'
        ORDER BY name
        """
        
        try:
            # Use the execute_sql endpoint via REST API
            sql_url = f"{self.base_url}/rest/v1/"
            headers = {
                **self.headers,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            # We'll use direct SQL via the MCP-like approach
            # For now, use the storage list API with proper pagination
            return self.get_all_images_storage_api()
        except Exception as e:
            logger.error(f"Error querying SQL: {e}")
            return []

    def get_all_images_storage_api(self) -> list[str]:
        """Get all images using storage API with recursive listing."""
        all_images = []
        
        # First, get all product IDs
        product_folders = self.list_folders("")
        logger.info(f"Found {len(product_folders)} product folders")
        
        # Then get all images from each folder
        for product_id in product_folders:
            objects = self.list_objects(product_id + "/")
            for obj in objects:
                # The API returns names WITHOUT the prefix, so we need to add it back
                name = obj.get('name', '')
                full_path = f"{product_id}/{name}"
                all_images.append(full_path)
        
        logger.info(f"Total images found: {len(all_images)}")
        return all_images

    def list_folders(self, prefix: str = "") -> list[str]:
        """List folders (not files) in the bucket."""
        url = f"{self.base_url}/storage/v1/object/list/{self.bucket}"
        payload = {
            "prefix": prefix,
            "limit": 1000,
            "offset": 0,
            "sortBy": {"column": "name", "order": "asc"},
        }
        
        try:
            resp = requests.post(url, headers=self.headers, json=payload, timeout=30)
            if resp.ok:
                # Filter out files (those with extensions)
                folders = []
                for obj in resp.json():
                    name = obj.get('name', '')
                    # If it doesn't have a file extension pattern, it's a folder
                    if not any(name.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']):
                        folders.append(name)
                return folders
            else:
                logger.error(f"Failed to list folders: {resp.status_code}")
                return []
        except Exception as e:
            logger.error(f"Error listing folders: {e}")
            return []

    def list_objects(self, prefix: str = "") -> list[dict]:
        """List objects with a specific prefix."""
        url = f"{self.base_url}/storage/v1/object/list/{self.bucket}"
        payload = {
            "prefix": prefix,
            "limit": 1000,
            "offset": 0,
            "sortBy": {"column": "name", "order": "asc"},
        }
        
        try:
            resp = requests.post(url, headers=self.headers, json=payload, timeout=30)
            if resp.ok:
                return resp.json()
            else:
                logger.error(f"Failed to list objects: {resp.status_code}")
                return []
        except Exception as e:
            logger.error(f"Error listing objects: {e}")
            return []

    def download_image(self, object_path: str) -> Optional[bytes]:
        """Download an image from storage."""
        url = f"{self.base_url}/storage/v1/object/public/{self.bucket}/{object_path}"
        try:
            resp = requests.get(url, timeout=60)
            if resp.ok:
                return resp.content
            else:
                logger.warning(f"Failed to download {object_path}: {resp.status_code}")
                return None
        except Exception as e:
            logger.warning(f"Error downloading {object_path}: {e}")
            return None

    def is_grey_image(self, img_bytes: bytes) -> bool:
        """Check if an image is grey/empty using improved detection."""
        try:
            img = Image.open(io.BytesIO(img_bytes))
            img = img.convert('RGB')
            
            width, height = img.size
            total_pixels = width * height
            
            if total_pixels == 0:
                return True
            
            # Small images are likely placeholders
            if width < 100 or height < 100:
                return True
            
            pixels = list(img.getdata())
            
            # Strategy 1: Check channel similarity (grey detection)
            r_vals = [p[0] for p in pixels]
            g_vals = [p[1] for p in pixels]
            b_vals = [p[2] for p in pixels]
            
            avg_r = sum(r_vals) / total_pixels
            avg_g = sum(g_vals) / total_pixels
            avg_b = sum(b_vals) / total_pixels
            
            # If RGB channels are very similar, image is grey
            channel_diff = abs(avg_r - avg_g) + abs(avg_g - avg_b) + abs(avg_r - avg_b)
            
            if channel_diff < 25:
                # Check variance - grey placeholders have very low variance
                var_r = sum((x - avg_r) ** 2 for x in r_vals) / total_pixels
                var_g = sum((x - avg_g) ** 2 for x in g_vals) / total_pixels
                var_b = sum((x - avg_b) ** 2 for x in b_vals) / total_pixels
                
                avg_variance = (var_r + var_g + var_b) / 3
                
                if avg_variance < 300:
                    return True
            
            # Strategy 2: Check saturation (convert to HSV)
            hsv_img = img.convert('HSV')
            hsv_pixels = list(hsv_img.getdata())
            s_vals = [p[1] for p in hsv_pixels]  # Saturation channel
            avg_saturation = sum(s_vals) / total_pixels
            
            # Very low saturation = grey image
            if avg_saturation < 15:
                return True
            
            # Strategy 3: Check if most pixels are nearly identical
            if total_pixels > 1000:
                step = max(1, total_pixels // 1000)
                sampled = pixels[::step][:1000]
            else:
                sampled = pixels
            
            unique_colors = set()
            for p in sampled:
                quantized = (p[0] // 8, p[1] // 8, p[2] // 8)
                unique_colors.add(quantized)
            
            # If very few unique colors, likely a placeholder
            if len(unique_colors) < 5:
                return True
            
            return False
            
        except Exception as e:
            logger.warning(f"Error checking image: {e}")
            return False

    def is_tshirt_product(self, product_id: str) -> bool:
        """Check if a product is a t-shirt by querying the database."""
        url = f"{self.base_url}/rest/v1/products"
        params = {
            "third_party_product_id": f"eq.{product_id}",
            "select": "category",
        }
        headers = {**self.headers, "Content-Type": "application/json", "Accept": "application/json"}
        
        try:
            resp = requests.get(url, headers=headers, params=params, timeout=15)
            if resp.ok:
                products = resp.json()
                if products:
                    category = products[0].get("category", "")
                    return category in ("camiseta", "camisetas")
            return False
        except Exception as e:
            logger.warning(f"Error checking product type for {product_id}: {e}")
            return False

    def delete_object(self, object_path: str) -> bool:
        """Delete an object from storage."""
        url = f"{self.base_url}/storage/v1/object/{self.bucket}"
        payload = {"prefixes": [object_path]}
        
        try:
            resp = requests.delete(url, headers=self.headers, json=payload, timeout=30)
            if resp.ok:
                return True
            else:
                logger.error(f"Failed to delete {object_path}: {resp.status_code} {resp.text[:200]}")
                return False
        except Exception as e:
            logger.error(f"Error deleting {object_path}: {e}")
            return False

    def move_object(self, old_path: str, new_path: str) -> bool:
        """Move/rename an object in storage (download + upload + delete)."""
        # Download the image
        img_bytes = self.download_image(old_path)
        if not img_bytes:
            logger.error(f"Failed to download {old_path} for renaming")
            return False
        
        # Upload with new name
        upload_url = f"{self.base_url}/storage/v1/object/{self.bucket}/{new_path}"
        try:
            resp = requests.put(
                upload_url,
                headers={
                    **self.headers,
                    "Content-Type": "image/jpeg",
                    "cache-control": "public, max-age=31536000",
                },
                data=img_bytes,
                timeout=120,
            )
            
            if not resp.ok:
                logger.error(f"Failed to upload {new_path}: {resp.status_code} {resp.text[:200]}")
                return False
            
            # Delete old
            return self.delete_object(old_path)
        except Exception as e:
            logger.error(f"Error moving {old_path} to {new_path}: {e}")
            return False

    def clean_product_images(self, product_id: str, image_paths: list[str], dry_run: bool = False):
        """Clean grey images and rename remaining for a single product."""
        logger.info(f"\nProcessing product {product_id} ({len(image_paths)} images)")
        
        # Check if t-shirt
        is_tshirt = self.is_tshirt_product(product_id)
        if not is_tshirt:
            logger.info(f"  Skipping - not a t-shirt product")
            return
        
        self.stats["tshirt_images"] += len(image_paths)
        
        # Download and check each image
        grey_images = []
        valid_images = []
        
        for path in sorted(image_paths):
            self.stats["total_scanned"] += 1
            
            img_bytes = self.download_image(path)
            if not img_bytes:
                self.stats["errors"] += 1
                continue
            
            is_grey = self.is_grey_image(img_bytes)
            
            if is_grey:
                logger.info(f"  GREY: {path}")
                grey_images.append(path)
                self.stats["grey_detected"] += 1
            else:
                logger.info(f"  VALID: {path}")
                valid_images.append(path)
        
        # Delete grey images
        if grey_images:
            logger.info(f"  Deleting {len(grey_images)} grey image(s)...")
            for path in grey_images:
                if not dry_run:
                    if self.delete_object(path):
                        logger.info(f"    Deleted: {path}")
                        self.stats["grey_deleted"] += 1
                    else:
                        self.stats["errors"] += 1
                else:
                    logger.info(f"    Would delete: {path}")
                    self.stats["grey_deleted"] += 1
        
        # Rename remaining images to sequential order
        if valid_images:
            logger.info(f"  Renaming {len(valid_images)} image(s) to sequential order...")
            for idx, old_path in enumerate(valid_images):
                parts = old_path.split("/")
                filename = parts[1]  # e.g., "007_image.jpg"
                ext = "." + filename.split(".")[-1] if "." in filename else ".jpg"
                new_filename = f"{idx:03d}_image{ext}"
                new_path = f"{product_id}/{new_filename}"
                
                if old_path != new_path:
                    logger.info(f"    {old_path} -> {new_path}")
                    if not dry_run:
                        if self.move_object(old_path, new_path):
                            self.stats["images_renamed"] += 1
                        else:
                            self.stats["errors"] += 1
                    else:
                        self.stats["images_renamed"] += 1

    def run(self, dry_run: bool = False, product_ids: list[str] = None):
        """Main cleanup routine."""
        logger.info("=" * 60)
        logger.info("Supabase Storage Grey Image Cleanup")
        logger.info("=" * 60)
        
        if dry_run:
            logger.info("*** DRY RUN MODE - no changes will be made ***")
        
        # Get all product folders
        product_folders = self.list_folders("")
        logger.info(f"Found {len(product_folders)} product folders")
        
        # Filter to specific products if requested
        if product_ids:
            product_folders = [p for p in product_folders if p in product_ids]
            logger.info(f"Filtered to {len(product_folders)} specific product(s)")
        
        # Process each product
        for product_id in sorted(product_folders):
            try:
                # Get all images for this product
                objects = self.list_objects(product_id + "/")
                # The API returns names WITHOUT the prefix, so we need to add it back
                image_paths = [f"{product_id}/{obj['name']}" for obj in objects]
                
                if not image_paths:
                    continue
                
                self.clean_product_images(product_id, image_paths, dry_run)
            except Exception as e:
                logger.error(f"Error processing product {product_id}: {e}")
                self.stats["errors"] += 1
        
        # Print summary
        logger.info("\n" + "=" * 60)
        logger.info("Cleanup Summary")
        logger.info("=" * 60)
        logger.info(f"  Total images scanned  : {self.stats['total_scanned']}")
        logger.info(f"  T-shirt images        : {self.stats['tshirt_images']}")
        logger.info(f"  Grey images detected  : {self.stats['grey_detected']}")
        logger.info(f"  Grey images deleted   : {self.stats['grey_deleted']}")
        logger.info(f"  Images renamed        : {self.stats['images_renamed']}")
        logger.info(f"  Errors                : {self.stats['errors']}")
        logger.info("=" * 60)
        
        if dry_run:
            logger.info("\n*** This was a DRY RUN. Run without --dry-run to apply changes. ***")


def main():
    parser = argparse.ArgumentParser(
        description="Clean up grey/empty images from Supabase Storage"
    )
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without executing")
    parser.add_argument("--product-ids", nargs="*", help="Specific product IDs to process")
    args = parser.parse_args()

    url = os.environ.get("SUPABASE_URL", "https://rnlsgpauiltzniordpoq.supabase.co")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    bucket = os.environ.get("SUPABASE_STORAGE_BUCKET", "product-images")

    if not key:
        logger.error("SUPABASE_SERVICE_ROLE_KEY environment variable is required")
        sys.exit(1)

    if not HAS_PIL:
        logger.error("Pillow library is required. Install with: pip install Pillow")
        sys.exit(1)

    cleaner = SupabaseStorageCleaner(url, key, bucket)
    cleaner.run(dry_run=args.dry_run, product_ids=args.product_ids)


if __name__ == "__main__":
    main()
