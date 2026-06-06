export interface DeathMessage {
  message: string;
  badge: string;
}

export const DEATH_MESSAGES: Record<string, DeathMessage> = {
  r_labor: { message: "Your back finally gave out. The grind was literal.", badge: "BONE CRUSHER" },
  r_delivery: { message: "You died for a cold burger. The algorithm replaced you.", badge: "ROAD KILL" },
  r_plasma: { message: "You literally ran out of juice. Dry husk.", badge: "DRY WELL" },
  drop: { message: "Your supply chain broke. Warehouse tomb.", badge: "SHIP WRECK" },
  vintage: { message: "Buried alive by 90s windbreakers.", badge: "OLD SCHOOL" },
  cc: { message: "The comments finally got you.", badge: "RATIO'D" },
  pod: { message: "Nobody was listening.", badge: "DEAD AIR" },
  saas_mvp: { message: "404: Legacy not found.", badge: "NULL POINTER" },
  global_franchise: { message: "Corporate cog ground to dust.", badge: "CORPORATE CLONE" },
  the_campaign: { message: "Couldn't buy enough votes.", badge: "BANKRUPT CANDIDATE" },
  DEFAULT: { message: "You lived fast, died young.", badge: "GHOST IN THE MACHINE" },
};
