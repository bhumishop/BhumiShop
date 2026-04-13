#!/usr/bin/env python3
"""
UmaPenca/PrataPrint Product Scraper v3 — HTML-embedded JSON + Supabase Storage

Strategy:
  The PrataPrint store is a SPA. The product list is embedded in the HTML as:
    window.vueInitialData = { "state": "vueProducts", "products": { "hits": [...] } }

  Each product hit contains: id, name, price, type, models (sizes), fabrics (colors),
  images_by_fabric (all gallery images), img_cover, full_link, product_color, etc.

  Product detail pages follow the same pattern but are not needed — the list response
  already has all images, variants, and pricing.

Usage:
    python umapenca.py [--dry-run] [--full] [--output FILE]
    python umapenca.py --dump-images --image-dir ./images
    python umapenca.py --upload-images    # upload to Supabase Storage instead of local
    python umapenca.py --url https://umapenca.com/bhumisprint/ --store-id 11205 --sync-to-db

Arguments:
    --url               Store URL to scrape (overrides UMAPENCA_STORE_URL env)
    --store-id          Numeric store ID (overrides UMAPENCA_STORE_ID env)
    --subcollection     Subcollection slug for DB sync (default: uma-penca)
    --sync-to-db        Sync scraped products to Supabase database

Environment Variables:
    SUPABASE_URL              Supabase project URL
    SUPABASE_SERVICE_ROLE_KEY Service role key (database + storage writes)
    SUPABASE_STORAGE_BUCKET   Storage bucket name (default: product-images)
    UMAPENCA_STORE_URL        Store base URL (default: https://prataprint.bhumisparshaschool.org)
    UMAPENCA_STORE_ID         Numeric store ID (default: 11210)
"""

import os
import re
import sys
import json
import time
import logging
import hashlib
import argparse
import mimetypes
import io
import concurrent.futures
from pathlib import Path
from datetime import datetime, timezone
from dataclasses import dataclass, field, asdict
from typing import Optional
from urllib.parse import urljoin, urlparse, urlunparse, unquote

import requests

try:
    from tqdm import tqdm
    HAS_TQDM = True
except ImportError:
    HAS_TQDM = False

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("scraper_v3.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# Configuration (defaults, overridable via CLI args)
# ─────────────────────────────────────────────

def _parse_cli_overrides():
    """Parse --url and --store-id early so module-level defaults can be overridden."""
    import sys as _sys
    url = None
    store_id = None
    args = _sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--url" and i + 1 < len(args):
            url = args[i + 1]
            i += 2
        elif args[i] == "--store-id" and i + 1 < len(args):
            store_id = args[i + 1]
            i += 2
        else:
            i += 1
    return url, store_id

_cli_url, _cli_store_id = _parse_cli_overrides()

STORE_URL    = (_cli_url or os.environ.get("UMAPENCA_STORE_URL", "https://prataprint.bhumisparshaschool.org")).rstrip("/")
STORE_ID     = (_cli_store_id or os.environ.get("UMAPENCA_STORE_ID", "11210"))
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
STORAGE_BUCKET = os.environ.get("SUPABASE_STORAGE_BUCKET", "product-images")

# Standard UmaPenca care text (Portuguese)
STANDARD_CARE_TEXT = """Detalhes do produto
Camiseta feita com 100% de fibra natural de algodão sustentável.
Estampada com impressão digital
Produto vegano atestado pelo selo "PETA Cruelty Free"

Cuidados com a sua camiseta
Passar do avesso: Nunca passe o ferro diretamente sobre a estampa. Vire a camiseta ao avesso e use o ferro em temperatura média ou baixa.
Use um pano protetor: Se precisar passar a camiseta no lado da estampa, coloque um pano de algodão por cima para evitar o contato direto entre o ferro e a estampa.
Evitar vapor direto: O vapor em excesso pode danificar a estampa, portanto, use com cautela ou opte por uma passadoria a seco."""

REQUEST_DELAY = 0.5   # seconds between individual HTTP calls
MAX_RETRIES   = 3
RETRY_DELAY   = 4     # seconds, multiplied by attempt number
MAX_WORKERS   = 6     # concurrent product detail fetches

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.7",
}

# ─────────────────────────────────────────────
# Data models
# ─────────────────────────────────────────────

@dataclass
class PriceVariant:
    """Size/color variant with its own price and stock"""
    size:           Optional[str]  = None
    color:          Optional[str]  = None
    variant_type:   Optional[str]  = None
    model_id:       Optional[int]  = None
    fabric_id:      Optional[int]  = None
    sku:            Optional[str]  = None
    price:          float          = 0.0
    compare_at_price: Optional[float] = None
    stock_quantity: int            = 0
    is_active:      bool           = True
    image_url:      Optional[str]  = None

