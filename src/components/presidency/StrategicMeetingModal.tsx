import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import type { PresidentialActivity, PresidentialActivityChoice } from '../../types/game';
import { Activity, Shield, Users, CheckCircle2, AlertTriangle, Globe, Landmark, Radio, Key } from 'lucide-react';

interface StrategicMeetingModalProps {
  activity: PresidentialActivity;
  onClose: () => void;
}

type Stage = 'BRIEFING' | 'CHOICE' | 'EXECUTION' | 'RESULTS';

export const StrategicMeetingModal: React.FC<StrategicMeetingModalProps> = ({ activity, onClose }) => {
  const { pl, resolvePresidentialActivity } = useGameStore();
  const [stage, setStage] = useState<Stage>('BRIEFING');
  const [selectedChoice, setSelectedChoice] = useState<PresidentialActivityChoice | null>(null);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [performanceMultiplier, setPerformanceMultiplier] = useState(1.0);
  const [outcome, setOutcome] = useState<any>(null);

  // General simulation timer ref
  const timerRef = useRef<any>(null);

  // ----------------------------------------------------
  // MINIGAME 1: Budget Balancing Slider
  // ----------------------------------------------------
  const [budgetVal, setBudgetVal] = useState(50);
  const [targetZoneVal, setTargetZoneVal] = useState(50);
  const [targetZoneDir, setTargetZoneDir] = useState(1);

  // ----------------------------------------------------
  // MINIGAME 2: Cabinet Alignment Board (Lights Out)
  // ----------------------------------------------------
  const [cabinetGrid, setCabinetGrid] = useState<boolean[]>([
    false, true, false,
    true, false, true,
    false, true, false
  ]);

  // ----------------------------------------------------
  // MINIGAME 3: Trade Barter Scale
  // ----------------------------------------------------
  const [scaleVal, setScaleVal] = useState(50);

  // ----------------------------------------------------
  // MINIGAME 4: Diplomatic Cable Transmission
  // ----------------------------------------------------
  const [diplomacyNodes, setDiplomacyNodes] = useState<{ id: number; x: number; active: boolean }[]>([]);
  const nextNodeId = useRef(0);

  // ----------------------------------------------------
  // MINIGAME 5: Q&A Question Deflection
  // ----------------------------------------------------
  const [questions, setQuestions] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const nextQuestionId = useRef(0);
  const questionPool = ["SCANDAL?", "TAXES?", "DEFICIT?", "COVERUP?", "SPENDING?", "FOREIGN AID?", "POLLING?"];

  // ----------------------------------------------------
  // MINIGAME 6: Crisis Dispatch Grid
  // ----------------------------------------------------
  const [sirens, setSirens] = useState<{ id: number; index: number; age: number }[]>([]);
  const nextSirenId = useRef(0);

  // ----------------------------------------------------
  // MINIGAME 7: Threat Decryption Network
  // ----------------------------------------------------
  const [decryptionPattern, setDecryptionPattern] = useState<number[]>([]);
  const [playerInputPattern, setPlayerInputPattern] = useState<number[]>([]);
  const [currentSeqTarget, setCurrentSeqTarget] = useState(0);

  // ----------------------------------------------------
  // MAIN GAME LOOP (Execution Stage)
  // ----------------------------------------------------
  useEffect(() => {
    if (stage === 'EXECUTION') {
      setExecutionProgress(0);
      setPerformanceMultiplier(1.0);

      // Initialize minigame-specific states
      // Cabinet Board
      setCabinetGrid(Array.from({ length: 9 }, () => Math.random() > 0.5));
      // Trade Scale
      setScaleVal(50);
      // Diplomacy timing nodes
      setDiplomacyNodes([
        { id: nextNodeId.current++, x: 0, active: true },
        { id: nextNodeId.current++, x: -30, active: true },
        { id: nextNodeId.current++, x: -60, active: true }
      ]);
      // Press questions
      setQuestions([]);
      // Emergency response sirens
      setSirens([
        { id: nextSirenId.current++, index: Math.floor(Math.random() * 9), age: 0 }
      ]);
      // Threat Decryption sequence (random 4 steps of indices 0-3)
      const pattern = Array.from({ length: 4 }, () => Math.floor(Math.random() * 4));
      setDecryptionPattern(pattern);
      setPlayerInputPattern([]);
      setCurrentSeqTarget(pattern[0]);

      // Game loops running every 60ms (approx 16 updates per second)
      timerRef.current = setInterval(() => {
        setExecutionProgress(prev => {
          if (prev >= 100) {
            clearInterval(timerRef.current);
            handleResolution();
            return 100;
          }
          return prev + 1; // 100 ticks total (~6 seconds of gameplay)
        });

        // 1. Budget Slider drift
        setTargetZoneVal(curr => {
          let nextDir = targetZoneDir;
          if (curr >= 85) nextDir = -1;
          else if (curr <= 15) nextDir = 1;
          else if (Math.random() < 0.08) nextDir = Math.random() > 0.5 ? 1 : -1;

          setTargetZoneDir(nextDir);
          const nextVal = Math.min(90, Math.max(10, curr + nextDir * (2.5 + (pl.presidentMonth / 20))));

          // If player's budget value matches, slowly build performance
          setBudgetVal(b => {
            const diff = Math.abs(b - nextVal);
            if (diff < 12) {
              setPerformanceMultiplier(m => Math.min(1.5, m + 0.005));
            }
            return b;
          });

          return nextVal;
        });

        // 2. Cabinet Alignment score builder (Passive gain based on aligned cabinet)
        setCabinetGrid(grid => {
          const alignedCount = grid.filter(g => g).length;
          if (alignedCount >= 7) {
            setPerformanceMultiplier(m => Math.min(1.5, m + 0.008));
          }
          return grid;
        });

        // 3. Trade Scale drift
        setScaleVal(curr => {
          const drift = (Math.random() - 0.5) * (4 + (pl.presidentMonth / 15));
          const nextVal = Math.min(95, Math.max(5, curr + drift));
          // If scale is balanced within 40-60 optimal zone, reward player
          if (nextVal >= 40 && nextVal <= 60) {
            setPerformanceMultiplier(m => Math.min(1.5, m + 0.006));
          }
          return nextVal;
        });

        // 4. Diplomatic Timing Nodes move
        setDiplomacyNodes(curr => {
          return curr.map(node => {
            let nextX = node.x + 1.8;
            if (nextX > 100) {
              nextX = -20; // wrap around
              return { ...node, x: nextX, active: true };
            }
            return { ...node, x: nextX };
          });
        });

        // 5. Press Questions fall
        setQuestions(curr => {
          // Spawn new questions occasionally
          let updated = [...curr];
          if (Math.random() < 0.07 && updated.length < 5) {
            updated.push({
              id: nextQuestionId.current++,
              text: questionPool[Math.floor(Math.random() * questionPool.length)],
              x: Math.random() * 80 + 10,
              y: 0
            });
          }
          // Move questions down
          return updated.map(q => ({ ...q, y: q.y + 2.5 })).filter(q => q.y < 100);
        });

        // 6. Emergency response aging
        setSirens(curr => {
          let updated = curr.map(s => ({ ...s, age: s.age + 2 })).filter(s => s.age < 100);
          if (Math.random() < 0.12 && updated.length < 3) {
            const availableCells = Array.from({ length: 9 }, (_, i) => i).filter(cell => !updated.some(s => s.index === cell));
            if (availableCells.length > 0) {
              updated.push({
                id: nextSirenId.current++,
                index: availableCells[Math.floor(Math.random() * availableCells.length)],
                age: 0
              });
            }
          }
          return updated;
        });

      }, 60);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [stage]);

  const handleResolution = () => {
    if (!selectedChoice) return;
    const result = resolvePresidentialActivity(activity.id, selectedChoice.id, performanceMultiplier);
    setOutcome(result);
    setStage('RESULTS');
  };

  const checkRequirement = (choice: PresidentialActivityChoice) => {
    if (!choice.requirement) return true;
    const { type, value } = choice.requirement.stat;
    switch (type) {
      case 'aura': return pl.aura >= value;
      case 'clout': return pl.clout >= value;
      case 'relations': return pl.foreignRelations >= value;
      default: return true;
    }
  };

  const getCabinetBonus = (choice: PresidentialActivityChoice) => {
    if (!choice.cabinetBonus) return null;
    const appointee = pl.cabinet[choice.cabinetBonus.roleId];
    if (!appointee) return null;
    return {
      name: appointee.name,
      message: choice.cabinetBonus.message,
      multiplier: appointee.isTrustedAlly ? choice.cabinetBonus.multiplier + 0.5 : choice.cabinetBonus.multiplier
    };
  };

  // ----------------------------------------------------
  // INTERACTIVE MINIGAME USER CONTROLS
  // ----------------------------------------------------

  // 1. Budget slider change
  const handleBudgetChange = (val: number) => {
    setBudgetVal(val);
    const diff = Math.abs(val - targetZoneVal);
    if (diff < 12) {
      setPerformanceMultiplier(m => Math.min(1.5, m + 0.04));
      if (navigator.vibrate) navigator.vibrate(10);
    }
  };

  // 2. Cabinet opinion alignment toggles (Lights out adjacent toggle)
  const toggleCabinetOpinion = (index: number) => {
    const adjacent = [
      [index - 3, index + 3, index % 3 !== 0 ? index - 1 : -1, index % 3 !== 2 ? index + 1 : -1]
    ].flat().filter(i => i >= 0 && i < 9);

    setCabinetGrid(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      adjacent.forEach(adjIndex => {
        copy[adjIndex] = !copy[adjIndex];
      });

      const totalAligned = copy.filter(g => g).length;
      setPerformanceMultiplier(m => Math.min(1.5, m + 0.05 * totalAligned));

      return copy;
    });

    if (navigator.vibrate) navigator.vibrate(15);
  };

  // 3. Trade balance scales (Push slider left or right)
  const pushTradeScale = (direction: 'left' | 'right') => {
    setScaleVal(curr => {
      const delta = direction === 'left' ? -15 : 15;
      const nextVal = Math.min(95, Math.max(5, curr + delta));
      if (nextVal >= 40 && nextVal <= 60) {
        setPerformanceMultiplier(m => Math.min(1.5, m + 0.08));
      }
      return nextVal;
    });
    if (navigator.vibrate) navigator.vibrate(15);
  };

  // 4. Diplomatic Cable Timing Tap
  const sendDiplomaticCable = () => {
    // Find if any active node is in target sweet spot (zone is around x coordinate 45 to 55)
    let perfectHit = false;
    setDiplomacyNodes(curr => {
      let hitNodeIndex = curr.findIndex(node => node.active && node.x >= 40 && node.x <= 60);
      if (hitNodeIndex !== -1) {
        perfectHit = true;
        const updated = [...curr];
        updated[hitNodeIndex] = { ...updated[hitNodeIndex], active: false };
        return updated;
      }
      return curr;
    });

    if (perfectHit) {
      setPerformanceMultiplier(m => Math.min(1.5, m + 0.12));
      if (navigator.vibrate) navigator.vibrate(30);
    } else {
      // Small penalty or miss
      setPerformanceMultiplier(m => Math.max(1.0, m - 0.05));
    }
  };

  // 5. Press question deflection tap
  const deflectQuestion = (id: number) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    setPerformanceMultiplier(m => Math.min(1.5, m + 0.08));
    if (navigator.vibrate) navigator.vibrate(15);
  };

  // 6. Emergency siren resolution tap
  const resolveSiren = (id: number) => {
    setSirens(prev => prev.filter(s => s.id !== id));
    setPerformanceMultiplier(m => Math.min(1.5, m + 0.08));
    if (navigator.vibrate) navigator.vibrate(20);
  };

  // 7. National security sequence node trace
  const handleSecurityNodeTap = (index: number) => {
    if (index === currentSeqTarget) {
      // Correct node tapped
      const nextStep = playerInputPattern.length + 1;
      if (nextStep === decryptionPattern.length) {
        // Full sequence decrypted! Great reward!
        setPerformanceMultiplier(m => Math.min(1.5, m + 0.25));
        // Regen new sequence
        const newPattern = Array.from({ length: 4 }, () => Math.floor(Math.random() * 4));
        setDecryptionPattern(newPattern);
        setPlayerInputPattern([]);
        setCurrentSeqTarget(newPattern[0]);
      } else {
        setPlayerInputPattern(curr => [...curr, index]);
        setCurrentSeqTarget(decryptionPattern[nextStep]);
        setPerformanceMultiplier(m => Math.min(1.5, m + 0.05));
      }
      if (navigator.vibrate) navigator.vibrate(30);
    } else {
      // Wrong node tapped, reset progress
      setPlayerInputPattern([]);
      setCurrentSeqTarget(decryptionPattern[0]);
      if (navigator.vibrate) navigator.vibrate([40, 40]);
    }
  };

  // ----------------------------------------------------
  // SUB-RENDERERS FOR EACH UNIQUE THEME
  // ----------------------------------------------------

  // Category BUDGET + ID negotiations -> Budget Balancing Slider
  const renderBudgetNegotiations = () => {
    return (
      <div className="space-y-6 py-4">
        <div className="flex items-center justify-center gap-2 text-yellow-400">
          <Landmark size={20} />
          <span className="text-xs font-black tracking-widest uppercase">BUDGET ALLOCATOR LEDGER</span>
        </div>
        <div className="text-[10px] text-slate-400 italic text-center max-w-xs mx-auto">
          "The budget is shifting. Slide your discretionary allocation block to align with the changing legislative consensus."
        </div>

        <div className="relative h-20 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden px-4 flex items-center">
          {/* Consensus Zone Track */}
          <div className="absolute inset-y-0 left-0 right-0 h-4 bg-slate-900 rounded-full my-auto" />

          {/* Optimal Target consensus zone */}
          <motion.div
            className="absolute h-8 bg-emerald-500/20 border-2 border-emerald-500 rounded-xl flex items-center justify-center text-[8px] font-black text-emerald-400"
            style={{
              left: `${targetZoneVal - 10}%`,
              width: '20%',
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            CONSENSUS
          </motion.div>

          {/* Player Proposed Allocation indicator */}
          <div
            className="absolute h-10 w-10 bg-blue-600 border border-white/50 rounded-full flex items-center justify-center text-xl shadow-[0_0_15px_rgba(59,130,246,0.6)] z-10 pointer-events-none"
            style={{
              left: `calc(${budgetVal}% - 20px)`,
            }}
          >
            💰
          </div>
        </div>

        {/* Interactive slider for user */}
        <div className="px-4">
          <input
            type="range"
            min="10"
            max="90"
            value={budgetVal}
            onChange={(e) => handleBudgetChange(Number(e.target.value))}
            className="w-full h-4 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
          />
          <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2">
            <span>Tight Fiscal Cap</span>
            <span>Balanced Target</span>
            <span>Expansive Funding</span>
          </div>
        </div>
      </div>
    );
  };

  // Category CABINET or Cabinet Vote -> Cabinet alignment Lights-out Board
  const renderCabinetVote = () => {
    return (
      <div className="space-y-4 py-4">
        <div className="flex items-center justify-center gap-2 text-blue-400">
          <Users size={20} />
          <span className="text-xs font-black tracking-widest uppercase">CABINET ALIGNMENT BOARD</span>
        </div>
        <div className="text-[10px] text-slate-400 italic text-center max-w-xs mx-auto">
          "Cabinet members are debating. Tap members to align their loyalty. A single tap influences adjacent delegates!"
        </div>

        <div className="grid grid-cols-3 gap-2 w-48 mx-auto py-2">
          {cabinetGrid.map((opinion, idx) => (
            <button
              key={idx}
              onClick={() => toggleCabinetOpinion(idx)}
              className={`h-14 rounded-xl border-2 font-bold text-lg flex flex-col items-center justify-center transition-all ${
                opinion
                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                  : 'bg-red-950/30 border-red-800/80 text-red-400'
              }`}
            >
              <span className="text-lg">💼</span>
              <span className="text-[7px] font-black uppercase mt-0.5 tracking-tighter">
                {opinion ? 'AGREE' : 'DISSENT'}
              </span>
            </button>
          ))}
        </div>
        <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center">
          Goal: Flip the entire grid green to earn massive strategic bonuses
        </div>
      </div>
    );
  };

  // ID trade_negotiations -> Trade Barter Scale
  const renderTradeNegotiations = () => {
    return (
      <div className="space-y-6 py-4">
        <div className="flex items-center justify-center gap-2 text-indigo-400">
          <Globe size={20} />
          <span className="text-xs font-black tracking-widest uppercase">TRADE TARIFF SCALE</span>
        </div>
        <div className="text-[10px] text-slate-400 italic text-center max-w-xs mx-auto">
          "Balance import and export trade winds. Push Tariffs or Subsidies to keep trade within the center optimal corridor!"
        </div>

        <div className="relative h-16 bg-slate-950 rounded-2xl border border-slate-800 flex items-center overflow-hidden px-4">
          {/* Target Zone in middle 40-60 */}
          <div className="absolute inset-y-0 left-[40%] w-[20%] bg-emerald-500/20 border-x border-emerald-500/40" />

          {/* Scale track indicator */}
          <div className="absolute inset-x-4 h-1 bg-slate-800 rounded-full" />

          {/* Scale Needle pointer */}
          <div
            className="absolute h-8 w-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] flex items-center justify-center"
            style={{ left: `${scaleVal}%` }}
          >
            <div className="absolute top-[-10px] text-lg">🚢</div>
          </div>

          <div className="absolute left-[45%] top-1 text-[7px] font-black text-emerald-400 uppercase tracking-widest">
            OPTIMAL CORRIDOR
          </div>
        </div>

        <div className="flex gap-4 px-4">
          <button
            onClick={() => pushTradeScale('left')}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black rounded-xl border-b-4 border-slate-950 active:border-0 active:translate-y-1 transition-all"
          >
            ⬅️ TARIFFS (LEFT)
          </button>
          <button
            onClick={() => pushTradeScale('right')}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black rounded-xl border-b-4 border-slate-950 active:border-0 active:translate-y-1 transition-all"
          >
            SUBSIDIES (RIGHT) ➡️
          </button>
        </div>
      </div>
    );
  };

  // Category DIPLOMACY -> Diplomatic timing cable tap
  const renderForeignRelations = () => {
    return (
      <div className="space-y-6 py-4">
        <div className="flex items-center justify-center gap-2 text-teal-400">
          <Radio size={20} />
          <span className="text-xs font-black tracking-widest uppercase">DIPLOMATIC CABLE TRANSMISSION</span>
        </div>
        <div className="text-[10px] text-slate-400 italic text-center max-w-xs mx-auto">
          "Foreign embassies are open. Tap 'TRANSMIT' exactly when a signal node matches the center sweet spot target."
        </div>

        <div className="relative h-16 bg-slate-950 rounded-2xl border border-slate-800 flex items-center overflow-hidden px-8">
          {/* Target Zone in middle */}
          <div className="absolute inset-y-0 left-[45%] w-[10%] bg-emerald-500/20 border-x-2 border-emerald-500 flex items-center justify-center text-[7px] font-black text-emerald-400">
            TARGET
          </div>

          {/* Signal path */}
          <div className="absolute left-4 right-4 h-1 bg-slate-900 rounded-full" />

          {/* Gliding nodes */}
          {diplomacyNodes.map(node => (
            <div
              key={node.id}
              className={`absolute h-4 w-4 rounded-full flex items-center justify-center text-xs transition-opacity duration-300 ${
                node.active ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 'bg-slate-800 opacity-20'
              }`}
              style={{ left: `${node.x}%` }}
            >
              ⚡
            </div>
          ))}
        </div>

        <div className="px-4">
          <button
            onClick={sendDiplomaticCable}
            className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-black uppercase tracking-widest rounded-xl border-b-4 border-teal-950 active:border-0 active:translate-y-1 transition-all text-xs"
          >
            TRANSMIT DIPLOMATIC CABLE 📥
          </button>
        </div>
      </div>
    );
  };

  // Category ELECTION or ID intelligence -> Press Q&A Question Deflection
  const renderPressConference = () => {
    return (
      <div className="space-y-4 py-2 relative min-h-[220px]">
        <div className="flex items-center justify-center gap-2 text-rose-400">
          <AlertTriangle size={20} />
          <span className="text-xs font-black tracking-widest uppercase">Q&A QUESTION DEFLECTION</span>
        </div>
        <div className="text-[10px] text-slate-400 italic text-center max-w-xs mx-auto">
          "Scurrilous questions are falling from reporters. Tap speech bubbles to respond and deflect them before they hit your podium!"
        </div>

        <div className="relative h-44 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
          {/* Podium at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-slate-900/95 border-t border-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500 uppercase tracking-widest">
            🛡️ PRESS SECRETARY PODIUM
          </div>

          {/* Falling Questions */}
          <AnimatePresence>
            {questions.map(q => (
              <motion.button
                key={q.id}
                onClick={() => deflectQuestion(q.id)}
                className="absolute px-3 py-1 bg-red-600 text-white font-black text-[9px] rounded-full border border-red-400/50 flex items-center gap-1 shadow-lg cursor-pointer"
                style={{
                  left: `${q.x}%`,
                  top: `${q.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                🎤 {q.text}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // Category CRISIS or DISASTER -> Emergency Dispatch coordination grid
  const renderEmergencyResponse = () => {
    return (
      <div className="space-y-4 py-2">
        <div className="flex items-center justify-center gap-2 text-orange-500">
          <Activity size={20} />
          <span className="text-xs font-black tracking-widest uppercase">CRISIS DISPATCH SHIELD</span>
        </div>
        <div className="text-[10px] text-slate-400 italic text-center max-w-xs mx-auto">
          "Emergencies are flashing on the domestic grid. Dispatch emergency federal responders by tapping flashing coordinates immediately!"
        </div>

        <div className="grid grid-cols-3 gap-2 w-44 mx-auto py-2">
          {Array.from({ length: 9 }).map((_, idx) => {
            const activeSiren = sirens.find(s => s.index === idx);
            return (
              <div
                key={idx}
                className="relative h-12 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-center overflow-hidden"
              >
                {activeSiren ? (
                  <button
                    onClick={() => resolveSiren(activeSiren.id)}
                    className="absolute inset-0 bg-red-600/30 hover:bg-red-600/50 border border-red-500 rounded-xl flex flex-col items-center justify-center animate-pulse cursor-pointer"
                  >
                    <span className="text-lg">🚨</span>
                    <div className="h-1 bg-red-500 absolute bottom-0 left-0" style={{ width: `${100 - activeSiren.age}%` }} />
                  </button>
                ) : (
                  <span className="text-slate-800 text-[10px] font-mono select-none">
                    0{idx + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Category SECURITY -> National Threat decryption seq-matching
  const renderNationalSecurity = () => {
    return (
      <div className="space-y-4 py-2">
        <div className="flex items-center justify-center gap-2 text-emerald-400">
          <Key size={20} />
          <span className="text-xs font-black tracking-widest uppercase">THREAT DECRYPTION NETWORK</span>
        </div>
        <div className="text-[10px] text-slate-400 italic text-center max-w-xs mx-auto">
          "Classified satellite feeds are locked. Intercept and tap the flashing security grid nodes in sequence to decrypt intelligence."
        </div>

        <div className="grid grid-cols-2 gap-4 w-52 mx-auto py-2">
          {[0, 1, 2, 3].map(idx => {
            const isTarget = currentSeqTarget === idx;
            const isPartlyClicked = playerInputPattern.includes(idx);

            return (
              <button
                key={idx}
                onClick={() => handleSecurityNodeTap(idx)}
                className={`h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                  isTarget
                    ? 'bg-red-600/30 border-red-500 text-red-400 animate-bounce shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : isPartlyClicked
                      ? 'bg-emerald-950/40 border-emerald-600 text-emerald-400 opacity-60'
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <span className="text-xl">{isTarget ? '🛰️' : '🔒'}</span>
                <span className="text-[8px] font-mono tracking-widest uppercase mt-1">
                  {isTarget ? 'ACTIVE NODE' : `NODE 0${idx + 1}`}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest text-center">
          Decryption Stage: {playerInputPattern.length} / {decryptionPattern.length} Complete
        </div>
      </div>
    );
  };

  // Delegate helper to select correct layout
  const renderSpecificMinigame = () => {
    if (activity.id === 'budget_negotiations') {
      return renderBudgetNegotiations();
    }
    if (activity.id === 'cabinet_vote') {
      return renderCabinetVote();
    }
    if (activity.id === 'trade_negotiations') {
      return renderTradeNegotiations();
    }
    if (activity.category === 'DIPLOMACY') {
      return renderForeignRelations();
    }
    if (activity.category === 'ELECTION' || activity.id === 'election_debate' || activity.id === 'intelligence_report') {
      return renderPressConference();
    }
    if (activity.category === 'CRISIS' || activity.category === 'DISASTER') {
      return renderEmergencyResponse();
    }
    if (activity.category === 'SECURITY') {
      return renderNationalSecurity();
    }
    // Fallback: Default to budget or emergency
    return renderEmergencyResponse();
  };

  const renderBriefing = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-center"
    >
      <div className="w-24 h-24 bg-blue-500/10 border-2 border-blue-500/30 rounded-full flex items-center justify-center mx-auto text-5xl shadow-[0_0_30px_rgba(59,130,246,0.2)]">
        {activity.icon}
      </div>
      <div>
        <div className="text-[10px] text-blue-400 font-black uppercase tracking-[0.4em] mb-2">Presidential Briefing</div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{activity.title}</h2>
      </div>
      <p className="text-slate-300 font-serif italic text-lg leading-relaxed px-4">
        "{activity.description}"
      </p>
      <button
        onClick={() => setStage('CHOICE')}
        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-xl shadow-blue-900/20"
      >
        COMMENCE STRATEGY SESSION →
      </button>
    </motion.div>
  );

  const renderChoice = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 text-center">SELECT STRATEGIC DIRECTION</div>

      {activity.choices.map(choice => {
        const isAvailable = checkRequirement(choice);
        const bonus = getCabinetBonus(choice);

        return (
          <button
            key={choice.id}
            disabled={!isAvailable}
            onClick={() => setSelectedChoice(choice)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all relative overflow-hidden group ${
              selectedChoice?.id === choice.id
                ? 'bg-blue-600/20 border-blue-500 shadow-lg'
                : isAvailable
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950 border-slate-900 opacity-50 grayscale cursor-not-allowed'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className={`text-sm font-black uppercase ${selectedChoice?.id === choice.id ? 'text-blue-400' : 'text-white'}`}>
                {choice.label}
              </h3>
              {!isAvailable && (
                <div className="text-[8px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded uppercase">
                  REQ: {choice.requirement?.stat.value} {choice.requirement?.stat.type}
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-serif italic mb-3 leading-snug">"{choice.description}"</p>

            <div className="flex flex-wrap gap-2">
              {Object.entries(choice.impact).map(([key, val]) => {
                if (typeof val !== 'number' || val === 0) return null;
                const isPos = val > 0;
                // Simplify key names for display
                const label = key === 'federalBudget' ? 'Budget' : key.charAt(0).toUpperCase() + key.slice(1);
                return (
                  <span key={key} className={`text-[7px] font-black px-1.5 py-0.5 rounded ${isPos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {isPos ? '+' : ''}{key === 'federalBudget' ? `$${(val/1000000).toFixed(0)}M` : val}{key === 'approval' || key === 'inflation' || key === 'debt' ? '%' : ''} {label}
                  </span>
                );
              })}
            </div>

            {bonus && (
              <div className="mt-3 pt-3 border-t border-blue-500/20">
                <div className="text-[8px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-1">
                  <Users size={8} /> CABINET BONUS: {bonus.name}
                </div>
                <div className="text-[8px] text-slate-500 italic mt-0.5">{bonus.message} (x{bonus.multiplier.toFixed(1)} Impact)</div>
              </div>
            )}
          </button>
        );
      })}

      <div className="pt-4">
        <button
          disabled={!selectedChoice}
          onClick={() => setStage('EXECUTION')}
          className={`w-full py-4 font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl ${
            selectedChoice
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          EXECUTE COMMAND →
        </button>
      </div>
    </motion.div>
  );

  const renderExecution = () => (
    <div className="space-y-6 text-center py-4 relative min-h-[300px]">
      {/* 1. Header Information */}
      <div className="flex justify-between items-center px-4">
        <div className="text-left">
          <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Strategic Plan</div>
          <div className="text-xs font-black text-white max-w-[200px] truncate">{selectedChoice?.label}</div>
        </div>
        <div className="text-right">
          <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Multiplier Bonus</div>
          <div className="text-xs font-black text-emerald-400 font-mono">{performanceMultiplier.toFixed(2)}x</div>
        </div>
      </div>

      {/* 2. Main Selected Minigame Console */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-[2rem] p-4 min-h-[220px]">
        {renderSpecificMinigame()}
      </div>

      {/* 3. Global Term Limit Circular/Flat progress indicators */}
      <div className="max-w-xs mx-auto px-4">
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${executionProgress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
          <span>Processing Command Execution</span>
          <span>{executionProgress}%</span>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!outcome) return null;
    const { impacts, diaryEntry } = outcome;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-emerald-500" size={40} />
          </div>
          <div className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.4em] mb-1">Strategic Victory</div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Resolution Complete</h2>
          <div className="text-[10px] text-slate-500 font-bold">PERFORMANCE BONUS: +{Math.round((performanceMultiplier - 1.0) * 100)}%</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
           <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-3">HISTORICAL RECORD</div>
           <p className="text-sm text-slate-200 font-serif italic leading-relaxed">
             "{diaryEntry}"
           </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Object.entries(impacts).map(([key, val]) => {
            if (typeof val !== 'number' || val === 0) return null;
            const isPos = val > 0;
            const label = key === 'federalBudget' ? 'Budget' : key.charAt(0).toUpperCase() + key.slice(1);
            return (
              <div key={key} className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
                <div className="text-[8px] text-slate-500 font-bold uppercase mb-1">{label}</div>
                <div className={`text-lg font-black ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPos ? '+' : ''}{key === 'federalBudget' ? `$${(val/1000000).toFixed(1)}M` : val}{key === 'approval' || key === 'inflation' || key === 'debt' ? '%' : ''}
                </div>
              </div>
            );
          })}
        </div>

        {pl.presidentMonth > 36 && (
          <div className="text-[9px] text-orange-400 font-black uppercase text-center bg-orange-500/10 border border-orange-500/30 py-2 rounded-lg animate-pulse">
            ⚠️ Lame Duck Period: Diminished Returns Applied
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-4 bg-white text-slate-950 font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-xl"
        >
          CLOSE BRIEFING
        </button>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Shield size={120} />
        </div>

        <AnimatePresence mode="wait">
          {stage === 'BRIEFING' && renderBriefing()}
          {stage === 'CHOICE' && renderChoice()}
          {stage === 'EXECUTION' && renderExecution()}
          {stage === 'RESULTS' && renderResults()}
        </AnimatePresence>
      </div>
    </div>
  );
};
