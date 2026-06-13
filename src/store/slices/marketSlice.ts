import type { StateCreator } from 'zustand';
import type { GameState, MarketType, TickerMessage } from '../../types/game';

export interface MarketSlice {
  currentMarket: MarketType;
  news: (string | TickerMessage)[];

  addTickerMessage: (text: string, colorClass?: string) => void;
}

export const createMarketSlice: StateCreator<GameState, [], [], MarketSlice> = (set) => ({
  currentMarket: 'NORMAL',
  news: ['Welcome to Bag Chaser. The grind begins now.'],

  addTickerMessage: (text, colorClass) => {
    set((state) => ({
      news: [{ text, colorClass }, ...state.news.slice(0, 49)]
    }));
  },
});