@dataclass
class ScrapedProduct:
    # Identity
    name:                   str            = ""
    slug:                   Optional[str]  = None
    description:            Optional[str]  = None
    short_description:      Optional[str]  = None
    category:               Optional[str]  = None
    brand:                  Optional[str]  = None
    artist:                 Optional[str]  = None
    info:                   Optional[str]  = None

    # Pricing (base / lowest variant)
    price:                  float          = 0.0
    compare_at_price:       Optional[float] = None

    # Media — full-resolution URLs
    image:                  Optional[str]  = None    # primary
    images:                 list           = field(default_factory=list)  # all gallery

    # Variants with per-item pricing
    variants:               list           = field(default_factory=list)  # list[PriceVariant]

    # Flat size/material lists
    sizes:                  list           = field(default_factory=list)
    colors:                 list           = field(default_factory=list)
    materials:              list           = field(default_factory=list)
    tags:                   list           = field(default_factory=list)

    # Physical
    weight:                 float          = 0.300

    # Status
    is_active:              bool           = True

    # Third-party tracking
    third_party_product_id: Optional[str]  = None
    third_party_source:     str            = "uma-penca"
    third_party_product_url: Optional[str] = None
    third_party_raw_data:   Optional[dict] = None

    # Local image paths (when downloaded)
    local_image_paths:      list           = field(default_factory=list)
    # Supabase Storage URLs (when uploaded)
    supabase_image_urls:    list           = field(default_factory=list)

    metadata:               dict           = field(default_factory=dict)

@dataclass
class SyncResult:
    processed:        int   = 0
    inserted:         int   = 0
    updated:          int   = 0
    failed:           int   = 0
    images_downloaded: int = 0
    images_uploaded:  int   = 0
    errors:           list  = field(default_factory=list)
    duration_seconds: float = 0.0


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def strip_imgix_transforms(url: str) -> str:
    """Remove imgix query-string transforms for full-resolution originals."""
    if not url:
        return url
    parsed = urlparse(url)
    if "imgix.net" not in parsed.netloc:
        return url
    return urlunparse(parsed._replace(query=""))


def make_slug(name: str, existing: set) -> str:
    """Generate a URL-safe slug, appending a counter to avoid collisions."""
    base = re.sub(r"[^a-z0-9\s-]", "", name.lower())
    base = re.sub(r"\s+", "-", base).strip("-")
    base = re.sub(r"-+", "-", base)
    slug = base
    counter = 2
    while slug in existing:
        slug = f"{base}-{counter}"
        counter += 1
    existing.add(slug)
    return slug


def category_weight(category: str) -> float:
    return {
        "camisetas": 0.200,
        "camiseta":  0.200,
        "canecas":   0.350,
        "caneca":    0.350,
        "posters":   0.100,
        "poster":    0.100,
        "livros":    0.400,
        "livro":     0.400,
        "bolsas":    0.250,
        "bolsa":     0.250,
        "ecobag":    0.150,
        "bottons":   0.050,
    }.get(category or "", 0.300)


def build_description(raw: dict, type_info: dict) -> str:
    """Build a rich product description from the raw data."""
    product_name = raw.get("name", "")
    type_name = type_info.get("name", "")
    observations = type_info.get("observations", "")

    parts = []

    # Standard care text for t-shirts
    if type_info.get("url") == "camiseta":
        parts.append(STANDARD_CARE_TEXT)

    # Add observations if any (from the type — care instructions, shrinkage notes)
    if observations:
        obs = observations.replace(";", "\n")
        parts.append(f"\nInformações adicionais\n{obs}")

    return "\n".join(parts) if parts else None


# ─────────────────────────────────────────────
# HTTP client
# ─────────────────────────────────────────────

