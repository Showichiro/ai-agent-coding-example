# 📐 Design Rules

## 📚 Overview

This document defines the design workflow and file structure rules for developing the SimpleToDo application.  
The design process follows a layered approach:

```
[requirements.md] → [features/.md] → [model/.md, ui/*.md]
```

---

## 🔁 Design Flow

### 1. Requirements Definition (`requirements.md`)
- Describe user needs and system goals in natural language.
- Each requirement should be actionable and testable.
- This document serves as the root of all downstream design.

### 2. Feature Specification (`features/*.md`)
- Each requirement is decomposed into one or more feature files.
- A feature file defines:
  - The purpose of the feature
  - Input/output behavior
  - Related user stories or flows
  - Dependencies and edge cases
- Each feature must have a unique file (e.g., `task_creation.md`).

### 3. Implementation Design
#### a. Domain Models (`model/*.md`)
- Define data structures, attributes, types, and relationships.
- Follow database modeling best practices.
- Reference feature specs for field requirements.

#### b. UI Design (`ui/*.md`)
- Describe UI components, layout, user interactions, and transitions.
- Include wireframe sketches or component hierarchies if available.
- All UI designs must be mapped to corresponding features.

---

## 📁 File Naming Conventions

| File Type         | Directory       | Format Example               |
|------------------|----------------|------------------------------|
| Requirement spec | `docs/`         | `requirements.md`           |
| Feature spec     | `docs/features/`| `task_creation.md`          |
| Model design     | `docs/model/`   | `task.md`, `user.md`        |
| UI spec          | `docs/ui/`      | `task_list.md`, `login_form.md` |

- Use snake_case for filenames.
- One feature/model/UI per file.

---

## 🤖 AI Agent Instructions

- AI must follow this workflow strictly:  
  `requirements → features → model/ui`
- Never generate a model or UI without referencing its corresponding feature.
- Do not derive fields, logic, or UI components directly from requirements. Use the intermediary feature layer.
- Use `design_rules.md` as a validation reference during generation and review.

---

## ✅ Example Flow

```
requirements.md:

"Users should be able to create tasks"

⬇️

features/task_creation.md:

Fields: title, description, due_date

API: POST /api/tasks

UI: Task creation form with submit button

⬇️

model/task.md:

title: string (required)

due_date: Date | null

status: 'todo' | 'in_progress' | 'done'

ui/task_form.md:

Input fields for task attributes

Submit button triggering task creation API
```


---

## 🛠️ Enforcement

This design rule is mandatory for all agents involved in planning, coding, testing, and reviewing.  
If any layer is missing or misaligned, the system should notify the task manager or request clarification before proceeding.
