# Admin Panel - BhumiShop

**URL:** `/admin`  
**Requires:** Authentication + Admin Role  
**Language:** Available in 8 languages (en, pt-BR, zh, ja, es, th, ne, hi)

---

## Page Overview

Administrative dashboard for managing products and categories in BhumiShop.

---

## Access Control
- Requires authenticated user
- Requires admin role (checked via Supabase)
- Non-admin users redirected to home

---

## Sections

### Page Header
- **Title:** "Admin Panel"
- **"+ Add Product"** button

### Tabs Navigation
1. **Products Tab** - Product management
2. **Categories Tab** - Category management

---

## Products Tab

### Filters
- Category dropdown: "All categories" + dynamic list
- Search input: "Search product..."
- Real-time filtering

### Products Table
| Column | Description |
|--------|-------------|
| Image | Product thumbnail |
| Name | Product name |
| Category | Category name |
| Price | Price in BRL (R$) |
| Stock | "On demand" or "In stock" badge |
| Actions | Edit and Delete buttons |

### Actions
- **Edit:** Opens product modal with pre-filled data
- **Delete:** Confirmation dialog then removes product

### Empty State
- Message: "No products found."

---

## Categories Tab

### Category List
- Display of all categories
- Delete button per category

### Add Category
- Inline input: "New category..."
- Enter to create

---

## Product Modal

### Edit Mode
- **Title:** "Edit Product"
- Pre-filled form with current data

### Create Mode
- **Title:** "New Product"
- Empty form

### Form Fields
| Field | Label | Placeholder | Notes |
|-------|-------|-------------|-------|
| Name | "Product name" | - | Required |
| Category | "Category" | "New category..." | Dropdown or inline create |
| Price | "Price (R$)" | - | Numeric, BRL |
| Stock Type | "Stock type" | - | Dropdown: On demand / In stock |
| Sizes | "Sizes (comma separated)" | "S, M, L, XL" | Optional |
| Description | "Description" | - | Text area |
| Image | "Image" | - | File upload or URL |
| Artist | "Artist" | "Artist/author name" | Optional |
| Additional Info | "Additional information" | - | Optional |

### Image Upload
- File upload (max 5MB)
- URL paste option
- Base64 conversion
- Error: "Image too large. Maximum 5MB."

### Modal Actions
- **Save** - Save changes or create new
- **Cancel** - Close without saving

---

## Toast Notifications

### Success
- "Product updated successfully"
- "Product added successfully"
- "Product deleted"
- "Category added"
- "Category deleted"

### Errors
- "Image too large. Maximum 5MB."
- "Product name is required"
- "Error saving product"
- "Error deleting product"
- "Error adding category"
- "Error deleting category"

---

## Confirmation Dialogs
- "Are you sure you want to delete this product?"
- "Delete this category?"

---

## Data Management

### Product Operations
- Create new products
- Edit existing products
- Delete products
- Search and filter

### Category Operations
- Create new categories
- Delete categories
- Category-product relationships

---

## Supabase Integration
- Real-time database sync
- CRUD operations on products table
- CRUD operations on categories table
- Admin role verification

---

## Related Pages
- [Profile](./profile.md)
- [Products](./products.md)
- [Home](./home.md)
