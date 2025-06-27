# Behavioral Change Guidelines

This directory contains instructions for making **behavioral changes** to the codebase.

## Definition

A behavioral change is any modification that alters how the software functions. This includes:

*   Adding a new feature (`feat`)
*   Fixing a bug (`fix`)
*   Changing existing functionality

## Core Principle: Red-Green Cycle

All behavioral changes must strictly follow the **Red-Green** steps of the TDD cycle.

1.  **Red - Write a Failing Test**: Before writing any implementation code, you must first write a test that clearly defines the desired new behavior and fails because that behavior does not yet exist. Refer to `write_failing_test.md` for detailed instructions.

2.  **Green - Make the Test Pass**: Write the absolute minimum amount of code necessary to make the failing test pass. The goal is not to write perfect code, but to quickly get the system back into a working (green) state. Refer to `implement_passing_code.md` for guidance.

## Key Rules

*   **Never write implementation code without a failing test.**
*   **Do not mix structural changes (refactoring) with behavioral changes.** If you need to refactor the code to make it easier to add a feature, do that first as a separate structural change.
*   Focus on a single, small piece of behavior at a time.
