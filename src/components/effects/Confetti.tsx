import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
}

const ConfettiInternal: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const colors = ['#fbbf24', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#a855f7', '#ec4899'];
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 100; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -50 - Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 10,
        velocityX: (Math.random() - 0.5) * 4,
        velocityY: 2 + Math.random() * 6,
      });
    }
    setPieces(newPieces);

    const interval = setInterval(() => {
      setPieces(prev => {
        const updated = prev.map(p => ({
          ...p,
          x: p.x + p.velocityX,
          y: p.y + p.velocityY,
        }));
        const remaining = updated.filter(p => p.y < window.innerHeight + 100);
        if (remaining.length === 0) {
          clearInterval(interval);
          onComplete();
        }
        return remaining;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute rounded-sm"
          style={{
            left: piece.x,
            top: piece.y,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            transform: `rotate(${piece.x}deg)`,
          }}
        />
      ))}
    </div>
  );
};

export const showConfetti = () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(<ConfettiInternal onComplete={() => {
    root.unmount();
    container.remove();
  }} />);
};
