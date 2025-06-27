# Filter Panel UI Specification

## Overview
The Filter Panel provides users with intuitive controls to filter tasks by status. This UI component implements the filtering functionality defined in `docs/features/filter_sort.md`.

## Component Structure

### FilterPanel Component
- **Location**: Top section of the task list interface
- **Layout**: Horizontal button group or dropdown menu
- **Responsive**: Adapts to mobile and desktop layouts

## UI Elements

### Filter Buttons
- **All Tasks** (default active state)
  - Label: "All" or "All Tasks"
  - Shows total task count when active
  - Always visible and selectable

- **Pending Tasks**
  - Label: "Pending" or "To Do"
  - Shows count of tasks with status "todo"
  - Maps to TaskStatus "todo"

- **In Progress Tasks**
  - Label: "In Progress" or "Active"
  - Shows count of tasks with status "in_progress"
  - Maps to TaskStatus "in_progress"

- **Completed Tasks**
  - Label: "Completed" or "Done"
  - Shows count of tasks with status "done"
  - Maps to TaskStatus "done"

## Visual Design

### Button States
- **Active State**: 
  - Primary color background
  - White text
  - Subtle shadow or border
  - Task count badge

- **Inactive State**:
  - Light gray background
  - Dark gray text
  - Hover effect with slight color change
  - Task count badge (dimmed)

- **Disabled State**:
  - Light gray background
  - Very light gray text
  - No hover effects
  - Count shows "0"

### Layout Options

#### Option 1: Button Group (Recommended)
```
[All (12)] [Pending (5)] [In Progress (3)] [Completed (4)]
```

#### Option 2: Dropdown Menu
```
Filter: [All Tasks ▼]
```

## Interactions

### Click Behavior
- Single click activates the filter
- Updates task list immediately
- Updates URL parameters for persistence
- Maintains scroll position when possible

### Visual Feedback
- Immediate visual state change on click
- Loading indicator during filter application (if needed)
- Smooth transitions between states

## Accessibility

### ARIA Labels
- `role="tablist"` for button group
- `aria-selected="true/false"` for active state
- `aria-label` describing each filter option

### Keyboard Navigation
- Tab navigation through filter options
- Enter/Space to activate filter
- Arrow keys for navigation within group

### Screen Reader Support
- Announce filter changes
- Provide context about task counts
- Clear indication of current active filter

## State Management

### Component State
- `activeFilter`: Current selected filter ('all' | 'todo' | 'in_progress' | 'done')
- `taskCounts`: Object with counts for each status
- `isLoading`: Boolean for loading states

### URL Integration
- Filter state reflected in URL parameters
- `?filter=pending` for pending tasks
- `?filter=completed` for completed tasks
- Default URL has no filter parameter (shows all)

## Technical Implementation

### Props Interface
```typescript
interface FilterPanelProps {
  activeFilter: TaskStatus | 'all'
  taskCounts: {
    all: number
    todo: number
    in_progress: number
    done: number
  }
  onFilterChange: (filter: TaskStatus | 'all') => void
  className?: string
}
```

### Event Handling
- `onFilterChange` callback when filter is selected
- Debounced to prevent excessive API calls
- Integrates with parent component state management

## Responsive Behavior

### Desktop (>768px)
- Horizontal button group layout
- All filters visible simultaneously
- Hover effects enabled

### Tablet (768px - 480px)
- Horizontal button group with smaller buttons
- Abbreviated labels if needed
- Touch-friendly tap targets

### Mobile (<480px)
- Vertical stack or dropdown menu
- Full-width buttons for easy tapping
- Simplified labels

## Performance Considerations

### Optimization
- Memoize component to prevent unnecessary re-renders
- Efficient count calculations
- Minimal DOM updates during filter changes

### Loading States
- Show skeleton or loading indicator during count updates
- Maintain interactivity during non-blocking operations
- Error states for failed filter operations

## Testing Requirements

### Unit Tests
- Filter selection changes active state
- Task counts display correctly
- Accessibility attributes are present
- Keyboard navigation works properly

### Integration Tests
- Filter changes update task list
- URL parameters sync with filter state
- Responsive layout adapts correctly

### Visual Tests
- Active/inactive states render correctly
- Button hover effects work
- Task count badges display properly