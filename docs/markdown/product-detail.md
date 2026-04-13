# Product Detail - BhumiShop

**URL:** `/produtos/:id`  
**Language:** Available in 8 languages (en, pt-BR, zh, ja, es, th, ne, hi)

---

## Page Overview

Detailed view of a single product with image gallery, variant selection, and add to cart functionality.

---

## Sections

### Breadcrumb Navigation
- Home > Products > [Product Name]
- Clickable links for Home and Products

### Product Gallery
- Main product image display
- Support for base64 encoded images and URLs
- Placeholder for products without images
- Full-width image on mobile

### Product Information
- **Product Name** (main heading)
- **Artist/Author** (if available): "by {artist}"
- **Price:** Displayed in BRL (R$)
- **Stock Badge:**
  - "On demand printing" (blue badge)
  - "In stock" (green badge)

### Description
- Full product description
- Additional information section (if available)

### Variants Selection
- **Size Selector** (when product has sizes)
  - Available sizes: S, M, L, XL (configurable per product)
  - Visual selection with active state
  - Validation: "Please select a size" if not selected before adding to cart

### Quantity Selector
- Decrease/Increase buttons
- Quantity display
- Minimum quantity: 1

### Add to Cart
- Primary action button
- Opens cart drawer on successful add
- Toast notification: "{name} added to cart!"

### Call to Action
- Secondary button: "View Products" - links to `/produtos`

### Not Found State
- Message: "Product not found"
- Shown when product ID doesn't exist

---

## Interactions
- **Size Selection:** Click size button to select
- **Quantity:** +/- buttons to adjust
- **Add to Cart:** Validates size selection, adds item, shows toast
- **Gallery:** Click to view full-size (if implemented)

---

## Product Data Structure
```javascript
{
  id: string,
  name: string,
  description: string,
  price: number,
  category: string,
  image: string,          // base64 or URL
  stock_type: 'on_demand' | 'in_stock',
  sizes: ['S', 'M', 'L', 'XL'],
  artist: string,
  additional_info: string,
  created_at: datetime
}
```

---

## Related Pages
- [Home](./home.md)
- [Products](./products.md)
- [Cart](./cart.md)
