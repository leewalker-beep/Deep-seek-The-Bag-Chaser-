import React, { useState, useEffect } from 'react';

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
  const [startTime] = useState(Date.now());
  const [staff, setStaff] = useState<Item[]>([]);
  const [clients, setClients] = useState<Item[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [matches, setMatches] = useState(0);

  useEffect(() => {
    // Generate 6 unique colors for matching
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
    const newStaff = shuffledColors.map((color, i) => ({ id: i, type: 'STAFF', color }));
    const newClients = [...newStaff]
      .map(s => ({ ...s, type: 'CLIENT' }))
      .sort(() => Math.random() - 0.5);

    setStaff(newStaff);
    setClients(newClients);
  }, []);

  const handleStaffClick = (id: number) => {
    setSelectedStaff(id);
  };

  const handleClientClick = (id: number) => {
    if (selectedStaff === null) return;

    if (selectedStaff === id) {
      setMatches(m => m + 1);
      setStaff(prev => prev.filter(s => s.id !== id));
      setClients(prev => prev.filter(c => c.id !== id));
      setSelectedStaff(null);

      if (matches + 1 === 6) {
        const elapsed = (Date.now() - startTime) / 1000;

        let multiplier = 1.0;
        if (elapsed >= 9) multiplier = 0.5;
        else if (elapsed >= 8) multiplier = 1.25;
        else if (elapsed >= 7) multiplier = 1.5;
        else if (elapsed >= 6) multiplier = 2.0;
        else multiplier = 4.0;

        onComplete(multiplier);
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
