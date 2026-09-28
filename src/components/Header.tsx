import React, { useState } from 'react';
import { MessageCircle, Store, MapPin, Clock, Menu, X, ArrowUpRight } from 'lucide-react';
import { ShopConfig } from '../types.js';
import { buildWhatsAppLink } from '../utils/presets.js';
import { StoreLogo, LogoBadgeSvg } from './Logo.js';

interface HeaderProps {
  config: ShopConfig;
  currentRoute: '/' | '/admin';
  onRouteChange: (route: '/' | '/admin') => void;
  isAdminAuthenticated?: boolean;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  currentRoute,
  onRouteChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStoreInfo, setShowStoreInfo] = useState(false);

  const whatsappUrl = buildWhatsAppLink(config.whatsappNumber, undefined, undefined, config.currency, config.whatsappPreFill);

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border-subtle transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          
          {/* Brand & Logo */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => onRouteChange('/')}>
            {config.logoUrl ? (
              <img
                src={config.logoUrl}
                alt={config.shopName}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-border-subtle shadow-xs"
              />
            ) : (
              <LogoBadgeSvg size={42} />
            )}
            
            <div className="flex flex-col">
              <span className="font-serif-display text-lg sm:text-2xl font-bold tracking-tight text-text-primary leading-none">
                {config.shopName}
              </span>
              <span className="text-[11px] sm:text-xs text-accent font-medium tracking-normal mt-0.5">
                {config.tagline}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onRouteChange('/')}
              className={`text-sm font-semibold transition-colors cursor-pointer py-1.5 px-3 rounded-lg ${
                currentRoute === '/'
                  ? 'text-accent bg-[#FDF2F4] font-bold shadow-2xs border border-[#F3CCD3]'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Catalog
            </button>

            {/* Store Information Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowStoreInfo(!showStoreInfo)}
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-surface-subtle flex items-center gap-1.5 cursor-pointer"
              >
                <Store className="w-4 h-4 text-gold" />
                Store Info
              </button>

              {showStoreInfo && (
                <div 
                  className="absolute right-0 mt-2 w-80 bg-surface rounded-xl border border-border-subtle shadow-lg p-5 z-50 animate-scale-up"
                  onMouseLeave={() => setShowStoreInfo(false)}
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F4EFE6]">
                    <h4 className="font-serif-display text-base font-bold text-text-primary">Store Location & Hours</h4>
                    <button 
                      onClick={() => setShowStoreInfo(false)}
                      className="text-text-tertiary hover:text-text-primary text-xs p-1"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-3 text-xs text-text-secondary">
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
                        <p className="font-medium text-text-primary">Opening Timings</p>
                        <p>{config.timings}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[#F4EFE6]">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[#1E8349] font-medium hover:underline text-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Chat directly with shop owner
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Direct WhatsApp Quick Link */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E8349] bg-[#E9F6ED] hover:bg-[#D5EFDD] px-3.5 py-2 rounded-xl border border-[#C6E7D0] transition-colors shadow-2xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ask on WhatsApp</span>
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text-secondary hover:text-text-primary rounded-xl border border-border-subtle bg-surface touch-target flex items-center justify-center cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border-subtle space-y-3 animate-fade-in bg-background">
            <div className="px-2 space-y-1">
              <button
                onClick={() => {
                  onRouteChange('/');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  currentRoute === '/' ? 'bg-[#FDF2F4] text-accent font-bold border border-[#F3CCD3]' : 'text-text-primary'
                }`}
              >
                Public Product Catalog
              </button>
            </div>

            <div className="px-2 pt-2 border-t border-border-subtle/60 space-y-2">
              <div className="bg-surface p-3 rounded-xl border border-border-subtle text-xs text-text-secondary space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                  <span>{config.address}, {config.city}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#1E8349] shrink-0 mt-0.5" />
                  <span>{config.timings}</span>
                </div>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#FAF7F2] bg-whatsapp hover:bg-whatsapp-hover py-3 rounded-xl shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Ask on WhatsApp</span>
              </a>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
