/**
 * Centralized layout layering scale with named constants.
 * Prevents unstructured z-index collisions across modal overlays,
 * dashboards, HUD systems, and critical timed minigames.
 */
export const Z_INDEX = {
  BACKGROUND: -1,             // e.g. TierBackground
  DECORATION: 1,              // e.g. PrologueScreen ambient graphics
  HEADER_NAV: 30,             // e.g. Fixed status bar / top navigation
  BASE_MODAL: 50,             // e.g. Scoreboard, CashSplash
  HUD_OVERLAY: 60,            // e.g. DailyChallenges
  STANDARD_OVERLAYS: 100,     // e.g. CinematicModal, ConfirmationModal, CinematicTransition, GameViewport
  MINIGAME_INNER_OVERLAY: 110,// e.g. inner minigame cards (EcomCatch instructions, RotateToScale instructions)
  CINEMATIC_REVIEWS: 120,     // e.g. AnnualStatement
  FEEDBACK_ALERT: 200,        // e.g. PresidentialTermEnd, StreetEats feedback, FamilyDeli feedback
  SYSTEM_MODALS: 1000,        // e.g. EndingModal, SpecializationModal, TheReceipts, StrategicAdvisorModal
  ADVISOR_POPUP: 1100,        // e.g. AdvisorMentorModal
  GALLERY_ZOOM: 1200,         // e.g. PortraitsTab zoomed image
  FEED_OVERLAY: 2000,         // e.g. WorldReactionFeed, EndgameSummary
  LIVE_WORLD_EVENT: 3000,     // e.g. LiveWorldEventModal, HallOfFame
  CRITICAL_MINIGAME: 4000,    // e.g. ConcertJam, or critical timed activeMinigame overlay
} as const;
