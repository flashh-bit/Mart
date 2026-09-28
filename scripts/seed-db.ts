import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to seed the database.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_CATEGORIES = [
  'Ceramics & Pottery',
  'Linen & Textiles',
  'Home Fragrance',
  'Brassware & Decor',
  'Artisanal Teas & Coffee'
];

const INITIAL_CONFIG = {
  id: 'default',
  shopName: 'Aura & Loom Lifestyle Co.',
  tagline: 'Artisanal Home, Handcrafted Ceramics & Living Goods',
  description: 'Carefully curated handmade goods by local artisans. Every item is crafted in small batches with honest materials.',
  logoMonogram: 'A&L',
  currency: '₹',
  whatsappNumber: '919876543210',
  whatsappPreFill: 'Hello Aura & Loom, I am interested in inquiring about',
  address: '14, heritage Lane, Indiranagar 12th Main',
  city: 'Bengaluru, Karnataka 560038',
  timings: 'Mon - Sat: 10:30 AM – 8:30 PM | Sun: 11:00 AM – 7:00 PM',
  categories: DEFAULT_CATEGORIES
};

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Earthen Terracotta Fluted Vase',
    price: 1250,
    originalPrice: 1650,
    category: 'Ceramics & Pottery',
    description: 'Hand-thrown unglazed terracotta vase with delicate fluted ridges. Finished with natural organic beeswax sealing. Ideal for dried eucalyptus, pampas grass, or standalone mantle display.',
    imageUrl: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80',
    inStock: true,
  },
  {
    id: 'prod-2',
    name: 'Handwoven Raw Slub Cotton Throw',
    price: 2490,
    category: 'Linen & Textiles',
    description: 'Artisanal pitloom-woven organic cotton throw blanket with textured slub yarns and delicate eyelash fringe. Breathable, hypoallergenic, and pre-washed for effortless softness.',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    inStock: true,
  },
  {
    id: 'prod-3',
    name: 'Handcrafted Sandalwood & Amber Soy Candle',
    price: 850,
    category: 'Home Fragrance',
    description: '100% natural soy wax candle hand-poured in a reusable speckled stoneware vessel. Notes of aged Mysore sandalwood, amber resin, and vetiver root. 45-hour clean burn time with wooden wick.',
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    inStock: true,
  },
  {
    id: 'prod-4',
    name: 'Hand-Hammered Solid Brass Dhuna Burner',
    price: 1850,
    category: 'Brassware & Decor',
    description: 'Traditional solid brass incense burner with intricately pierced lattice lid and turned dark sheesham wood handle. Crafted by generational metal artisans in Moradabad.',
    imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=800&q=80',
    inStock: true,
  },
  {
    id: 'prod-5',
    name: 'Nilgiri Single-Estate Silver Needle White Tea',
    price: 680,
    category: 'Artisanal Teas & Coffee',
    description: 'Sun-dried tender handpicked spring buds from high-altitude blue mountains. Yields a delicate floral liquor with gentle melon and orchid undertones. 50g resealable kraft tin.',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
    inStock: true,
  }
];

async function seed() {
  console.log('Seeding shop_config...');
  const { error: configError } = await supabase
    .from('shop_config')
    .upsert(INITIAL_CONFIG);

  if (configError) {
    console.error('Error seeding shop_config:', configError);
  } else {
    console.log('shop_config seeded successfully.');
  }

  console.log('Seeding products...');
  const { error: productsError } = await supabase
    .from('products')
    .upsert(INITIAL_PRODUCTS);

  if (productsError) {
    console.error('Error seeding products:', productsError);
  } else {
    console.log('products seeded successfully.');
  }

  console.log('Done.');
}

seed().catch(console.error);
