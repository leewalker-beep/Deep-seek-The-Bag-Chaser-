from playwright.sync_api import sync_playwright
import time

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")
        page.wait_for_selector("body")

        # Inject state
        page.evaluate("""() => {
            const store = window.useGameStore.getState();
            window.useGameStore.setState({
                ph: 'PLAYING',
                pl: {
                    ...store.pl,
                    currentTier: 'CORPORATE'
                },
                revealedBenefits: ['badge_audio', 'badge_tech']
            });
        }""")

        time.sleep(2)
        page.screenshot(path="verification/modal_visible.png")
        browser.close()

if __name__ == "__main__":
    run_verification()
