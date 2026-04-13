# Products - BhumiShop | Product Catalog

**URL:** `/produtos`  
**Query Parameters:** `?category={categoryId}&search={query}&page={pageNumber}`  
**Language:** Available in 8 languages (en, pt-BR, zh, ja, es, th, ne, hi)

---

## Page Overview

Browse the complete BhumiShop product catalog with filtering, search, and pagination.

---

## Sections

### Page Header
- **Title:** "Products"
- Dynamic product count display: "{count} product | {count} products"

### Search Bar
- **Placeholder:** "Search products..."
- Real-time search filtering
- Clear search button

### Category Filters
- **Title:** "Categories"
- Filter tabs for all categories:
  - "All categories" (default)
  - Dynamic category list from database
- Active category highlighting
- Horizontal scroll on mobile

### Product Grid
- Responsive grid layout
- Product cards containing:
  - Product image (or placeholder if none)
  - Product name
  - Price in BRL (R$)
  - Stock status badge:
    - "On demand" (impressao sob demanda)
    - "In stock" (em estoque)
  - Quick "Add to Cart" button
  - Click card to view product details

### Pagination
- Previous/Next navigation
- Page number display
- Disabled states for boundaries

### Empty State
- Message: "No products found."
- Appears when filters yield no results

---

## Product Card Interactions
- **Click card:** Navigate to product detail page (`/produtos/:id`)
- **Click "Add":** Add product to cart with toast notification
- **Hover effects:** Card lift and shadow animation

---

## Navigation Links
- Breadcrumb: Home > Products
- Link to Cart (`/carrinho`)
- Link to Home (`/`)

---

## URL Structure
```
/produtos                          - All products
/produtos?category=abc123          - Filtered by category
/produtos?search=shirt             - Search results
/produtos?category=abc123&page=2   - Category + pagination
```

---

## Related Pages
- [Home](./home.md)
- [Product Detail](./product-detail.md)
- [Cart](./cart.md)
