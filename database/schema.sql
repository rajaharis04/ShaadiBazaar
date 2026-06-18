-- ============================================================
-- SHAADI BAZAAR — DATABASE SCHEMA
-- Run this FIRST in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE 1: users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  phone       TEXT,
  city        TEXT,
  role        TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 2: products
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(10,2) NOT NULL,
  category     TEXT NOT NULL CHECK (category IN ('bridal','jewellery','mehndi','decor','baraat')),
  image_url    TEXT,
  stock        INTEGER DEFAULT 10,
  is_featured  BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 3: services
-- ============================================================
CREATE TABLE IF NOT EXISTS public.services (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title          TEXT NOT NULL,
  provider_name  TEXT NOT NULL,
  category       TEXT NOT NULL CHECK (category IN ('photographer','decorator','catering')),
  city           TEXT NOT NULL,
  price_per_day  NUMERIC(10,2) NOT NULL,
  description    TEXT,
  image_url      TEXT,
  rating         NUMERIC(3,2) DEFAULT 4.0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 4: cart_items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- TABLE 5: orders
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_amount    NUMERIC(10,2) NOT NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','delivered','cancelled')),
  payment_method  TEXT NOT NULL CHECK (payment_method IN ('jazzcash','easypaisa','cod')),
  address         TEXT NOT NULL,
  city            TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 6: order_items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id),
  quantity    INTEGER NOT NULL,
  price       NUMERIC(10,2) NOT NULL
);

-- ============================================================
-- TABLE 7: bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_id   UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  event_date   DATE NOT NULL,
  time_slot    TEXT NOT NULL,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  total_price  NUMERIC(10,2) NOT NULL,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 8: reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES public.products(id) ON DELETE CASCADE,
  service_id  UUID REFERENCES public.services(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Products & Services: Anyone can read
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Services are publicly readable" ON public.services FOR SELECT USING (true);
CREATE POLICY "Reviews are publicly readable" ON public.reviews FOR SELECT USING (true);

-- Users: Can only read/update own profile
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Cart: Users manage own cart
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL USING (auth.uid() = user_id);

-- Orders: Users see own orders
CREATE POLICY "Users see own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users place orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items: Users see own order items
CREATE POLICY "Users see own order items" ON public.order_items FOR SELECT
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

-- Bookings: Users manage own bookings
CREATE POLICY "Users manage own bookings" ON public.bookings FOR ALL USING (auth.uid() = user_id);

-- Reviews: Users manage own reviews
CREATE POLICY "Users manage own reviews" ON public.reviews FOR ALL USING (auth.uid() = user_id);

-- Admin bypass policies (service role bypasses RLS automatically)
-- For admin routes use the service_role key in backend

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_city ON public.services(city);
CREATE INDEX IF NOT EXISTS idx_cart_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service ON public.reviews(service_id);

-- ============================================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: fires after each auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
