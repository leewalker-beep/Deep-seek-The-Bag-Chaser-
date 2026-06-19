import React from 'react';
import { SwipeOrder } from '../minigames/SwipeOrder';
import type { SwipeItem } from '../minigames/SwipeOrder';

interface CabinetApprovalProps {
  onComplete: (multiplier: number) => void;
}

const CABINET_NOMINEES: SwipeItem[] = [
  { id: 101, name: 'SEC. OF STATE', type: 'real', timeLimit: 1.5 },
  { id: 102, name: 'MINISTER OF MAGIC', type: 'fake', timeLimit: 1.5 },
  { id: 103, name: 'TREASURY SEC.', type: 'real', timeLimit: 1.5 },
  { id: 104, name: 'GRAND VIZIER', type: 'fake', timeLimit: 1.5 },
  { id: 105, name: 'DEFENSE SEC.', type: 'real', timeLimit: 1.5 },
  { id: 106, name: 'SUPREME LEADER', type: 'fake', timeLimit: 1.5 },
  { id: 107, name: 'ATTORNEY GENERAL', type: 'real', timeLimit: 1.5 },
  { id: 108, name: 'GALACTIC EMPEROR', type: 'fake', timeLimit: 1.5 },
  { id: 109, name: 'CHIEF OF STAFF', type: 'real', timeLimit: 1.5 },
  { id: 110, name: 'COURT JESTER', type: 'fake', timeLimit: 1.5 },
  { id: 111, name: 'PRESS SECRETARY', type: 'real', timeLimit: 1.5 },
  { id: 112, name: 'MASTER OF COIN', type: 'fake', timeLimit: 1.5 },
  { id: 113, name: 'INTEL DIRECTOR', type: 'real', timeLimit: 1.5 },
  { id: 114, name: 'DARK LORD', type: 'fake', timeLimit: 1.5 },
  { id: 115, name: 'ENERGY SEC.', type: 'real', timeLimit: 1.5 },
];

export const CabinetApproval: React.FC<CabinetApprovalProps> = ({ onComplete }) => {
  return (
    <SwipeOrder
      title="CABINET APPROVAL"
      instruction="VET NOMINEES"
      leftLabel="REJECT"
      rightLabel="CONFIRM"
      icon="⚖️"
      items={CABINET_NOMINEES}
      onComplete={onComplete}
    />
  );
};
