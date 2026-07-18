import os
import time
from playwright.sync_api import sync_playwright, expect

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Set larger viewport to avoid any element truncation
        page.set_viewport_size({"width": 1280, "height": 800})

        # 1. Navigate to game
        print("Navigating to local dev server...")
        page.goto("http://localhost:5173")
        page.wait_for_selector('h1:has-text("BAG CHASER")')

        # 2. Inject game store state directly to enter the OPEN Movie Casting panel
        print("Injecting Zustand game store state...")
        page.evaluate("""() => {
            const store = window.useGameStore;
            store.getState().resetGame('sk_ghost', 3);
            store.getState().setPlayerName('Director Jules');
            store.getState().setPh('PLAYING');
            store.getState().setTutorialSkipped(true);
            store.setState({ activeTransition: null, transitionQueue: [] });
            store.getState().updatePl({
                currentTier: 'OPEN',
                bag: 1000000000,
                clout: 5000,
                aura: 5000,
                rolodex: [
                  { id: 'cel_1', name: 'Vlog Titan Jenny', avatar: '📹', relationshipScore: 85, isUnlocked: true },
                  { id: 'cel_2', name: 'Slam-Dunk Marcus', avatar: '🏀', relationshipScore: 45, isUnlocked: true },
                  { id: 'cel_3', name: 'Lil Spitfire', avatar: '🎤', relationshipScore: 15, isUnlocked: true }
                ],
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
            store.getState().setActiveTab('OPEN');
            store.getState().setActiveHustleView('open_movie');
        }""")

        # Force clear transition again to override any delayed animation triggers
        print("Clearing any delayed transition overlays...")
        page.evaluate("""() => {
            const store = window.useGameStore;
            store.setState({ activeTransition: null, transitionQueue: [] });
        }""")

        # Sleep to allow the exit animation of CinematicTransition to finish completely
        print("Waiting for exit animation of transition...")
        time.sleep(3.5)

        # 3. Wait for the Casting Board UI to be visible
        print("Waiting for Casting Board UI...")
        page.wait_for_selector('text=SELECT LEAD ACTOR', timeout=10000)

        # Take a screenshot of the Casting Board
        casting_screenshot_path = "open_movie_casting.png"
        page.screenshot(path=casting_screenshot_path)
        print(f"Casting Board screenshot saved to {casting_screenshot_path}")

        # 4. Click on Vlog Titan Jenny card to cast her
        print("Casting Vlog Titan Jenny...")
        page.click("text=Vlog Titan Jenny")

        # Wait for pre-production screen
        page.wait_for_selector("text=PRE-PRODUCTION SCREEN", timeout=10000)

        # 5. Click Greenlight Blockbuster
        print("Greenlighting movie...")
        page.click("text=GREENLIGHT BLOCKBUSTER")

        # Wait for outcome screen
        print("Waiting for box office results...")
        page.wait_for_selector("text=OFFICIAL FILM RELEASE", timeout=10000)

        # Take a screenshot of the Outcome screen
        outcome_screenshot_path = "open_movie_outcome.png"
        page.screenshot(path=outcome_screenshot_path)
        print(f"Movie Outcome screenshot saved to {outcome_screenshot_path}")

        browser.close()

if __name__ == "__main__":
    main()
