import React, { useRef, useState, useEffect } from 'react';

interface ScrollableListProps {
  children: React.ReactNode;
  maxHeight?: string; // e.g. "max-h-[250px]"
  className?: string;
  fadeColor?: string; // e.g. "from-slate-900" or "from-slate-950"
}

export const ScrollableList: React.FC<ScrollableListProps> = ({
  children,
  maxHeight = 'max-h-[250px]',
  className = '',
  fadeColor = 'from-slate-900',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      const { scrollTop, scrollHeight, clientHeight } = el;
      // We check if there is content to scroll down to (with a tiny 2px tolerance for subpixel math)
      const hasMoreToScroll = scrollHeight > clientHeight && scrollTop + clientHeight < scrollHeight - 3;
      setCanScrollDown(hasMoreToScroll);
    }
  };

  useEffect(() => {
    // Check initial state
    checkScroll();

    // Setup resize observer to update when children change size or viewport changes
    const el = scrollRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      checkScroll();
    });
    observer.observe(el);

    // Also watch children changes inside
    const mutationObserver = new MutationObserver(() => {
      checkScroll();
    });
    mutationObserver.observe(el, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [children]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={`overflow-y-auto no-scrollbar scroll-smooth ${maxHeight}`}
      >
        {children}
      </div>

      {/* Fade Gradient overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t ${fadeColor} to-transparent pointer-events-none transition-opacity duration-300 z-10 ${
          canScrollDown ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Bottom Chevron/Nudge Indicator */}
      {canScrollDown && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center animate-bounce z-20 bg-slate-950/90 px-2 py-0.5 rounded-full border border-emerald-500/20 shadow-md">
          <span className="text-emerald-400 text-[7px] font-black tracking-widest uppercase">MORE</span>
          <span className="text-emerald-400 text-[8px] font-bold leading-none mt-0.5">▼</span>
        </div>
      )}
    </div>
  );
};