class Client:
    """Polite HTTP client with rate limiting and retries."""

    def __init__(self, delay: float = REQUEST_DELAY):
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self._last = 0.0

    def _wait(self):
        elapsed = time.time() - self._last
        if elapsed < self.delay:
            time.sleep(self.delay - elapsed)
        self._last = time.time()

    def get(self, url: str, as_json: bool = False, extra_headers: dict = None) -> Optional[requests.Response]:
        hdrs = {}
        if extra_headers:
            hdrs.update(extra_headers)

        for attempt in range(MAX_RETRIES):
            try:
                self._wait()
                resp = self.session.get(url, timeout=30, headers=hdrs, allow_redirects=True)

                if resp.status_code == 429:
                    wait = int(resp.headers.get("Retry-After", RETRY_DELAY * (attempt + 1)))
                    logger.warning(f"Rate-limited, waiting {wait}s…")
                    time.sleep(wait)
                    continue
                if resp.status_code == 404:
                    return None
                resp.raise_for_status()
                return resp

            except requests.RequestException as exc:
                logger.warning(f"Request failed (attempt {attempt + 1}/{MAX_RETRIES}): {exc}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (attempt + 1))

        logger.error(f"Gave up after {MAX_RETRIES} retries: {url}")
        return None

    def download_binary(self, url: str, dest: Path) -> bool:
        """Download a binary file (image) to dest."""
        try:
            self._wait()
            resp = self.session.get(url, timeout=60, stream=True, allow_redirects=True)
            resp.raise_for_status()
            dest.parent.mkdir(parents=True, exist_ok=True)
            with open(dest, "wb") as fh:
                for chunk in resp.iter_content(chunk_size=65536):
                    fh.write(chunk)
            return True
        except Exception as exc:
            logger.warning(f"Image download failed {url}: {exc}")
            return False

    def download_bytes(self, url: str) -> Optional[bytes]:
        """Download binary content and return as bytes."""
        try:
            self._wait()
            resp = self.session.get(url, timeout=60, stream=True, allow_redirects=True)
            resp.raise_for_status()
            return resp.content
        except Exception as exc:
            logger.warning(f"Image download failed {url}: {exc}")
            return None


# ─────────────────────────────────────────────
# HTML extractor — parses vueInitialData from page source
# ─────────────────────────────────────────────

class HtmlExtractor:
    """Extracts product data from the embedded JSON in the store HTML."""

    VUE_DATA_RE = re.compile(r'window\.vueInitialData\s*=\s*(\{.*?\})\s*;', re.DOTALL)

    def __init__(self, client: Client):
        self.client = client
        # Derive path prefix from STORE_URL
        parsed = urlparse(STORE_URL)
        self.path_prefix = parsed.path.rstrip("/") if parsed.path and parsed.path != "/" else ""

    def fetch_product_list(self) -> list[dict]:
        """Fetch the store page and extract all product hits."""
        # Try multiple entry points relative to the store root
        # STORE_URL already contains the full path e.g. https://umapenca.com/bhumisprint
        pfx = self.path_prefix  # e.g. /bhumisprint or ""
        paths = [f"{pfx}/loja", f"{pfx}/", "/loja", "/"]
        seen = set()
        for path in paths:
            if path in seen:
                continue
            seen.add(path)
            # Build full URL: STORE_URL is the base, path is relative to store root
            if path.startswith("/"):
                # Replace the prefix in the base URL with the target path
                base = f"{urlparse(STORE_URL).scheme}://{urlparse(STORE_URL).netloc}"
                url = f"{base}{path}"
            else:
                url = f"{STORE_URL}/{path}"
            logger.info(f"Fetching {url}")
            resp = self.client.get(url)
            if not resp:
                continue

            data = self._extract_vue_data(resp.text)
            if data:
                products = data.get("products", {})
                hits = products.get("hits", [])
                if hits:
                    total = products.get("totalHits", len(hits))
                    logger.info(f"Found {total} products from {url}")
                    return hits

        logger.warning("Could not extract product list from any page")
        return []

    def fetch_product_detail(self, product_id: str) -> Optional[dict]:
        """Fetch a single product detail page and extract its data."""
        # We need the full URL pattern — try to find it from the list first
        # If we already know the slug, construct the URL
        url = f"{STORE_URL}/produto/{product_id}.html"
        resp = self.client.get(url)
        if not resp:
            return None

        data = self._extract_vue_data(resp.text)
        if data:
            # Detail page may have a single product in products.hits
            products = data.get("products", {})
            hits = products.get("hits", [])
            if hits:
                return hits[0]

            # Or the product may be in a different key
            for key in ("product", "item", "currentProduct"):
                if key in data:
                    return data[key]

        return None

    def _extract_vue_data(self, html: str) -> Optional[dict]:
        """Extract and parse window.vueInitialData from HTML."""
        match = self.VUE_DATA_RE.search(html)
        if not match:
            return None

        json_str = match.group(1)
        # Fix potential trailing issues
        json_str = json_str.strip()
        if json_str.endswith("},"):
            json_str = json_str[:-1]

        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            # Try to find the products section more aggressively
            return self._brute_force_extract(html)

    def _brute_force_extract(self, html: str) -> Optional[dict]:
        """Fallback: find JSON block containing 'totalHits' and 'hits'."""
        # Find the products JSON block
        start = html.find('"products"')
        if start == -1:
            return None

        # Find the enclosing vueInitialData object
        obj_start = html.rfind('{', 0, start)
        if obj_start == -1:
            return None

        # Try parsing progressively larger chunks
        depth = 0
        in_string = False
        escape_next = False
        for i in range(obj_start, len(html)):
            ch = html[i]
            if escape_next:
                escape_next = False
                continue
            if ch == '\\':
                escape_next = True
                continue
            if ch == '"' and not escape_next:
                in_string = not in_string
                continue
            if in_string:
                continue
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    candidate = html[obj_start:i+1]
                    try:
                        return json.loads(candidate)
                    except json.JSONDecodeError:
                        pass
                    break

        return None


# ─────────────────────────────────────────────
# Raw data → ScrapedProduct converter
# ─────────────────────────────────────────────

class ProductConverter:
    """Converts raw Chicorei/PrataPrint API dicts to ScrapedProduct."""

    def __init__(self, existing_slugs: set, store_tag: str = None):
        self.existing_slugs = existing_slugs
        # Derive source tag from STORE_URL if not provided
        self.store_tag = store_tag or (STORE_URL.split("//")[-1].split(".")[0] if "//" in STORE_URL else "uma-penca")
        # Normalize: use hostname prefix
        from urllib.parse import urlparse
        parsed = urlparse(STORE_URL)
        hostname = parsed.hostname or ""
        # e.g. prataprint.bhumisparshaschool.org -> prataprint
        # umapenca.com/bhumisprint -> use URL path
        if "umapenca.com" in hostname:
            path_parts = [p for p in parsed.path.strip("/").split("/") if p]
            self.store_tag = path_parts[0] if path_parts else "bhumisprint"
        else:
            self.store_tag = hostname.split(".")[0] if hostname else "uma-penca"

    def convert(self, raw: dict) -> ScrapedProduct:
        p = ScrapedProduct()

        # ── Identity ──────────────────────────────────────────
        p.name = raw.get("name", "").strip()
        pid = raw.get("id")
        p.third_party_product_id = str(pid) if pid else None

        type_info = raw.get("type", {}) or {}
        type_url = type_info.get("url", "")
        type_name = type_info.get("name", "")
        type_plural = type_info.get("plural", "")
        observations = type_info.get("observations", "")

        p.category = type_url if type_url else None

        # Brand/store
        store = raw.get("store", {}) or {}
        p.brand = store.get("name", "Prata Print")

        # ── Pricing ───────────────────────────────────────────
        price = raw.get("price", 0) or 0
        price_old = raw.get("price_old", 0) or 0
        p.price = float(price) if price else 0.0
        p.compare_at_price = float(price_old) if price_old and price_old > price else None

        # ── Models (sizes) ───────────────────────────────────
        models = raw.get("models", []) or []
        size_map = {}  # model_id -> model info
        for m in models:
            mid = m.get("id")
            mname = m.get("name", "")
            murl = m.get("url", "")
            gender = m.get("gender", "")
            if mid:
                size_map[mid] = m
            if mname and mname not in p.sizes:
                p.sizes.append(mname)

        # ── Fabrics (colors) ──────────────────────────────────
        fabrics = raw.get("fabrics", []) or []
        fabric_map = {}  # fabric_id -> fabric info
        for f in fabrics:
            fid = f.get("id")
            fname = f.get("product_color_name", f.get("name", ""))
            if fid:
                fabric_map[fid] = f
            if fname and fname not in p.colors:
                p.colors.append(fname)

        # ── Images ────────────────────────────────────────────
        # Collect ALL unique image URLs from images_by_fabric
        images_by_fabric = raw.get("images_by_fabric", []) or []
        all_image_urls = []
        seen_img_urls = set()

        for img_entry in images_by_fabric:
            img_url = img_entry.get("url", "")
            if img_url:
                clean_url = strip_imgix_transforms(img_url)
                if clean_url not in seen_img_urls:
                    seen_img_urls.add(clean_url)
                    all_image_urls.append(clean_url)

        # Fallback to individual image fields
        for img_key in ("img_cover", "img_male", "img_female", "img_thumb_png", "img_thumb"):
            img = raw.get(img_key)
            if img and isinstance(img, str):
                clean_url = strip_imgix_transforms(img)
                if clean_url not in seen_img_urls:
                    seen_img_urls.add(clean_url)
                    all_image_urls.append(clean_url)

        p.images = all_image_urls
        # Primary image: prefer img_cover (male model) or first available
        img_cover = raw.get("img_cover")
        if img_cover:
            p.image = strip_imgix_transforms(img_cover)
        elif all_image_urls:
            p.image = all_image_urls[0]

        # ── Variants ──────────────────────────────────────────
        # Build variants from model × fabric combinations
        for img_entry in images_by_fabric:
            model_id = img_entry.get("product_model_id")
            fabric_id = img_entry.get("fabric_id")
            gender = img_entry.get("gender")
            color_id = img_entry.get("color_id")
            img_url = img_entry.get("url", "")

            # Only create variants for specific model+fabric combos (not null/generic)
            if model_id is None and fabric_id is None:
                continue

            model_info = size_map.get(model_id, {}) if model_id else {}
            fabric_info = fabric_map.get(fabric_id, {}) if fabric_id else {}

            size_name = model_info.get("name")
            color_name = fabric_info.get("product_color_name", fabric_info.get("name", ""))
            variant_type = type_name if type_name else None

            # Build SKU-like identifier
            sku_parts = [str(pid) if pid else ""]
            if model_info.get("url"):
                sku_parts.append(model_info["url"])
            if fabric_info.get("id"):
                sku_parts.append(f"F{fabric_info['id']}")
            sku = "-".join(sku_parts) if any(sku_parts) else None

            v = PriceVariant(
                size=size_name,
                color=color_name if color_name else None,
                variant_type=variant_type,
                model_id=model_id,
                fabric_id=fabric_id,
                sku=sku,
                price=p.price,
                compare_at_price=p.compare_at_price,
                stock_quantity=0,
                is_active=raw.get("in_stock", True),
                image_url=strip_imgix_transforms(img_url) if img_url else None,
            )
            p.variants.append(asdict(v))

        # If no variants were created (e.g., no models or no images_by_fabric),
        # create a single default variant
        if not p.variants:
            v = PriceVariant(
                size=None,
                color=raw.get("product_color", {}).get("name") if raw.get("product_color") else None,
                variant_type=type_name if type_name else None,
                price=p.price,
                compare_at_price=p.compare_at_price,
                stock_quantity=0,
                is_active=raw.get("in_stock", True),
            )
            p.variants.append(asdict(v))

        # ── Materials ─────────────────────────────────────────
        # For t-shirts, use standard material
        if type_url == "camiseta":
            p.materials = ["100% algodão"]
        elif type_url == "caneca":
            p.materials = ["Cerâmica"]
        elif type_url == "poster":
            p.materials = ["Papel couché 170g"]
        elif type_url == "ecobag":
            p.materials = ["100% algodão cru"]
        elif type_url == "bottons":
            p.materials = ["Metal laminado"]

        # ── Tags ──────────────────────────────────────────────
        p.tags = [self.store_tag, "dropshipping"]
        if type_url:
            p.tags.append(type_url)
        if type_name and type_name not in p.tags:
            p.tags.append(type_name.lower())

        # ── Description ───────────────────────────────────────
        p.description = build_description(raw, type_info)
        p.short_description = f"{type_name} '{p.name}' — {p.brand}" if p.name else None

        # ── Weight ───────────────────────────────────────────
        p.weight = category_weight(type_url)

        # ── Slug ─────────────────────────────────────────────
        clean_name = (
            p.name
            .replace(" - Prata Print", "")
            .replace(" - Uma Penca", "")
            .replace("-", " ")  # re-normalize
            .strip()
        )
        p.slug = make_slug(clean_name, self.existing_slugs)

        # ── URLs ─────────────────────────────────────────────
        full_link = raw.get("full_link", "")
        if full_link and not full_link.startswith("http"):
            full_link = f"{STORE_URL}{full_link}"
        p.third_party_product_url = full_link if full_link else None

        # ── Status ───────────────────────────────────────────
        p.is_active = raw.get("in_stock", True)

        # ── Metadata ─────────────────────────────────────────
        p.metadata = {
            "fulfillment_type": "uma_penca",
            "external_store": self.store_tag,
            "product_type": type_name,
            "product_type_url": type_url,
            "is_new": raw.get("is_new", False),
            "is_clothing": raw.get("is_clothing", False),
            "virtual_stock": raw.get("virtual_stock", False),
        }

        # ── Raw data ─────────────────────────────────────────
        p.third_party_raw_data = {
            "scraped_at": datetime.now(timezone.utc).isoformat(),
            "store_id": int(STORE_ID),
            "store_name": p.brand,
            "raw": raw,
        }

        # ── Third party source ───────────────────────────────
        p.third_party_source = self.store_tag

        return p


# ─────────────────────────────────────────────
# Image downloader
# ─────────────────────────────────────────────

class ImageDownloader:
    """Downloads all product images at full resolution to local disk."""

    def __init__(self, client: Client, image_dir: Path):
        self.client = client
        self.image_dir = image_dir
        self.image_dir.mkdir(parents=True, exist_ok=True)
        self.downloaded = 0

    def _dest_path(self, url: str, product_id: str, index: int) -> Path:
        parsed = urlparse(url)
        filename = Path(unquote(parsed.path)).name
        if not filename or "." not in filename:
            url_hash = hashlib.md5(url.encode()).hexdigest()[:12]
            ext = mimetypes.guess_type(url)[0]
            ext = mimetypes.guess_extension(ext) if ext else ".jpg"
            filename = f"{url_hash}{ext}"
        # Prefix with index for ordering
        return self.image_dir / product_id / f"{index:03d}_{filename}"

    def download_product(self, product: ScrapedProduct) -> list[str]:
        """Download all images for a product. Returns list of local paths."""
        pid = product.third_party_product_id or product.slug or "unknown"
        local_paths = []
        for idx, url in enumerate(product.images):
            dest = self._dest_path(url, pid, idx)
            if dest.exists():
                local_paths.append(str(dest))
                continue
            ok = self.client.download_binary(url, dest)
            if ok:
                local_paths.append(str(dest))
                self.downloaded += 1
        product.local_image_paths = local_paths
        return local_paths

    def download_all(self, products: list[ScrapedProduct], workers: int = 2) -> dict:
        """Parallel image downloads. Returns {product_id: [local_paths]}."""
        results = {}
        with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
            future_map = {
                pool.submit(self.download_product, p): (p.third_party_product_id or p.slug)
                for p in products if p.images
            }
            iterator = concurrent.futures.as_completed(future_map)
            if HAS_TQDM:
                iterator = tqdm(iterator, total=len(future_map), desc="Downloading images")
            for fut in iterator:
                pid = future_map[fut]
                results[pid] = fut.result()
        return results


# ─────────────────────────────────────────────
# Supabase Storage uploader
# ─────────────────────────────────────────────

class SupabaseStorageUploader:
    """Uploads images to Supabase Storage and returns public URLs."""

    def __init__(self, url: str, key: str, bucket: str = STORAGE_BUCKET):
        self.base_url = url.rstrip("/")
        self.key = key
        self.bucket = bucket
        self.storage_url = f"{self.base_url}/storage/v1/object"
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
        }
        self.uploaded = 0

    def ensure_bucket(self):
        """Check if bucket exists, create if needed."""
        # List buckets
        resp = requests.get(
            f"{self.base_url}/storage/v1/bucket",
            headers=self.headers,
            timeout=15,
        )
        if not resp.ok:
            return

    def upload_file(self, file_bytes: bytes, object_path: str, content_type: str = "image/jpeg") -> Optional[str]:
        """Upload a file to Supabase Storage. Returns public URL or None."""
        url = f"{self.storage_url}/{self.bucket}/{object_path}"
        resp = requests.put(
            url,
            headers={
                **self.headers,
                "Content-Type": content_type,
                "cache-control": "public, max-age=31536000",
            },
            data=file_bytes,
            timeout=120,
        )
        if resp.ok:
            self.uploaded += 1
            # Return the public URL
            return f"{self.base_url}/storage/v1/object/public/{self.bucket}/{object_path}"
        else:
            logger.warning(f"Storage upload failed for {object_path}: {resp.status_code} {resp.text[:200]}")
            return None

    def upload_product_images(self, product: ScrapedProduct, client: Client) -> list[str]:
        """Download and upload all images for a product to Supabase Storage."""
        pid = product.third_party_product_id or product.slug or "unknown"
        uploaded_urls = []

        for idx, url in enumerate(product.images):
            # Download image bytes
            img_bytes = client.download_bytes(url)
            if not img_bytes:
                continue

            # Determine content type
            content_type = mimetypes.guess_type(url)[0] or "image/jpeg"
            ext = mimetypes.guess_extension(content_type) or ".jpg"

            # Build object path
            object_path = f"{pid}/{idx:03d}_image{ext}"

            # Upload
            public_url = self.upload_file(img_bytes, object_path, content_type)
            if public_url:
                uploaded_urls.append(public_url)

        product.supabase_image_urls = uploaded_urls
        return uploaded_urls

    def upload_all(self, products: list[ScrapedProduct], client: Client, workers: int = 2) -> dict:
        """Parallel upload of all product images to Supabase Storage."""
        results = {}

        def _upload_product(p):
            return self.upload_product_images(p, client)

        with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
            future_map = {
                pool.submit(_upload_product, p): (p.third_party_product_id or p.slug)
                for p in products if p.images
            }
            iterator = concurrent.futures.as_completed(future_map)
            if HAS_TQDM:
                iterator = tqdm(iterator, total=len(future_map), desc="Uploading to Supabase Storage")
            for fut in iterator:
                pid = future_map[fut]
                results[pid] = fut.result()
        return results


