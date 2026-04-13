# Checkout - BhumiShop

**URL:** `/checkout`  
**Requires:** Authentication  
**Language:** Available in 8 languages (en, pt-BR, zh, ja, es, th, ne, hi)

---

## Page Overview

Multi-step checkout process for completing purchases with shipping and payment selection.

---

## Checkout Steps

### Step 1: Cart (Order Summary)
- **Title:** "Order Summary"
- Review of all cart items
- Item groups:
  - Bhumi Shop Items
  - Uma Penca Items (sent by Uma Penca)
  - Digital Items (immediate delivery)
- Subtotal per group
- Shipping (Bhumi): Free or calculated
- **Total** display
- **Continue** button to Step 2
- Empty state: "Your cart is empty" with "View Products" link

### Step 2: Information (Contact Details)
- **Title:** "Contact Information"
- **Shipping Address** section

#### Form Fields
| Field | Label | Placeholder | Validation |
|-------|-------|-------------|------------|
| Full Name | "Full name" | "Your name" | Required |
| Email | "Email" | "your@email.com" | Valid email required |
| Phone | "Phone" | "(11) 99999-9999" | Valid phone required |
| CPF | "CPF (optional)" | "000.000.000-00" | Optional |
| CEP | "CEP" | "00000-000" | Valid CEP required |
| Street | "Street / Avenue" | "Delivery address" | Required |
| Number | "Number" | "No." | Required |
| Complement | "Complement (optional)" | "Apt, block, etc." | Optional |
| Neighborhood | "Neighborhood" | "Neighborhood" | Required |
| City | "City" | "City" | Required |
| Notes | "Notes (optional)" | "Additional delivery info" | Optional |

- **Back** button (to Step 1)
- **Continue** button (to Step 3)

### Step 3: Shipping & Payment
- **Title:** "Shipping & Payment"

#### Shipping Summary
- Calculated shipping cost
- Delivery estimate

#### Payment Provider Selection
- **Prompt:** "Your cart has items from Uma Penca. Choose how you want to pay:"

##### Payment Options
1. **AbacatePay**
   - PIX (instant payment)
   - Credit Card (installments)
   - National Brazilian processing

2. **Pix Bricks International**
   - International PIX
   - UPI (India)
   - Alipay
   - WeChat Pay

3. **Uma Penca Direct**
   - T-shirts, mugs and more
   - External checkout

4. **Mercado Pago**
   - Latin American payment gateway

#### Order Summary
- Subtotal
- Shipping (Bhumi Shop)
- Shipping (Uma Penca)
- Free shipping indicator
- **Total**

- **Back** button (to Step 2)
- **Generate PIX** / **Go to Payment** / **Go to Uma Penca** / **Pay with Mercado Pago** (context-dependent)

### Step 4: Confirmation
- **Title:** "Processing Payment"

#### Payment Processing States
- **AbacatePay:** "You will be redirected to the secure AbacatePay checkout."
- **Mercado Pago:** "Loading Mercado Pago..."
- **Uma Penca:** "Redirecting to Uma Penca. Your items will be processed in the Uma Penca checkout."

#### PIX Payment
- QR Code generation
- PIX code copy functionality
- Payment status:
  - "Generating QR Code..."
  - "Awaiting payment..."
  - "Verifying payment..."
  - "Payment confirmed!"
- **"I've Paid"** button to confirm

#### Success State
- Order confirmation
- **"Continue Shopping"** - links to `/produtos`
- **"View My Orders"** - links to `/minhas-compras`

---

## Stepper Navigation
Visual progress indicator showing:
1. Cart
2. Information
3. Shipping & Payment
4. Confirmation

---

## Payment Methods

### PIX
- Instant Brazilian payment system
- QR Code scanning
- Copy-paste code option
- Real-time payment verification

### Credit Card
- Processed via AbacatePay
- Installment options

### International Payments
- Pix Bricks International
- Multiple currencies supported
- UPI, Alipay, WeChat Pay

---

## Security
- Secure payment processing
- SSL encryption
- No card data stored locally

---

## Related Pages
- [Cart](./cart.md)
- [My Orders](./my-orders.md)
- [Authentication](./auth.md)
