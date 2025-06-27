# Instruction: Write a Test

This task follows the "Red" phase of the Test-Driven Development (TDD) cycle. Your goal is to write a single, failing test that clearly defines the next piece of functionality to be implemented.

## Steps

1.  **Identify a Small, Testable Behavior**: Determine the smallest increment of functionality you want to add. Do not try to test the entire feature at once.

2.  **Write a Failing Test**:
    *   Create a new test case that describes the desired behavior.
    *   Use a clear and descriptive name for your test (e.g., `it('should return an empty list when no todos exist')`).
    *   Write assertions that will fail because the feature or function does not yet exist or is incomplete.

3.  **Run the Test and Confirm Failure**:
    *   Execute the test suite (`pnpm test`).
    *   Verify that the new test fails as expected. The error message should indicate that the functionality is missing (e.g., `ReferenceError: function is not defined` or a failed assertion).

## Guiding Principles

*   **One Step at a Time**: Each test should specify a single, focused requirement.
*   **Clarity is Key**: The test should serve as executable documentation for the behavior you are about to build.
*   **Start Simple**: Write the simplest possible test that will force you to write new code.

Once you have a single, clearly failing test, your next step is to write the minimum amount of code required to make it pass (the "Green" phase).
