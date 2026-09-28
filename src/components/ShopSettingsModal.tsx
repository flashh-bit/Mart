import React, { useState } from 'react';
import { X, Store, Save, MessageCircle, AlertCircle, Plus, Trash2, Upload } from 'lucide-react';
import { ShopConfig } from '../types.js';
import { compressImage } from '../utils/imageCompression.js';
import { api } from '../utils/api.js';
import { BRAND_CONSTANTS } from '../utils/brandConfig.js';

interface ShopSettingsModalProps {
  config: ShopConfig;
  token: string;
  onUpdate: (updated: ShopConfig) => void;
  onClose: () => void;
}

export const ShopSettingsModal: React.FC<ShopSettingsModalProps> = ({
  config,
  token,
  onUpdate,
  onClose,
}) => {
  const [shopName, setShopName] = useState(config.shopName);
  const [tagline, setTagline] = useState(config.tagline);
  const [description, setDescription] = useState(config.description);
  const [logoMonogram, setLogoMonogram] = useState(config.logoMonogram);
  const [logoUrl, setLogoUrl] = useState(config.logoUrl || '');
  const [whatsappNumber, setWhatsappNumber] = useState(config.whatsappNumber);
  const [whatsappPreFill, setWhatsappPreFill] = useState(config.whatsappPreFill);
  const [address, setAddress] = useState(config.address);
  const [city, setCity] = useState(config.city);
  const [timings, setTimings] = useState(config.timings);
  const [categories, setCategories] = useState<string[]>([...config.categories]);
  const [newCatInput, setNewCatInput] = useState('');

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddCategory = () => {
    const trimmed = newCatInput.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setNewCatInput('');
    }
  };

  const handleRemoveCategory = (catToRemove: string) => {
    if (categories.length <= 1) {
      setError('You must keep at least one category.');
      return;
    }
    setCategories(categories.filter((c) => c !== catToRemove));
  };

  const handleLogoUpload = async (file: File) => {
    if (!file) return;
    setUploadingLogo(true);
    setError(null);
    try {
      const compressed = await compressImage(file, 600, 0.8);
      const res = await api.uploadImage(compressed.file, token);
      setLogoUrl(res.url);
    } catch (err: any) {
      setError(err.message || 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      setError('Shop name cannot be empty.');
      return;
    }
    if (!whatsappNumber.trim()) {
      setError('WhatsApp number is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated = await api.updateConfig(
        {
          shopName: shopName.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          logoMonogram: logoMonogram.trim() || BRAND_CONSTANTS.MONOGRAM,
          logoUrl: logoUrl.trim() || undefined,
          whatsappNumber: whatsappNumber.replace(/[^0-9]/g, ''),
          whatsappPreFill: whatsappPreFill.trim(),
          address: address.trim(),
          city: city.trim(),
          timings: timings.trim(),
          categories,
        },
        token
      );
      onUpdate(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save shop settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-[#241A17]/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-surface rounded-2xl border border-border-subtle shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scale-up"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border-subtle flex items-center justify-between bg-background">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDF2F4] text-accent flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 id="settings-modal-title" className="font-serif-display text-xl font-bold text-text-primary">
                Shop & Branding Settings
              </h3>
              <p className="text-xs text-text-secondary">
                Configure shop name, logo, WhatsApp contact, and store timings.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-tertiary hover:text-text-primary rounded-full hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Section: Identity */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary pb-1 border-b border-border-subtle">
              Shop Identity & Logo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                  Shop Name *
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder={BRAND_CONSTANTS.SHOP_NAME}
                  className="w-full px-3.5 py-2.5 bg-background border border-border-subtle focus:border-accent focus:ring-1 focus:ring-[#7E1929] rounded-xl text-sm text-text-primary outline-none transition-all touch-target"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                  Logo Monogram (2-3 letters)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={logoMonogram}
                  onChange={(e) => setLogoMonogram(e.target.value)}
                  placeholder={BRAND_CONSTANTS.MONOGRAM}
                  className="w-full px-3.5 py-2.5 bg-background border border-border-subtle focus:border-accent focus:ring-1 focus:ring-[#7E1929] rounded-xl text-sm text-text-primary font-serif-display uppercase outline-none transition-all touch-target"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Tagline / Subheading
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder={BRAND_CONSTANTS.TAGLINE}
                className="w-full px-3.5 py-2.5 bg-background border border-border-subtle focus:border-accent focus:ring-1 focus:ring-[#7E1929] rounded-xl text-sm text-text-primary outline-none transition-all touch-target"
              />
            </div>

            {/* Logo Image Upload / URL */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Custom Logo Image (Optional)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://... or upload image"
                  className="flex-1 px-3.5 py-2.5 bg-background border border-border-subtle focus:border-accent focus:ring-1 focus:ring-[#7E1929] rounded-xl text-xs text-text-primary outline-none"
                />
                <label className="px-3.5 py-2.5 rounded-xl border border-border-subtle bg-surface hover:bg-background text-xs font-medium text-text-primary cursor-pointer inline-flex items-center gap-1.5 shrink-0 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-accent" />
                  <span>{uploadingLogo ? 'Uploading...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Section: WhatsApp Settings */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary pb-1 border-b border-border-subtle flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5 text-[#1E8349]" />
              <span>WhatsApp Integration</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Owner WhatsApp Number (with country code, no + or spaces) *
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. 919876543210 (India: 91 + 10 digits)"
                className="w-full px-3.5 py-2.5 bg-background border border-border-subtle focus:border-accent focus:ring-1 focus:ring-[#7E1929] rounded-xl text-sm font-mono text-text-primary outline-none transition-all touch-target"
              />
              <p className="text-[11px] text-text-tertiary mt-1">
                Customers clicking "Ask on WhatsApp" will directly message this number.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Default Inquiry Greeting
              </label>
              <input
                type="text"
                value={whatsappPreFill}
                onChange={(e) => setWhatsappPreFill(e.target.value)}
                placeholder={BRAND_CONSTANTS.WHATSAPP_PREFILL}
                className="w-full px-3.5 py-2.5 bg-background border border-border-subtle focus:border-accent focus:ring-1 focus:ring-[#7E1929] rounded-xl text-sm text-text-primary outline-none transition-all touch-target"
              />
            </div>
          </div>

          {/* Section: Physical Store Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary pb-1 border-b border-[#F0ECE4]">
              Store Location & Timings
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="14, Heritage Lane, Indiranagar"
                  className="w-full px-3.5 py-2.5 bg-background border border-border-subtle focus:border-[#B85D3D] focus:ring-1 focus:ring-[#B85D3D] rounded-xl text-sm text-text-primary outline-none transition-all touch-target"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                  City & State / PIN
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Bengaluru, Karnataka 560038"
                  className="w-full px-3.5 py-2.5 bg-background border border-border-subtle focus:border-[#B85D3D] focus:ring-1 focus:ring-[#B85D3D] rounded-xl text-sm text-text-primary outline-none transition-all touch-target"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                Opening Hours
              </label>
              <input
                type="text"
                value={timings}
                onChange={(e) => setTimings(e.target.value)}
                placeholder="Mon - Sat: 10:30 AM – 8:30 PM | Sun: 11:00 AM – 7:00 PM"
                className="w-full px-3.5 py-2.5 bg-background border border-border-subtle focus:border-[#B85D3D] focus:ring-1 focus:ring-[#B85D3D] rounded-xl text-sm text-text-primary outline-none transition-all touch-target"
              />
            </div>
          </div>

          {/* Section: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary pb-1 border-b border-[#F0ECE4]">
              Catalog Categories
            </h4>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border-subtle text-xs font-medium text-text-primary"
                >
                  {cat}
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="text-[#928C81] hover:text-red-600 p-0.5"
                    title="Remove category"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                placeholder="New category name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                className="flex-1 px-3 py-2 bg-background border border-border-subtle rounded-lg text-xs text-text-primary outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3.5 py-2 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent-hover cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-3">
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
              className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-[#FAF7F2] text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2 touch-target"
            >
              <Save className="w-4 h-4 text-gold" />
              <span>{saving ? 'Saving changes...' : 'Save All Settings'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
