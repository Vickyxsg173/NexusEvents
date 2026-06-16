import React from 'react';

export default function EventCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-full animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-36 bg-slate-200 dark:bg-slate-700 w-full" />
      
      {/* Content Area Skeleton */}
      <div className="p-5 flex-grow flex flex-col">
        <div className="mb-4">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
        </div>

        <div className="space-y-3 mb-6 flex-grow">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6" />
        </div>

        {/* Tags Skeleton */}
        <div className="flex gap-2 mb-6">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16" />
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20" />
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-14" />
        </div>

        {/* Footer Details Skeleton */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
