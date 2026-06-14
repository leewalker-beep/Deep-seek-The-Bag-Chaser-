from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto('http://localhost:5173')
        time.sleep(2)

        # Start game
        if page.query_selector('input[placeholder="ENTER YOUR ALIAS"]'):
            page.get_by_placeholder("ENTER YOUR ALIAS").fill("Jules")
            page.get_by_role("button", name="BEGIN THE GRIND").click()
            time.sleep(2)

        # Dismiss tutorial
        for _ in range(6):
            btn = page.query_selector('button:has-text("Next"), button:has-text("Let\'s Go")')
            if btn:
                btn.click()
                time.sleep(0.5)

        # Take screenshot of MUD tier
        page.screenshot(path='verification/mud_tier_actual.png')

        # Open Scoreboard
        page.get_by_role("button", name="📊 Stats").click()
        time.sleep(1)
        page.screenshot(path='verification/scoreboard_actual.png')

        browser.close()

if __name__ == "__main__":
    run()
