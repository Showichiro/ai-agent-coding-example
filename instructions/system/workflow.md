# Workflow: Task-Oriented Multi-Agent Development

## Step-by-Step Flow

1. **Input**: Task Manager receives user goal and supporting docs
2. **Planning**: Task Manager breaks down the work into discrete tasks
3. **Assignment**:
   - Design → to Designer Agent
   - Implementation → to Coder Agent (with pre-assigned Reviewer)
   - Testing → to Tester Agent
   - Review → to Reviewer Agent
4. **Execution**: Developer agents complete their tasks
5. **Validation**:
   - Task Manager checks results
   - Sends follow-ups or downstream tasks
6. **Completion**: Task Manager compiles the final output for the user

## Improved Role Structure

### Primary Roles

| Agent         | Description                      | Scope |
|---------------|----------------------------------|----------|
| Task Manager  | Overall coordination and strategic decisions | Overall supervision |
| Deputy Task Manager| Team progress management and primary review | Each team |
| Designer      | Creates architecture, models     | All design work |
| Coder         | Writes application code          | Implementation work |
| Tester        | Writes unit/integration tests    | Test creation |
| Reviewer      | Reviews output for quality       | Quality assurance |

### Team Structure
- **Backend Team**: Coder %1, %2 (Deputy Task Manager: %1)
- **Frontend Team**: Coder %4, %5 (Deputy Task Manager: %4)
- Each team's Deputy Task Manager handles progress management and primary reviews

## Formalized Review Process

### Rules for Implementation Task Assignment
1. **Paired Task and Reviewer Assignment**
   - When assigning implementation tasks, always specify the reviewer simultaneously
   - Example: `%1 implements → %2 reviews`, `%4 implements → %5 reviews`

2. **Cross-Review Recommendations**
   - Pair reviews within the same team as standard practice
   - Critical features undergo cross-team reviews

3. **Automatic Review Task Generation**
   - Corresponding review tasks are automatically created when implementation tasks are created
   - Review tasks include deadline and priority settings

### Review Completion Criteria
- [ ] Code adheres to design specifications
- [ ] Meets constraints in `implementation_rules.md`
- [ ] Tests are added/updated
- [ ] Error handling is appropriate
- [ ] Performance impact is considered

## Progress Management Improvements

### Progress Management Board (`docs/progress_board.md`)
- Centralized status tracking for all tasks
- Clear documentation of assignees, deadlines, and priorities
- Daily updates are mandatory

### Automated Reporting Flow
1. Developers update progress board upon task completion
2. Deputy Task Managers review team progress daily
3. Task Manager monitors overall status via progress board
4. Intervention only when delays or issues arise

## Principle of Separation of Duties

### Task Manager Restrictions
- Direct code implementation is prohibited
- Review execution must be requested through Deputy Task Manager
- Maintain clear role boundaries

### Maintaining Role Specialization
- Designer: Design only, no implementation
- Coder: Implementation only, no design changes
- Reviewer: Review only, no direct modifications
