# Instruction: Generate a Component / Implement Code

This task corresponds to the "Green" phase of the Test-Driven Development (TDD) cycle. Your goal is to write the simplest, most minimal code necessary to make the currently failing test pass.

## Pre-condition

*   You must have a single failing test that was written in the "Red" phase.

## Steps

1.  **Write Minimal Code**:
    *   Implement the function, component, or class required by the test.
    *   Write only the code that is absolutely necessary to satisfy the test's assertions. Avoid adding any extra logic or features that are not explicitly required by the test.

2.  **Run Tests and Confirm Pass**:
    *   Execute the test suite (`pnpm test`).
    *   Verify that the failing test now passes, and that all other existing tests also continue to pass.

## Guiding Principles

*   **Simplicity First**: Do not try to write the perfect or final version of the code. The goal is simply to get to a "Green" state.
*   **No Gold Plating**: Resist the temptation to add functionality that "you know you're going to need." Add it only when a test requires it.
*   **Focus on Passing the Test**: Your sole objective in this phase is to make the test bar green. Improvements and cleanup will come next, in the "Refactor" phase.

Once all tests are passing, you have successfully completed the "Green" phase. You can now either proceed to the "Refactor" phase to improve the code's design or return to the "Red" phase to write the next test.
