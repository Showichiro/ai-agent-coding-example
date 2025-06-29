以下に、`docs/design_rules.md` に準拠した**AI/人間共通のレビュー用チェックリスト**を作成しました。
このチェックリストは、**設計プロセスが正しく分離され、情報の流れが一貫しているかを確認するためのもの**です。

---

## ✅ Design Compliance Checklist (for SimpleToDo Project)

### 🧾 Section 1: Requirements

| Checkpoint | Description                                                            | Pass/Fail | Notes |
| ---------- | ---------------------------------------------------------------------- | --------- | ----- |
| R-01       | Are all user needs described in `requirements.md` in natural language? |           |       |
| R-02       | Does `requirements.md` avoid specifying data structures or UI details? |           |       |
| R-03       | Are all requirements testable and specific (not vague or broad)?       |           |       |

---

### 🔍 Section 2: Features

| Checkpoint | Description                                                                  | Pass/Fail | Notes |
| ---------- | ---------------------------------------------------------------------------- | --------- | ----- |
| F-01       | Does each feature in `features/` map clearly to one or more requirements?    |           |       |
| F-02       | Is each feature isolated in its own file (e.g., `task_creation.md`)?         |           |       |
| F-03       | Does each feature describe its purpose, inputs/outputs, and flow?            |           |       |
| F-04       | Are dependencies and edge cases mentioned for complex features?              |           |       |
| F-05       | Are there no direct implementation details (models/UI/API) in feature files? |           |       |

---

### 📦 Section 3: Models

| Checkpoint | Description                                                            | Pass/Fail | Notes |
| ---------- | ---------------------------------------------------------------------- | --------- | ----- |
| M-01       | Does every `model/*.md` file reference its source feature(s)?          |           |       |
| M-02       | Are all fields and types justified by feature specs (not assumptions)? |           |       |
| M-03       | Are validation rules, enums, and relations clearly described?          |           |       |
| M-04       | Are field names and types consistent with planned API schema?          |           |       |

---

### 🖼️ Section 4: UI

| Checkpoint | Description                                                              | Pass/Fail | Notes |
| ---------- | ------------------------------------------------------------------------ | --------- | ----- |
| U-01       | Does every `ui/*.md` file reference the corresponding feature spec?      |           |       |
| U-02       | Are UI components described clearly (fields, buttons, interactions)?     |           |       |
| U-03       | Are layout structure and user flow outlined (optionally via wireframes)? |           |       |
| U-04       | Are only UI-specific details included (no backend logic)?                |           |       |

---

### 📏 Section 5: Workflow Consistency

| Checkpoint | Description                                                                                 | Pass/Fail | Notes |
| ---------- | ------------------------------------------------------------------------------------------- | --------- | ----- |
| W-01       | Is there a 1-to-1 or 1-to-n mapping from requirement → feature?                             |           |       |
| W-02       | Are features traceable back to requirements, and designs traceable to features?             |           |       |
| W-03       | Is `design_rules.md` being followed strictly (no bypass of layers)?                         |           |       |
| W-04       | Does the system reject or warn if any layer is missing before proceeding to implementation? |           |       |
| W-05       | **Are implementation constraints in `implementation_rules.md` reflected in the design?**     |           |       |

---

## 🧠 Usage Tips

* ✅ Use this checklist at **task assignment** and **review** stages.
* 🤖 Integrate selected items into AI prompts for self-validation.
* 🗂️ Store results in `docs/reviews/design_checklist_<datetime>.md` for traceability.