# ─────────────────────────────────────────────
# Supabase Database sync
# ─────────────────────────────────────────────

class SupabaseSync:

    def __init__(self, url: str, key: str, subcollection_slug: str = "uma-penca"):
        self.base = f"{url.rstrip('/')}/rest/v1"
        self.hdrs = {
            "apikey":        key,
            "Authorization": f"Bearer {key}",
            "Content-Type":  "application/json",
            "Prefer":        "return=representation",
        }
        self.subcollection_slug = subcollection_slug

    def _get(self, path: str) -> list:
        resp = requests.get(f"{self.base}/{path}", headers=self.hdrs, timeout=15)
        return resp.json() if resp.ok else []

    def _post(self, path: str, payload) -> requests.Response:
        return requests.post(f"{self.base}/{path}", headers=self.hdrs, json=payload, timeout=30)

    def _patch(self, path: str, payload: dict) -> requests.Response:
        return requests.patch(f"{self.base}/{path}", headers=self.hdrs, json=payload, timeout=30)

    def get_collection_id(self, slug: str = "bhumi-print") -> Optional[str]:
        rows = self._get(f"collections?slug=eq.{slug}")
        return rows[0]["id"] if rows else None

    def get_subcollection_id(self, slug: str = None) -> Optional[str]:
        target = slug or self.subcollection_slug
        rows = self._get(f"subcollections?slug=eq.{target}")
        return rows[0]["id"] if rows else None

    def existing_product(self, third_party_id: str) -> Optional[dict]:
        if not third_party_id:
            return None
        rows = self._get(
            f"products?third_party_product_id=eq.{third_party_id}"
            f"&third_party_source=eq.uma-penca&select=id,slug"
        )
        return rows[0] if rows else None

    def upsert_product(
        self,
        product: ScrapedProduct,
        collection_id: Optional[str],
        subcollection_id: Optional[str],
    ) -> dict:
        # Use Supabase Storage URLs if available, otherwise fall back to original URLs
        image = product.supabase_image_urls[0] if product.supabase_image_urls else product.image
        images = product.supabase_image_urls if product.supabase_image_urls else product.images

        payload = {
            "name":               product.name,
            "slug":               product.slug,
            "description":        product.description,
            "short_description":  product.short_description,
            "category":           product.category,
            "collection_id":      collection_id,
            "subcollection_id":   subcollection_id,
            "price":              product.price,
            "compare_at_price":   product.compare_at_price,
            "stock_type":         "dropshipping",
            "fulfillment_type":   "uma_penca",
            "artist":             product.artist,
            "brand":              product.brand,
            "info":               product.info,
            "materials":          product.materials,
            "tags":               product.tags,
            "weight":             product.weight,
            "image":              image,
            "images":             images,
            "shipping_zones":     ["BR"],
            "is_active":          product.is_active,
            "is_featured":        False,
            "is_archived":        False,
            "third_party_product_id":  product.third_party_product_id,
            "third_party_source":      product.third_party_source,
            "third_party_product_url": product.third_party_product_url,
            "third_party_synced_at":   datetime.now(timezone.utc).isoformat(),
            "third_party_raw_data":    product.third_party_raw_data,
            "metadata":                product.metadata,
        }

        existing = self.existing_product(product.third_party_product_id or "")
        if existing:
            resp = self._patch(f"products?id=eq.{existing['id']}", payload)
            action = "updated"
        else:
            resp = self._post("products", payload)
            action = "inserted"

        if resp.ok:
            data = resp.json()
            return {"success": True, "action": action, "data": data}
        return {"success": False, "action": action, "error": resp.text}

    def upsert_variants(self, product_id: str, variants: list) -> None:
        """Delete existing variants then re-insert fresh ones."""
        requests.delete(
            f"{self.base}/product_variants?product_id=eq.{product_id}",
            headers=self.hdrs,
            timeout=15,
        )
        for v in variants:
            v_payload = {
                "product_id": product_id,
                "size": v.get("size"),
                "color": v.get("color"),
                "variant_type": v.get("variant_type"),
                "price_override": v.get("price") if v.get("price") else None,
                "compare_at_price_override": v.get("compare_at_price"),
                "sku": v.get("sku"),
                "stock_quantity": v.get("stock_quantity", 0),
                "is_active": v.get("is_active", True),
                "image_url": v.get("image_url"),
            }
            # Remove None values
            v_payload = {k: v for k, v in v_payload.items() if v is not None}
            self._post("product_variants", v_payload)

    def log_sync(self, sync_type: str, result: SyncResult):
        self._post("third_party_sync_log", {
            "source":          "uma-penca",
            "sync_type":       sync_type,
            "status":          "failed" if result.failed and not result.inserted else "success",
            "items_processed": result.processed,
            "items_inserted":  result.inserted,
            "items_updated":   result.updated,
            "items_failed":    result.failed,
            "errors":          result.errors[:20],
            "completed_at":    datetime.now(timezone.utc).isoformat(),
            "duration_seconds": result.duration_seconds,
            "triggered_by":    "python-scraper-v3",
        })


