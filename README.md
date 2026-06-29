# BAG CHASER

Escape the mud. Build the empire. Don't lose your soul.

**Bag Chaser** is a high-stakes life simulator where you climb from the bottom of the economic ladder to the highest office in the land. Balance your wealth, clout, and reputation while navigating a dynamic world of market shifts, rivalries, and life-changing choices.

## 🚀 Core Gameplay Loop

1.  **Hustle**: Execute various jobs and business ventures to earn Cash, Clout, and Aura.
2.  **Upgrade**: Reinvest your earnings to unlock better hustles and passive income streams.
3.  **Advance**: Meet tier requirements to move from the "Mud" to "President."
4.  **Manage**: Balance your mental health and keep the law (Heat) off your back.
5.  **Evolve**: When a run ends, use your Legacy Points to unlock permanent buffs for the next run.

## 📈 Progression Tiers

-   **MUD**: Starting with nothing but grit.
-   **STREET**: Building a local reputation.
-   **STARTUP**: Scaling digital and physical ventures.
-   **CORPORATE**: Navigating institutional power.
-   **ELITE**: Joining the global shadow cabinet.
-   **MOGUL**: Owning the world.
-   **PRESIDENT**: Running the country.
-   **OPEN**: Infinite sandbox scaling.

## 🛠 Tech Stack

-   **Frontend**: React 19, TypeScript, Tailwind CSS
-   **State**: Zustand (with Persistence)
-   **Animations**: Framer Motion
-   **Build**: Vite
-   **Testing**: Vitest & Playwright

## 📂 Project Structure

```text
src/
├── components/     # React UI components & Minigames
├── config/         # Game content & balance configuration
├── engine/         # Pure logic and math modules
├── store/          # Zustand store and slices
├── types/          # TypeScript definitions
└── utils/          # Generic helpers
```

## 📖 Documentation

Detailed documentation is available in the `docs/` folder:

-   [**Architecture**](./docs/ARCHITECTURE.md): Technical deep-dive.
-   [**Game Design**](./docs/GAME_DESIGN.md): Mechanics and systems.
-   [**Adding Content**](./docs/ADDING_CONTENT.md): How to extend the game.
-   [**Balancing**](./docs/BALANCING.md): Economy and math.
-   [**Contributing**](./docs/CONTRIBUTING.md): Dev standards and workflow.

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run unit tests
npm run test

# Build for production
npm run build
```

## 💾 Save Compatibility

Game progress is automatically saved to `localStorage`.
- **Run Progress**: Reset upon "Game Over" or manual restart.
- **Legacy Progress**: Points and unlocked upgrades are permanent.

## 🤝 Adding Content

To add new content, refer to the [Adding Content Guide](./docs/ADDING_CONTENT.md). You can easily add:
- Hustles
- Minigames
- Narrative Events
- World Events
- Legacy Upgrades
- Specializations

## 📜 License

[MIT License](LICENSE)
