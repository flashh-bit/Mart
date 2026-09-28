import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Sparkles, AlertCircle, Zap, Eye } from 'lucide-react';
import { Product, ShopConfig } from '../types.js';
import { PRESET_PRODUCT_IMAGES, ImagePreset, DEFAULT_PRODUCT_PLACEHOLDER, formatIndianRupees } from '../utils/presets.js';
import { compressImage, formatFileSize, CompressionResult } from '../utils/imageCompression.js';
import { api } from '../utils/api.js';

interface ProductFormModalProps {
  productToEdit?: Product | null;
  config: ShopConfig;
  token: string;
  onSave: (product: Product, isEdit: boolean) => void;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  productToEdit,
  config,
  token,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(productToEdit);

  const [name, setName] = useState(productToEdit?.name || '');
  const [department, setDepartment] = useState<'Kirana' | 'Jewellery'>(
    productToEdit?.department || 'Kirana'
  );
  const [priceOnRequest, setPriceOnRequest] = useState<boolean>(
    Boolean(productToEdit?.priceOnRequest)
  );
  const [price, setPrice] = useState(
    productToEdit && !productToEdit.priceOnRequest ? String(productToEdit.price) : ''
  );
  const [originalPrice, setOriginalPrice] = useState(
    productToEdit?.originalPrice ? String(productToEdit.originalPrice) : ''
  );
  const [unit, setUnit] = useState(productToEdit?.unit || '');
  const [category, setCategory] = useState(
    productToEdit?.category || config.categories[0] || 'Atta, Dal & Rice'
  );
  const [customCategory, setCustomCategory] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [imageUrl, setImageUrl] = useState(productToEdit?.imageUrl || '');
  const [inStock, setInStock] = useState(productToEdit ? productToEdit.inStock : true);

