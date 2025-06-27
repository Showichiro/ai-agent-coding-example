# TDD and Tidy First Development Workflow

This document outlines the mandatory development workflow, combining Test-Driven Development (TDD) with the Tidy First methodology. Adherence to this process is crucial for maintaining code quality and ensuring a clean, testable, and maintainable codebase.

## Core Principles

1.  **Red-Green-Refactor Cycle**: The foundation of our process.
    *   **Red**: Write a single, small, failing test that defines a new behavior.
    *   **Green**: Write the *absolute minimum* amount of code required to make the test pass.
    *   **Refactor**: Improve the internal structure of the code without changing its external behavior.

2.  **Separation of Concerns**: Strictly separate *behavioral changes* from *structural changes*.
    *   **Behavioral Change**: Adds or modifies functionality (the "what it does"). This corresponds to the Red-Green steps.
    *   **Structural Change (Tidy First)**: Improves the code's design, readability, or organization without altering its functionality (the "how it's built"). This is the Refactor step, but can also be done *before* adding new functionality.

## The Workflow

Follow these steps for every new feature or change.

### Step 1: Tidy First (Optional but Recommended)

Before adding new functionality, assess the existing code. Is it well-structured and easy to modify?

*   If the code is not clean, perform **Structural Changes** first.
    *   Refer to `03_structural_change/tidy_first.md` for specific guidelines (e.g., renaming variables, extracting methods).
    *   Run all tests after each small structural change to ensure no behavior was accidentally altered.
    *   Commit these changes separately with a `tidy:` or `refactor:` prefix.

### Step 2: Red - Write a Failing Test

Begin the **Behavioral Change** by writing a test.

*   Follow the instructions in `02_behavioral_change/write_failing_test.md`.
*   The test must fail. This is critical to verify that the test is correctly set up and that the feature doesn't already exist.
*   Run the tests and confirm you see the expected failure (the "Red" state).

### Step 3: Green - Make the Test Pass

Write the simplest possible code to make the failing test pass.

*   Follow the instructions in `02_behavioral_change/implement_passing_code.md`.
*   Do not add extra features or optimizations. The goal is simply to get back to a "Green" state.
*   Run all tests and confirm they all pass.

### Step 4: Commit the Behavioral Change

Once the tests are green, commit the change.

*   This commit represents a complete, small, functional increment.
*   Use a `feat:` or `fix:` prefix as appropriate. See `04_commit_guidelines.md` for details.

### Step 5: Refactor

With the safety of passing tests, look for opportunities to improve the code's structure.

*   Did the new code introduce duplication? Is there a clearer way to express the logic?
*   Apply refactoring patterns as described in `03_structural_change/tidy_first.md`.
*   Run tests after every small refactoring to ensure you haven't broken anything.
*   Commit these changes separately with a `refactor:` prefix.

### Step 6: Repeat

Continue this cycle for the next increment of functionality. Each cycle should be small and focused, ensuring the codebase is always in a clean, working state.
