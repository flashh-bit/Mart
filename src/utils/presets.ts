import {
  DEFAULT_KIRANA_CATEGORIES,
  DEFAULT_JEWELLERY_CATEGORIES,
  ALL_DEFAULT_CATEGORIES,
  BRAND_CONSTANTS,
} from './brandConfig.js';

export {
  DEFAULT_KIRANA_CATEGORIES,
  DEFAULT_JEWELLERY_CATEGORIES,
  ALL_DEFAULT_CATEGORIES,
};

export interface ImagePreset {
  label: string;
  category: string;
  department: 'Kirana' | 'Jewellery';
  url: string;
}

export const PRESET_PRODUCT_IMAGES: ImagePreset[] = [
  // Kirana presets
  {
    label: 'Stone Ground Wheat Flour (Atta)',
    category: 'Atta, Dal & Rice',
    department: 'Kirana',
    url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Aromatic Basmati Rice Grain',
    category: 'Atta, Dal & Rice',
    department: 'Kirana',
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Pure Desi Cow Ghee Jar',
    category: 'Tel & Desi Ghee',
    department: 'Kirana',
    url: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Whole Khada Masala & Spices',
    category: 'Masale & Spices',
    department: 'Kirana',
    url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Premium Almonds & Cashew Nuts',
    category: 'Chai, Cheeni & Dry Fruits',
    department: 'Kirana',
    url: 'https://images.unsplash.com/photo-1508061252224-237ff54ed5a9?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Strong CTC Assam Tea Leaves',
    category: 'Chai, Cheeni & Dry Fruits',
    department: 'Kirana',
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
  },

  // Jewellery presets
  {
    label: 'Pure Silver Payal with Ghungroo',
    category: 'Silver Payal & Bichhiya',
    department: 'Jewellery',
    url: 'https://images.unsplash.com/photo-1611591475152-478311383af8?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: '24K Pure Gold Bullion Coin',
    category: 'Gold & Silver Coins',
    department: 'Jewellery',
    url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Traditional Rajasthani Gold Bangles',
    category: 'Traditional Bangles & Kada',
    department: 'Jewellery',
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Antique Temple Choker Necklace',
    category: 'Necklace & Mangalsutra',
    department: 'Jewellery',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Polki Kundan Festive Jhumkas',
    category: 'Jhumkas & Earrings',
    department: 'Jewellery',
    url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Silver Toe Rings / Bichhiya Pair',
    category: 'Silver Payal & Bichhiya',
    department: 'Jewellery',
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
  },
];

export const PLACEHOLDER_SVG_DATA_URL =
  `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="none">
  <rect width="800" height="600" fill="#FAF7F2"/>
  <rect x="24" y="24" width="752" height="552" rx="16" stroke="#E9E2D5" stroke-width="2" stroke-dasharray="6 6"/>
  <rect x="360" y="210" width="80" height="80" rx="20" fill="#7E1929" stroke="#D4AF37" stroke-width="3"/>
  <circle cx="400" cy="250" r="28" fill="none" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="4 3"/>
  <path d="M386 262C386 256 390 248 396 238" stroke="#D4AF37" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <path d="M404 242L408 236H416L420 242L412 252L404 242Z" fill="#FFF9E6" stroke="#D4AF37" stroke-width="1.5"/>
  <circle cx="400" cy="250" r="2" fill="#FFF"/>
  <text x="400" y="340" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="16" font-weight="700" fill="#241A17" text-anchor="middle" letter-spacing="1">PHOTO COMING SOON</text>
  <text x="400" y="368" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" fill="#6B5E59" text-anchor="middle">Shree Ratna Kirana &amp; Jewellers</text>
</svg>
`)}`;

export const DEFAULT_PRODUCT_PLACEHOLDER = PLACEHOLDER_SVG_DATA_URL;

export function formatIndianRupees(amount: number, currency: string = '₹'): string {
  if (isNaN(amount) || amount <= 0) return `${currency}0`;
  const formatted = amount.toLocaleString('en-IN');
  return `${currency}${formatted}`;
}

export function buildWhatsAppLink(
  number: string,
  productName?: string,
  price?: number,
  currency: string = '₹',
  baseText?: string,
  unit?: string,
  priceOnRequest?: boolean
): string {
  const cleanNumber = number.replace(/[^0-9]/g, '');
  let message = baseText || 'Namaste Shree Ratna, I would like to inquire about your store items.';

  if (productName) {
    if (priceOnRequest) {
      const unitText = unit ? ` (${unit})` : '';
      message = `Namaste! I would like to check today's current rate for *${productName}*${unitText} at Shree Ratna Kirana & Jewellers.`;
    } else {
      const unitText = unit ? ` / ${unit}` : '';
      const formattedPrice = price !== undefined ? ` (${formatIndianRupees(price, currency)}${unitText})` : '';
      message = `Namaste! I saw *${productName}*${formattedPrice} on your catalog and would love to check availability.`;
    }
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
