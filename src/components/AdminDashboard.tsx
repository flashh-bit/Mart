import React, { useState } from 'react';
import {
  Plus,
  Settings,
  LogOut,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  Package,
  CheckCircle,
  AlertTriangle,
  Layers,
  ExternalLink,
  RefreshCw,
  X,
  ToggleLeft,
  ToggleRight,
  SlidersHorizontal,
} from 'lucide-react';
import { Product, ShopConfig } from '../types.js';
import { formatIndianRupees, DEFAULT_PRODUCT_PLACEHOLDER } from '../utils/presets.js';
import { DeleteConfirmModal } from './DeleteConfirmModal.js';
import { api } from '../utils/api.js';

interface AdminDashboardProps {
  products: Product[];
  config: ShopConfig;
  token: string;
  adminEmail: string;
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onOpenSettingsModal: () => void;
  onProductDeleted: (id: string) => void;
  onProductStockToggled: (product: Product) => void;
  onRefreshProducts: () => void;
  onLogout: () => void;
  onViewCatalog: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  config,
  token,
  adminEmail,
  onOpenAddModal,
  onOpenEditModal,
  onOpenSettingsModal,
  onProductDeleted,
  onProductStockToggled,
  onRefreshProducts,
  onLogout,
  onViewCatalog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Compute metrics
  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = totalProducts - inStockCount;
  const uniqueCategories = Array.from(new Set(products.map((p) => p.category)));

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handleToggleStock = async (product: Product) => {
    setTogglingId(product.id);
    setFeedbackError(null);
    try {
      const updated = await api.toggleProductStock(product.id, token);
      onProductStockToggled(updated);
    } catch (err: any) {
      setFeedbackError(err.message || 'Failed to update stock status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    setFeedbackError(null);
    try {
      await api.deleteProduct(productToDelete.id, token);
      onProductDeleted(productToDelete.id);
      setProductToDelete(null);
    } catch (err: any) {
      setFeedbackError(err.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1">
            <span>{config.shopName}</span>
            <span>•</span>
            <span className="text-[#1E8349] font-medium">{adminEmail}</span>
          </div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-text-primary">
            Product Catalog Management
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Manage your store inventory. Changes are instantly published to customer view.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onViewCatalog}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface hover:bg-background text-xs font-semibold text-text-primary transition-all cursor-pointer shadow-2xs touch-target"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-accent" />
            <span>View Site</span>
          </button>

          <button
            onClick={onOpenSettingsModal}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface hover:bg-background text-xs font-semibold text-text-primary transition-all cursor-pointer shadow-2xs touch-target"
          >
            <Settings className="w-3.5 h-3.5 text-gold" />
            <span>Shop Settings</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-[#FAF7F2] text-xs font-semibold transition-all shadow-xs cursor-pointer touch-target"
          >
            <Plus className="w-4 h-4 text-[#FAF7F2]" />
            <span>Add Product</span>
          </button>

          <button
            onClick={onLogout}
            title="Log out of owner admin"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface hover:bg-red-50 hover:border-red-200 text-xs font-semibold text-red-700 transition-colors cursor-pointer touch-target"
            aria-label="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {feedbackError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
          <span>{feedbackError}</span>
          <button onClick={() => setFeedbackError(null)} className="text-red-800 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface rounded-xl p-4 sm:p-5 border border-border-subtle shadow-2xs">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-medium uppercase tracking-wider">Total Items</span>
            <Package className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-serif-display text-text-primary mt-2">
            {totalProducts}
          </p>
        </div>

        <div className="bg-surface rounded-xl p-4 sm:p-5 border border-border-subtle shadow-2xs">
          <div className="flex items-center justify-between text-[#4E6554]">
            <span className="text-xs font-medium uppercase tracking-wider">In Stock</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-serif-display text-[#4E6554] mt-2">
            {inStockCount}
          </p>
        </div>

        <div className="bg-surface rounded-xl p-4 sm:p-5 border border-border-subtle shadow-2xs">
          <div className="flex items-center justify-between text-text-secondary">
            <span className="text-xs font-medium uppercase tracking-wider">Out of Stock</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-serif-display text-text-secondary mt-2">
            {outOfStockCount}
          </p>
        </div>

        <div className="bg-surface rounded-xl p-4 sm:p-5 border border-border-subtle shadow-2xs">
          <div className="flex items-center justify-between text-[#B85D3D]">
            <span className="text-xs font-medium uppercase tracking-wider">Categories</span>
            <Layers className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-serif-display text-text-primary mt-2">
            {uniqueCategories.length}
          </p>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-surface rounded-2xl border border-border-subtle p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          
          {/* Quick Search Box */}
          <div className="flex-1 max-w-lg">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Quick search products by title, category, description..."
                className="w-full pl-10 pr-9 py-2.5 bg-background border border-border-subtle rounded-xl text-xs sm:text-sm text-text-primary placeholder-[#8C8476] outline-none focus:border-[#B85D3D] focus:ring-1 focus:ring-[#B85D3D] transition-all touch-target"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Dropdown & Actions */}
          <div className="flex flex-wrap items-center gap-2.5 justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary font-medium hidden sm:inline">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-background border border-border-subtle rounded-xl text-xs font-semibold text-text-primary outline-none cursor-pointer focus:border-[#B85D3D]"
              >
                <option value="All">All Categories ({totalProducts})</option>
                {config.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onRefreshProducts}
              title="Refresh product list"
              className="p-2 border border-border-subtle rounded-xl hover:bg-background text-text-secondary hover:text-text-primary transition-colors cursor-pointer touch-target flex items-center gap-1.5 text-xs font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Live Search Status Bar */}
        {(searchTerm || selectedCategory !== 'All') && (
          <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-background border border-border-subtle text-text-secondary">
            <div className="flex items-center gap-2">
              <span>
                Found <strong className="text-text-primary">{filteredProducts.length}</strong> of {totalProducts} items
              </span>
              {searchTerm && (
                <span className="text-text-secondary">
                  matching "<span className="text-text-primary font-medium">{searchTerm}</span>"
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span className="text-text-secondary">
                  in category "<span className="text-text-primary font-medium">{selectedCategory}</span>"
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="text-[#B85D3D] font-medium hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Products Table (Desktop & Tablet) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-text-primary">
            <thead>
              <tr className="border-b border-[#F0ECE4] text-[11px] uppercase tracking-wider text-text-secondary bg-background">
                <th className="py-3 px-4 rounded-l-lg">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Quick Stock Toggle</th>
                <th className="py-3 px-4 text-right rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE4]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-secondary space-y-2">
                    <p className="font-serif-display text-base font-medium text-text-primary">
                      No products found
                    </p>
                    <p className="text-xs">
                      Try adjusting your search query or category filter.
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="mt-2 text-xs font-semibold text-[#B85D3D] hover:underline"
                      >
                        Clear Search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-background/80 transition-colors">
                    
                    {/* Item Thumbnail & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.imageUrl || DEFAULT_PRODUCT_PLACEHOLDER}
                          alt={prod.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_PLACEHOLDER;
                          }}
                          className="w-12 h-12 rounded-lg object-cover bg-surface-subtle border border-border-subtle shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-text-primary text-sm truncate">{prod.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {prod.department && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-background text-accent border border-border-subtle">
                                {prod.department === 'Kirana' ? '🌾 Kirana' : '✨ Jewellery'}
                              </span>
                            )}
                            <span className="text-[11px] text-text-tertiary truncate">{prod.description}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-background text-text-secondary text-[11px] font-medium border border-border-subtle">
                        {prod.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        {prod.priceOnRequest ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#FBF5E6] text-gold border border-[#E8D7A6] w-fit">
                            Price on request
                          </span>
                        ) : (
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-sm text-text-primary tabular-nums">
                              {formatIndianRupees(prod.price, config.currency)}
                            </span>
                            {prod.unit && (
                              <span className="text-[11px] text-text-tertiary font-medium">
                                / {prod.unit}
                              </span>
                            )}
                          </div>
                        )}
                        {!prod.priceOnRequest && prod.originalPrice && prod.originalPrice > prod.price && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] text-text-tertiary line-through font-medium">
                              {formatIndianRupees(prod.originalPrice, config.currency)}
                            </span>
                            <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-accent/10 text-accent">
                              {Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Quick Stock Toggle (Directly in Table) */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(prod)}
                        disabled={togglingId === prod.id}
                        title={
                          prod.inStock
                            ? 'Currently in stock. Click to mark out of stock.'
                            : 'Currently out of stock. Click to mark in stock.'
                        }
                        className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                          prod.inStock
                            ? 'bg-[#EDF2EE] text-[#24452C] border-[#B9CEC0] hover:bg-[#E0EBE2]'
                            : 'bg-[#F4F1EC] text-[#716A62] border-[#DDD7CD] hover:bg-[#EAE4D9]'
                        }`}
                      >
                        {/* Interactive toggle switch knob */}
                        <span
                          className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
                            prod.inStock ? 'bg-[#3D6647]' : 'bg-[#BFB8AD]'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-surface shadow-xs transition-transform ${
                              prod.inStock ? 'translate-x-3.5' : 'translate-x-0.5'
                            }`}
                          />
                        </span>

                        {togglingId === prod.id ? (
                          <span className="flex items-center gap-1 text-[11px]">
                            <RefreshCw className="w-3 h-3 animate-spin text-[#B85D3D]" />
                            Updating...
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold">
                            {prod.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <a
                          href={`/product/${prod.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open shareable product page"
                          className="p-1.5 text-text-secondary hover:text-[#B85D3D] hover:bg-surface rounded-md border border-transparent hover:border-border-subtle transition-all cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => onOpenEditModal(prod)}
                          title="Edit Product Details"
                          className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md border border-transparent hover:border-border-subtle transition-all cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setProductToDelete(prod)}
                          title="Delete Product (opens confirmation)"
                          className="p-1.5 text-[#928C81] hover:text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Product Card List (<768px) */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {filteredProducts.length === 0 ? (
            <p className="py-8 text-center text-xs text-text-secondary">
              No products found matching your filter.
            </p>
          ) : (
            filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-background p-3.5 rounded-xl border border-border-subtle flex items-center gap-3"
              >
                <img
                  src={prod.imageUrl || DEFAULT_PRODUCT_PLACEHOLDER}
                  alt={prod.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_PLACEHOLDER;
                  }}
                  className="w-16 h-16 rounded-lg object-cover bg-[#F3EFEA] border border-border-subtle shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {prod.department && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-background text-accent border border-border-subtle">
                          {prod.department === 'Kirana' ? '🌾' : '✨'}
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-semibold text-text-tertiary truncate">
                        {prod.category}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      {prod.priceOnRequest ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FBF5E6] text-gold border border-[#E8D7A6]">
                          On request
                        </span>
                      ) : (
                        <span className="font-bold text-sm text-text-primary tabular-nums">
                          {formatIndianRupees(prod.price, config.currency)}
                          {prod.unit && <span className="text-[10px] font-normal text-text-tertiary"> / {prod.unit}</span>}
                        </span>
                      )}
                      {!prod.priceOnRequest && prod.originalPrice && prod.originalPrice > prod.price && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-text-tertiary line-through">
                            {formatIndianRupees(prod.originalPrice, config.currency)}
                          </span>
                          <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-accent/10 text-accent">
                            {Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="font-semibold text-xs sm:text-sm text-text-primary truncate mt-0.5">
                    {prod.name}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border-subtle/60">
                    {/* Quick Stock Toggle on mobile */}
                    <button
                      type="button"
                      onClick={() => handleToggleStock(prod)}
                      disabled={togglingId === prod.id}
                      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                        prod.inStock
                          ? 'bg-[#EDF2EE] text-[#24452C] border-[#B9CEC0]'
                          : 'bg-[#F4F1EC] text-[#716A62] border-[#DDD7CD]'
                      }`}
                    >
                      <span
                        className={`relative inline-flex h-3.5 w-6 shrink-0 items-center rounded-full transition-colors ${
                          prod.inStock ? 'bg-[#3D6647]' : 'bg-[#BFB8AD]'
                        }`}
                      >
                        <span
                          className={`inline-block h-2.5 w-2.5 transform rounded-full bg-surface transition-transform ${
                            prod.inStock ? 'translate-x-3' : 'translate-x-0.5'
                          }`}
                        />
                      </span>

                      {togglingId === prod.id ? (
                        <span>Updating...</span>
                      ) : (
                        <span>{prod.inStock ? 'In Stock' : 'Out of Stock'}</span>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/product/${prod.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open shareable product page"
                        className="p-1.5 text-text-secondary bg-surface rounded-md border border-border-subtle"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => onOpenEditModal(prod)}
                        title="Edit Product"
                        className="p-1.5 text-text-secondary bg-surface rounded-md border border-border-subtle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setProductToDelete(prod)}
                        title="Delete Product"
                        className="p-1.5 text-red-600 bg-surface rounded-md border border-border-subtle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Confirmation Popup Before Deleting Product */}
      {productToDelete && (
        <DeleteConfirmModal
          product={productToDelete}
          currency={config.currency}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setProductToDelete(null)}
        />
      )}

    </div>
  );
};
