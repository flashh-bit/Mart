export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  department?: 'Kirana' | 'Jewellery';
  unit?: string; // Optional unit: "per kg", "per litre", "per packet", "per 500g", "per pair", "per tola", etc.
  priceOnRequest?: boolean; // If true, card displays "Price on request" and prompts WhatsApp inquiry
  description: string;
  imageUrl: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShopConfig {
  shopName: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  logoMonogram: string;
  currency: string;
  whatsappNumber: string;
  whatsappPreFill: string;
  address: string;
  city: string;
  timings: string;
  categories: string[];
}

export interface AdminUser {
  email: string;
  role: 'owner';
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: AdminUser | null;
}
