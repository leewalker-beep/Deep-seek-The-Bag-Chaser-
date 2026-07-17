import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WindowDisplayMinigameProps {
  onComplete: (multiplier: number) => void;
  scaling: number;
}

interface ClosetItem {
  id: string;
  category: 'Hoodie' | 'Tee' | 'Pants' | 'Hat' | 'Shoes';
  color: 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Purple';
  vibe: 'Distressed' | 'Acid-wash' | 'Cyberpunk' | 'Vintage' | 'Minimalist';
  name: string;
}

interface MannequinSlot {
  index: number;
  label: string;
  constraints: {
    color: 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Purple';
    category: 'Hoodie' | 'Tee' | 'Pants' | 'Hat' | 'Shoes';
    vibe: 'Distressed' | 'Acid-wash' | 'Cyberpunk' | 'Vintage' | 'Minimalist';
  };
  itemPool: ClosetItem[];
}

export const WindowDisplayMinigame: React.FC<WindowDisplayMinigameProps> = ({ onComplete, scaling }) => {
  // Setup 3 distinct mannequins, each with 1 unique color, 1 category, and 1 vibe constraint.
  const slots: MannequinSlot[] = useMemo(() => {
    return [
      {
        index: 0,
        label: "MANNEQUIN A",
        constraints: { color: 'Red', category: 'Hoodie', vibe: 'Distressed' },
        itemPool: [
          { id: 'm1_perfect', category: 'Hoodie', color: 'Red', vibe: 'Distressed', name: 'Cherry Distressed Hoodie' },
          { id: 'm1_trap_color_cat', category: 'Hoodie', color: 'Red', vibe: 'Minimalist', name: 'Cherry Minimalist Hoodie' },
          { id: 'm1_trap_cat_vibe', category: 'Hoodie', color: 'Blue', vibe: 'Distressed', name: 'Cobalt Distressed Hoodie' },
          { id: 'm1_trap_color_vibe', category: 'Tee', color: 'Red', vibe: 'Distressed', name: 'Cherry Distressed Tee' },
          { id: 'm1_trash', category: 'Hat', color: 'Green', vibe: 'Acid-wash', name: 'Forest Acid Hat' },
        ]
      },
      {
        index: 1,
        label: "MANNEQUIN B",
        constraints: { color: 'Blue', category: 'Tee', vibe: 'Acid-wash' },
        itemPool: [
          { id: 'm2_perfect', category: 'Tee', color: 'Blue', vibe: 'Acid-wash', name: 'Acid Cobalt Tee' },
          { id: 'm2_trap_color_cat', category: 'Tee', color: 'Blue', vibe: 'Cyberpunk', name: 'Cyber Cobalt Tee' },
          { id: 'm2_trap_cat_vibe', category: 'Tee', color: 'Purple', vibe: 'Acid-wash', name: 'Acid Plum Tee' },
          { id: 'm2_trap_color_vibe', category: 'Pants', color: 'Blue', vibe: 'Acid-wash', name: 'Acid Cobalt Jeans' },
          { id: 'm2_trash', category: 'Shoes', color: 'Red', vibe: 'Minimalist', name: 'Minimalist Cherry Sneakers' },
        ]
      },
      {
        index: 2,
        label: "MANNEQUIN C",
        constraints: { color: 'Purple', category: 'Pants', vibe: 'Cyberpunk' },
        itemPool: [
          { id: 'm3_perfect', category: 'Pants', color: 'Purple', vibe: 'Cyberpunk', name: 'Cyber Plum Cargoes' },
          { id: 'm3_trap_color_cat', category: 'Pants', color: 'Purple', vibe: 'Vintage', name: 'Vintage Plum Pants' },
          { id: 'm3_trap_cat_vibe', category: 'Pants', color: 'Yellow', vibe: 'Cyberpunk', name: 'Cyber Neon Pants' },
          { id: 'm3_trap_color_vibe', category: 'Hat', color: 'Purple', vibe: 'Cyberpunk', name: 'Cyber Plum Beanie' },
          { id: 'm3_trash', category: 'Hoodie', color: 'Blue', vibe: 'Minimalist', name: 'Minimalist Blue Hoodie' },
        ]
      }
    ];
  }, []);

  // Currently selected items for the 3 mannequins
  const [selections, setSelections] = useState<(ClosetItem | null)[]>([null, null, null]);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const handleSelectItem = (item: ClosetItem) => {
    if (activeSlotIndex === null) return;
    const next = [...selections];
    next[activeSlotIndex] = item;
    setSelections(next);
    setActiveSlotIndex(null);

    if (navigator.vibrate) navigator.vibrate(20);
  };

  const handleFinish = () => {
    // Score matches
    let matchCount = 0;
    selections.forEach((item, i) => {
      if (!item) return;
      const target = slots[i].constraints;
      if (item.color === target.color) matchCount++;
      if (item.category === target.category) matchCount++;
      if (item.vibe === target.vibe) matchCount++;
    });

    // 9 maximum possible matched attributes
    // Multiplier calculation:
    // 9/9 = 3.0x multiplier
    // 8/9 = 2.5x multiplier
    // 7/9 = 2.0x multiplier
    // 5-6/9 = 1.4x multiplier
    // 3-4/9 = 1.0x multiplier
    // <3/9 = 0.5x multiplier
    let baseMult = 0.5;
    if (matchCount === 9) baseMult = 3.0;
    else if (matchCount === 8) baseMult = 2.5;
    else if (matchCount === 7) baseMult = 2.0;
    else if (matchCount >= 5) baseMult = 1.4;
    else if (matchCount >= 3) baseMult = 1.0;
    else baseMult = 0.5;

    const finalMultiplier = Math.max(0.5, Math.min(3.0, baseMult * (0.8 + scaling * 0.2)));

    setShowSummary(true);

    if (navigator.vibrate) navigator.vibrate(100);

    setTimeout(() => {
      onComplete(finalMultiplier);
    }, 2000);
  };

  const getEmojiForCategory = (cat: string) => {
    switch (cat) {
      case 'Hoodie': return '🧥';
      case 'Tee': return '👕';
      case 'Pants': return '👖';
      case 'Hat': return '🧢';
      case 'Shoes': return '👟';
      default: return '🛍️';
    }
  };

  const getColorHex = (colorName: string) => {
    switch (colorName) {
      case 'Red': return '#ef4444';
      case 'Blue': return '#3b82f6';
      case 'Green': return '#22c55e';
      case 'Yellow': return '#eab308';
      case 'Purple': return '#a855f7';
      default: return '#64748b';
    }
  };

  const allSlotsFilled = selections.every(s => s !== null);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-950 text-white rounded-3xl border-2 border-slate-800 relative overflow-hidden min-h-[500px]">
      <div className="text-center mb-6">
        <h3 className="text-xl font-black text-purple-400 tracking-tight italic">FLAGSHIP CURATOR</h3>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">STYLE THE DISPLAY WINDOWS</p>
      </div>

      {!showSummary ? (
        <>
          {/* Main Display Windows */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-6">
            {slots.map((slot) => {
              const selectedItem = selections[slot.index];
              const isActive = activeSlotIndex === slot.index;

              return (
                <div key={slot.index} className="flex flex-col items-center">
                  {/* Slot Target Constraints Header Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-[8px] text-center uppercase tracking-tight w-full mb-2">
                    <span className="text-slate-500 font-extrabold block mb-1">GOAL:</span>
                    <div className="flex flex-col gap-0.5 font-bold">
                      <span className="text-white" style={{ color: getColorHex(slot.constraints.color) }}>🎨 {slot.constraints.color}</span>
                      <span className="text-slate-300">📦 {slot.constraints.category}</span>
                      <span className="text-purple-300">⚡ {slot.constraints.vibe}</span>
                    </div>
                  </div>

                  {/* Window frame / Mannequin Container */}
                  <button
                    onClick={() => setActiveSlotIndex(isActive ? null : slot.index)}
                    className={`w-full aspect-[2/3] bg-slate-900 border-2 rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-95 ${
                      isActive ? 'border-amber-400 bg-amber-500/5' :
                      selectedItem ? 'border-indigo-500 bg-indigo-500/5' : 'border-dashed border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {selectedItem ? (
                      <div className="flex flex-col items-center p-2 text-center h-full justify-between">
                        <div className="text-4xl filter drop-shadow">
                          {getEmojiForCategory(selectedItem.category)}
                        </div>
                        <div className="flex flex-col items-center gap-0.5 mt-1">
                          <span className="text-[8px] font-black uppercase text-slate-100 line-clamp-2 leading-none">
                            {selectedItem.name}
                          </span>
                          <span className="text-[6.5px] px-1 bg-slate-800 text-slate-400 rounded-full font-bold uppercase">
                            {selectedItem.vibe}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-slate-600">
                        <span className="text-3xl animate-pulse">👤</span>
                        <span className="text-[7.5px] font-black uppercase tracking-widest mt-1">EMPTY</span>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Curation Closet Overlay Container */}
          <AnimatePresence mode="wait">
            {activeSlotIndex !== null ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="w-full max-w-sm bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 mb-6 shadow-2xl relative"
              >
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    CLOSET POOL FOR SLOT {String.fromCharCode(65 + activeSlotIndex)}
                  </span>
                  <button
                    onClick={() => setActiveSlotIndex(null)}
                    className="text-xs text-slate-500 hover:text-white font-bold"
                  >
                    ✕ CLOSE
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {slots[activeSlotIndex].itemPool.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className="w-full flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl transition-all text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{getEmojiForCategory(item.category)}</span>
                        <div>
                          <div className="text-[10px] font-black uppercase text-slate-100">{item.name}</div>
                          <div className="flex gap-1.5 mt-0.5">
                            <span className="text-[7px] text-slate-400 bg-slate-900 px-1 rounded uppercase font-bold">
                              {item.category}
                            </span>
                            <span className="text-[7px] font-bold px-1 rounded uppercase bg-slate-900" style={{ color: getColorHex(item.color) }}>
                              {item.color}
                            </span>
                            <span className="text-[7px] text-purple-300 bg-purple-950/40 px-1 rounded uppercase font-bold">
                              {item.vibe}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] text-indigo-400 font-extrabold uppercase">SELECT</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="w-full max-w-sm text-center py-4 bg-slate-900/30 border border-slate-900 rounded-2xl mb-6">
                <span className="text-xs text-slate-500 font-black uppercase tracking-widest">
                  TAP A MANNEQUIN TO START CURATING
                </span>
              </div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <div className="w-full max-w-xs">
            <button
              onClick={handleFinish}
              disabled={!allSlotsFilled}
              className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-100 ${
                allSlotsFilled
                  ? 'bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white border-b-4 border-purple-800 active:translate-y-1 active:border-b-0 shadow-lg'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed border-b-2 border-slate-950'
              }`}
            >
              APPROVE DESIGN WINDOW
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-10 animate-pulse">
          <span className="text-6xl mb-4 block">🏆</span>
          <h4 className="text-2xl font-black text-purple-400 italic uppercase">WINDOW LOCKED IN</h4>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Evaluating Curation Score...</p>
        </div>
      )}
    </div>
  );
};
