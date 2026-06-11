import React, { useState, useRef, useCallback } from 'react';

interface TapAssignProps {
  onComplete: (multiplier: number) => void;
}

interface Item {
  id: number;
  type: string; // 'STAFF' or 'CLIENT'
  color: string;
}

const COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-red-500', 'bg-pink-500'];

export const TapAssign: React.FC<TapAssignProps> = ({ onComplete }) => {
  // Use lazy initializers to avoid impure calls during render
  const [startTime] = useState(() => Date.now());

  const [initialData] = useState(() => {
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
    const s = shuffledColors.map((color, i) => ({ id: i, type: 'STAFF', color }));
    const c = [...s]
      .map(item => ({ ...item, type: 'CLIENT' }))
      .sort(() => Math.random() - 0.5);
    return { s, c };
  });

  const [staff, setStaff] = useState<Item[]>(initialData.s);
  const [clients, setClients] = useState<Item[]>(initialData.c);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [matches, setMatches] = useState(0);
  const isComplete = useRef(false);

  const handleStaffClick = (id: number) => {
    setSelectedStaff(id);
  };

  const getMultiplier = useCallback((elapsed: number) => {
    if (elapsed >= 9) return 0.5;
    if (elapsed >= 8) return 1.25;
    if (elapsed >= 7) return 1.5;
    if (elapsed >= 6) return 2.0;
    return 4.0;
  }, []);

  const handleClientClick = (id: number) => {
    if (selectedStaff === null || isComplete.current) return;

    if (selectedStaff === id) {
      const nextMatches = matches + 1;
      setMatches(nextMatches);
      setStaff(prev => prev.filter(s => s.id !== id));
      setClients(prev => prev.filter(c => c.id !== id));
      setSelectedStaff(null);

      if (nextMatches === 6) {
        isComplete.current = true;
        // eslint-disable-next-line react-hooks/purity
        const now = Date.now();
        const elapsed = (now - startTime) / 1000;
        onComplete(getMultiplier(elapsed));
      }
    } else {
      // Penalty for wrong match
      setSelectedStaff(null);
    }
  };

  return (
    <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center select-none touch-none min-h-[400px] flex flex-col justify-between items-center relative">
      <div className="text-[10px] text-slate-500 uppercase font-bold mb-4">
        MATCH STAFF TO CLIENTS ({matches}/6)
      </div>

      <div className="w-full space-y-8">
        {/* Clients Row */}
        <div>
          <div className="text-[8px] text-slate-500 uppercase mb-2">Clients</div>
          <div className="grid grid-cols-3 gap-4">
            {clients.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleClientClick(c.id)}
                className={`h-12 rounded-lg ${c.color} shadow-lg flex items-center justify-center text-xl transition-transform active:scale-90 border-2 border-transparent`}
              >
                👤
              </button>
            ))}
          </div>
        </div>

        {/* Staff Row */}
        <div>
          <div className="text-[8px] text-slate-500 uppercase mb-2">Staff</div>
          <div className="grid grid-cols-3 gap-4">
            {staff.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleStaffClick(s.id)}
                className={`h-12 rounded-lg ${s.color} shadow-lg flex items-center justify-center text-xl transition-transform active:scale-90 ${selectedStaff === s.id ? 'border-white scale-110' : 'border-transparent'}`}
              >
                👨‍💻
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 text-[10px] text-blue-400 font-mono animate-pulse">
        SPEED AND ACCURACY BOOST YIELD
      </div>
    </div>
  );
};
