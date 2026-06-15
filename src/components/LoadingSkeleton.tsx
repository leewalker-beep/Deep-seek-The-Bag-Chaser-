import React from 'react';
import { motion } from 'framer-motion';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col items-center">
      {/* Top Bar Skeleton */}
      <div className="w-full max-w-md bg-slate-900 h-8 rounded-lg mb-2 animate-pulse" />

      {/* Stats Row Skeleton */}
      <div className="w-full max-w-md bg-slate-900 h-24 rounded-xl mb-4 animate-pulse" />

      {/* Nav Tabs Skeleton */}
      <div className="w-full max-w-md flex gap-1 mb-4 h-10 overflow-hidden">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 bg-slate-900 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="w-full max-w-md space-y-4">
        {/* Advance Button Placeholder */}
        <div className="w-full h-12 bg-slate-900/50 rounded-xl animate-pulse" />

        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-square bg-slate-900 rounded-xl animate-pulse flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 bg-slate-800 rounded-full mb-2" />
              <div className="w-2/3 h-2 bg-slate-800 rounded mt-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Loading Message */}
      <div className="fixed bottom-12 flex flex-col items-center gap-2">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-6 h-6 border-2 border-slate-700 border-t-emerald-500 rounded-full"
        />
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] animate-pulse">
          Syncing Bag...
        </p>
      </div>
    </div>
  );
};
