# TaskItem Component Specification

## Purpose
A component that displays individual task details with inline editing, status management, and deletion capabilities.

## Component Hierarchy
```
TaskItem
├── TaskCard
│   ├── StatusIndicator
│   ├── TaskContent
│   │   ├── TaskTitle
│   │   ├── TaskDescription
│   │   └── TaskDueDate
│   └── TaskActions
│       ├── EditButton
│       ├── DeleteButton
│       └── StatusToggle
└── EditMode (conditional)
    ├── EditForm
    ├── SaveButton
    └── CancelButton
```

## Props Interface
```typescript
interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  isLoading?: boolean;
  compact?: boolean;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  due_date?: string;
  created_at: string;
  updated_at: string;
}
```

## State Management
```typescript
interface TaskItemState {
  isEditing: boolean;
  showDeleteConfirm: boolean;
  editValues: {
    title: string;
    description: string;
    due_date: string;
  };
  isUpdating: boolean;
  errors: {
    title?: string;
    description?: string;
    due_date?: string;
  };
}
```

## UI Layout

### View Mode - Desktop
```
┌────────────────────────────────────────────────────────┐
│ ⭕ Fix homepage layout                        📝 🗑️ ✅ │
│    Update the responsive grid to work on mobile        │
│    Due: Dec 31, 2024                                   │
└────────────────────────────────────────────────────────┘
```

### View Mode - Mobile
```
┌──────────────────────────────┐
│ ⭕ Fix homepage layout       │
│    Update the responsive     │
│    grid to work on mobile    │
│    Due: Dec 31, 2024         │
│                       📝 🗑️ │
└──────────────────────────────┘
```

### Edit Mode
```
┌────────────────────────────────────────────────────────┐
│ Title *                                                │
│ [Fix homepage layout________________________]          │
│                                                        │
│ Description                                            │
│ [Update the responsive grid to work on mobile_______]  │
│ [_______________________________________________]      │
│                                                        │
│ Due Date                                               │
│ [Dec 31, 2024____] 📅                                 │
│                                                        │
│                               [Cancel] [Save Changes]  │
└────────────────────────────────────────────────────────┘
```

## Status Indicators
- **Todo**: ⭕ (Empty circle, gray)
- **In Progress**: 🔄 (Arrow circle, blue)
- **Done**: ✅ (Checkmark, green)

## Interactive States

### Hover Effects
- Subtle background color change
- Action buttons become more prominent
- Cursor changes appropriately

### Focus States
- Clear focus outline for keyboard navigation
- Focus trapping in edit mode
- Logical tab order

### Loading States
- Disabled interactions during updates
- Spinner overlay for status changes
- Optimistic UI updates where appropriate

## Responsive Design

### Desktop (≥1024px)
- Full layout with all elements visible
- Actions on the right side
- Generous spacing and typography

### Tablet (768px - 1023px)
- Slightly condensed layout
- Actions remain visible
- Adjusted spacing

### Mobile (<768px)
- Compact layout with stacked content
- Actions moved to bottom row
- Larger touch targets

## Accessibility
- Semantic HTML structure
- ARIA labels for status and actions
- Keyboard shortcuts (e.g., Enter to edit, Escape to cancel)
- Screen reader announcements for status changes
- High contrast mode support

## Styling Guidelines
- Consistent card design with subtle shadows
- Status-based color coding
- Clear visual hierarchy
- Smooth transitions for state changes
- Responsive typography scales

## Interaction Patterns

### Editing Flow
1. Click edit button or double-click title
2. Enter edit mode with pre-filled form
3. Real-time validation on field changes
4. Save or cancel with confirmation for unsaved changes

### Status Management
1. Click status indicator for quick toggle
2. Dropdown for multiple status options
3. Optimistic UI updates with rollback on error

### Deletion Flow
1. Click delete button
2. Show confirmation modal
3. Confirm deletion with loading state
4. Remove item with animation

## Error Handling
- Inline validation errors in edit mode
- Toast notifications for save/delete errors
- Retry mechanisms for failed operations
- Graceful degradation for network issues

## Performance Optimizations
- Memoization for expensive calculations
- Debounced auto-save in edit mode
- Lazy loading for complex interactions
- Efficient re-rendering strategies

## Animation & Transitions
- Smooth expand/collapse for edit mode
- Fade transitions for status changes
- Slide animations for deletion
- Micro-interactions for better UX