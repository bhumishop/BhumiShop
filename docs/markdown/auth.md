# Authentication - BhumiShop

**URL:** `/login`  
**Language:** Available in 8 languages (en, pt-BR, zh, ja, es, th, ne, hi)

---

## Page Overview

User authentication page with multiple login/registration methods.

---

## Authentication Modes

### Login Mode
- **Title:** "Login"
- **Form Fields:**
  - Email: "your@email.com"
  - Password: "Minimum 6 characters"
- **Submit Button:** "Login"
- **Switch Link:** "Don't have an account? Register"

### Register Mode
- **Title:** "Register"
- **Form Fields:**
  - Full Name: "Your name"
  - Email: "your@email.com"
  - Password: "Minimum 6 characters"
- **Submit Button:** "Register"
- **Switch Link:** "Already have an account? Login"

---

## Social Login Options

### Divider
- Text: "or"

### Social Providers
1. **WeChat**
   - Button: "Continue with WeChat"
   - OAuth authentication

2. **Google**
   - Button: "Continue with Google"
   - OAuth authentication

3. **SMS Login**
   - Button: "Login with SMS"
   - Phone field: "+55 11 99999-9999"
   - "Send SMS code" button
   - Success message: "Code sent! Check your phone."

---

## Form Validation

### Login Validation
| Field | Error Message |
|-------|---------------|
| Email | "Email is required", "Invalid email" |
| Password | "Password is required", "Minimum 6 characters" |

### Register Validation
| Field | Error Message |
|-------|---------------|
| Full Name | "Name is required" |
| Email | "Email is required", "Invalid email" |
| Password | "Password is required", "Minimum 6 characters" |

---

## Authentication Flow

### Login Success
- Redirect to home page or original destination
- Toast: "Logged in successfully!"

### Register Success
- Auto-login after registration
- Toast: "Account created successfully!"

### Protected Routes
If not authenticated, redirect to login with `?redirect=` parameter:
- `/checkout`
- `/minhas-compras`
- `/perfil`
- `/admin`

### Guest Routes
If already logged in, redirect from `/login` to home

---

## Error Handling
- "Error logging in with WeChat"
- "Phone is required"
- "Error sending SMS code"
- "Error processing request"

---

## User Roles

### Regular User
- Access to: Home, Products, Cart, Checkout, My Orders, Profile

### Admin User
- Additional access to: Admin Panel (`/admin`)
- Admin role checked via Supabase

---

## Session Management
- Supabase authentication state
- Persistent sessions
- Auto-restore on page load

---

## Related Pages
- [Profile](./profile.md)
- [Checkout](./checkout.md)
- [My Orders](./my-orders.md)
