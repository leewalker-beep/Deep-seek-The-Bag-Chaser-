export const getElectionTitle = (masteryCount: number): string => {
  if (masteryCount >= 20) return 'The Unstoppable';
  if (masteryCount >= 10) return 'The Polymath';
  if (masteryCount >= 5) return 'The Coalition Builder';
  return 'The Specialist';
};
