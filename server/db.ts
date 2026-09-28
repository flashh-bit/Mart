import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
export const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  department?: 'Kirana' | 'Jewellery';
  unit?: string;
  priceOnRequest?: boolean;
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

export interface AdminAuthContext {
  adminEmail: string;
}

/**
 * Database Security Rule: Enforces that write/mutation operations
 * can only be invoked by an authenticated admin session.
 */
function assertAdminAuth(auth: AdminAuthContext | undefined): void {
  if (!auth || typeof auth.adminEmail !== 'string' || !auth.adminEmail.trim()) {
    throw new Error('Database security violation: Write operations require authenticated admin credentials');
  }
  const cleanEmail = auth.adminEmail.trim().toLowerCase();
  const authorizedEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (!authorizedEmail || cleanEmail !== authorizedEmail) {
    throw new Error('Database security violation: Admin email does not match authorized owner');
  }
}

export const db = {
  async getConfig(): Promise<ShopConfig> {
    const { data, error } = await supabase
      .from('shop_config')
      .select('*')
      .eq('id', 'default')
      .single();
    if (error) {
      console.error('Error fetching config:', error);
      throw new Error('Failed to fetch config');
    }
    // Remove the id field before returning as ShopConfig
    const { id, ...configData } = data;
    return configData as ShopConfig;
  },

  async updateConfig(auth: AdminAuthContext, updates: Partial<ShopConfig>): Promise<ShopConfig> {
    assertAdminAuth(auth);
    const sanitized: Partial<ShopConfig> = {};
    if (updates.shopName !== undefined) sanitized.shopName = String(updates.shopName).trim();
    if (updates.tagline !== undefined) sanitized.tagline = String(updates.tagline).trim();
    if (updates.description !== undefined) sanitized.description = String(updates.description).trim();
    if (updates.whatsappNumber !== undefined) sanitized.whatsappNumber = String(updates.whatsappNumber).replace(/[^0-9]/g, '');
    if (updates.whatsappPreFill !== undefined) sanitized.whatsappPreFill = String(updates.whatsappPreFill).trim();
    if (updates.address !== undefined) sanitized.address = String(updates.address).trim();
    if (updates.city !== undefined) sanitized.city = String(updates.city).trim();
    if (updates.timings !== undefined) sanitized.timings = String(updates.timings).trim();
    if (updates.currency !== undefined) sanitized.currency = String(updates.currency).trim();
    if (Array.isArray(updates.categories)) {
      sanitized.categories = updates.categories.map(c => String(c).trim()).filter(Boolean);
    }

    const { data, error } = await supabase
      .from('shop_config')
      .update(sanitized)
      .eq('id', 'default')
      .select()
      .single();

    if (error) {
      console.error('Error updating config:', error);
      throw new Error('Failed to update config');
    }
    const { id, ...configData } = data;
    return configData as ShopConfig;
  },

  getAdminUser(): { email: string; lastLogin?: string } {
    return {
      email: process.env.ADMIN_EMAIL || '',
    };
  },

  verifyAdmin(email: string, passwordPlain: string): boolean {
    if (!email || !passwordPlain) return false;
    const cleanEmail = email.toLowerCase().trim();
    const authorizedEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    if (!authorizedEmail || cleanEmail !== authorizedEmail) {
      return false;
    }
    const hash = process.env.ADMIN_PASSWORD_HASH || '';
    if (!hash) return false;
    return bcrypt.compareSync(passwordPlain, hash);
  },

  updateAdminPassword(auth: AdminAuthContext, email: string, newPasswordPlain: string): boolean {
    throw new Error('Database security violation: Password must be changed via environment variables.');
  },

  recordAdminLogin(email: string) {
    // No-op for stateless auth
  },

  async getProducts(filters?: { category?: string; search?: string; inStockOnly?: boolean }): Promise<Product[]> {
    let query = supabase.from('products').select('*').order('createdAt', { ascending: false });

    if (filters?.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }
    if (filters?.inStockOnly) {
      query = query.eq('inStock', true);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }

    let list = data as Product[];

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    return list;
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const cleanId = String(id).trim();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', cleanId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
    return data as Product;
  },

  async addProduct(auth: AdminAuthContext, productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    assertAdminAuth(auth);
    
    // Auto-add category to config if it doesn't exist
    if (productData.category) {
      const config = await this.getConfig();
      if (!config.categories.includes(productData.category)) {
        await this.updateConfig(auth, { categories: [...config.categories, productData.category] });
      }
    }

    const newProduct = {
      id: 'prod-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex'),
      name: String(productData.name).trim(),
      price: Math.max(0, Number(productData.price) || 0),
      originalPrice: productData.originalPrice ? Math.max(0, Number(productData.originalPrice)) : null,
      category: String(productData.category).trim(),
      department: productData.department,
      unit: productData.unit ? String(productData.unit).trim() : null,
      priceOnRequest: Boolean(productData.priceOnRequest),
      description: String(productData.description || '').trim(),
      imageUrl: String(productData.imageUrl || '').trim() || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
      inStock: Boolean(productData.inStock)
    };

    const { data, error } = await supabase
      .from('products')
      .insert(newProduct)
      .select()
      .single();

    if (error) {
      console.error('Error adding product:', error);
      throw new Error('Failed to add product');
    }
    return data as Product;
  },

  async updateProduct(auth: AdminAuthContext, id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product | null> {
    assertAdminAuth(auth);
    const cleanId = String(id).trim();

    const payload: any = {
      updatedAt: new Date().toISOString()
    };
    if (updates.name !== undefined) payload.name = String(updates.name).trim();
    if (updates.price !== undefined) payload.price = Math.max(0, Number(updates.price) || 0);
    if (updates.originalPrice !== undefined) payload.originalPrice = updates.originalPrice ? Math.max(0, Number(updates.originalPrice)) : null;
    if (updates.category !== undefined) payload.category = String(updates.category).trim();
    if (updates.department !== undefined) payload.department = updates.department;
    if (updates.unit !== undefined) payload.unit = updates.unit ? String(updates.unit).trim() : null;
    if (updates.priceOnRequest !== undefined) payload.priceOnRequest = Boolean(updates.priceOnRequest);
    if (updates.description !== undefined) payload.description = String(updates.description).trim();
    if (updates.imageUrl !== undefined) payload.imageUrl = String(updates.imageUrl).trim() || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80';
    if (updates.inStock !== undefined) payload.inStock = Boolean(updates.inStock);

    if (payload.category) {
      const config = await this.getConfig();
      if (!config.categories.includes(payload.category)) {
        await this.updateConfig(auth, { categories: [...config.categories, payload.category] });
      }
    }

    // Fetch existing product to check if image changed
    let oldImageUrl: string | undefined;
    if (payload.imageUrl !== undefined) {
      const existing = await this.getProductById(cleanId);
      if (existing && existing.imageUrl && existing.imageUrl !== payload.imageUrl) {
        oldImageUrl = existing.imageUrl;
      }
    }

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', cleanId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }

    // Delete old image from storage if it was replaced
    if (oldImageUrl && oldImageUrl.includes('/product-images/')) {
      const filename = oldImageUrl.split('/product-images/').pop();
      if (filename) {
        supabase.storage.from('product-images').remove([filename]).catch(err => {
          console.error('Error deleting old image:', err);
        });
      }
    }
    return data as Product;
  },

  async toggleProductStock(auth: AdminAuthContext, id: string): Promise<Product | null> {
    assertAdminAuth(auth);
    const cleanId = String(id).trim();
    
    // Fetch current
    const current = await this.getProductById(cleanId);
    if (!current) return null;

    const { data, error } = await supabase
      .from('products')
      .update({ inStock: !current.inStock, updatedAt: new Date().toISOString() })
      .eq('id', cleanId)
      .select()
      .single();

    if (error) {
      console.error('Error toggling product stock:', error);
      throw new Error('Failed to toggle product stock');
    }
    return data as Product;
  },

  async deleteProduct(auth: AdminAuthContext, id: string): Promise<boolean> {
    assertAdminAuth(auth);
    const cleanId = String(id).trim();

    // Fetch product first to get the image URL
    const product = await this.getProductById(cleanId);
    
    if (product && product.imageUrl && product.imageUrl.includes('/product-images/')) {
      const filename = product.imageUrl.split('/product-images/').pop();
      if (filename) {
        const { error: storageError } = await supabase.storage.from('product-images').remove([filename]);
        if (storageError) {
          console.error('Error deleting image from storage:', storageError);
        }
      }
    }

    const { error, count } = await supabase
      .from('products')
      .delete({ count: 'exact' })
      .eq('id', cleanId);

    if (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
    return (count || 0) > 0;
  }
};
