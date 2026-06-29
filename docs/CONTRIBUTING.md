# Contributing

Thank you for contributing to Bag Chaser!

## Development Standards

- **TypeScript**: All new code must be fully typed. Avoid `any`.
- **React Patterns**:
  - Use functional components and hooks.
  - Keep components small and focused.
  - For complex game loops in minigames, use `useRef` for unstable values to prevent stale closures.
- **State Management**:
  - Put game logic in `src/engine/` and call it from Zustand actions.
  - Avoid putting complex logic directly inside React components.
- **Mobile First**: The UI is designed for mobile screens (390px width). Ensure all new components are responsive and have touch-friendly targets (min 44x44px).

## Folder Structure

- `src/components/`: React UI components.
  - `minigames/`: Self-contained game components.
  - `ui/`: Reusable primitive components (buttons, modals).
- `src/config/`: Static data and configuration.
- `src/engine/`: Pure logic and math modules.
- `src/store/`: Zustand store and slices.
- `src/types/`: TypeScript interfaces and types.
- `src/utils/`: Generic helper functions.

## Workflow

1.  **Run Tests**: Before starting, ensure all tests pass: `npm run test`.
2.  **Add Feature**: Implement your changes following the [Adding Content](./ADDING_CONTENT.md) guide.
3.  **Documentation**: If you add a new system, update the relevant docs in `docs/`.
4.  **Verify**: Run the game locally and test your changes across different tiers.
5.  **Build**: Ensure the project builds successfully: `npm run build`.

## Testing

We use **Vitest** for unit and integration tests.
- Run tests: `npx vitest run src`
- Tests are located in `src/__tests__/` or alongside the files they test.

**Note**: Playwright E2E tests are located in `tests/` and are used for browser-level verification.
