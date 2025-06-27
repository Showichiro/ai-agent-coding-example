# Workflow: Task-Oriented Multi-Agent Development

## Step-by-Step Flow

1. **Input**: Task Manager receives user goal and supporting docs
2. **Planning**: Task Manager breaks down the work into discrete tasks
3. **Assignment**:
   - Design → to Designer Agent
   - Implementation → to Coder Agent
   - Testing → to Tester Agent
   - Review → to Reviewer Agent
4. **Execution**: Developer agents complete their tasks
5. **Validation**:
   - Task Manager checks results
   - Sends follow-ups or downstream tasks
6. **Completion**: Task Manager compiles the final output for the user

## Roles

| Agent         | Description                      |
|---------------|----------------------------------|
| Task Manager  | Coordinator / Workflow engine    |
| Designer      | Creates architecture, models     |
| Coder         | Writes application code          |
| Tester        | Writes unit/integration tests    |
| Reviewer      | Reviews output for quality       |
