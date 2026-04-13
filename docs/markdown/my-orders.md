# My Orders - BhumiShop

**URL:** `/minhas-compras`  
**Requires:** Authentication  
**Language:** Available in 8 languages (en, pt-BR, zh, ja, es, th, ne, hi)

---

## Page Overview

Order history page displaying all user orders with status tracking and details.

---

## Sections

### Page Header
- **Title:** "My Orders"

### Orders List
Each order card displays:

#### Order Header
- Order number (e.g., "Bhumi-12345")
- Order date
- Status badges

#### Order Items
- Product thumbnail
- Product name
- Size (if applicable)
- Quantity
- Item price

#### Order Summary
- Subtotal
- Payment method:
  - "Payment: PIX"
  - "Payment: Card"
- **Total:** R$ {amount}

#### Order Status

##### Order Status Labels
| Status | Label (EN) | Label (PT-BR) |
|--------|-----------|---------------|
| pending | Pending | Pendente |
| processing | Processing | Processando |
| shipped | Shipped | Enviado |
| delivered | Delivered | Entregue |
| cancelled | Cancelled | Cancelado |

##### Payment Status Labels
| Status | Label (EN) | Label (PT-BR) |
|--------|-----------|---------------|
| pending | Payment Pending | Pagamento Pendente |
| paid | Paid | Pago |
| failed | Failed | Falhou |
| refunded | Refunded | Reembolsado |

---

### Empty State
- Message: "No orders found"
- CTA Button: "View Products" - links to `/produtos`

---

## Order Data Structure
```javascript
{
  id: string,
  order_number: string,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded',
  payment_method: 'pix' | 'card',
  total: number,
  items: [
    {
      product_id: string,
      name: string,
      price: number,
      quantity: number,
      size: string | null,
      image: string
    }
  ],
  shipping_address: {
    street: string,
    number: string,
    complement: string,
    neighborhood: string,
    city: string,
    cep: string
  },
  created_at: datetime,
  updated_at: datetime
}
```

---

## Features
- Sort by date (newest first)
- Real-time status updates
- Click order to view details (if implemented)
- Link to checkout for pending payments

---

## Navigation Links
- Home: `/`
- Products: `/produtos`
- Profile: `/perfil`

---

## Related Pages
- [Profile](./profile.md)
- [Checkout](./checkout.md)
- [Authentication](./auth.md)