# ─────────────────────────────────────────────
# Products.json generator — outputs a full products file for CI
# ─────────────────────────────────────────────

def generate_products_json(products: list[ScrapedProduct], output_path: str, image_map: dict = None):
    """Generate a complete products.json with all data for CI pipeline."""
    # Derive store name from URL
    from urllib.parse import urlparse
    parsed = urlparse(STORE_URL)
    hostname = parsed.hostname or "store"
    if "umapenca.com" in hostname:
        path_parts = [p for p in parsed.path.strip("/").split("/") if p]
        store_name = path_parts[0].title().replace("-", " ") if path_parts else "Store"
    else:
        store_name = hostname.split(".")[0].title() if hostname else "Store"

    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "store": {
            "url": STORE_URL,
            "id": int(STORE_ID),
            "name": store_name,
        },
        "total_products": len(products),
        "products": [],
    }

    for p in products:
        product_dict = asdict(p)
        # Add Supabase image URLs if available
        if image_map and p.third_party_product_id:
            product_dict["uploaded_images"] = image_map.get(p.third_party_product_id, [])
        output["products"].append(product_dict)

    with open(output_path, "w", encoding="utf-8") as fh:
        json.dump(output, fh, indent=2, ensure_ascii=False)
    logger.info(f"Products JSON saved → {output_path} ({len(products)} products)")
    return output_path


