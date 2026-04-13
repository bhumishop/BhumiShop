# Home - BhumiShop | Bhumisparsha School Virtual Store

**URL:** `/`  
**Language:** Available in 8 languages (en, pt-BR, zh, ja, es, th, ne, hi)

---

## Page Overview

The landing page of BhumiShop, the official virtual store of Bhumisparsha School. Features an immersive hero section, product categories, and featured products showcase.

---

## Sections

### Hero Section
- **Headline:** "Bhumisparsha School"
- **Eyebrow:** "Virtual Store"
- **Subtitle:** "Discover unique products from Bhumisparsha School -- books, art and much more."
- **Call-to-Action Buttons:**
  - "View Products" (primary) - links to `/produtos`
  - "Explore" (secondary) - scrolls to featured products
- **Stats Display:**
  - Dynamic product count
  - Dynamic category count
  - "100% Handcrafted"
- **Visual Elements:**
  - GridScan WebGL animated background
  - Interactive cursor glow effect
  - Floating product cards showcase (top 3 products)
  - Scroll indicator animation

### Scroll Velocity Banner
- Animated scrolling text: "Bhumi Shop", "Scroll Down", "Handcrafted Goods"
- Interactive parallax effect based on scroll speed

### Categories Section
- **Title:** "Categories"
- Grid of category cards with icons
- Categories include:
  - Camisetas (T-shirts)
  - Acessorios (Accessories)
  - Arte (Art)
  - Canecas (Mugs)
  - Bags
- Each card shows category name and product count
- Click any category to filter products at `/produtos?category={id}`
- "View All" button linking to `/produtos`

### Featured Products Section
- **Title:** "Highlights"
- Displays up to 12 featured products
- Product cards with:
  - Product image
  - Product name
  - Price in BRL (Brazilian Real)
  - Quick add to cart button
- Animated entrance with stagger grid effect

### Circular Gallery
- **Title:** "Featured Collection"
- 3D circular carousel of top 6 products
- Interactive scroll-based navigation
- Product images with names

---

## Navigation Links
- Home
- Products (`/produtos`)
- Cart (`/carrinho`)
- Login (`/login`)
- My Account (when authenticated)
- Admin (when admin user)

---

## Features
- Dark/Light mode toggle
- Language switcher (8 languages)
- Mobile responsive design
- Animated transitions and scroll effects
- Real-time product data from Supabase

---

## Meta Information
- **Title:** BhumiShop - Bhumisparsha School Virtual Store
- **Description:** Virtual store of Bhumisparsha School. Products with meaning, art and purpose.
- **Keywords:** bhumishop, bhumisparsha school, handcrafted products, school store, art, books, merchandise

---

## Related Pages
- [Products](./products.md)
- [Cart](./cart.md)
- [Login](./auth.md)
