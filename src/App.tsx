import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header.js';
import { ProductCard } from './components/ProductCard.js';
import { ProductDetailModal } from './components/ProductDetailModal.js';
import { CategoryFilter } from './components/CategoryFilter.js';
import { SearchBar } from './components/SearchBar.js';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton.js';
import { AdminLogin } from './components/AdminLoginModal.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { ProductFormModal } from './components/ProductFormModal.js';
import { ShopSettingsModal } from './components/ShopSettingsModal.js';
import { Footer } from './components/Footer.js';
import { ProductGridSkeleton } from './components/ProductSkeleton.js';
import { Toast, ToastMessage } from './components/Toast.js';
import { Product, ShopConfig, AuthState } from './types.js';
import { api } from './utils/api.js';
import { DEFAULT_SHOP_CONFIG, BRAND_CONSTANTS, DEFAULT_JEWELLERY_CATEGORIES } from './utils/brandConfig.js';
import { Sparkles, ShoppingBag, AlertCircle, RefreshCw, ArrowUpDown } from 'lucide-react';

export default function App() {
  // Routing state ('/' or '/admin')
  const [currentRoute, setCurrentRoute] = useState<'/' | '/admin'>(() => {
    return window.location.pathname.startsWith('/admin') ? '/admin' : '/';
  });

  // Data states
  const [config, setConfig] = useState<ShopConfig>(DEFAULT_SHOP_CONFIG);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Public Catalog Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDepartment, setActiveDepartment] = useState<'All' | 'Kirana' | 'Jewellery'>('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  // Detail Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Helper to extract product ID from current pathname if matches /product/:id
  const getProductIdFromPath = (path: string): string | null => {
    const match = path.match(/^\/product\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  };

  // Open product and synchronize URL to /product/[id]
  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    const targetUrl = `/product/${product.id}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({ productId: product.id }, '', targetUrl);
    }
  };

  // Close product and restore URL to / (or keep /admin if in admin mode)
  const handleCloseProduct = () => {
    setSelectedProduct(null);
    if (window.location.pathname.startsWith('/product/')) {
      window.history.pushState(null, '', currentRoute === '/admin' ? '/admin' : '/');
    }
  };

  // Auth state for admin
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedToken = localStorage.getItem('catalog_admin_token');
    const savedEmail = localStorage.getItem('catalog_admin_email');
    if (savedToken && savedEmail) {
      return {
        isAuthenticated: true,
        token: savedToken,
        user: { email: savedEmail, role: 'owner' }
      };
    }
    return {
      isAuthenticated: false,
      token: null,
      user: null
    };
  });

  // Admin Modals
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Sync route with browser history
  const handleRouteChange = (route: '/' | '/admin') => {
    setCurrentRoute(route);
    setSelectedProduct(null);
    if (window.location.pathname !== route) {
      window.history.pushState(null, '', route);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Synchronize browser history and direct URLs like /product/[id]
  useEffect(() => {
    const onPopState = async () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        setCurrentRoute('/admin');
        setSelectedProduct(null);
      } else {
        setCurrentRoute('/');
        const prodId = getProductIdFromPath(path);
        if (prodId) {
          const found = products.find((p) => p.id === prodId);
          if (found) {
            setSelectedProduct(found);
          } else {
            try {
              const fetched = await api.getProduct(prodId);
              setSelectedProduct(fetched);
            } catch {
              setSelectedProduct(null);
            }
          }
        } else {
          setSelectedProduct(null);
        }
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [products]);

  // Check URL on first load or when products are populated
  useEffect(() => {
    const prodId = getProductIdFromPath(window.location.pathname);
    if (prodId) {
      const found = products.find((p) => p.id === prodId);
      if (found) {
        setSelectedProduct(found);
      } else if (!loading) {
        api.getProduct(prodId)
          .then((p) => setSelectedProduct(p))
          .catch(() => {});
      }
    }
  }, [products, loading]);

  // Fetch shop config and products from server
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedConfig, fetchedProducts] = await Promise.all([
        api.getConfig(),
        api.getProducts(),
      ]);
      setConfig(fetchedConfig);
      setProducts(fetchedProducts);

      // Verify token if exists
      if (authState.token) {
        try {
          await api.checkAuth(authState.token);
        } catch {
          // Token expired
          handleLogout();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load catalog data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (token: string, email: string) => {
    localStorage.setItem('catalog_admin_token', token);
    localStorage.setItem('catalog_admin_email', email);
    setAuthState({
      isAuthenticated: true,
      token,
      user: { email, role: 'owner' },
    });
  };

  const handleLogout = async () => {
    if (authState.token) {
      await api.logout(authState.token).catch(() => {});
    }
    localStorage.removeItem('catalog_admin_token');
    localStorage.removeItem('catalog_admin_email');
    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null,
    });
  };

  // Product mutation handlers
  const handleProductSaved = (savedProduct: Product, isEdit: boolean = false) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === savedProduct.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = savedProduct;
        return copy;
      }
      return [savedProduct, ...prev];
    });

    // Also update config categories if a new category was created
    if (savedProduct.category && !config.categories.includes(savedProduct.category)) {
      setConfig((prev) => ({
        ...prev,
        categories: [...prev.categories, savedProduct.category],
      }));
    }

    setToast({
      id: String(Date.now()),
      type: 'success',
      title: isEdit ? 'Product Updated' : 'Product Added',
      message: `"${savedProduct.name}" has been ${isEdit ? 'updated' : 'added to your catalog'} successfully.`,
    });

    setProductFormOpen(false);
    setEditingProduct(null);
  };

  const handleProductDeleted = (id: string) => {
    const deletedProduct = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (selectedProduct?.id === id) {
      setSelectedProduct(null);
    }
    setToast({
      id: String(Date.now()),
      type: 'info',
      title: 'Product Deleted',
      message: deletedProduct
        ? `"${deletedProduct.name}" has been removed from catalog.`
        : 'Product removed from catalog.',
    });
  };

  const handleProductStockToggled = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    if (selectedProduct?.id === updatedProduct.id) {
      setSelectedProduct(updatedProduct);
    }
    setToast({
      id: String(Date.now()),
      type: 'success',
      title: 'Stock Updated',
      message: `"${updatedProduct.name}" is now marked as ${updatedProduct.inStock ? 'In Stock' : 'Out of Stock'}.`,
    });
  };

  const handleConfigUpdated = (newConfig: ShopConfig) => {
    setConfig(newConfig);
    setToast({
      id: String(Date.now()),
      type: 'success',
      title: 'Settings Saved',
      message: 'Store settings and details updated successfully.',
    });
  };

  // Synchronize browser tab title with shop configuration
  useEffect(() => {
    if (config?.shopName) {
      document.title = `${config.shopName} | ${config.tagline || 'Daily Kirana & Jewellery'}`;
    }
  }, [config]);

  // Helper to determine if a category belongs to Jewellery
  const isJewelleryCat = (cat: string): boolean => {
    if (DEFAULT_JEWELLERY_CATEGORIES.includes(cat)) return true;
    const lower = cat.toLowerCase();
    return (
      lower.includes('gold') ||
      lower.includes('silver') ||
      lower.includes('payal') ||
      lower.includes('bichhiya') ||
      lower.includes('coin') ||
      lower.includes('bangle') ||
      lower.includes('kada') ||
      lower.includes('necklace') ||
      lower.includes('jhumka') ||
      lower.includes('earring') ||
      lower.includes('jewel')
    );
  };

  // Public Catalog Filtering & Sorting
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      // Department filter (Kirana vs Jewellery)
      const isJewel = p.department === 'Jewellery' || isJewelleryCat(p.category);
      if (activeDepartment === 'Kirana' && isJewel) return false;
      if (activeDepartment === 'Jewellery' && !isJewel) return false;

      const matchesCategory =
        selectedCategory === 'All' ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);

      const matchesStock = !inStockOnly || p.inStock;

      return matchesCategory && matchesSearch && matchesStock;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    // 'newest': newest first
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [products, activeDepartment, selectedCategory, searchTerm, inStockOnly, sortBy]);

  return (
    <div className="min-h-screen bg-ambient-texture flex flex-col selection:bg-accent/15 selection:text-accent">
      
      {/* Universal Header */}
      <Header
        config={config}
        currentRoute={currentRoute}
        onRouteChange={handleRouteChange}
        isAdminAuthenticated={authState.isAuthenticated}
        onOpenSettings={() => setSettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {error && products.length === 0 ? (
          // Error Display
          <div className="max-w-md mx-auto my-20 p-6 rounded-2xl bg-surface border border-red-200 text-center space-y-4 shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
            <h3 className="font-serif-display text-lg font-bold text-text-primary">
              Failed to load store catalog
            </h3>
            <p className="text-xs text-text-secondary">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-[#241A17] text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-[#3D2E2B]"
            >
              Retry Connection
            </button>
          </div>
        ) : currentRoute === '/admin' ? (
          // ================= ADMIN ROUTE =================
          authState.isAuthenticated ? (
            <AdminDashboard
              products={products}
              config={config}
              token={authState.token!}
              adminEmail={authState.user?.email || 'Store Owner'}
              onOpenAddModal={() => {
                setEditingProduct(null);
                setProductFormOpen(true);
              }}
              onOpenEditModal={(prod) => {
                setEditingProduct(prod);
                setProductFormOpen(true);
              }}
              onOpenSettingsModal={() => setSettingsModalOpen(true)}
              onProductDeleted={handleProductDeleted}
              onProductStockToggled={handleProductStockToggled}
              onRefreshProducts={loadData}
              onLogout={handleLogout}
              onViewCatalog={() => handleRouteChange('/')}
            />
          ) : (
            <AdminLogin
              onLoginSuccess={handleLoginSuccess}
              onCancel={() => handleRouteChange('/')}
            />
          )
        ) : (
          // ================= PUBLIC CATALOG ROUTE =================
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-4 sm:space-y-8">
            
            {/* Store Hero Banner */}
            <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-background border border-border-subtle p-4 sm:p-8 md:p-12 keyline-frame shadow-xs">
              {/* Subtle ambient blur orbs */}
              <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-accent/5 filter blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gold/5 filter blur-3xl pointer-events-none -ml-20 -mb-20" />

              <div className="relative z-10 max-w-2xl space-y-2.5 sm:space-y-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border-subtle text-[10px] sm:text-[11px] font-semibold text-accent tracking-wider uppercase shadow-2xs">
                  <span>🌾 Daily Kirana &amp; ✨ Fashion Jewellery</span>
                </div>

                <h1 className="font-serif-display text-2xl sm:text-4xl md:text-5xl font-bold text-text-primary tracking-tight leading-tight">
                  {config.tagline || BRAND_CONSTANTS.TAGLINE}
                </h1>

                <p className="text-xs sm:text-base text-text-secondary leading-relaxed font-normal">
                  {config.description || BRAND_CONSTANTS.HERO_DESCRIPTION}
                </p>
              </div>
            </section>

            {/* Sticky Catalog Controls (Search Bar & Category Filters) */}
            <section className="sticky top-16 sm:top-20 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 bg-background/95 backdrop-blur-md border-y border-border-subtle shadow-xs transition-all">
              <div className="max-w-7xl mx-auto space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 sm:max-w-md">
                    <SearchBar
                      value={searchTerm}
                      onChange={setSearchTerm}
                      placeholder={loading ? 'Loading items...' : `Search in Kirana & Jewellery (${products.length})...`}
                    />
                  </div>

                  {/* Sort by Dropdown */}
                  <div className="flex items-center gap-1.5 bg-surface border border-border-subtle rounded-xl px-2 sm:px-2.5 py-2 shadow-2xs hover:border-border-hover transition-colors shrink-0">
                    <ArrowUpDown className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                    <select
                      id="catalog-sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      aria-label="Sort catalog products"
                      className="bg-transparent text-xs font-semibold text-text-primary outline-none cursor-pointer pr-1"
                    >
                      <option value="newest">Newest</option>
                      <option value="price-asc">Price: Low</option>
                      <option value="price-desc">Price: High</option>
                    </select>
                  </div>
                </div>

                {/* Category Tabs & Subcategory Chips */}
                <CategoryFilter
                  categories={config.categories}
                  activeDepartment={activeDepartment}
                  onSelectDepartment={setActiveDepartment}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  products={products}
                  inStockOnly={inStockOnly}
                  onToggleInStockOnly={setInStockOnly}
                />
              </div>
            </section>

            {/* Product Cards Grid or Skeleton Loader */}
            <section aria-label="Product Catalog">
              {loading && products.length === 0 ? (
                // Initial loading skeleton state
                <ProductGridSkeleton count={8} />
              ) : filteredProducts.length === 0 ? (
                // Empty state
                <div className="py-16 sm:py-24 text-center bg-surface rounded-2xl border border-border-subtle p-8 max-w-md mx-auto space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-background text-text-secondary mx-auto flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif-display text-lg font-bold text-text-primary">
                      No items found
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      We couldn't find any products matching "{searchTerm || selectedCategory}".
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                      setInStockOnly(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-accent text-[#FAF8F5] text-xs font-semibold hover:bg-accent-hover cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredProducts.map((prod, index) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      index={index}
                      currency={config.currency}
                      whatsappNumber={config.whatsappNumber}
                      whatsappPreFill={config.whatsappPreFill}
                      onClick={handleOpenProduct}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Floating WhatsApp Action Button */}
            <WhatsAppFloatingButton
              whatsappNumber={config.whatsappNumber}
              whatsappPreFill={config.whatsappPreFill}
              currency={config.currency}
            />

          </div>
        )}
      </main>

      {/* Universal Footer */}
      <Footer
        config={config}
        onRouteChange={handleRouteChange}
        isAdminAuthenticated={authState.isAuthenticated}
      />

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          config={config}
          onClose={handleCloseProduct}
        />
      )}

      {productFormOpen && (
        <ProductFormModal
          productToEdit={editingProduct}
          config={config}
          token={authState.token || ''}
          onSave={handleProductSaved}
          onClose={() => {
            setProductFormOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {settingsModalOpen && (
        <ShopSettingsModal
          config={config}
          token={authState.token || ''}
          onUpdate={handleConfigUpdated}
          onClose={() => setSettingsModalOpen(false)}
        />
      )}

      {/* Global Action Feedback Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
