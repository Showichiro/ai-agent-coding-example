# Instruction: Refactor Code

This task represents the "Refactor" phase of the Test-Driven Development (TDD) cycle and embodies the "Tidy First" principle. The goal is to improve the internal quality of the code (e.g., clarity, simplicity, maintainability) without changing its external behavior.

## Pre-condition

*   All tests must be passing (you are in a "Green" state).

## Steps

1.  **Identify an Improvement**: Look for "code smells" in the code you just wrote or in related code. Examples include:
    *   Duplicated logic
    *   Unclear variable or function names
    *   Long methods or functions
    *   Complex conditional logic

2.  **Apply a Small Refactoring**:
    *   Make a single, small, atomic change to improve the code structure. For example, rename a variable, extract a function, or remove a redundant comment.
    *   Do **not** introduce new functionality during refactoring.

3.  **Run Tests and Verify**:
    *   After each small refactoring change, run the entire test suite (`pnpm test`).
    *   Confirm that all tests still pass. This ensures your change was purely structural and did not alter behavior.

4.  **Repeat (if necessary)**: Continue making small, incremental refactorings, running tests after each one, until the code is clean and clear.

## Guiding Principles

*   **Structural vs. Behavioral**: Refactoring is a **structural** change. Never mix it with **behavioral** changes (adding/modifying features). If you need to do both, refactor first.
*   **Baby Steps**: Make small, verifiable changes. This makes it easy to pinpoint the source of a problem if a test fails.
*   **Safety Net**: The test suite is your safety net. Rely on it to ensure your refactoring is safe.
*   **Commit Discipline**: Commit your structural changes separately from your behavioral changes. The commit message should clearly state that it is a refactoring commit (e.g., `refactor: Extract user validation logic`).
