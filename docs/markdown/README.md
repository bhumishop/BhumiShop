# BhumiShop - Site Documentation

## Overview
BhumiShop is the official virtual store of Bhumisparsha School, offering unique handcrafted products with meaning, art and purpose.

**Base URL:** `/` (hash-based routing)  
**Framework:** Vue 3 SPA with Vite  
**Languages:** 8 (en, pt-BR, zh, ja, es, th, ne, hi)

---

## Site Map

### Public Pages
- [Home](./home.md) - `/` - Landing page with hero, categories, and featured products
- [Products](./products.md) - `/produtos` - Product catalog with search and filters
- [Product Detail](./product-detail.md) - `/produtos/:id` - Individual product view
- [Cart](./cart.md) - `/carrinho` - Shopping cart management
- [Not Found](./not-found.md) - `/:pathMatch(.*)*` - 404 error page

### Authentication
- [Login/Register](./auth.md) - `/login` - User authentication

### User Dashboard (Requires Auth)
- [Checkout](./checkout.md) - `/checkout` - Multi-step purchase flow
- [My Orders](./my-orders.md) - `/minhas-compras` - Order history
- [Profile](./profile.md) - `/perfil` - User account management

### Admin (Requires Admin Role)
- [Admin Panel](./admin.md) - `/admin` - Product and category management

---

## Features

### E-Commerce
- Product catalog with categories
- Shopping cart with persistent storage
- Multi-step checkout
- Multiple payment providers (PIX, Credit Card, International)
- Order tracking

### Internationalization
- Full i18n support
- 8 languages supported
- Dynamic locale switching

### UI/UX
- Dark/Light theme
- Responsive design
- GSAP animations
- WebGL effects (GridScan)
- Skeleton loading states
- Toast notifications

### Authentication
- Supabase integration
- Social login (WeChat, Google)
- SMS authentication
- Role-based access control

---

## Technical Stack
- **Frontend:** Vue 3, Vue Router 5, Pinia
- **Styling:** CSS Custom Properties, Scoped CSS
- **Animations:** GSAP, Motion-V
- **3D/Effects:** Three.js, OGL, Postprocessing
- **Backend:** Supabase
- **Payments:** AbacatePay, Pix Bricks, Mercado Pago, Uma Penca
- **Build:** Vite 7
- **Testing:** Vitest

---

## Payment Methods
1. **PIX** - Instant Brazilian payment
2. **Credit Card** - Via AbacatePay
3. **International** - Pix Bricks (UPI, Alipay, WeChat Pay)
4. **External** - Uma Penca, Mercado Pago

---

## Product Categories
- Camisetas (T-shirts)
- Acessorios (Accessories)
- Arte (Art)
- Canecas (Mugs)
- Bags

---

## Contact
- **Email:** contact@bhumisparshaschool.org
- **Organization:** Bhumisparsha School
