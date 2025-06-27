# Structural Change Guidelines

This directory contains instructions for making **structural changes** to the codebase.

## Definition

A structural change (also known as tidying or refactoring) is a modification to the code's internal structure that **does not change its external behavior**.

The goal of a structural change is to improve:

*   **Readability**: Making the code easier to understand.
*   **Maintainability**: Making the code easier to modify in the future.
*   **Simplicity**: Reducing complexity and removing duplication.

Examples include renaming a variable, extracting a method, or moving a class.

## Core Principle: Tidy First & Refactor on Green

Structural changes are performed in two main scenarios:

1.  **Tidy First**: Before adding a new feature, you may clean up the existing code to make the new feature easier to implement. This is a proactive approach to maintaining quality.

2.  **Refactor on Green**: After a behavioral change (i.e., after the tests are passing), you refactor the code you just wrote to integrate it cleanly into the existing design.

## Key Rules

*   **Never change behavior.** The single most important rule. The program must function identically before and after a structural change.
*   **Run tests constantly.** Run all tests before you start, and after each small structural change, to verify that behavior has not been altered.
*   **Make one change at a time.** Do not combine multiple refactorings (e.g., renaming a method and extracting a class) into a single step.
*   **Commit separately.** Structural changes must be committed separately from behavioral changes, typically with a `refactor:` or `tidy:` prefix.

Refer to `tidy_first.md` for specific techniques and patterns.
