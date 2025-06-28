# TaskForm Component Specification

## Purpose
A form component for creating new tasks with validation and user feedback.

## Component Hierarchy
```
TaskForm
├── Form (semantic HTML form)
├── TitleInput (required field)
├── DescriptionTextarea (optional field)
├── DueDatePicker (optional field)
├── SubmitButton
└── ErrorDisplay/SuccessMessage
```

## Props Interface
```typescript
interface TaskFormProps {
  onSubmit: (task: CreateTaskRequest) => Promise<void>;
  onSuccess?: (task: Task) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
  initialValues?: Partial<CreateTaskRequest>;
}

interface CreateTaskRequest {
  title: string;
  description?: string;
  due_date?: string; // ISO date string
}
```

## State Management
```typescript
interface TaskFormState {
  title: string;
  description: string;
  due_date: string;
  isSubmitting: boolean;
  errors: {
    title?: string;
    description?: string;
    due_date?: string;
    general?: string;
  };
}
```

## Validation Rules
- **Title**: Required, 1-100 characters, trim whitespace
- **Description**: Optional, max 500 characters
- **Due Date**: Optional, valid ISO date, not in the past

## UI Layout

### Desktop (≥768px)
```
┌─────────────────────────────────────┐
│ Create New Task                     │
├─────────────────────────────────────┤
│ Title *                             │
│ [________________________]          │
│                                     │
│ Description                         │
│ [________________________]          │
│ [________________________]          │
│ [________________________]          │
│                                     │
│ Due Date                            │
│ [___________] 📅                    │
│                                     │
│           [Cancel] [Create Task]    │
└─────────────────────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────────┐
│ Create New Task      │
├──────────────────────┤
│ Title *              │
│ [________________]   │
│                      │
│ Description          │
│ [________________]   │
│ [________________]   │
│ [________________]   │
│                      │
│ Due Date             │
│ [____________] 📅    │
│                      │
│ [Cancel]             │
│ [Create Task]        │
└──────────────────────┘
```

## Responsive Design
- **Mobile**: Single column, full-width inputs, stacked buttons
- **Tablet**: Single column with larger inputs
- **Desktop**: Single column with optimal width constraints

## Accessibility
- Semantic form elements with proper labels
- ARIA attributes for error states
- Keyboard navigation support
- Screen reader announcements for validation errors
- Focus management after form submission

## Styling Guidelines
- Consistent with app theme using Tailwind CSS 4
- Clear visual hierarchy with proper spacing
- Error states with red border and descriptive text
- Loading states with disabled inputs and spinner
- Success feedback with green border/background

## Interaction Flow
1. User focuses on title input
2. Real-time validation on blur/change
3. Optional fields remain pristine until touched
4. Submit button disabled until valid title provided
5. Loading state during submission
6. Success/error feedback displayed
7. Form reset on successful creation

## Error Handling
- Client-side validation errors displayed inline
- Server-side errors shown in general error area
- Network errors with retry option
- Graceful degradation for JavaScript disabled

## Performance Considerations
- Debounced validation for real-time feedback
- Minimal re-renders with optimized state updates
- Lazy loading of date picker component
- Efficient form reset mechanism