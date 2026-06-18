# 💍 Shaadi Bazaar — Pakistani Wedding E-Commerce Platform

> Pakistan's #1 wedding marketplace — shop bridal wear, jewellery, mehndi, décor, and book photographers, decorators, caterers!

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML + CSS + Vanilla JS |
| Backend | Node.js + Express.js |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT) |
| Storage | Supabase Storage |
| Hosting FE | Netlify |
| Hosting BE | Render.com |
| Payment | Mock JazzCash / Easypaisa / COD |

---

## 📁 Project Structure

```
ecom/
├── frontend/          ← All HTML, CSS, JS files
│   ├── index.html     ← Home page
│   ├── products.html  ← Products listing
│   ├── services.html  ← Services listing
│   ├── cart.html      ← Shopping cart
│   ├── checkout.html  ← Checkout & payment
│   ├── dashboard.html ← User dashboard
│   ├── admin/         ← Admin panel pages
│   ├── css/           ← Stylesheets
│   └── js/            ← JavaScript files
├── backend/           ← Node.js Express API
│   ├── server.js      ← Entry point
│   ├── routes/        ← API routes
│   ├── controllers/   ← Business logic
│   └── middleware/    ← Auth/Admin guards
└── database/          ← SQL files
    ├── schema.sql     ← Run this FIRST
    └── seed.sql       ← Run this SECOND (50 products, 50 services)
```

---

## 🚀 Setup Guide

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → Create Account → New Project
2. Note your **Project URL** and **Anon Key** (Settings → API)
3. Also copy the **Service Role Key** (Settings → API → Secret)

### Step 2: Run Database SQL

In Supabase Dashboard → SQL Editor:

```sql
-- Run schema.sql FIRST
-- (paste entire content of database/schema.sql)

-- Then run seed.sql
-- (paste entire content of database/seed.sql)
```

### Step 3: Create User Accounts

In Supabase Dashboard → Authentication → Users → Add User:

**Admin:**
- Email: `admin@shaadibazaar.pk`
- Password: `Admin123!`

**Customer:**
- Email: `customer@shaadibazaar.pk`
- Password: `Customer123!`

Then run in SQL Editor to set admin role:
```sql
UPDATE public.users 
SET role = 'admin', name = 'Admin User', city = 'Karachi'
WHERE email = 'admin@shaadibazaar.pk';
```

### Step 4: Configure Backend

```bash
cd backend
npm install
```

Edit `backend/.env` and replace all `YOUR_*` values:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 5: Configure Frontend

Edit `frontend/js/config.js`:
```js
const SUPABASE_URL  = 'https://your-project-id.supabase.co';
const SUPABASE_ANON = 'your-anon-key';
const API_BASE      = 'http://localhost:5000/api';  // or your Render URL
```

### Step 6: Run Backend

```bash
cd backend
npm run dev    # Development (with nodemon)
# or
npm start      # Production
```

Backend starts at: **http://localhost:5000**

### Step 7: Open Frontend

Open `frontend/index.html` in browser, or use Live Server VS Code extension.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Customer | customer@shaadibazaar.pk | Customer123! |
| Admin | admin@shaadibazaar.pk | Admin123! |

---

## 📱 Pages Guide

| Page | URL | Description |
|---|---|---|
| Home | /index.html | Hero, featured products/services, calculator |
| Products | /products.html | All 50 products with filter/search |
| Product Detail | /product-detail.html?id=UUID | Single product + reviews |
| Services | /services.html | All 50 services with filter |
| Service Detail | /service-detail.html?id=UUID | Single service + booking form |
| Cart | /cart.html | Shopping cart with promo codes |
| Checkout | /checkout.html | Address + payment + order placement |
| Login | /login.html | User login |
| Register | /register.html | User registration |
| Dashboard | /dashboard.html | Orders, bookings, profile, countdown |
| Orders | /orders.html | My order history |
| Admin Login | /admin/admin-login.html | Admin access |
| Admin Dashboard | /admin/admin-dashboard.html | Stats overview |
| Manage Products | /admin/manage-products.html | CRUD products |
| Manage Services | /admin/manage-services.html | CRUD services |
| Manage Orders | /admin/manage-orders.html | Update order status |

---

## 🌐 API Endpoints

```
POST   /api/auth/register       ← Register new user
POST   /api/auth/login          ← Login
POST   /api/auth/logout         ← Logout
GET    /api/auth/me             ← Get current user (auth required)
PUT    /api/auth/profile        ← Update profile (auth required)

GET    /api/products            ← All products (filter/search/sort)
GET    /api/products/:id        ← Single product + reviews
POST   /api/products            ← Add product (admin only)
PUT    /api/products/:id        ← Update product (admin only)
DELETE /api/products/:id        ← Delete product (admin only)
POST   /api/products/:id/review ← Add review (auth required)

GET    /api/services            ← All services
GET    /api/services/:id        ← Single service + reviews
POST   /api/services            ← Add service (admin only)
PUT    /api/services/:id        ← Update (admin only)
DELETE /api/services/:id        ← Delete (admin only)

POST   /api/orders              ← Place order (auth required)
GET    /api/orders/my-orders    ← My orders (auth required)
GET    /api/orders/:id          ← Order detail (auth required)

POST   /api/bookings            ← Book service (auth required)
GET    /api/bookings/my-bookings← My bookings (auth required)
PUT    /api/bookings/:id        ← Update booking (auth required)

GET    /api/admin/stats         ← Dashboard stats (admin)
GET    /api/admin/orders        ← All orders (admin)
PUT    /api/admin/orders/:id    ← Update order status (admin)
GET    /api/admin/bookings      ← All bookings (admin)
PUT    /api/admin/bookings/:id  ← Update booking status (admin)
GET    /api/admin/users         ← All users (admin)
```

---

## 🎟️ Promo Codes

| Code | Discount |
|---|---|
| SHAADI10 | 10% off |
| WEDDING20 | 20% off |
| BARAT15 | 15% off |

---

## 🚢 Deployment

### Frontend → Netlify
1. Create account at [netlify.com](https://netlify.com)
2. Drag & drop the `frontend/` folder
3. Update `config.js` API_BASE to your Render URL

### Backend → Render.com
1. Push backend to GitHub
2. Create new Web Service on Render.com
3. Add environment variables from `.env`
4. Deploy!

---

## 👨‍🏫 Features for Professor

| Feature | Concept Covered |
|---|---|
| Cart + Checkout | Core e-commerce flow |
| Supabase Auth + JWT | Secure authentication |
| Admin Panel CRUD | Backend management |
| Order tracking | Real-world functionality |
| Service booking | Mixed business model |
| Search + Filter | Database querying |
| Reviews/Ratings | User engagement |
| Role-based access | Authorization |
| RLS Policies | Database security |
| Responsive design | Modern web development |

---

*Built with ❤️ for Pakistan's weddings 💍*
