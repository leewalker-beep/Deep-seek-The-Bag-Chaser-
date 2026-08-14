import os
import time
from playwright.sync_api import sync_playwright

def run_verification():
    print("Starting Playwright Frontend Verification...")
    os.makedirs("verification", exist_ok=True)

    with sync_playwright() as p:
        # Launch Chromium headless
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Set viewport size to standard desktop to capture beautiful screenshots
        page.set_viewport_size({"width": 1280, "height": 960})

        # Navigate to application
        print("Navigating to http://localhost:5173/...")
        page.goto("http://localhost:5173/")
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        # Helper to clear blocking popups
        def clear_blocking_modals():
            page.evaluate("""
                const state = window.useGameStore.getState();
                if (state.dismissLiveEvent) {
                    try { state.dismissLiveEvent(); } catch(e){}
                }
                if (state.pl) {
                    state.pl.activeLiveEvent = null;
                    state.pl.activeNarrative = null;
                    state.pl.pendingAnnualStatement = false;
                    state.pl.activeAdvisorMessage = null;
                    state.activeModalEvent = null;
                }
                window.useGameStore.setState({ pl: { ...state.pl }, activeModalEvent: null });
            """)
            time.sleep(0.5)

        # 1. Skip prologue if visible
        print("Skipping prologue...")
        skip_btn = page.get_by_text("Skip Prologue")
        if skip_btn.is_visible():
            skip_btn.click()
            time.sleep(2)

        # Ensure the main screen has loaded
        page.wait_for_load_state("networkidle")
        clear_blocking_modals()

        # Dismiss "Continue Operations" modal if visible
        continue_btn = page.get_by_text("Continue Operations")
        if continue_btn.is_visible():
            print("Dismissing monthly summary modal...")
            continue_btn.click()
            time.sleep(1)

        # Ensure we have Marcus rival initialized or add some history events to make history render
        page.evaluate("""
            const state = window.useGameStore.getState();
            state.pl.bag = 1000; // Low bag so Marcus net worth is higher
            state.pl.rivals = state.pl.rivals.map(r =>
                r.id === 'rival_mud' ? { ...r, netWorth: 1000000, relationshipWithPlayer: -10 } : r
            );
            state.pl.history = [
                {
                    id: 'rival_sabotage_success_rival_mud_1',
                    month: 2,
                    year: 18,
                    title: 'Sabotage Dispatched: Success',
                    description: 'Successfully disrupted Marcus\\\'s business operations, cutting their net worth.',
                    category: 'RIVAL',
                    importance: 3
                },
                {
                    id: 'rival_help_rival_mud_2',
                    month: 4,
                    year: 18,
                    title: 'Relief Investment: Marcus',
                    description: 'Backed Marcus\\\'s strategy with a relief injection, establishing a solid partnership.',
                    category: 'RIVAL',
                    importance: 3
                }
            ];
            window.useGameStore.setState({ pl: { ...state.pl } });
        """)
        time.sleep(0.5)

        # Scroll the rival leaderboard into view
        leaderboard = page.locator('[data-testid="rival-card-rival_mud"]')
        leaderboard.scroll_into_view_if_needed()
        time.sleep(1)

        # Screenshot 1: Collapsed rival card
        print("Capturing collapsed rival card...")
        leaderboard.screenshot(path="verification/collapsed_rival.png")

        # Screenshot 2: Expanded rival card
        print("Expanding Marcus rival card...")
        leaderboard.click()
        time.sleep(1) # Wait for expand animation
        leaderboard.screenshot(path="verification/expanded_rival.png")

        # Screenshot 3: Sabotage action
        print("Executing Sabotage on Marcus...")
        sabotage_btn = page.locator('button:has-text("SABOTAGE")')
        sabotage_btn.click()
        time.sleep(1.5)
        leaderboard.screenshot(path="verification/sabotage_result.png")

        # Dismiss Result overlay
        clear_blocking_modals()
        page.get_by_text("[ Click anywhere to dismiss ]", exact=False).click()
        time.sleep(0.5)

        # Screenshot 4: Help / Partner action
        print("Executing Partner Support...")
        # To run Partner Support, we need enough cash! Let's increase player's bag
        page.evaluate("""
            const state = window.useGameStore.getState();
            state.pl.bag = 10000000;
            window.useGameStore.setState({ pl: { ...state.pl } });
        """)
        time.sleep(0.2)
        help_btn = page.locator('button:has-text("PARTNER SUPPORT")')
        help_btn.click()
        time.sleep(1.5)
        leaderboard.screenshot(path="verification/help_result.png")

        # Dismiss Result overlay
        clear_blocking_modals()
        page.get_by_text("[ Click anywhere to dismiss ]", exact=False).click()
        time.sleep(0.5)

        # Let's set Marcus as a critical threat and add a retaliation bid to show Retaliate and Counter-Bid
        page.evaluate("""
            const state = window.useGameStore.getState();
            state.pl.rivalThreats = { MUD: 'RIVAL_DOMINANT' };
            state.pl.rivals = state.pl.rivals.map(r =>
                r.id === 'rival_mud' ? { ...r, netWorth: 15000000, currentBid: 500000, relationshipWithPlayer: -50 } : r
            );
            window.useGameStore.setState({ pl: { ...state.pl } });
        """)
        time.sleep(0.5)

        # Screenshot 5: Counter-Bid action
        print("Executing Counter-Bid...")
        counter_btn = page.locator('button:has-text("COUNTER-BID")')
        counter_btn.click()
        time.sleep(1.5)
        leaderboard.screenshot(path="verification/counter_result.png")

        # Dismiss
        clear_blocking_modals()
        page.get_by_text("[ Click anywhere to dismiss ]", exact=False).click()
        time.sleep(0.5)

        # Let's set Marcus as ready for recruitment (relationshipWithPlayer = 45)
        page.evaluate("""
            const state = window.useGameStore.getState();
            state.pl.rivals = state.pl.rivals.map(r =>
                r.id === 'rival_mud' ? { ...r, relationshipWithPlayer: 45, status: undefined, currentBid: 0 } : r
            );
            window.useGameStore.setState({ pl: { ...state.pl } });
        """)
        time.sleep(1) # Wait for glow and label to render
        leaderboard.screenshot(path="verification/recruit_available.png")

        # Screenshot 6: Recruitment action
        print("Recruiting Marcus...")
        recruit_btn = page.locator('button:has-text("RECRUIT AS ALLY")')
        recruit_btn.click()
        time.sleep(1.5)
        leaderboard.screenshot(path="verification/recruit_result.png")

        # Dismiss
        clear_blocking_modals()
        page.get_by_text("[ Click anywhere to dismiss ]", exact=False).click()
        time.sleep(0.5)

        # Let's populate the world feed with an entry containing rivalIdLink
        page.evaluate("""
            const state = window.useGameStore.getState();
            state.pl.worldFeed = [
                {
                    id: 'custom_feed_entry_1',
                    category: 'BUSINESS',
                    text: 'BREAKING NEWS: Dynamic interactions triggered on Marcus. View history now.',
                    source: 'Wall Street Ledger',
                    timestamp: Date.now(),
                    month: state.pl.month,
                    rivalIdLink: 'rival_mud'
                }
            ];
            window.useGameStore.setState({ pl: { ...state.pl } });
        """)
        time.sleep(0.5)

        # Screenshot 7: Feed Navigation
        print("Opening World Feed to view redirect option...")
        feed_tab = page.get_by_text("Feed", exact=True)
        if feed_tab.is_visible():
            feed_tab.click()
            time.sleep(1.5)
            # Take screenshot of the Feed modal showing "View Rivalry" button
            page.screenshot(path="verification/feed_navigation.png")

            # Click "View Rivalry" to trigger redirection & focused card pulse highlight
            print("Clicking View Rivalry button to redirect...")
            view_rivalry_btn = page.locator('button:has-text("View Rivalry")')
            if view_rivalry_btn.is_visible():
                view_rivalry_btn.click()
                time.sleep(0.5)
                # Captured pulse highlight state
                leaderboard.screenshot(path="verification/focused_rival_highlight.png")
            else:
                print("View Rivalry button not found!")
        else:
            print("Feed button/tab not found!")

        print("Playwright Frontend Verification completed successfully!")
        browser.close()

if __name__ == "__main__":
    run_verification()
