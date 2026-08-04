import os
import time
from playwright.sync_api import sync_playwright, expect

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Set standard viewport
        page.set_viewport_size({"width": 1280, "height": 800})

        print("Navigating to local dev server...")
        page.goto("http://localhost:5173")
        page.wait_for_selector('h1:has-text("BAG CHASER")')

        # Inject state for Level 3 E-com Brand
        print("Injecting Zustand state for Level 3 E-com Brand...")
        page.evaluate("""() => {
            const store = window.useGameStore;
            store.getState().resetGame('sk_ghost', 3);
            store.getState().setPlayerName('Ecom Mogul Jules');
            store.getState().setPh('PLAYING');
            store.getState().setTutorialSkipped(true);
            store.setState({ activeTransition: null, transitionQueue: [] });
            store.getState().updatePl({
                currentTier: 'STARTUP',
                bag: 5000000,
                clout: 1000,
                aura: 1000,
                hustleBranchIds: {
                    ecom_brand: 'l3'
                },
                hustleLevels: {
                    ecom_brand: 3
                },
                narrativeFlags: {
                    advisor_shown_first_rival: true,
                    advisor_shown_first_million: true,
                    advisor_shown_dangerous_crime: true,
                    advisor_shown_first_business: true,
                    advisor_shown_first_passive: true,
                    advisor_shown_tier_MUD: true,
                    advisor_shown_tier_STREET: true,
                    advisor_shown_tier_STARTUP: true
                }
            });
            store.getState().setActiveTab('STARTUP');
            store.getState().setActiveHustleView('ecom_brand');
        }""")

        # Clear active transition and wait for animations to clear
        page.evaluate("""() => {
            const store = window.useGameStore;
            store.setState({ activeTransition: null, transitionQueue: [] });
        }""")
        time.sleep(4.0)

        # Click the "PLAY" button to open the EcomCatch minigame
        print("Clicking PLAY button...")
        page.click('text=PLAY')
        time.sleep(0.5)

        # Handle Large Spend confirmation modal if visible
        if page.is_visible("text=CONFIRM LARGE SPEND"):
            print("Confirming large spend...")
            page.click("text=YES, SPEND IT")

        # Wait a bit for the transition or screen update
        print("Waiting for EcomCatch minigame to load...")
        time.sleep(1.5)

        # Take a screenshot to inspect if minigame opened
        print("Taking minigame screenshot...")
        screenshot_path = "ecom_brand_level3.png"
        page.screenshot(path=screenshot_path)
        print(f"Redesigned E-com Brand Level 3 minigame screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    main()
