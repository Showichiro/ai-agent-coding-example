# Testing Strategy

This document outlines the testing strategy for this project, which is based on the principles of Test-Driven Development (TDD).

## Running Tests

To run the test suite, use the following command:

```bash
pnpm test
```

This will start Vitest in watch mode, automatically re-running tests as you make changes to the code.

### Coverage

To generate a test coverage report, run:

```bash
pnpm test:cov
```

This command will run the tests and output a coverage summary to the console. A detailed HTML report will also be generated in the `coverage/` directory.

## Development Workflow

We follow a strict TDD workflow as outlined in the `system_prompt.md`. The basic cycle is:

1.  **Red**: Write a failing test that describes a small piece of desired functionality.
2.  **Green**: Write the minimum amount of code necessary to make the test pass.
3.  **Refactor**: Improve the code's structure and clarity without changing its behavior.

All new features and bug fixes should be accompanied by tests.
