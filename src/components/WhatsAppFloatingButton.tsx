import React from 'react';
import { MessageCircle } from 'lucide-react';
import { buildWhatsAppLink } from '../utils/presets.js';

interface WhatsAppFloatingButtonProps {
  whatsappNumber: string;
  whatsappPreFill?: string;
  currency?: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  whatsappNumber,
  whatsappPreFill,
  currency = '₹',
}) => {
  const whatsappUrl = buildWhatsAppLink(
    whatsappNumber,
    undefined,
    undefined,
    currency,
    whatsappPreFill || 'Hello, I am exploring your store catalog and had a question.'
  );

  return (
    <aside
      aria-label="Direct WhatsApp inquiry"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 bg-whatsapp hover:bg-whatsapp-hover text-[#FAF8F5] p-3.5 sm:py-3.5 sm:px-4.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 touch-target"
        aria-label="Chat with store owner on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
        <span className="text-xs sm:text-sm font-semibold tracking-wide pr-1 hidden xs:inline sm:inline">
          Ask on WhatsApp
        </span>

        {/* Ambient indicator dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-surface opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200"></span>
        </span>
      </a>
    </aside>
  );
};
