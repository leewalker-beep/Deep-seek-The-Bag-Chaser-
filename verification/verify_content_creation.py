import os
import time
from playwright.sync_api import sync_playwright, expect

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Set viewport to ensure nice layouts
        page.set_viewport_size({"width": 1280, "height": 800})

        # 1. Navigate to game
        print("Navigating to local dev server...")
        page.goto("http://localhost:5173")
        page.wait_for_selector('h1:has-text("BAG CHASER")')

        # 2. Inject Zustand store state for Level 1 Content Creation
        print("Injecting Level 1 Content Creation state...")
        page.evaluate("""() => {
            const store = window.useGameStore;
            store.getState().resetGame('sk_ghost', 3);
            store.getState().setPlayerName('Influencer Jules');
            store.getState().setPh('PLAYING');
            store.getState().setTutorialSkipped(true);
            store.setState({ activeTransition: null, transitionQueue: [] });
            store.getState().updatePl({
                currentTier: 'STREET',
                bag: 50000,
                clout: 100,
                aura: 50,
                hustleLevels: { cc: 1 },
                narrativeFlags: {
                    advisor_shown_first_rival: true,
                    advisor_shown_first_million: true,
                    advisor_shown_dangerous_crime: true,
                    advisor_shown_first_business: true,
                    advisor_shown_first_passive: true,
                    advisor_shown_tier_MUD: true,
                    advisor_shown_tier_STREET: true,
                    advisor_shown_tier_STARTUP: true,
                    advisor_shown_tier_CORPORATE: true,
                    advisor_shown_tier_ELITE: true,
                    advisor_shown_tier_MOGUL: true,
                    advisor_shown_tier_PRESIDENT: true,
                    advisor_shown_tier_OPEN: true,
                    advisor_shown_high_heat: true,
                    advisor_shown_low_mental_health: true,
                    advisor_shown_housing_protest: true,
                    advisor_shown_economy_collapse: true
                }
            });
            store.setState({
                activeTab: 'STREET',
                activeHustleView: 'cc',
                showMinigame: true
            });
        }""")

        # Clear active transition
        page.evaluate("""() => {
            window.useGameStore.setState({ activeTransition: null, transitionQueue: [] });
        }""")

        # Wait for prologue / entry animations to complete
        print("Waiting 4 seconds for transitions to exit...")
        time.sleep(4)

        # Confirm Content Creation is rendered
        print("Checking if Content Creation is visible...")
        page.wait_for_selector('[data-testid="active-topic-label"]', timeout=10000)

        # Take screenshot of Level 1 Content Creation
        lvl1_path = "/home/jules/verification/verification_level1.png"
        page.screenshot(path=lvl1_path)
        print(f"Level 1 screenshot saved to {lvl1_path}")

        # 3. Toggle/inject to Level 3
        print("Switching to Level 3 Content Creation...")
        page.evaluate("""() => {
            const store = window.useGameStore;
            store.getState().updatePl({
                hustleLevels: { cc: 3 }
            });
            // Reset/Re-mount the minigame
            store.setState({ showMinigame: false });
        }""")

        time.sleep(0.5)

        page.evaluate("""() => {
            const store = window.useGameStore;
            store.setState({ showMinigame: true });
        }""")

        # Clear any transitions
        page.evaluate("""() => {
            window.useGameStore.setState({ activeTransition: null, transitionQueue: [] });
        }""")

        time.sleep(1.5)

        # Wait for selector
        page.wait_for_selector('[data-testid="active-topic-label"]', timeout=10000)

        # Take screenshot of Level 3 Content Creation
        lvl3_path = "/home/jules/verification/verification_level3.png"
        page.screenshot(path=lvl3_path)
        print(f"Level 3 screenshot saved to {lvl3_path}")

        browser.close()

if __name__ == "__main__":
    main()
