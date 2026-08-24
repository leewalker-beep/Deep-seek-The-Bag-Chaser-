import React, { useState, useEffect } from 'react';

interface ReadTheRoomProps {
  onComplete: (multiplier: number) => void;
  level?: number;
  tier?: string;
}

interface PoliticianScenario {
  id: string;
  politicianName: string;
  role: string;
  stanceText: string;
  stanceGauge: 'CONSERVATIVE' | 'PROGRESSIVE' | 'CENTRIST' | 'LIBERTARIAN'; // target stance
  options: {
    label: string;
    stance: 'CONSERVATIVE' | 'PROGRESSIVE' | 'CENTRIST' | 'LIBERTARIAN';
    argument: string;
  }[];
}

const SCENARIOS: PoliticianScenario[] = [
  {
    id: '1',
    politicianName: 'Senator Vance',
    role: 'Chair of Energy & Commerce',
    stanceText: 'We need to talk about energy independence and deregulation, but without alienating moderate voters.',
    stanceGauge: 'CONSERVATIVE',
    options: [
      {
        label: 'A',
        stance: 'CONSERVATIVE',
        argument: 'Propose tax credits for domestic energy production and streamlined federal permitting.',
      },
      {
        label: 'B',
        stance: 'PROGRESSIVE',
        argument: 'Demand an immediate federal ban on fossil fuels and mandate 100% renewables.',
      },
      {
        label: 'C',
        stance: 'LIBERTARIAN',
        argument: 'Abolish the Department of Energy completely and remove all interstate trade rules.',
      },
    ],
  },
  {
    id: '2',
    politicianName: 'Congresswoman Chen',
    role: 'House Tech & Innovation Committee',
    stanceText: 'AI regulation must protect consumer privacy while keeping domestic tech startups competitive globally.',
    stanceGauge: 'PROGRESSIVE',
    options: [
      {
        label: 'A',
        stance: 'CONSERVATIVE',
        argument: 'Block all federal oversight of AI algorithms to protect corporate trade secrets.',
      },
      {
        label: 'B',
        stance: 'PROGRESSIVE',
        argument: 'Establish transparency standards and privacy protections with innovation sandbox exemptions.',
      },
      {
        label: 'C',
        stance: 'CENTRIST',
        argument: 'Form an advisory study commission that reports back in four years.',
      },
    ],
  },
  {
    id: '3',
    politicianName: 'Governor Sterling',
    role: 'Swing State Governor',
    stanceText: 'Infrastructure funding needs bipartisan appeal — balanced budgets with visible local job creation.',
    stanceGauge: 'CENTRIST',
    options: [
      {
        label: 'A',
        stance: 'CENTRIST',
        argument: 'Match federal grant dollars with private-public partnerships for regional highway and transit hubs.',
      },
      {
        label: 'B',
        stance: 'LIBERTARIAN',
        argument: 'Privatize all state toll roads and eliminate state transit subsidies immediately.',
      },
      {
        label: 'C',
        stance: 'CONSERVATIVE',
        argument: 'Redirect all infrastructure funding exclusively to rural county road repaving.',
      },
    ],
  },
];

export const ReadTheRoom: React.FC<ReadTheRoomProps> = ({ onComplete, level = 1 }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(Math.max(12 - (level - 1) * 2, 6));
  const [feedback, setFeedback] = useState<string | null>(null);

  const scenario = SCENARIOS[currentRound % SCENARIOS.length];

  useEffect(() => {
    if (feedback) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSelectOption(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRound, feedback]);

  const handleSelectOption = (stance: string | null) => {
    let roundScore = 0;
    if (stance === scenario.stanceGauge) {
      roundScore = 1;
      setFeedback('🎯 PERFECT PERSUASION! Stance aligned perfectly.');
    } else if (stance !== null) {
      roundScore = 0.5;
      setFeedback('⚠️ OFF-KEY! Argument missed politician stance.');
    } else {
      setFeedback('⏱️ TIME EXPIRED! Room lost.');
    }

    const newScore = score + roundScore;
    setScore(newScore);

    setTimeout(() => {
      setFeedback(null);
      if (currentRound + 1 >= 3) {
        // Calculate final performance score multiplier (0.5x to 2.0x)
        const accuracy = newScore / 3;
        const multiplier = Math.max(0.5, Math.min(2.0, 0.5 + accuracy * 1.5));
        onComplete(multiplier);
      } else {
        setCurrentRound((prev) => prev + 1);
        setTimeLeft(Math.max(12 - (level - 1) * 2, 6));
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[420px] w-full max-w-xl mx-auto p-4 bg-slate-900 text-white rounded-xl shadow-2xl border border-amber-500/30">
      {/* Header */}
      <div className="w-full flex justify-between items-center border-b border-slate-700 pb-3">
        <div>
          <h2 className="text-xl font-extrabold text-amber-400 tracking-wide uppercase">
            🏛️ Read The Room
          </h2>
          <p className="text-xs text-slate-400">Lobbying Stance Gauge & Persuasion</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-slate-300">
            Round {currentRound + 1} / 3
          </div>
          <div className={`text-xs font-mono ${timeLeft <= 3 ? 'text-red-400 animate-ping' : 'text-amber-300'}`}>
            ⏱️ {timeLeft}s
          </div>
        </div>
      </div>

      {/* Target Politician Briefing */}
      <div className="w-full bg-slate-800/80 rounded-lg p-4 border border-slate-700 my-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-amber-300 text-base">{scenario.politicianName}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40">
            {scenario.role}
          </span>
        </div>
        <p className="text-sm text-slate-200 italic mb-3">
          "{scenario.stanceText}"
        </p>

        {/* Stance Indicator Meter */}
        <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 border border-slate-700 flex justify-between items-center text-[10px] text-slate-400 px-1">
          <span className={scenario.stanceGauge === 'CONSERVATIVE' ? 'text-blue-400 font-bold' : ''}>CONS</span>
          <span className={scenario.stanceGauge === 'CENTRIST' ? 'text-amber-400 font-bold' : ''}>CENT</span>
          <span className={scenario.stanceGauge === 'PROGRESSIVE' ? 'text-emerald-400 font-bold' : ''}>PROG</span>
          <span className={scenario.stanceGauge === 'LIBERTARIAN' ? 'text-purple-400 font-bold' : ''}>LIB</span>
        </div>
      </div>

      {/* Options List or Feedback */}
      {feedback ? (
        <div className="w-full flex-1 flex items-center justify-center p-6 bg-slate-800/90 rounded-lg border border-amber-500/50 text-center text-amber-300 font-bold text-base animate-fade-in">
          {feedback}
        </div>
      ) : (
        <div className="w-full space-y-2.5 my-2">
          {scenario.options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleSelectOption(opt.stance)}
              className="w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/50 transition-all flex items-start space-x-3 group"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/40 group-hover:bg-amber-500 group-hover:text-slate-950">
                {opt.label}
              </span>
              <span className="text-xs text-slate-200 leading-snug">
                {opt.argument}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Footer Instructions */}
      <div className="w-full text-center text-[11px] text-slate-400 pt-2 border-t border-slate-800">
        Align your policy argument to match the politician's underlying stance before time expires!
      </div>
    </div>
  );
};
