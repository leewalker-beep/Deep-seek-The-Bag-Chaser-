export const MASTERY_TO_HUSTLE_ID: Record<string, string> = {
  'music_production': 'audio',
  'tech_flipping': 'techFlip',
  'real_estate': 'real_estate_empire',
  'media_empire': 'media_empire',
  'scrap_metal': 'r_scrap',
  'dropshipping': 'drop',
  'street_eats': 'street_eats',
  'labor': 'r_labor',
  'delivery': 'r_delivery',
  'ghost_mode': 'r_ghost_mode',
};

export const MASTERY_DISPLAY_NAMES: Record<string, string> = {
  'music_production': 'Music Production',
  'tech_flipping': 'Tech Flipping',
  'real_estate': 'Real Estate',
  'media_empire': 'Media Empire',
  'scrap_metal': 'Scrap Metal',
  'dropshipping': 'Dropshipping',
  'street_eats': 'Street Eats',
  'labor': 'Labor',
  'delivery': 'Delivery',
  'ghost_mode': 'Ghost Mode',
};

export const MASTERY_ORDER_BONUSES: Record<string, { orderId: string; bonus: number }[]> = {
  music_production: [{ orderId: 'festival', bonus: 0.05 }],
  tech_flipping: [{ orderId: 'data_analytics', bonus: 0.05 }, { orderId: 'crypto_mining', bonus: 0.05 }],
  real_estate: [{ orderId: 'housing_policy', bonus: 0.05 }],
  media_empire: [{ orderId: 'media_policy', bonus: 0.05 }],
  scrap_metal: [{ orderId: 'crisis_response', bonus: 0.05 }],
  dropshipping: [{ orderId: 'trade_policy', bonus: 0.05 }],
  street_eats: [{ orderId: 'working_class_policy', bonus: 0.05 }],
  labor: [{ orderId: 'labor_policy', bonus: 0.05 }],
  delivery: [{ orderId: 'infrastructure_policy', bonus: 0.05 }],
  ghost_mode: [{ orderId: 'security_policy', bonus: 0.05 }],
};
