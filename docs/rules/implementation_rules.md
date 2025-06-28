# 🛠️ Implementation Rules

## 📚 Overview

Defines the mandatory development workflow and standards for the SimpleToDo application on Next.js 15.  
All work must strictly follow this flow:

```

docs/features/\*.md → src/… + tests/ (TDD + Tidy First) -> code review -> fixing (TDD + Tidy First) -> re-review -> ...

```

**Implementation begins only after design is reviewed and approved.**

---

## 🔁 Development Workflow (TDD + Tidy First)

The implementer is instructed by the task manager to implement the workflow below. Upon completion, the implementer reports completion to the task manager and requests a review.
The review results are stored in `docs/reviews`. After receiving a report of review completion from the task manager, the reviewer checks the review contents and corrects them if necessary (TDD + Tidy First). After the correction is completed, ask the task manager for another review.

1. ✅ **Design Review Completed**  
   Ensure reviewed files exist:
   - `docs/features/<feature>.md`
   - Corresponding `docs/model/` and `docs/ui/`

2. 🧹 **Tidy First (Structural Preparations)**  
   Optionally clean existing code (rename, extract, reorder), ensuring no behavior change—using small, well-tested commits. Kent Beck も「tidyings are tiny structural changes before behavioral work」

3. 🔴 **Red – Write a Failing Test**  
   Write the minimal Vitest test that defines new behavior. Run tests to confirm it fails.

4. 🟢 **Green – Write Minimal Code**  
   Implement the simplest code (Server Action, component logic) to pass the test. No excess code.

5. 🔄 **Commit with `feat:`**  
   Commit the minimal passing implementation.
   When committing, use `git add .` is forbidden. You must always specify the file path to limit the scope of the commit.

6. 🛠️ **Refactor (Behavioral Tidy)**  
   Clean up internals (e.g., extract helpers, rename variables) without altering functionality. Each change followed by test run and committed with `refactor:`.
   When committing, use `git add .` is forbidden. You must always specify the file path to limit the scope of the commit.

7. 🔁 **Repeat**  
   Continue the cycle for next behavior.

---

## 🌐 Stack & Tools

| Area             | Tech |
|------------------|------|
| Frontend         | TS + React (Next.js 15 App Router) |
| Server Logic     | Server Actions (`'use server'` + `after()`) |
| ORM              | Prisma + PostgreSQL |
| Validation       | Zod |
| Testing          | Vitest + Testing Library |
| Bundler/Lint     | Turbopack, ESLint v9, Prettier |

Include revalidation after mutations (`revalidatePath()` etc.) and `redirect()` when needed.

---

## ⚙️ Server Action Rules

- Place logic in `actions.ts`, use `'use server'`
- Validate input with Zod
- Secure with session/auth checks
- Post-mutation: call `revalidatePath()` or `after()` for side-effects
- No API routes unless external needs

---

## 🧪 Testing Standards (Vitest)

- Tests accompany each action/component
- Each test suite includes:
  - 1 failing test (Red)
  - Implementation until pass (Green)
  - Refactor code—tests must still pass
- Use `vi.fn()` for mocks
- Small, focused tests following AAA
- Run tests frequently to catch regressions

---

## 🧠 AI & Developer Guidelines

- Don’t start coding without reviewed design
- Enforce TDD > tidy first > implementation > tests
- Halt and escalate if missing docs
- Tests before code, minimal passing implementation, then refactor

---

## 📘 Documentation & Linting

- JSDoc on public functions/actions
- Keep docs updated after behavior changes
- Linting: No `any`, no skip types, no bypass validation

---

## 🚫 Prohibited Patterns

| ❌ Avoid                       | ✅ Instead                                      |
|------------------------------|-------------------------------------------------|
| Starting with API routes      | Use Server Actions                             |
| Skipping structural cleanup   | Apply Tidy First                                |
| Writing code before test      | Follow Red–Green–Refactor                      |
| Ignoring input validation     | Use Zod                                        |
| Missing tests or refactor     | Ensure both steps are present                  |
| Omitting revalidation logic   | Use Next.js caching APIs                       |

---

## ✅ Commit & PR Standards

- Use Conventional Commits: `tidy:`, `feat:`, `refactor:`, `test:`
- Reference feature spec in PR description
- Include checklist: Design reviewed, Tests in place, Passed lint/tests, Docs updated

---

## 🛡️ Enforcement

- Every code path must trace back to reviewed feature spec
- Tests must run and pass before merge
- Structural changes (tidy) and behavioral changes must be separate commits


## Review

Reviews the document requested by the task manager. The review viewpoints of the design document are in 
`docs/implementation_review_checklist.md`. When the review is completed, store the review results and report the completion to the task manager.