# ─────────────────────────────────────────────
# Orchestrator
# ─────────────────────────────────────────────

def run(args) -> SyncResult:
    start = time.time()
    result = SyncResult()
    client = Client(delay=REQUEST_DELAY)

    # ── 1. Discover + fetch raw product data ──────────────────

    extractor = HtmlExtractor(client)
    raw_products = []

    if args.product_id:
        logger.info(f"Fetching single product ID: {args.product_id}")
        detail = extractor.fetch_product_detail(args.product_id)
        if detail:
            raw_products = [detail]
        else:
            logger.error(f"Could not fetch product {args.product_id}")
    else:
        raw_products = extractor.fetch_product_list()

    if not raw_products:
        logger.error("No product data found. The store HTML structure may have changed.")
        sys.exit(1)

    logger.info(f"Total raw products: {len(raw_products)}")

    # ── 2. Convert to ScrapedProduct ─────────────────────────

    slugs = set()
    converter = ProductConverter(slugs)
    products = []
    for raw in raw_products:
        try:
            p = converter.convert(raw)
            if p.name:
                products.append(p)
        except Exception as exc:
            pid = raw.get("id", "?")
            logger.warning(f"Conversion error for product {pid}: {exc}")

    logger.info(f"Converted {len(products)} products")

    # ── 3. Save raw JSON ─────────────────────────────────────

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = args.output or f"scraped_products_{ts}.json"

    # ── 4. Download images ────────────────────────────────────

    image_map_local = {}
    if args.dump_images:
        image_dir = Path(args.image_dir)
        downloader = ImageDownloader(client, image_dir)
        logger.info(f"Downloading all images to {image_dir}/")
        image_map_local = downloader.download_all(products, workers=2)
        result.images_downloaded = downloader.downloaded
        map_file = f"image_map_{ts}.json"
        with open(map_file, "w") as fh:
            json.dump(image_map_local, fh, indent=2)
        logger.info(f"Image map saved → {map_file}")

    # ── 5. Upload images to Supabase Storage ──────────────────

    image_map_storage = {}
    if args.upload_images and SUPABASE_URL and SUPABASE_KEY:
        uploader = SupabaseStorageUploader(SUPABASE_URL, SUPABASE_KEY, STORAGE_BUCKET)
        logger.info(f"Uploading all images to Supabase Storage bucket: {STORAGE_BUCKET}")
        image_map_storage = uploader.upload_all(products, client, workers=2)
        result.images_uploaded = uploader.uploaded

        # Update product image URLs to point to Supabase Storage
        for p in products:
            if p.supabase_image_urls:
                p.image = p.supabase_image_urls[0]
                p.images = p.supabase_image_urls

    # ── 6. Generate products.json ─────────────────────────────

    generate_products_json(products, output_file, image_map_storage)

    # ── 7. Sync to Supabase Database ──────────────────────────

    should_sync_db = args.sync_to_db and not args.dry_run and (SUPABASE_URL and SUPABASE_KEY)

    if should_sync_db:
        subcollection_slug = getattr(args, 'subcollection', 'uma-penca') or 'uma-penca'
        supabase = SupabaseSync(SUPABASE_URL, SUPABASE_KEY, subcollection_slug)
        collection_id = supabase.get_collection_id("bhumi-print")
        subcollection_id = supabase.get_subcollection_id()

        for p in products:
            result.processed += 1
            try:
                sr = supabase.upsert_product(p, collection_id, subcollection_id)
                if sr["success"]:
                    if sr["action"] == "inserted":
                        result.inserted += 1
                    else:
                        result.updated += 1

                    # Upsert variants
                    if p.variants and sr.get("data"):
                        product_db_id = sr["data"][0]["id"]
                        supabase.upsert_variants(product_db_id, p.variants)

                    logger.info(f"{sr['action'].capitalize()}: {p.name}")
                else:
                    result.failed += 1
                    err = f"{p.name}: {sr.get('error', '?')}"
                    result.errors.append(err)
                    logger.error(err)

            except Exception as exc:
                result.failed += 1
                result.errors.append(f"{p.name}: {exc}")
                logger.error(f"Sync error for {p.name}: {exc}")

        result.duration_seconds = time.time() - start
        supabase.log_sync("full" if args.full else "incremental", result)
    elif args.dry_run:
        logger.info("Dry run — skipping DB sync")
    elif not (SUPABASE_URL and SUPABASE_KEY):
        logger.warning("No Supabase credentials — skipping DB sync")
    elif not args.sync_to_db:
        logger.info("No --sync-to-db flag — skipping DB sync (use --output to save JSON)")

    result.duration_seconds = time.time() - start

    # ── 8. Summary ───────────────────────────────────────────

    print("\n" + "=" * 52)
    print("Sync summary")
    print("=" * 52)
    print(f"  Discovered      : {len(raw_products)}")
    print(f"  Converted       : {len(products)}")
    print(f"  Inserted        : {result.inserted}")
    print(f"  Updated         : {result.updated}")
    print(f"  Failed          : {result.failed}")
    print(f"  Images downloaded: {result.images_downloaded}")
    print(f"  Images uploaded : {result.images_uploaded}")
    print(f"  Duration        : {result.duration_seconds:.1f}s")
    if result.errors:
        print(f"\n  Errors ({len(result.errors)}):")
        for e in result.errors[:5]:
            print(f"    – {e}")

    return result


