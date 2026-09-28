import React, { useEffect, useState } from 'react';
import { X, MessageCircle, CheckCircle2, AlertCircle, Share2, MapPin, Copy, Check, Sparkles } from 'lucide-react';
import { Product, ShopConfig } from '../types.js';
import { formatIndianRupees, buildWhatsAppLink, DEFAULT_PRODUCT_PLACEHOLDER } from '../utils/presets.js';

interface ProductDetailModalProps {
  product: Product | null;
  config: ShopConfig;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  config,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const isPriceOnRequest = Boolean(product.priceOnRequest);

  // Dedicated shareable product link: /product/[id]
  const productShareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/product/${product.id}`
    : `/product/${product.id}`;

  const priceLabel = isPriceOnRequest
    ? `Price on request${product.unit ? ` (${product.unit})` : ''}`
    : `${formatIndianRupees(product.price, config.currency)}${product.unit ? ` / ${product.unit}` : ''}`;

  // WhatsApp share link that sends the product name, price, and page link
  const shareMessage = `Check out *${product.name}* (${priceLabel}) at ${config.shopName}:\n${productShareUrl}`;
  const shareOnWhatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;

  // Direct 1-on-1 WhatsApp inquiry link to the shop owner
  const whatsappInquiryUrl = buildWhatsAppLink(
    config.whatsappNumber,
    product.name,
    isPriceOnRequest ? undefined : product.price,
    config.currency,
    config.whatsappPreFill,
    product.unit,
    isPriceOnRequest
  );

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | ${config.shopName}`,
          text: `Check out ${product.name} (${priceLabel}) at ${config.shopName}`,
          url: productShareUrl,
        });
      } catch (err) {
        // Ignored if cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const hasDiscount = Boolean(!isPriceOnRequest && product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-accent/65 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full md:max-w-3xl bg-surface rounded-t-3xl md:rounded-2xl border border-border-subtle shadow-2xl overflow-hidden mt-auto md:my-auto flex flex-col md:grid md:grid-cols-2 max-h-[95vh] animate-fade-up md:animate-scale-up"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-background/90 hover:bg-background text-text-secondary hover:text-text-primary border border-border-subtle shadow-xs transition-colors touch-target flex items-center justify-center cursor-pointer"
          aria-label="Close product details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Image Section */}
        <div className="relative h-64 shrink-0 md:h-full md:aspect-auto bg-surface-subtle overflow-hidden">
          <img
            src={product.imageUrl || DEFAULT_PRODUCT_PLACEHOLDER}
            alt={product.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_PLACEHOLDER;
            }}
            className="w-full h-full object-cover object-center"
          />
          {/* Badges on image */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            {product.inStock ? (
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold tracking-wide bg-surface/95 text-whatsapp border border-[#C6E7D0] shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-whatsapp mr-1.5" />
                Available in Store
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold tracking-wide bg-[#241A17]/90 text-[#FAF7F2] border border-[#443834] shadow-xs">
                <AlertCircle className="w-3.5 h-3.5 text-text-tertiary mr-1.5" />
                Currently Out of Stock
              </span>
            )}

            {product.department && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-background/95 text-accent border border-border-subtle shadow-xs">
                {product.department === 'Kirana' ? '🌾 Kirana' : '✨ Jewellery'}
              </span>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-5 sm:p-8 space-y-5 flex-1 overflow-y-auto">
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-accent bg-[#FDF2F4] px-2.5 py-1 rounded-md border border-[#F3CCD3]">
                  {product.category}
                </span>
                <button
                  onClick={handleShare}
                  className="text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-surface-subtle transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-accent" />
                  Share
                </button>
              </div>

              {/* Title */}
              <h2
                id="product-modal-title"
                className="font-serif-display text-2xl sm:text-3xl font-bold text-text-primary leading-tight"
              >
                {product.name}
              </h2>

              {/* Price Row: Large & Bold */}
              <div>
                {isPriceOnRequest ? (
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-base font-bold bg-[#FBF5E6] text-gold border border-[#E8D7A6]">
                      <Sparkles className="w-4 h-4 text-gold" />
                      <span>Price on request / Call for rate</span>
                    </div>
                    {product.unit && (
                      <p className="text-xs text-text-secondary font-medium">
                        Unit basis: <span className="font-semibold text-text-primary">{product.unit}</span>
                      </p>
                    )}
                    <p className="text-xs text-text-tertiary">
                      Rates for gold, silver, and commodities vary daily. Inquire on WhatsApp for instant live quotation.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-black font-sans text-accent tracking-tight tabular-nums">
                      {formatIndianRupees(product.price, config.currency)}
                    </span>
                    {product.unit && (
                      <span className="text-sm sm:text-base font-semibold text-text-secondary">
                        / {product.unit}
                      </span>
                    )}
                    {hasDiscount && (
                      <>
                        <span className="text-sm sm:text-base text-text-tertiary line-through font-medium">
                          {formatIndianRupees(product.originalPrice!, config.currency)}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-accent/10 text-accent border border-accent/25">
                          {discountPercent}% OFF
                        </span>
                      </>
                    )}
                    <span className="text-xs text-text-tertiary">MRP (Incl. of all taxes)</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="pt-2 border-t border-[#F4EFE6]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-1.5">
                  About this item
                </h4>
                <p className="text-sm text-[#443834] leading-relaxed whitespace-pre-line font-normal">
                  {product.description}
                </p>
              </div>

              {/* Store Details note */}
              <div className="p-3 rounded-xl bg-background border border-border-subtle text-xs text-text-secondary space-y-1">
                <div className="flex items-center gap-1.5 text-text-primary font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  <span>Available at {config.shopName}</span>
                </div>
                <p className="pl-5 text-[11px] text-text-tertiary">{config.address}, {config.city}</p>
              </div>
            </div>
          </div>

          {/* Action Row - Sticky on Mobile */}
          <div className="p-5 sm:p-8 pt-4 border-t border-border-subtle bg-surface space-y-2.5 shrink-0 sticky bottom-0">
            {/* Primary Action: Share on WhatsApp */}
              <a
                href={shareOnWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 text-sm sm:text-base font-semibold text-white bg-[#25D366] hover:bg-[#20BD5A] active:scale-[0.99] py-3.5 px-6 rounded-xl shadow-xs transition-all touch-target cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span>Share on WhatsApp</span>
              </a>

              {/* Direct Shop Inquiry & Copy Link Actions */}
              <div className="flex items-center gap-2">
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-whatsapp bg-surface-subtle hover:bg-border-subtle active:scale-[0.99] py-2.5 px-4 rounded-xl border border-border-hover transition-all touch-target cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>{isPriceOnRequest ? 'Ask Current Rate on WhatsApp' : 'Inquire / Order on WhatsApp'}</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  title="Copy shareable link"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary bg-background hover:bg-surface-subtle py-2.5 px-3 rounded-xl border border-border-subtle transition-all touch-target cursor-pointer shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-whatsapp" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
  );
};
