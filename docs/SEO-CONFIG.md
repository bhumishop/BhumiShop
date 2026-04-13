# BhumiShop SEO Configuration Guide

## Overview
This document outlines all SEO configurations implemented for BhumiShop.

---

## Files Created

### 1. `llms.txt`
**Location:** `/public/llms.txt`

Purpose: Provide structured information for AI/LLM crawlers about the site structure, features, and content.

Contains:
- Site description and purpose
- Complete site map with routes
- Feature documentation
- Data structures (Product, Order, User)
- Technical stack information
- Payment integrations
- Internationalization details

### 2. `sitemap.xml`
**Location:** `/public/sitemap.xml`

Purpose: XML sitemap for search engines to discover and index pages.

Includes:
- All public routes (home, products, cart, login)
- Category filter pages
- Language alternates (hreflang) for 8 languages
- Priority levels (1.0 for home, 0.9 for products, etc.)
- Change frequency recommendations
- Last modification dates
- Reference to XSL stylesheet for human-readable view

### 3. `sitemap.xsl`
**Location:** `/public/sitemap.xsl`

Purpose: Transform XML sitemap into a beautiful, human-readable HTML page.

Features:
- Styled table layout
- Priority color coding
- Stats summary
- Responsive design
- Clickable URLs

### 4. `robots.txt`
**Location:** `/public/robots.txt`

Purpose: Instruct crawlers which pages to index and which to avoid.

Rules:
- **Allow:** Public pages (/, /produtos)
- **Disallow:** Private pages (checkout, cart, profile, admin, login)
- **Special rules for:**
  - Google (Googlebot, Googlebot-Image)
  - Bing (Bingbot)
  - AI Crawlers (GPTBot, Claude-Web, CCBot)
  - Social Media (Facebook, Twitter, LinkedIn, WhatsApp)
- Crawl delay: 1 second
- Sitemap location reference

### 5. `index.html` Meta Tags
**Location:** `/index.html`

Enhanced with:

#### Basic Meta Tags
- Charset (UTF-8)
- Viewport (responsive)
- Canonical URL
- Description (optimized for search engines)
- Keywords (relevant terms)
- Author
- Robots directives

#### Mobile & PWA
- Mobile-web-app-capable
- Apple-mobile-web-app-capable
- Apple-mobile-web-app-status-bar-style
- Theme color
- MS application tiles

#### Open Graph (Facebook/LinkedIn)
- og:type (website)
- og:url
- og:title
- og:description
- og:image (with dimensions)
- og:site_name
- og:locale (pt_BR)
- og:locale:alternate (7 languages)

#### Twitter Cards
- twitter:card (summary_large_image)
- twitter:site
- twitter:creator
- twitter:title
- twitter:description
- twitter:image

#### Internationalization
- hreflang links for all 8 languages
- x-default for language detection

#### Structured Data (JSON-LD)
1. **Organization Schema**
   - Name, URL, logo, description
   - Contact information
   - Available languages

2. **WebSite Schema**
   - Name, URL, description
   - SearchAction for site search

3. **OnlineStore Schema**
   - Store type
   - Accepted currencies (BRL)
   - Payment methods
   - Contact point

### 6. `useSEO.js` Composable
**Location:** `/src/composables/useSEO.js`

Purpose: Dynamic meta tag management for Vue components.

Features:
- `updateMetaTags()` - Update all meta tags programmatically
- `updateProductMeta(product)` - Product-specific SEO
- `updateCategoryMeta(category)` - Category-specific SEO
- Route-based SEO configurations
- Structured data injection
- Open Graph and Twitter Card updates

### 7. `.htaccess`
**Location:** `/public/.htaccess`

Purpose: Apache server configuration for SEO and performance.

Includes:
- SPA routing (redirect to index.html)
- HTTPS forcing
- Security headers (X-Frame-Options, X-XSS-Protection, CSP, etc.)
- Compression (gzip/deflate)
- Browser caching (Expires headers)
- MIME types
- Access restrictions for sensitive files

---

## SEO Recommendations

### Immediate Actions
1. **Create OG Image:** Add `/public/images/og-image.png` (1200x630px)
2. **Create Twitter Card Image:** Add `/public/images/twitter-card.png` (1200x600px)
3. **Add Logo:** Add `/public/images/logo.png` for structured data
4. **Update Domain:** Replace `bhumisparshaschool.org` with actual domain

### Short-term Improvements
1. **Implement SSR/SSG:** Consider Nuxt.js or Vite SSR for better crawling
2. **Add Product Images:** Ensure all products have optimized images with alt text
3. **Blog/Content:** Add educational content about Bhumisparsha School
4. **Google Search Console:** Submit sitemap.xml
5. **Google Analytics:** Add tracking code
6. **Social Profiles:** Update `sameAs` in structured data with actual social links

### Medium-term Improvements
1. **Performance Optimization:**
   - Lazy load images
   - Implement code splitting (already done with Vue Router)
   - Optimize bundle size
   - Add service worker for offline support

2. **Content Strategy:**
   - Product descriptions (unique, keyword-rich)
   - Category descriptions
   - About page
   - FAQ section
   - Customer testimonials

3. **Technical SEO:**
   - Implement breadcrumb schema
   - Add FAQ schema
   - Create XML sitemaps for products (if many)
   - Implement canonical tags for filtered views

### Long-term Strategy
1. **Migrate to Nuxt.js** for full SSR support
2. **Implement PWA** for better mobile experience
3. **Add multi-region hosting** for international users
4. **Build backlinks** through partnerships
5. **Monitor Core Web Vitals** and optimize

---

## Meta Tag Priority by Page

### Home Page (Priority: 1.0)
- Full meta tags (already implemented in index.html)
- All structured data
- All social media tags

### Products Page (Priority: 0.9)
- Dynamic title: "Products - BhumiShop"
- Category-specific descriptions
- Breadcrumbs

### Product Detail (Priority: 0.8)
- Product name in title
- Product schema
- Price and availability
- Product images

### Cart/Checkout/Profile (Priority: 0.5-0.7)
- Basic meta tags
- Noindex recommended (user-specific content)

### Admin (Noindex)
- No public indexing needed

---

## Monitoring & Testing Tools

1. **Google Search Console:** Indexing status, search queries
2. **Google Rich Results Test:** Validate structured data
3. **Facebook Sharing Debugger:** Test OG tags
4. **Twitter Card Validator:** Test Twitter cards
5. **Lighthouse:** Performance, SEO, Accessibility audit
6. **Schema Markup Validator:** Validate JSON-LD
7. **Mobile-Friendly Test:** Responsive design check

---

## Language Support

| Language | Code | hreflang | OG Locale |
|----------|------|----------|-----------|
| English | en | en | en_US |
| Portuguese (BR) | pt-BR | pt-BR | pt_BR |
| Chinese | zh | zh | zh_CN |
| Japanese | ja | ja | ja_JP |
| Spanish | es | es | es_ES |
| Thai | th | th | th_TH |
| Nepali | ne | ne | ne_NP |
| Hindi | hi | hi | hi_IN |

---

## Contact
- **Email:** contact@bhumisparshaschool.org
- **Organization:** Bhumisparsha School
