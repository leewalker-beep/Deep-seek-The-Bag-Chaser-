# Contributing

Thank you for contributing to Bag Chaser!

## Development Standards

- **TypeScript**: All new code must be strictly typed. Avoid `any` casts and unused variables.
- **React Patterns**:
  - Use functional components, custom hooks, and `React.lazy` code-splitting for heavy screens and minigames.
  - Keep components small, focused, and wrapped with `React.memo` where appropriate.
  - For high-frequency minigame render loops, use `useRef` for unstable frame states to avoid stale closures.
- **State Management**:
  - Encapsulate pure domain and math logic in engine utilities (`src/engine/`) and invoke them through Zustand slice actions (`src/store/slices/`).
  - Keep React component views clean by delegating stat deltas and state calculations to Zustand slices.
- **Accessibility & Mobile First**:
  - The primary viewport targets mobile layouts (390px width). Ensure all buttons and touchable elements fulfill the minimum target size of 44x44px.
  - Use visible focus indicators and explicit `Escape` key handlers on core overlay modals.

## Workflow Commands

```bash
# Install dependencies
bun install # or npm install

# Start local dev server
npm run dev

# Run unit and integration tests
bun test

# Run TypeScript compilation & production build
npm run build

# Run ESLint checks
npm run lint
```

## Side-Effect File Protection

Running full test suites may automatically update test audit artifacts such as `audit_results.json`. Before committing changes, restore these tracked files:

```bash
git checkout HEAD audit_results.json
```
