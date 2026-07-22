import time
from playwright.sync_api import sync_playwright, expect

def main():
    print("Launching browser...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 450, "height": 1000})
        page = context.new_page()

        # Capture page console logs
        page.on("console", lambda msg: print("PAGE CONSOLE:", msg.text))

        try:
            print("Navigating to local development server...")
            page.goto("http://localhost:5173/")
            page.wait_for_load_state("networkidle")
            time.sleep(2)

            print("Looking for 'Skip Prologue' button...")
            skip_btn = page.locator("text=Skip Prologue")
            expect(skip_btn).to_be_visible()

            print("Clicking Skip Prologue...")
            skip_btn.click()
            time.sleep(2)

            print("Dismissing initial first rival popup by clicking CONTINUE...")
            continue_btn = page.locator("text=CONTINUE")
            if continue_btn.is_visible():
                continue_btn.click()
                time.sleep(1)

            print("Injecting state directly into advisorQueue...")
            page.evaluate("""() => {
                const store = window.useGameStore;
                if (store) {
                    store.setState(state => ({
                        ph: 'PLAYING',
                        activeTransition: null,
                        pendingSpecialization: false,
                        pl: {
                            ...state.pl,
                            lastAdvisorPopupMonth: -1, // Unblock dequeuing
                            advisorQueue: [
                                {
                                    id: 'advisor_shown_first_employee',
                                    title: '👥 THE POWER OF DELEGATION',
                                    subtitle: 'You have hired your very first employee! Corporate leadership is about leveraging other people\\'s time while you focus on macro strategy.',
                                    bullets: [
                                        'Hiring employees automates manual labor, paving the path to scalable passive cash flow.',
                                        'Keep scaling your businesses by upgrading their levels to generate higher passive and active returns.',
                                        'Be mindful of your monthly overheads and maintain healthy capital buffers.'
                                    ],
                                    ctaLabel: 'Take me there',
                                    tabToOpen: 'OPPORTUNITIES'
                                }
                            ],
                            narrativeFlags: {
                                ...state.pl.narrativeFlags,
                                publicReputation: 'The Kingmaker' // Make playstyle = Leader for Peter Drucker quote
                            }
                        }
                    }));
                }
            }""")

            print("Waiting for advisor popup to trigger from queue...")
            time.sleep(2)

            # Let's inspect the active advisor prompt state in javascript
            prompt_obj = page.evaluate("() => window.useGameStore.getState().pl")
            print("Player narrativeFlags:", prompt_obj.get("narrativeFlags"))
            print("Player advisorQueue:", prompt_obj.get("advisorQueue"))

            # Take a screenshot
            screenshot_path = "verification/advisor_mentor.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print("An error occurred during verification:", e)
        finally:
            browser.close()

if __name__ == "__main__":
    main()