  const [imageTab, setImageTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [compressing, setCompressing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
    originalPrice?: string;
    category?: string;
    image?: string;
    general?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setErrors((prev) => ({
        ...prev,
        image: `Image size (${sizeMb}MB) exceeds 5MB limit. Please select an image under 5MB.`,
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: undefined, general: undefined }));

    try {
      setCompressing(true);
      const compressed = await compressImage(file, 1000, 0.8);
      setCompressionInfo(compressed);
      setCompressing(false);

      setUploading(true);
      const res = await api.uploadImage(compressed.file, token);
      setImageUrl(res.url);
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        image: err.message || 'Image compression or upload failed.',
      }));
    } finally {
      setCompressing(false);
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSelectPreset = (preset: ImagePreset) => {
    setImageUrl(preset.url);
    setCompressionInfo(null);
    setErrors((prev) => ({ ...prev, image: undefined }));
    setDepartment(preset.department);
    setCategory(preset.category);
  };

  const handleUsePlaceholder = () => {
    setImageUrl(DEFAULT_PRODUCT_PLACEHOLDER);
    setCompressionInfo(null);
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; price?: string; originalPrice?: string; category?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Product name is required.';
    }

    // Price validation: only required if NOT price-on-request
    if (!priceOnRequest) {
      if (!price.trim()) {
        newErrors.price = 'Selling price is required when Price on Request is OFF.';
      } else {
        const numPrice = Number(price);
        if (isNaN(numPrice)) {
          newErrors.price = 'Price must be a valid number.';
        } else if (numPrice <= 0) {
          newErrors.price = 'Price must be greater than 0.';
        }
      }
    }

    if (!priceOnRequest && originalPrice.trim()) {
      const numOriginal = Number(originalPrice);
      if (isNaN(numOriginal)) {
        newErrors.originalPrice = 'Original price must be a valid number.';
      } else if (numOriginal <= 0) {
        newErrors.originalPrice = 'Original price must be greater than 0.';
      }
    }

    if (isAddingNewCategory && !customCategory.trim()) {
      newErrors.category = 'Please enter a category name.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const finalName = name.trim();
    const finalPrice = priceOnRequest ? 0 : parseFloat(price);
    const finalOriginalPrice = !priceOnRequest && originalPrice.trim() ? parseFloat(originalPrice) : undefined;
    const finalCategory = isAddingNewCategory ? customCategory.trim() : category.trim();
    const finalImageUrl = imageUrl.trim() || DEFAULT_PRODUCT_PLACEHOLDER;

    setSaving(true);
    setErrors({});

    try {
      if (isEditing && productToEdit) {
        const updated = await api.updateProduct(
          productToEdit.id,
          {
            name: finalName,
            price: finalPrice,
            originalPrice: finalOriginalPrice,
            category: finalCategory,
            department,
            unit: unit.trim() || undefined,
            priceOnRequest,
            description: description.trim(),
            imageUrl: finalImageUrl,
            inStock,
          },
          token
        );
        onSave(updated, true);
      } else {
        const created = await api.createProduct(
          {
            name: finalName,
            price: finalPrice,
            originalPrice: finalOriginalPrice,
            category: finalCategory,
            department,
            unit: unit.trim() || undefined,
            priceOnRequest,
            description: description.trim(),
            imageUrl: finalImageUrl,
            inStock,
          },
          token
        );
        onSave(created, false);
      }
      onClose();
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        general: err.message || 'Failed to save product. Please try again.',
      }));
    } finally {
      setSaving(false);
    }
  };

  const commonUnits = department === 'Kirana'
    ? ['per kg', 'per 500g', 'per litre', 'per 5 kg bag', 'per packet', 'per piece']
    : ['per pair', 'per piece', 'per 5g coin', 'per tola', 'per set of 2', 'per gram'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-accent/65 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-surface rounded-2xl border border-border-subtle shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scale-up"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border-subtle bg-background">
          <div>
            <h2 id="product-form-title" className="font-serif-display text-xl sm:text-2xl font-bold text-text-primary">
              {isEditing ? 'Edit Store Item' : 'Add New Item to Catalog'}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Add details for Kirana grocery staples or gold/silver jewellery pieces.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-tertiary hover:text-text-primary rounded-full hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {errors.general && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Department Selector: Kirana vs Jewellery */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
              Store Department *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDepartment('Kirana')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  department === 'Kirana'
                    ? 'bg-accent text-white shadow-xs border border-accent'
                    : 'bg-background text-text-secondary border border-border-subtle hover:bg-surface-subtle'
                }`}
              >
                <span>🌾 Kirana (Daily Grocery)</span>
              </button>

              <button
                type="button"
                onClick={() => setDepartment('Jewellery')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  department === 'Jewellery'
                    ? 'bg-accent text-white shadow-xs border border-accent'
                    : 'bg-background text-text-secondary border border-border-subtle hover:bg-surface-subtle'
                }`}
              >
                <span>✨ Jewellery (Gold / Silver)</span>
              </button>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder={department === 'Kirana' ? 'e.g. Sharbati MP Gehu Atta' : 'e.g. 925 Pure Silver Ghungroo Payal'}
              className={`w-full px-3.5 py-2.5 bg-background border rounded-xl text-sm text-text-primary outline-none transition-all touch-target ${
                errors.name
                  ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                  : 'border-border-subtle focus:border-accent focus:ring-1 focus:ring-[#7E1929]'
              }`}
            />
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium animate-fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Price on Request Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border-subtle">
            <div className="space-y-0.5 pr-3">
              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                Price on Request Toggle
              </span>
              <p className="text-[11px] text-text-secondary">
                Enable for gold, silver, or daily fluctuating items to hide fixed price and prompt customer inquiry on WhatsApp.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPriceOnRequest(!priceOnRequest);
                if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                priceOnRequest ? 'bg-accent' : 'bg-[#D8CFBF]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-surface shadow-xs transition duration-200 ease-in-out ${
                  priceOnRequest ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Pricing Row: Only shown if Price On Request is OFF */}
          {!priceOnRequest ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                  Selling Price ({config.currency}) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-sm text-text-tertiary">
                    {config.currency}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                    }}
                    placeholder="260"
                    className={`w-full pl-8 pr-3.5 py-2.5 bg-background border rounded-xl text-sm font-semibold text-text-primary outline-none transition-all touch-target ${
                      errors.price
                        ? 'border-red-400 focus:border-red-500 bg-red-50/20'
                        : 'border-border-subtle focus:border-accent focus:ring-1 focus:ring-[#7E1929]'
                    }`}
                  />
                </div>
                {errors.price && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.price}</span>
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Original Price ({config.currency})
                  </label>
                  <span className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">
                    Optional
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center font-bold text-sm text-text-tertiary">
                    {config.currency}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={originalPrice}
                    onChange={(e) => {
                      setOriginalPrice(e.target.value);
                      if (errors.originalPrice) setErrors((prev) => ({ ...prev, originalPrice: undefined }));
                    }}
                    placeholder="290"
                    className="w-full pl-8 pr-3.5 py-2.5 bg-background border border-border-subtle focus:border-accent focus:ring-1 focus:ring-[#7E1929] rounded-xl text-sm font-semibold text-text-primary outline-none transition-all touch-target"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#FBF5E6] border border-[#E8D7A6] text-xs text-gold flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Card will display "Price on request" with a direct WhatsApp rate inquiry button.</span>
            </div>
          )}

          {/* Unit / Quantity Basis Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Unit / Quantity Basis (Optional)
              </label>
              <span className="text-[10px] text-text-tertiary font-medium">e.g. per kg, per packet, per tola</span>
            </div>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. per kg, per litre, per packet, per pair, per tola"
              className="w-full px-3.5 py-2.5 bg-background border border-border-subtle focus:border-accent focus:ring-1 focus:ring-[#7E1929] rounded-xl text-sm text-text-primary outline-none transition-all touch-target"
            />
            {/* Quick unit suggestion chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] text-text-tertiary self-center">Suggestions:</span>
              {commonUnits.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                    unit === u
                      ? 'bg-accent text-white border-accent'
                      : 'bg-surface text-text-secondary border-border-subtle hover:bg-surface-subtle'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Category *
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNewCategory(!isAddingNewCategory);
                  if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                }}
                className="text-[11px] text-accent hover:underline font-semibold cursor-pointer"
              >
                {isAddingNewCategory ? 'Choose Existing' : '+ New Category'}
              </button>
            </div>

            {isAddingNewCategory ? (
              <>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                  }}
                  placeholder="Enter new category name..."
                  className="w-full px-3.5 py-2.5 bg-background border border-border-subtle focus:border-accent focus:ring-1 focus:ring-[#7E1929] rounded-xl text-sm text-text-primary outline-none"
                />
                {errors.category && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium animate-fade-in">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.category}</span>
                  </p>
                )}
              </>
            ) : (
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                }}
                className="w-full px-3.5 py-2.5 bg-background border border-border-subtle focus:border-accent focus:ring-1 focus:ring-[#7E1929] rounded-xl text-sm text-text-primary outline-none transition-all touch-target cursor-pointer"
              >
                {config.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe purity, ingredients, weight, origin, or usage recommendations..."
              className="w-full px-3.5 py-2.5 bg-background border border-border-subtle focus:border-accent focus:ring-1 focus:ring-[#7E1929] rounded-xl text-sm text-text-primary outline-none transition-all resize-y leading-relaxed"
            />
          </div>

          {/* Image Selection Section */}
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Product Image
              </label>

              {/* Tab Selector */}
              <div className="inline-flex rounded-lg border border-border-subtle bg-background p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    imageTab === 'upload' ? 'bg-accent text-white shadow-2xs' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('preset')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    imageTab === 'preset' ? 'bg-accent text-white shadow-2xs' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Shop Presets
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    imageTab === 'url' ? 'bg-accent text-white shadow-2xs' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {/* TAB 1: Upload */}
            {imageTab === 'upload' && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                    errors.image
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-border-subtle hover:border-accent bg-background hover:bg-surface-subtle'
                  }`}
                >
                  {compressing || uploading ? (
                    <div className="py-2 space-y-2">
                      <div className="w-8 h-8 mx-auto border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-semibold text-accent">
                        {compressing ? 'Compressing for mobile...' : 'Uploading securely...'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-full bg-surface text-accent mx-auto flex items-center justify-center shadow-xs">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-text-primary">
                          Click to upload or drag &amp; drop product photo
                        </p>
                        <p className="text-[11px] text-text-tertiary mt-0.5">
                          JPEG, PNG, WebP or GIF (Auto-compressed for fast mobile loading, max 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Presets */}
            {imageTab === 'preset' && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1 border border-border-subtle rounded-xl bg-background">
                  {PRESET_PRODUCT_IMAGES.map((preset) => {
                    const isSelected = imageUrl === preset.url;
                    return (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer group ${
                          isSelected ? 'border-accent ring-2 ring-[#7E1929]/20' : 'border-transparent hover:border-border-hover'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-[9px] text-white truncate text-center">
                          {preset.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleUsePlaceholder}
                    className="text-xs text-accent hover:underline font-semibold"
                  >
                    Use Default Placeholder
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Direct URL */}
            {imageTab === 'url' && (
              <div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-background border border-border-subtle focus:border-accent focus:ring-1 focus:ring-[#7E1929] rounded-xl text-sm text-text-primary outline-none"
                />
              </div>
            )}

            {/* Preview Banner */}
            {imageUrl && (
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-surface-subtle border border-border-subtle">
                <img
                  src={imageUrl}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent text-white">
                    {department}
                  </span>
                </div>
                {priceOnRequest && (
                  <div className="absolute bottom-2.5 right-2.5 z-10">
                    <span className="px-2.5 py-1 rounded-md bg-[#FBF5E6] text-gold text-xs font-bold border border-[#E8D7A6]">
                      Price on request
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* In-Stock Toggle */}
          <div className="pt-2 border-t border-[#F4EFE6] flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-text-primary block">
                Availability Status
              </span>
              <span className="text-xs text-text-secondary">
                {inStock ? 'Available for in-store purchase or immediate order' : 'Marked Out of Stock'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setInStock(!inStock)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                inStock ? 'bg-whatsapp' : 'bg-[#D8CFBF]'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-surface shadow-xs transition duration-200 ease-in-out ${
                  inStock ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#F4EFE6] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border-subtle text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-background transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-[#FAF7F2] text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-1.5 touch-target"
            >
              {saving ? 'Saving...' : isEditing ? 'Update Item' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
