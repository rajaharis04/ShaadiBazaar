-- ============================================================
-- DYNAMIC CATEGORIES SETUP
-- Run this in your Supabase SQL Editor to support dynamic categories!
-- ============================================================

-- 1. Drop existing CHECK constraints on product and service categories
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE public.services DROP CONSTRAINT IF EXISTS services_category_check;

-- 2. Create the categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('product', 'service')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Seed default product categories
INSERT INTO public.categories (key, name, type) VALUES
  ('bridal', 'Bridal', 'product'),
  ('jewellery', 'Jewellery', 'product'),
  ('mehndi', 'Mehndi', 'product'),
  ('decor', 'Decor', 'product'),
  ('baraat', 'Baraat', 'product')
ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type;

-- 4. Seed default service categories
INSERT INTO public.categories (key, name, type) VALUES
  ('photographer', 'Photography', 'service'),
  ('decorator', 'Decoration', 'service'),
  ('catering', 'Catering', 'service')
ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type;

-- 5. Enable Row Level Security (RLS) on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 6. Policies for categories
CREATE POLICY "Categories are publicly readable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL USING (true); -- service role client bypasses RLS anyway

-- 7. Add index for performance
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);
