import React from 'react';
import type { RosterCharacter } from '../../types/game';
import Avatar from '../Avatar';

export interface RosterSelectListProps<T extends RosterCharacter> {
  roster: T[];
  onSelect: (item: T) => void;
  renderCard?: (item: T, onSelect: () => void, index: number) => React.ReactNode;
  containerClassName?: string;
  // Fallback display prop helpers if renderCard is not provided
  getDisplayProps?: (item: T) => {
    name: string;
    avatar?: string;
    avatarId?: string;
    subtitle?: string | React.ReactNode;
    statLine?: string | React.ReactNode;
  };
  layout?: 'list' | 'grid';
}

export function RosterSelectList<T extends RosterCharacter>({
  roster,
  onSelect,
  renderCard,
  containerClassName = "",
  getDisplayProps,
  layout = 'list',
}: RosterSelectListProps<T>) {
  // If there's no custom renderCard, we can use a built-in card style
  const defaultRenderCard = (item: T, handleSelect: () => void, index: number) => {
    if (getDisplayProps) {
      const { name, avatar, avatarId, subtitle, statLine } = getDisplayProps(item);
      const isGrid = layout === 'grid';

      if (isGrid) {
        return (
          <div
            key={item.id || index}
            onClick={handleSelect}
            className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col items-center hover:border-blue-500/50 transition-colors group cursor-pointer"
          >
            {/* Standard Avatar rendering */}
            <div className="mb-4 text-center">
              <Avatar avatarId={avatarId || avatar || '👑'} size={64} className="mx-auto rounded-full border border-slate-700" />
            </div>

            <h5 className="text-white font-black text-sm text-center mb-1">{name}</h5>
            {subtitle && (
              <div className="text-[10px] text-slate-500 font-serif italic text-center leading-relaxed mb-4">
                {subtitle}
              </div>
            )}
            {statLine && (
              <div className="w-full text-xs text-slate-300 text-center mb-4">
                {statLine}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div
            key={item.id || index}
            onClick={handleSelect}
            className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-purple-500/80 cursor-pointer transition-all flex items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-3">
              <div className="group-hover:scale-105 transition-transform shrink-0">
                <Avatar avatarId={avatarId || avatar || '👑'} size={48} className="rounded-lg border border-slate-800" />
              </div>
              <div className="text-left space-y-0.5">
                <h5 className="text-white font-black text-sm group-hover:text-purple-400 transition-colors">
                  {name}
                </h5>
                {subtitle && (
                  <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {statLine && (
              <div className="text-right">
                {statLine}
              </div>
            )}
          </div>
        );
      }
    }

    // Ultimate fallback if nothing provided
    return (
      <div
        key={item.id || index}
        onClick={handleSelect}
        className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-purple-500/80 cursor-pointer transition-all flex items-center justify-between gap-4"
      >
        <span className="text-white font-bold">{item.name}</span>
      </div>
    );
  };

  const finalContainerClass = containerClassName || (layout === 'grid' ? "grid grid-cols-1 md:grid-cols-3 gap-6 p-4" : "space-y-3 max-h-[280px] overflow-y-auto pr-1");

  return (
    <div className={finalContainerClass}>
      {roster.map((item, index) => {
        const handleSelect = () => onSelect(item);
        return (
          <React.Fragment key={item.id || index}>
            {renderCard
              ? renderCard(item, handleSelect, index)
              : defaultRenderCard(item, handleSelect, index)}
          </React.Fragment>
        );
      })}
    </div>
  );
}
