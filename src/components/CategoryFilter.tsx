import React from 'react';
import { Product } from '../types.js';
import { DEFAULT_JEWELLERY_CATEGORIES } from '../utils/presets.js';
import { Sparkles, ShoppingBag, Check } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  activeDepartment: 'All' | 'Kirana' | 'Jewellery';
  onSelectDepartment: (dept: 'All' | 'Kirana' | 'Jewellery') => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  products: Product[];
  inStockOnly: boolean;
  onToggleInStockOnly: (val: boolean) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeDepartment = 'All',
  onSelectDepartment = () => {},
  selectedCategory,
  onSelectCategory,
  products = [],
  inStockOnly = false,
  onToggleInStockOnly = () => {},
}) => {
  // Helper to determine if a category is Jewellery
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

  // Filter sub-categories based on selected department tab
  const departmentCategories = categories.filter((cat) => {
    if (activeDepartment === 'Kirana') return !isJewelleryCat(cat);
    if (activeDepartment === 'Jewellery') return isJewelleryCat(cat);
    return true;
  });

  // Calculate counts
  const kiranaProductsCount = products.filter(
    (p) => p.department === 'Kirana' || !isJewelleryCat(p.category)
  ).length;

  const jewelleryProductsCount = products.filter(
    (p) => p.department === 'Jewellery' || isJewelleryCat(p.category)
  ).length;

  const getCategoryCount = (cat: string) => {
    return products.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
  };

  const currentTabAllCount =
    activeDepartment === 'Kirana'
      ? kiranaProductsCount
      : activeDepartment === 'Jewellery'
      ? jewelleryProductsCount
      : products.length;

  return (
    <div className="space-y-2.5">
      {/* 1. Main Department Tabs: Kirana vs Jewellery */}
      <div className="flex items-center justify-between gap-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 w-full sm:w-auto">
          {/* Kirana Tab */}
          <button
            type="button"
            onClick={() => {
              onSelectDepartment('Kirana');
              onSelectCategory('All');
            }}
            className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer touch-target ${
              activeDepartment === 'Kirana'
                ? 'bg-accent text-[#FAF7F2] shadow-xs'
                : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-border-subtle'
            }`}
          >
            <span>🌾 Kirana</span>
            <span
              className={`text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full font-sans font-semibold ${
                activeDepartment === 'Kirana'
                  ? 'bg-surface/20 text-[#FAF7F2]'
                  : 'bg-surface-subtle text-text-secondary'
              }`}
            >
              {kiranaProductsCount}
            </span>
          </button>

          {/* Jewellery Tab */}
          <button
            type="button"
            onClick={() => {
              onSelectDepartment('Jewellery');
              onSelectCategory('All');
            }}
            className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer touch-target ${
              activeDepartment === 'Jewellery'
                ? 'bg-accent text-[#FAF7F2] shadow-xs'
                : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-border-subtle'
            }`}
          >
            <span>✨ Jewellery</span>
            <span
              className={`text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full font-sans font-semibold ${
                activeDepartment === 'Jewellery'
                  ? 'bg-surface/20 text-[#FAF7F2]'
                  : 'bg-surface-subtle text-text-secondary'
              }`}
            >
              {jewelleryProductsCount}
            </span>
          </button>

          {/* All Items Tab (desktop view) */}
          <button
            type="button"
            onClick={() => {
              onSelectDepartment('All');
              onSelectCategory('All');
            }}
            className={`hidden sm:flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer touch-target ${
              activeDepartment === 'All'
                ? 'bg-[#241A17] text-[#FAF7F2] shadow-xs'
                : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-border-subtle'
            }`}
          >
            <span>All Items</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                activeDepartment === 'All' ? 'bg-surface/20 text-[#FAF7F2]' : 'bg-surface-subtle text-text-secondary'
              }`}
            >
              {products.length}
            </span>
          </button>
        </div>

        {/* Desktop In-Stock Filter Toggle */}
        <div className="hidden sm:flex items-center shrink-0">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary cursor-pointer hover:text-text-primary">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => onToggleInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded text-accent border-border-subtle focus:ring-[#7E1929] accent-[#7E1929] cursor-pointer"
            />
            <span>In-Stock Only</span>
          </label>
        </div>
      </div>

      {/* 2. Sub-category Chips Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5 no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
        {/* "All" Chip for the active department */}
        <button
          type="button"
          onClick={() => onSelectCategory('All')}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all shrink-0 cursor-pointer touch-target ${
            selectedCategory === 'All'
              ? 'bg-[#241A17] text-[#FAF7F2] font-semibold shadow-xs'
              : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-border-subtle'
          }`}
        >
          <span>
            {activeDepartment === 'Kirana'
              ? 'All Kirana'
              : activeDepartment === 'Jewellery'
              ? 'All Jewellery'
              : 'All'}
          </span>
          <span
            className={`text-[10px] px-1 py-0.2 rounded-full ${
              selectedCategory === 'All'
                ? 'bg-surface/20 text-[#FAF7F2]'
                : 'bg-surface-subtle text-text-tertiary'
            }`}
          >
            {currentTabAllCount}
          </span>
        </button>

        {/* Sub-category chips */}
        {departmentCategories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = getCategoryCount(cat);

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all shrink-0 cursor-pointer touch-target ${
                isSelected
                  ? 'bg-accent text-[#FAF7F2] font-semibold shadow-xs'
                  : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-border-subtle'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-surface/20 text-[#FAF7F2]'
                    : 'bg-surface-subtle text-text-tertiary'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile in-stock toggle */}
      <div className="flex sm:hidden items-center justify-between pt-0.5 text-xs text-text-secondary">
        <span className="text-[11px] text-text-tertiary">
          {activeDepartment === 'Kirana' ? '🌾 Grocery & Daily Essentials' : activeDepartment === 'Jewellery' ? '✨ Fashion & Imitation Jewellery' : 'Store Catalog'}
        </span>
        <label className="inline-flex items-center gap-1.5 font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onToggleInStockOnly(e.target.checked)}
            className="w-3.5 h-3.5 rounded text-accent border-border-subtle accent-[#7E1929] cursor-pointer"
          />
          <span className="text-[11px]">In-Stock Only</span>
        </label>
      </div>

    </div>
  );
};