# ─────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="UmaPenca/PrataPrint Scraper v3 — HTML-embedded JSON + Supabase Storage"
    )
    parser.add_argument("--dry-run",      action="store_true", help="Scrape but skip DB write")
    parser.add_argument("--full",         action="store_true", help="Full sync (all products)")
    parser.add_argument("--product-id",   help="Fetch a single product by numeric ID")
    parser.add_argument("--output",       help="Output JSON file")
    parser.add_argument("--dump-images",  action="store_true", help="Download all images locally")
    parser.add_argument("--upload-images", action="store_true", help="Upload images to Supabase Storage")
    parser.add_argument("--image-dir",    default="./images",  help="Directory for downloaded images")
    parser.add_argument("--storage-bucket", default=None,      help="Supabase Storage bucket name")
    parser.add_argument("--url",          default=None,        help="Store URL to scrape (overrides env)")
    parser.add_argument("--store-id",     default=None,        help="Store numeric ID (overrides env)")
    parser.add_argument("--subcollection", default="uma-penca", help="Subcollection slug for DB sync")
    parser.add_argument("--sync-to-db",   action="store_true", help="Sync scraped products to Supabase DB")
    args = parser.parse_args()

    if args.storage_bucket:
        global STORAGE_BUCKET
        STORAGE_BUCKET = args.storage_bucket

    # Apply CLI url/store-id overrides to globals
    if args.url:
        global STORE_URL
        STORE_URL = args.url.rstrip("/")
    if args.store_id:
        global STORE_ID
        STORE_ID = args.store_id

    logger.info(f"Store: {STORE_URL} (ID {STORE_ID})")
    logger.info(f"Supabase Storage bucket: {STORAGE_BUCKET}")
    logger.info(f"Dry run: {args.dry_run}")
    logger.info(f"Dump images: {args.dump_images}")
    logger.info(f"Upload images: {args.upload_images}")
    logger.info(f"Sync to DB: {args.sync_to_db}")

    result = run(args)
    sys.exit(1 if result.failed and not result.inserted else 0)


if __name__ == "__main__":
    main()
