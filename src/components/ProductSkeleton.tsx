import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface rounded-xl border border-border-subtle overflow-hidden flex flex-col shadow-2xs">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3] sm:aspect-[5/4] w-full skeleton-shimmer">
        <div className="absolute top-3 left-3 w-20 h-6 rounded-md bg-[#DFD9CE]/70" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-2.5">
          {/* Category pill skeleton */}
          <div className="w-24 h-3.5 rounded-sm skeleton-shimmer" />

          {/* Title skeleton (2 lines) */}
          <div className="w-11/12 h-5 rounded-md skeleton-shimmer" />
          <div className="w-2/3 h-5 rounded-md skeleton-shimmer" />

          {/* Description skeleton */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-3 rounded-sm skeleton-shimmer" />
            <div className="w-4/5 h-3 rounded-sm skeleton-shimmer" />
          </div>
        </div>

        {/* Price & Action row skeleton */}
        <div className="pt-3 border-t border-[#F0ECE4] flex items-center justify-between gap-2 mt-auto">
          <div className="space-y-1.5">
            <div className="w-10 h-2.5 rounded-xs skeleton-shimmer" />
            <div className="w-20 h-6 rounded-md skeleton-shimmer" />
          </div>
          <div className="w-24 h-9 rounded-lg skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<ProductSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 animate-fade-in">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
};
