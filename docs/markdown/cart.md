# Cart - BhumiShop

**URL:** `/carrinho`  
**Language:** Available in 8 languages (en, pt-BR, zh, ja, es, th, ne, hi)

---

## Page Overview

Shopping cart page displaying selected items with quantity management and checkout initiation.

---

## Cart Drawer (Alternative View)
- Slide-out panel from the right
- Triggered by cart icon in header
- Shows same information in compact format
- Cart count badge on icon

---

## Sections

### Page Header
- **Title:** "Cart"
- **Subtitle:** "Your items appear in the side panel. Click the cart icon at the top to view."
- Cart count: "Cart ({count})"

### Cart Items List
Each item displays:
- Product thumbnail image
- Product name (link to detail page)
- Size (if applicable): "Size: {size}"
- Unit price
- Quantity controls:
  - Decrease button
  - Quantity display
  - Increase button
- Item subtotal
- "Remove" button

### Item Groups
Items are grouped by source:
- **Bhumi Shop Items** - Direct from BhumiShop
- **Uma Penca Items** - External merchandise (sent by Uma Penca)
- **Digital Items** - Digital products (immediate delivery)

### Order Summary
- Subtotal calculation
- Shipping (Bhumi): "Free" or calculated amount
- **Total** - Final amount in BRL

### Empty Cart State
- Message: "Your cart is empty"
- CTA Button: "View Products" - links to `/produtos`

### Action Buttons
- **Clear cart** - Remove all items (with confirmation)
- **Checkout** - Proceed to `/checkout`

---

## Cart Features

### Free Shipping
- Progress indicator for free shipping threshold
- Message: "Free shipping on own items!" or "Only R$ {amount} left for free shipping"

### Cart Persistence
- Cart stored in localStorage
- Persists across sessions
- Syncs with user account when logged in

---

## Navigation Links
- Product links: `/produtos/:id`
- Checkout: `/checkout`
- Continue shopping: `/produtos`
- Home: `/`

---

## Cart Item Structure
```javascript
{
  productId: string,
  name: string,
  price: number,
  image: string,
  size: string | null,
  quantity: number,
  source: 'bhumi' | 'umapenca' | 'digital'
}
```

---

## Related Pages
- [Home](./home.md)
- [Products](./products.md)
- [Checkout](./checkout.md)
