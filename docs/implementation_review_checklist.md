## ✅ Implementation Compliance Checklist (for SimpleToDo Project)

### 📚 Section 1: Overview & Design Alignment

| Checkpoint | Description                                                              | Pass/Fail | Notes |
| ---------- | ------------------------------------------------------------------------ | --------- | ----- |
| OD-01      | Implementation started only after design was reviewed and approved.      |           |       |
| OD-02      | Code implementation aligns with reviewed design documents (`docs/features/<feature>.md`, `docs/model/`, `docs/ui/`). |           |       |
| OD-03      | Every code path traces back to a reviewed feature specification.         |           |       |

---

### 🌐 Section 2: Stack & Tools Adherence

| Checkpoint | Description                                                              | Pass/Fail | Notes |
| ---------- | ------------------------------------------------------------------------ | --------- | ----- |
| ST-01      | Frontend uses TS + React (Next.js 15 App Router).                        |           |       |
| ST-02      | Server Logic uses Server Actions (`'use server'` + `after()`).           |           |       |
| ST-03      | ORM uses Prisma + PostgreSQL.                                            |           |       |
| ST-04      | Validation uses Zod.                                                     |           |       |
| ST-05      | Testing uses Vitest + Testing Library.                                   |           |       |
| ST-06      | Bundler/Linting uses Turbopack, ESLint v9, Prettier.                     |           |       |
| ST-07      | Revalidation after mutations (`revalidatePath()` etc.) and `redirect()` are included when needed. |           |       |

---

### ⚙️ Section 3: Server Action Rules Compliance

| Checkpoint | Description                                                              | Pass/Fail | Notes |
| ---------- | ------------------------------------------------------------------------ | --------- | ----- |
| SA-01      | Logic is placed in `actions.ts`.                                         |           |       |
| SA-02      | `'use server'` is used.                                                  |           |       |
| SA-03      | Input is validated with Zod.                                             |           |       |
| SA-04      | Session/auth checks are implemented for security.                        |           |       |
| SA-05      | Post-mutation: `revalidatePath()` or `after()` is called for side-effects. |           |       |
| SA-06      | No API routes are used unless external needs dictate.                    |           |       |

---

### 🧪 Section 4: Testing & Quality Assurance

| Checkpoint | Description                                                              | Pass/Fail | Notes |
| ---------- | ------------------------------------------------------------------------ | --------- | ----- |
| TQ-01      | Tests accompany each action/component.                                   |           |       |
| TQ-02      | All tests run and pass without errors.                                   |           |       |
| TQ-03      | `vi.fn()` is used appropriately for mocks.                               |           |       |
| TQ-04      | Small, focused tests following AAA (Arrange, Act, Assert) are written.   |           |       |
| TQ-05      | JSDoc is present on public functions/actions.                            |           |       |
| TQ-06      | Documentation is updated to reflect behavior changes.                    |           |       |
| TQ-07      | No linting errors are present.                                           |           |       |
| TQ-08      | No `any` types are used.                                                 |           |       |
| TQ-09      | No type skipping or validation bypassing is present.                     |           |       |

---

### 🚫 Section 5: Prohibited Patterns Avoidance

| Checkpoint | Description                                                              | Pass/Fail | Notes |
| ---------- | ------------------------------------------------------------------------ | --------- | ----- |
| PP-01      | API routes were not used where Server Actions were appropriate.          |           |       |
| PP-02      | Structural cleanup was not skipped (Tidy First principles applied).      |           |       |
| PP-03      | Code was not written before tests (Red–Green–Refactor principles followed). |           |       |
| PP-04      | Input validation was not ignored (Zod was used).                         |           |       |
| PP-05      | Tests or refactoring steps were not missed.                              |           |       |
| PP-06      | Revalidation logic was not omitted (Next.js caching APIs were used).     |           |       |

---

### ✅ Section 6: Commit & PR Standards

| Checkpoint | Description                                                              | Pass/Fail | Notes |
| ---------- | ------------------------------------------------------------------------ | --------- | ----- |
| CP-01      | Conventional Commits (`tidy:`, `feat:`, `refactor:`, `test:`) were used. |           |       |
| CP-02      | Feature specification was referenced in the PR description.              |           |       |
| CP-03      | PR checklist includes: Design reviewed, Tests in place, Passed lint/tests, Docs updated. |           |       |
| CP-04      | Structural changes (tidy) and behavioral changes are in separate commits. |           |       |

---

## 🧠 Usage Tips

* ✅ Use this checklist at **code review** and **merge** stages.
* 🤖 Integrate selected items into AI prompts for self-validation.
* 🗂️ Store results in `docs/reviews/implementation_checklist_<datetime>.md` for traceability.
