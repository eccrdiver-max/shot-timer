# Development Guide for Shot Timer Pro

This document provides instructions for developers working on the Shot Timer Pro application, including how to run the automated tests.

---

## Automated Testing

This project uses [Vitest](https://vitest.dev/) for running unit and component tests. Tests are crucial for maintaining code quality and preventing regressions.

### Running Tests

To run the automated tests, you will need to have `vitest` installed (e.g., `npm install -g vitest` or as a dev dependency). Then, execute the following command in your terminal at the root of the project:

```bash
npx vitest
```

This will start Vitest, which will find and run all test files in the project. For a better development experience, you can run it in watch mode:

```bash
npx vitest --watch
```

This command will automatically re-run tests whenever you make changes to a source file or a test file.

### Writing Tests

-   **Test Files:** Test files should be located next to the source files they are testing, with a `.test.ts` or `.test.tsx` extension. For example, tests for `utils/scoring.ts` should be in `utils/scoring.test.ts`.
-   **Structure:** We use the `describe`, `it`, and `expect` pattern, similar to Jest. `vitest` is configured to provide these as globals.
-   **Philosophy:** We have started by adding unit tests for pure functions (e.g., `utils/scoring.ts`). The goal is to gradually increase coverage and add component tests using React Testing Library to verify UI behavior.

Your contributions to the test suite are highly encouraged and appreciated!
