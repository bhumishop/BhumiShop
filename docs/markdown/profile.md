# Profile - BhumiShop

**URL:** `/perfil`  
**Requires:** Authentication  
**Language:** Available in 8 languages (en, pt-BR, zh, ja, es, th, ne, hi)

---

## Page Overview

User profile management page displaying account information and quick access links.

---

## Sections

### Page Header
- **Title:** "My Profile"

### User Information
- User's full name
- Email address
- Avatar/initials display

### Role Badge
- **"Admin"** badge displayed for admin users
- Hidden for regular users

### Quick Actions

#### My Orders
- Link to `/minhas-compras`
- View order history
- Track order status

#### Admin Panel (Admin Only)
- Link to `/admin`
- Product and category management
- Only visible to users with admin role

### Logout
- **Button:** "Logout"
- Signs out user from Supabase
- Redirects to home page
- Success toast: "You have been logged out"
- Error handling: "Error logging out"

---

## Empty State
- Message: "You need to be logged in to view your profile."
- CTA Button: "Login" - links to `/login`

---

## User Data Structure
```javascript
{
  id: string,           // Supabase UUID
  full_name: string,
  email: string,
  phone: string,
  role: 'user' | 'admin'
}
```

---

## Navigation Links
- Home: `/`
- Products: `/produtos`
- My Orders: `/minhas-compras`
- Admin Panel: `/admin` (if admin)

---

## Authentication Integration
- Supabase auth state
- Profile auto-populated from auth user
- Real-time session management

---

## Related Pages
- [Authentication](./auth.md)
- [My Orders](./my-orders.md)
- [Admin Panel](./admin.md)
