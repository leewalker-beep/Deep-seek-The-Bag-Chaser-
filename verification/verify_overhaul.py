from playwright.sync_api import sync_playwright
import time
import json

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True)
        page = context.new_page()

        # Go to app
        page.goto('http://localhost:5173')

        # Inject state
        def inject_tier(tier):
            state = {
                "state": {
                    "pl": {
                        "name": "JULES",
                        "bag": 1000000,
                        "clout": 100,
                        "aura": 100,
                        "mentalHealth": 100,
                        "heat": 0,
                        "month": 12,
                        "currentTier": tier,
                        "hustleLevels": {},
                        "hustleBranchIds": {},
                        "masteredHustles": ["r_labor"],
                        "flexAssets": {},
                        "unlockedAchievements": [],
                        "rentalCount": 0,
                        "flipCount": 0,
                        "vendingCount": 0,
                        "passiveLaborYield": 0,
                        "mentalShieldTurns": 0,
                        "artists": [],
                        "grammyCount": 0,
                        "recordLabelLevel": 1,
                        "marketCycle": {
                            "realEstate": "normal",
                            "vc": {"tech": "normal", "biotech": "normal", "energy": "normal"}
                        },
                        "monthsSinceCycleChange": 0,
                        "dynamicPassives": {},
                        "rivals": [],
                        "actionLog": [],
                        "milestones": [],
                        "stats": {"totalHustles": 0, "successfulHustles": 0, "lifetimeEarnings": 0}
                    },
                    "ph": "PLAYING",
                    "currentMarket": "NORMAL",
                    "activeTab": tier,
                    "difficulty": 3
                },
                "version": 0
            }
            page.evaluate(f"localStorage.setItem('bag-chaser-save', '{json.dumps(state)}')")
            page.evaluate("localStorage.setItem('bag-chaser-tutorial-complete', 'true')")
            page.goto('http://localhost:5173')
            time.sleep(2)

        # 1. Mud Tier View
        inject_tier("MUD")
        page.screenshot(path='verification/mud_tier.png')

        # 2. Open a Mud Hustle (Manual Labor)
        page.get_by_text('Labor & Property').click()
        time.sleep(1)
        page.screenshot(path='verification/hustle_card_mud.png')

        # 3. Trigger Minigame (StruggleMash)
        page.get_by_role('button', name='PLAY').click()
        time.sleep(1)
        page.screenshot(path='verification/minigame_struggle.png')

        # 4. Street Tier View
        inject_tier("STREET")
        page.screenshot(path='verification/street_tier.png')

        # 5. Corporate Tier
        inject_tier("CORPORATE")
        page.screenshot(path='verification/corporate_tier.png')

        # 6. Scoreboard Badges
        page.get_by_role('button', name='📊 Stats').click()
        time.sleep(1)
        page.get_by_role('button', name='badges').click()
        time.sleep(1)
        page.screenshot(path='verification/scoreboard_badges.png')

        browser.close()

if __name__ == '__main__':
    run_verification()
