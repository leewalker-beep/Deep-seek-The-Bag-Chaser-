# Character Registry

This document lists the recurring NPCs in Bag Chaser, their roles, and how your interactions with them affect the game's narrative and your empire's growth.

## Recurring NPCs

### 1. Marcus "Mook" Miller
- **Portrait:** `av_m1`
- **Background:** Childhood friend from the mud blocks. Knows where the bodies are buried, but has a heart of gold.
- **Personality:** Loyal, reckless, street-smart.
- **First Appearance:** MUD
- **Narrative Arc:** Marcus is your first connection. Helping him early builds a strong ally, but his reckless nature can lead to high-heat opportunities later in the game.

### 2. Ashley Weaver
- **Portrait:** `av_f2`
- **Background:** Ambitious investigative journalist for the Metro Gazette. Always looking for the next big scoop.
- **Personality:** Persistent, ethical, inquisitive.
- **First Appearance:** STREET
- **Narrative Arc:** Ashley can be a powerful ally to expose rivals like Victor Kane, or a dangerous enemy if she starts digging into your own less-than-legal activities.

### 3. Detective Silas Cole
- **Portrait:** `av_m3`
- **Background:** A veteran detective with a grudge against the "new money" taking over the city.
- **Personality:** Cynical, observant, incorruptible.
- **First Appearance:** STREET
- **Narrative Arc:** Cole represents the law. Cooperating with him can reduce heat, but at the cost of your street aura. Defying him increases your clout but puts a target on your back.

### 4. Investor Lawrence Chen
- **Portrait:** `av_m4`
- **Background:** A high-stakes venture capitalist who values ROI above all else. He doesn't invest in businesses; he invests in people.
- **Personality:** Calculating, demanding, influential.
- **First Appearance:** STARTUP
- **Narrative Arc:** Chen offers massive capital injections but demands control. Partnering with him accelerates growth but ties your success to his rigid demands.

### 5. Maya Vane
- **Portrait:** `av_f1`
- **Background:** Your younger sister. She wants to make a difference in the community through social work, not greed.
- **Personality:** Idealistic, grounding, brave.
- **First Appearance:** MUD
- **Narrative Arc:** Maya serves as your moral compass. Supporting her community projects builds immense aura and political support in later tiers.

### 6. Victor Kane
- **Portrait:** `av_m2`
- **Background:** A ruthless conglomerate CEO who sees the entire city as his personal chessboard.
- **Personality:** Arrogant, strategic, predatory.
- **First Appearance:** CORPORATE
- **Narrative Arc:** Kane is your primary antagonist in the corporate world. You can either surrender and merge with his empire or declare war and dismantle it piece by piece.

### 7. Sofia Ramirez
- **Portrait:** `av_f3`
- **Background:** A rising political star with eyes on the Mayor's office and beyond. She needs powerful backers.
- **Personality:** Charismatic, ambitious, pragmatic.
- **First Appearance:** ELITE
- **Narrative Arc:** Sofia is your gateway to the Presidency. Endorsing her early provides massive political clout and easier advancement into the highest tiers of power.

### 8. Ghost
- **Portrait:** `av_f4`
- **Background:** An anonymous hacker-activist who specializes in corporate espionage and digital sabotage.
- **Personality:** Enigmatic, libertarian, brilliant.
- **First Appearance:** STARTUP
- **Narrative Arc:** Ghost provides high-tech solutions to heat and rival problems. Their services are expensive and often lower your aura, but their effectiveness is unmatched.

### 9. Leo Thorne
- **Portrait:** `av_m1`
- **Background:** The world's most popular lifestyle influencer. He can make or break a brand with a single post.
- **Personality:** Vain, energetic, fickle.
- **First Appearance:** CORPORATE
- **Narrative Arc:** Leo Thorne can skyrocket your clout through viral partnerships. However, his fickle nature means you must constantly manage your relationship with him.

### 10. Sarah Jenkins
- **Portrait:** `av_f2`
- **Background:** Leader of the United Workers Union. She's the only one standing between you and total labor control.
- **Personality:** Tough, uncompromising, protective.
- **First Appearance:** CORPORATE
- **Narrative Arc:** Interaction with Sarah defines your labor relations. Conceding to her demands boosts aura but lowers passive income; fighting her does the opposite.

### 11. President Mikhail Volkov
- **Portrait:** `av_m3`
- **Background:** Leader of a powerful foreign nation with significant interests in your city's tech sector.
- **Personality:** Stoic, nationalist, ruthless.
- **First Appearance:** MOGUL
- **Narrative Arc:** Volkov offers global-scale partnerships that provide massive wealth and clout but carry heavy political and reputational risks.

### 12. Elena Vance
- **Portrait:** `av_f4`
- **Background:** A corporate fixer who handles the problems that money alone can't solve.
- **Personality:** Efficient, cold, discreet.
- **First Appearance:** ELITE
- **Narrative Arc:** Elena is the ultimate solution to extreme heat. Her retainers are astronomical, but she can ensure that no investigation ever reaches your doorstep.

## Relationship & Trust System

All characters have hidden **Relationship** and **Trust** scores stored in your `narrativeFlags`. These scores are affected by your choices:

- **Rel_NAME:** Reflects how much the character likes or dislikes you.
- **Trust_NAME:** Reflects how much the character believes your word or counts on your actions.
- **Status_NAME:** Tracks whether a character is an `ally`, a `rival`, `deceased`, or simply `alive`.

Choices made in the early game (MUD/STREET tiers) have long-lasting effects and will determine which events trigger as you reach the ELITE and MOGUL tiers.
