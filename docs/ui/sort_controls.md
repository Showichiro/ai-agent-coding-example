# Sort Controls UI Specification

## Overview
The Sort Controls component provides users with intuitive controls to sort tasks by creation date or due date in ascending or descending order. This UI component implements the sorting functionality defined in `docs/features/filter_sort.md`.

## Component Structure

### SortControls Component
- **Location**: Adjacent to filter panel or integrated toolbar
- **Layout**: Dropdown menu or button group with sort direction toggles
- **Responsive**: Adapts to different screen sizes

## UI Elements

### Sort Criteria Selection
- **Sort by Creation Date**
  - Label: "Created" or "Date Created"
  - Default sort option
  - Shows most recent first (descending) by default

- **Sort by Due Date**
  - Label: "Due Date" or "Deadline"
  - Alternative sort option
  - Shows earliest due date first (ascending) by default
  - Tasks without due dates appear at the end

### Sort Direction Controls
- **Ascending Order**
  - Icon: ↑ or "A-Z" symbol
  - Label: "Oldest First" (for creation date)
  - Label: "Earliest First" (for due date)

- **Descending Order**
  - Icon: ↓ or "Z-A" symbol  
  - Label: "Newest First" (for creation date)
  - Label: "Latest First" (for due date)

## Visual Design

### Layout Options

#### Option 1: Dropdown with Direction Toggle (Recommended)
```
Sort by: [Created ▼] [↓]
```

#### Option 2: Segmented Control
```
[Created] [Due Date]  [↑] [↓]
```

#### Option 3: Combined Dropdown
```
Sort: [Created - Newest First ▼]
```

### Visual States

#### Active State
- **Selected Criteria**: Primary color background or border
- **Active Direction**: Highlighted icon with primary color
- **Current Sort**: Clear indication of active sort method

#### Inactive State
- **Unselected Options**: Neutral gray background
- **Inactive Direction**: Dimmed icon color
- **Hover Effects**: Subtle color change on hover

#### Loading State
- **Sorting Indicator**: Small spinner or loading animation
- **Disabled State**: Prevent interaction during sort operation
- **Smooth Transitions**: Fade effects during state changes

## Interactions

### Sort Criteria Change
- **Click Behavior**: Immediately apply new sort criteria
- **Default Direction**: Auto-select appropriate direction for criteria
- **Visual Feedback**: Instant UI update with new sort indication

### Direction Toggle
- **Click Behavior**: Toggle between ascending/descending order
- **Icon Animation**: Smooth rotation or fade transition
- **State Persistence**: Remember last direction for each criteria

### Combined Interactions
- **Quick Sort**: One-click sort with predetermined direction
- **Context Awareness**: Smart defaults based on sort type
- **Keyboard Shortcuts**: Optional keyboard navigation support

## Accessibility

### ARIA Labels
- `role="button"` for sort controls
- `aria-label` describing current sort state
- `aria-expanded` for dropdown states
- `aria-pressed` for direction toggles

### Keyboard Navigation
- Tab navigation through sort controls
- Enter/Space to activate sort options
- Arrow keys for dropdown navigation
- Escape to close dropdown menus

### Screen Reader Support
- Announce sort changes to screen readers
- Provide context about current sort criteria and direction
- Clear descriptions of available sort options

## State Management

### Component State
```typescript
interface SortState {
  criteria: 'created_at' | 'due_date'
  direction: 'asc' | 'desc'
  isLoading: boolean
}
```

### Default States
- **Initial Load**: Sort by creation date, newest first
- **Criteria Change**: Smart direction selection based on criteria type
- **Persistence**: Maintain sort state across page refreshes

### URL Integration
- Reflect sort state in URL parameters
- `?sort=due_date&order=asc` for due date ascending
- `?sort=created_at&order=desc` for creation date descending
- Default URL omits sort parameters (uses defaults)

## Technical Implementation

### Props Interface
```typescript
interface SortControlsProps {
  sortCriteria: 'created_at' | 'due_date'
  sortDirection: 'asc' | 'desc'
  onSortChange: (criteria: string, direction: string) => void
  isLoading?: boolean
  className?: string
}
```

### Event Handling
- `onSortChange` callback with criteria and direction
- Debounced to prevent excessive API calls
- Integration with parent component state management
- Error handling for failed sort operations

## Edge Case Handling

### Empty Dataset
- **No Tasks**: Hide or disable sort controls
- **Single Task**: Show controls but indicate no effect
- **Loading State**: Show skeleton or disabled state

### Data Boundaries
- **Mixed Due Dates**: Handle null/undefined due dates consistently
- **Invalid Dates**: Gracefully handle corrupted date data
- **Large Datasets**: Maintain performance with up to 10,000 tasks

### Error States
- **Sort Failure**: Show error message and revert to previous state
- **Network Issues**: Maintain local sort state during connectivity issues
- **Data Corruption**: Fallback to default sort when data is invalid

## Responsive Behavior

### Desktop (>768px)
- Full sort controls with labels and icons
- Hover effects and detailed tooltips
- Dropdown menus with full option descriptions

### Tablet (768px - 480px)
- Compact sort controls with abbreviated labels
- Touch-friendly tap targets
- Simplified dropdown options

### Mobile (<480px)
- Icon-only sort controls to save space
- Bottom sheet or modal for sort options
- Swipe gestures for quick direction changes

## Performance Considerations

### Optimization
- Memoize sort controls to prevent unnecessary re-renders
- Efficient sort algorithms for large datasets
- Lazy loading for sort options if needed

### User Experience
- Immediate visual feedback during sort operations
- Smooth animations for state transitions
- Minimal delay between user action and sort completion

### Resource Management
- Cleanup sort state on component unmount
- Prevent memory leaks from sort operations
- Efficient DOM updates during sort changes

## Testing Requirements

### Unit Tests
- Sort criteria selection changes state correctly
- Direction toggle functions properly
- Accessibility attributes are present
- Default states are applied correctly

### Integration Tests
- Sort changes update task list correctly
- URL parameters sync with sort state
- Combined filter and sort operations work together
- Error handling recovers gracefully

### Visual Tests
- Sort controls render correctly in all states
- Responsive layout adapts properly
- Icons and labels display correctly
- Loading states appear appropriately

### Performance Tests
- Sort operations complete within 200ms
- Large dataset sorting remains responsive
- Memory usage stays within acceptable limits
- No memory leaks during repeated sort operations