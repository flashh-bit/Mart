import React from 'react';
import { MessageCircle, MapPin, Clock } from 'lucide-react';
import { ShopConfig } from '../types.js';
import { buildWhatsAppLink } from '../utils/presets.js';
import { LogoBadgeSvg } from './Logo.js';

interface FooterProps {
  config: ShopConfig;
  onRouteChange: (route: '/' | '/admin') => void;
  isAdminAuthenticated?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  config,
  onRouteChange,
}) => {
  const whatsappUrl = buildWhatsAppLink(
    config.whatsappNumber,
    undefined,
    undefined,
    config.currency,
    config.whatsappPreFill
  );

  return (
    <footer className="border-t border-border-subtle bg-surface-subtle/90 text-text-secondary mt-16 sm:mt-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Responsive Multi-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12">
          
          {/* Shop Identity Column */}
          <div className="md:col-span-5 space-y-3.5">
            <div className="flex items-center gap-3">
              {config.logoUrl ? (
                <img
                  src={config.logoUrl}
                  alt={config.shopName}
                  className="w-10 h-10 rounded-xl object-cover border border-border-subtle"
                />
              ) : (
                <LogoBadgeSvg size={38} />
              )}
              <span className="font-serif-display text-xl font-bold text-text-primary">
                {config.shopName}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-sm font-normal">
              {config.description}
            </p>

            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#1E8349] bg-[#E9F6ED] hover:bg-[#D5EFDD] px-3.5 py-2.5 rounded-xl border border-[#C6E7D0] transition-colors touch-target shadow-2xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat directly on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Location & Timings Column */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-serif-display text-sm font-bold text-text-primary uppercase tracking-wider">
              Store Visit & Hours
            </h4>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-text-primary">{config.address}</p>
                  <p>{config.city}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#1E8349] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-text-primary">Store Opening Hours</p>
                  <p>{config.timings}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif-display text-sm font-bold text-text-primary uppercase tracking-wider">
              Quick Links
            </h4>

            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  onClick={() => {
                    onRouteChange('/');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-accent py-1 inline-flex items-center gap-1.5 cursor-pointer transition-colors text-text-primary"
                >
                  <span>All Store Items</span>
                </button>
              </li>
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#1E8349] py-1 inline-flex items-center gap-1.5 transition-colors text-text-secondary"
                >
                  <span>WhatsApp Rate Inquiry</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-text-tertiary">
          <p>© {new Date().getFullYear()} {config.shopName}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Ghar Ka Kirana • Vishwas Ke Gehne
          </p>
        </div>

      </div>
    </footer>
  );
};
