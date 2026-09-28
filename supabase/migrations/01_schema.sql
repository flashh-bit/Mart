-- Create tables
CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  "originalPrice" numeric,
  category text NOT NULL,
  department text,
  unit text,
  "priceOnRequest" boolean DEFAULT false,
  description text DEFAULT '',
  "imageUrl" text DEFAULT '',
  "inStock" boolean DEFAULT true,
  "createdAt" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categories are just an array in ShopConfig, but if we need a separate table or keep it in config
CREATE TABLE public.shop_config (
  id text PRIMARY KEY DEFAULT 'default',
  "shopName" text NOT NULL,
  tagline text NOT NULL,
  description text NOT NULL,
  "logoUrl" text,
  "logoMonogram" text NOT NULL,
  currency text NOT NULL,
  "whatsappNumber" text NOT NULL,
  "whatsappPreFill" text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  timings text NOT NULL,
  categories text[] NOT NULL DEFAULT '{}'
);

-- Turn on Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_config ENABLE ROW LEVEL SECURITY;

-- Note: We are explicitly NOT creating any public policies.
-- Since the Express server uses the Supabase Service Role Key, 
-- it will completely bypass RLS. This ensures that no database tables 
-- are directly accessible from the client side over the REST API.
