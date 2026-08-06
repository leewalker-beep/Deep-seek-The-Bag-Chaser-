import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { useGameStore } from './store/gameStore'
import { loadNarrativeEventsForTier } from './utils/narrativeLoader'
import { loadWorldFeedContent } from './utils/worldFeedLoader'

if (typeof window !== 'undefined') {
  (window as any).useGameStore = useGameStore;
}

// Event-driven reactive narrative and world feed loader that updates content on demand
useGameStore.subscribe(
  (state) => state.pl?.currentTier,
  async (currentTier) => {
    if (currentTier) {
      await Promise.all([
        loadNarrativeEventsForTier(currentTier),
        loadWorldFeedContent()
      ]);
    }
  },
  { fireImmediately: true }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
