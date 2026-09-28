import React from 'react';
import { MessageCircle, Eye } from 'lucide-react';
import { Product } from '../types.js';
import { formatIndianRupees, buildWhatsAppLink, DEFAULT_PRODUCT_PLACEHOLDER } from '../utils/presets.js';

interface ProductCardProps {
  product: Product;
  index: number;
  currency?: string;
  whatsappNumber?: string;
  whatsappPreFill?: string;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index,
  currency = '₹',
  whatsappNumber,
  whatsappPreFill,
  onClick,
}) => {
  const isPriceOnRequest = Boolean(product.priceOnRequest);

  const directWhatsAppUrl = whatsappNumber
    ? buildWhatsAppLink(
        whatsappNumber,
        product.name,
        isPriceOnRequest ? undefined : product.price,
        currency,
        whatsappPreFill,
        product.unit,
        isPriceOnRequest
      )
    : undefined;

  // Staggered entrance animation delay capped at reasonable sequence
  const animDelay = `${Math.min(index * 40, 500)}ms`;

  const hasDiscount = Boolean(!isPriceOnRequest && product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <article
      onClick={() => onClick(product)}
      style={{ animationDelay: animDelay }}
      className="product-card-anim product-card-interactive group bg-surface rounded-2xl border border-border-subtle overflow-hidden flex flex-col cursor-pointer relative shadow-2xs hover:border-border-hover"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] sm:aspect-[5/4] w-full overflow-hidden bg-surface-subtle">
        <img
          src={product.imageUrl || DEFAULT_PRODUCT_PLACEHOLDER}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_PLACEHOLDER;
          }}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106 will-change-transform"
        />

        {/* Subtle hover gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Badges on Image (Stock & Department) */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          {product.inStock ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide bg-surface/95 text-[#1E8349] border border-[#C6E7D0] shadow-2xs backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-whatsapp mr-1.5"></span>
              Available
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide bg-[#241A17]/90 text-[#FAF7F2] border border-[#443834] shadow-2xs backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#968A84] mr-1.5"></span>
              Out of Stock
            </span>
          )}

          {/* Department indicator tag */}
          {product.department && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-background/90 text-accent border border-border-subtle backdrop-blur-xs">
              {product.department === 'Kirana' ? '🌾 Kirana' : '✨ Jewellery'}
            </span>
          )}
        </div>

        {/* Quick View Pill */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="bg-background/95 text-text-primary text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-border-subtle flex items-center gap-1.5 backdrop-blur-sm transform translate-y-2 scale-95 opacity-0 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 ease-out">
            <Eye className="w-3.5 h-3.5 text-accent" />
            View Details
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category Chip */}
          <span className="text-[11px] uppercase tracking-wider font-semibold text-text-tertiary group-hover:text-accent transition-colors duration-200">
            {product.category}
          </span>

          {/* Product Title */}
          <h3 className="font-serif-display text-base sm:text-lg font-bold text-text-primary leading-snug mt-1 group-hover:text-accent transition-colors duration-200 line-clamp-2">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-text-secondary line-clamp-2 mt-1.5 leading-relaxed font-normal">
            {product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-[#F4EFE6] flex items-center justify-between gap-2 mt-auto">
          {/* Price Section: Large & Bold */}
          <div className="flex flex-col">
            {isPriceOnRequest ? (
              <div className="flex flex-col">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FBF5E6] text-gold border border-[#E8D7A6] shadow-2xs">
                  Price on request
                </span>
                {product.unit && (
                  <span className="text-[11px] text-text-tertiary font-medium mt-0.5">
                    ({product.unit})
                  </span>
                )}
              </div>
            ) : (
              <>
                <span className="text-[10px] uppercase font-semibold text-text-tertiary tracking-wider">
                  Price
                </span>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xl sm:text-2xl font-black font-sans tracking-tight text-accent tabular-nums">
                    {formatIndianRupees(product.price, currency)}
                  </span>
                  {product.unit && (
                    <span className="text-xs font-medium text-text-secondary">
                      / {product.unit}
                    </span>
                  )}
                  {hasDiscount && (
                    <>
                      <span className="text-xs text-text-tertiary line-through font-medium">
                        {formatIndianRupees(product.originalPrice!, currency)}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent/10 text-accent border border-accent/20">
                        {discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* WhatsApp Direct Action Link */}
          {directWhatsAppUrl && (
            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={isPriceOnRequest ? "Inquire rate on WhatsApp" : "Inquire / order on WhatsApp"}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200 touch-target cursor-pointer shrink-0 shadow-2xs hover:shadow-xs active:scale-95 ${
                isPriceOnRequest
                  ? 'text-accent bg-[#FDF2F4] hover:bg-[#FCE5E9] border border-[#F3CCD3]'
                  : 'text-[#1E8349] bg-[#E9F6ED] hover:bg-[#D5EFDD] border border-[#C6E7D0]'
              }`}
              aria-label={`Ask about ${product.name} on WhatsApp`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{isPriceOnRequest ? 'Ask Rate' : 'WhatsApp'}</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
};
