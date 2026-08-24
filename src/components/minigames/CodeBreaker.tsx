import React, { useState, useEffect } from 'react';

interface CodeBreakerProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: string;
}

const HEX_SYMBOLS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

export const CodeBreaker: React.FC<CodeBreakerProps> = ({ onComplete, level = 1 }) => {
  const codeLength = Math.min(3 + level, 6); // L1=4 symbols, L2=5, L3=6
  const maxAttempts = Math.max(6 - (level - 1), 4); // 6 attempts L1, 5 L2, 4 L3

  const [targetCode, setTargetCode] = useState<string[]>([]);
  const [userGuess, setUserGuess] = useState<string[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState(maxAttempts);
  const [feedbackHistory, setFeedbackHistory] = useState<
    { guess: string[]; exactMatches: number; partialMatches: number }[]
  >([]);
  const [gameOver, setGameOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initialize random hex key code on mount / level change
  useEffect(() => {
    const code: string[] = [];
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * HEX_SYMBOLS.length);
      code.push(HEX_SYMBOLS[randomIndex]);
    }
    setTargetCode(code);
    setUserGuess([]);
    setAttemptsLeft(maxAttempts);
    setFeedbackHistory([]);
    setGameOver(false);
    setStatusMessage(null);
  }, [level, codeLength, maxAttempts]);

  const handleSymbolPress = (symbol: string) => {
    if (gameOver || userGuess.length >= codeLength) return;
    setUserGuess((prev) => [...prev, symbol]);
  };

  const handleBackspace = () => {
    if (gameOver || userGuess.length === 0) return;
    setUserGuess((prev) => prev.slice(0, -1));
  };

  const handleSubmitGuess = () => {
    if (gameOver || userGuess.length !== codeLength) return;

    // Mastermind feedback logic
    let exactMatches = 0;
    let partialMatches = 0;

    const targetCopy = [...targetCode];
    const guessCopy = [...userGuess];

    // First pass: exact matches
    for (let i = 0; i < codeLength; i++) {
      if (guessCopy[i] === targetCopy[i]) {
        exactMatches++;
        targetCopy[i] = '';
        guessCopy[i] = '';
      }
    }

    // Second pass: partial matches (right symbol, wrong position)
    for (let i = 0; i < codeLength; i++) {
      if (guessCopy[i] !== '' && targetCopy.includes(guessCopy[i])) {
        partialMatches++;
        const indexInTarget = targetCopy.indexOf(guessCopy[i]);
        targetCopy[indexInTarget] = '';
      }
    }

    const newHistory = [...feedbackHistory, { guess: userGuess, exactMatches, partialMatches }];
    setFeedbackHistory(newHistory);
    const newAttempts = attemptsLeft - 1;
    setAttemptsLeft(newAttempts);
    setUserGuess([]);

    if (exactMatches === codeLength) {
      // Crack success!
      setGameOver(true);
      const attemptsUsed = maxAttempts - newAttempts;
      setStatusMessage(`🔓 FIREWALL BREACHED! Encryption cracked in ${attemptsUsed} attempt${attemptsUsed === 1 ? '' : 's'}.`);
      // Multiplier from 1.2x to 2.0x based on remaining attempts
      const multiplier = Math.min(2.0, 1.2 + (newAttempts / maxAttempts) * 0.8);
      setTimeout(() => onComplete(multiplier), 1200);
    } else if (newAttempts <= 0) {
      // Failed attempts
      setGameOver(true);
      setStatusMessage(`🔒 SYSTEM LOCKED! Code was: ${targetCode.join(' ')}`);
      setTimeout(() => onComplete(0.5), 1400);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[440px] w-full max-w-xl mx-auto p-4 bg-slate-950 text-emerald-400 font-mono rounded-xl shadow-2xl border border-emerald-500/40">
      {/* Header */}
      <div className="w-full flex justify-between items-center border-b border-emerald-900/60 pb-3">
        <div>
          <h2 className="text-xl font-black text-emerald-400 tracking-wider uppercase flex items-center gap-2">
            💻 Data Encryption Code Breaker
          </h2>
          <p className="text-xs text-emerald-600">Firewall Decryption Protocol L{level}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Attempts Left</div>
          <div className={`text-sm font-bold ${attemptsLeft <= 2 ? 'text-red-400 animate-pulse' : 'text-emerald-300'}`}>
            {attemptsLeft} / {maxAttempts}
          </div>
        </div>
      </div>

      {/* Terminal History Display */}
      <div className="w-full bg-black/80 rounded-lg p-3 border border-emerald-900/50 my-2 space-y-1.5 h-44 overflow-y-auto">
        {feedbackHistory.length === 0 ? (
          <div className="text-xs text-emerald-700 italic text-center pt-8">
            Enter {codeLength} hex symbols to probe firewall response...
          </div>
        ) : (
          feedbackHistory.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs border-b border-emerald-900/30 pb-1">
              <span className="text-slate-400 font-bold">#{idx + 1}:</span>
              <span className="text-emerald-200 tracking-widest font-bold">
                {item.guess.join(' ')}
              </span>
              <span className="text-[11px] font-semibold space-x-2">
                <span className="text-emerald-400">🟢 Exact: {item.exactMatches}</span>
                <span className="text-amber-400">🟡 Partial: {item.partialMatches}</span>
              </span>
            </div>
          ))
        )}
      </div>

      {/* Current Active Guess Input */}
      <div className="w-full flex items-center justify-center gap-2 py-2 my-1 bg-emerald-950/40 rounded-lg border border-emerald-800/40">
        {Array.from({ length: codeLength }).map((_, idx) => (
          <div
            key={idx}
            className={`w-9 h-10 rounded border flex items-center justify-center text-base font-bold shadow-inner transition-all ${
              userGuess[idx]
                ? 'border-emerald-400 bg-emerald-900/40 text-emerald-300'
                : 'border-emerald-900/80 bg-black/40 text-slate-600'
            }`}
          >
            {userGuess[idx] || '_'}
          </div>
        ))}
      </div>

      {/* Game Over Message / Keypad */}
      {statusMessage ? (
        <div className="w-full p-4 bg-emerald-950/80 rounded-lg border border-emerald-400/60 text-center font-bold text-sm text-emerald-300 animate-fade-in my-2">
          {statusMessage}
        </div>
      ) : (
        <div className="w-full space-y-2 my-1">
          {/* Hex Symbol Grid */}
          <div className="grid grid-cols-8 gap-1.5">
            {HEX_SYMBOLS.map((sym) => (
              <button
                key={sym}
                onClick={() => handleSymbolPress(sym)}
                disabled={gameOver || userGuess.length >= codeLength}
                className="py-1.5 rounded bg-slate-900 hover:bg-emerald-900/60 border border-emerald-800/50 hover:border-emerald-400 text-xs font-bold text-emerald-300 disabled:opacity-30 transition-colors"
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Controls: Backspace & Decrypt Submit */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleBackspace}
              disabled={gameOver || userGuess.length === 0}
              className="py-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 disabled:opacity-30"
            >
              ⌫ DELETE
            </button>
            <button
              onClick={handleSubmitGuess}
              disabled={gameOver || userGuess.length !== codeLength}
              className="py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black tracking-wide uppercase disabled:opacity-30 transition-all shadow-md"
            >
              🔓 EXECUTE DECRYPT
            </button>
          </div>
        </div>
      )}

      {/* Footer Instructions */}
      <div className="w-full text-center text-[10px] text-emerald-600 pt-2 border-t border-emerald-950">
        🟢 Exact = Right symbol & position | 🟡 Partial = Right symbol, wrong position
      </div>
    </div>
  );
};
