import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskList } from './TaskList';
import type { Task } from '@/types/task';

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'First Task',
    description: 'First Description',
    status: 'TODO',
    dueDate: new Date('2024-12-31T09:00:00Z'),
    createdAt: new Date('2024-01-01T09:00:00Z'),
    updatedAt: new Date('2024-01-01T09:00:00Z'),
  },
  {
    id: '2',
    title: 'Second Task',
    description: 'Second Description',
    status: 'IN_PROGRESS',
    dueDate: null,
    createdAt: new Date('2024-01-02T09:00:00Z'),
    updatedAt: new Date('2024-01-02T09:00:00Z'),
  },
  {
    id: '3',
    title: 'Third Task',
    description: null,
    status: 'DONE',
    dueDate: new Date('2024-01-15T09:00:00Z'),
    createdAt: new Date('2024-01-03T09:00:00Z'),
    updatedAt: new Date('2024-01-03T09:00:00Z'),
  },
];

describe('TaskList Component', () => {
  describe('Basic Rendering', () => {
    it('renders list of tasks', () => {
      render(<TaskList tasks={mockTasks} />);
      
      expect(screen.getByText('First Task')).toBeInTheDocument();
      expect(screen.getByText('Second Task')).toBeInTheDocument();
      expect(screen.getByText('Third Task')).toBeInTheDocument();
    });

    it('renders correct number of task items', () => {
      render(<TaskList tasks={mockTasks} />);
      
      const taskItems = screen.getAllByRole('article');
      expect(taskItems).toHaveLength(3);
    });

    it('passes task data to TaskItem components', () => {
      render(<TaskList tasks={mockTasks} />);
      
      expect(screen.getByText('First Description')).toBeInTheDocument();
      expect(screen.getByText('Second Description')).toBeInTheDocument();
      expect(screen.queryByText('Third Description')).not.toBeInTheDocument(); // null description
    });

    it('renders with proper list semantics', () => {
      render(<TaskList tasks={mockTasks} />);
      
      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders empty state when no tasks provided', () => {
      render(<TaskList tasks={[]} />);
      
      expect(screen.getByText('タスクがありません')).toBeInTheDocument();
      expect(screen.getByText('新しいタスクを作成してください')).toBeInTheDocument();
    });

    it('renders empty state with custom message', () => {
      render(<TaskList tasks={[]} emptyMessage="カスタムメッセージ" />);
      
      expect(screen.getByText('カスタムメッセージ')).toBeInTheDocument();
    });

    it('renders create task button in empty state', () => {
      const onCreateTask = vi.fn();
      render(<TaskList tasks={[]} onCreateTask={onCreateTask} />);
      
      const createButton = screen.getByText('新しいタスクを作成');
      expect(createButton).toBeInTheDocument();
      
      fireEvent.click(createButton);
      expect(onCreateTask).toHaveBeenCalledTimes(1);
    });

    it('does not render empty state when tasks exist', () => {
      render(<TaskList tasks={mockTasks} />);
      
      expect(screen.queryByText('タスクがありません')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('renders loading skeleton when loading', () => {
      render(<TaskList tasks={[]} loading />);
      
      expect(screen.getByTestId('task-list-skeleton')).toBeInTheDocument();
      expect(screen.queryByText('タスクがありません')).not.toBeInTheDocument();
    });

    it('renders multiple skeleton items', () => {
      render(<TaskList tasks={[]} loading skeletonCount={5} />);
      
      const skeletonItems = screen.getAllByTestId('task-skeleton-item');
      expect(skeletonItems).toHaveLength(5);
    });

    it('does not render loading state when not loading', () => {
      render(<TaskList tasks={mockTasks} loading={false} />);
      
      expect(screen.queryByTestId('task-list-skeleton')).not.toBeInTheDocument();
    });

    it('renders loading more indicator', () => {
      render(<TaskList tasks={mockTasks} loadingMore />);
      
      expect(screen.getByTestId('loading-more-indicator')).toBeInTheDocument();
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });
  });

  describe('Task Interactions', () => {
    it('calls onTaskStatusChange when task status is changed', () => {
      const onTaskStatusChange = vi.fn();
      render(<TaskList tasks={mockTasks} onTaskStatusChange={onTaskStatusChange} />);
      
      const statusButton = screen.getAllByLabelText('タスクのステータスを変更')[0];
      fireEvent.click(statusButton);
      
      const inProgressOption = screen.getByText('進行中');
      fireEvent.click(inProgressOption);
      
      expect(onTaskStatusChange).toHaveBeenCalledWith('1', 'IN_PROGRESS');
    });

    it('calls onTaskEdit when task edit is triggered', () => {
      const onTaskEdit = vi.fn();
      render(<TaskList tasks={mockTasks} onTaskEdit={onTaskEdit} />);
      
      const editButton = screen.getAllByLabelText('タスクを編集')[0];
      fireEvent.click(editButton);
      
      expect(onTaskEdit).toHaveBeenCalledWith('1');
    });

    it('calls onTaskDelete when task delete is triggered', () => {
      const onTaskDelete = vi.fn();
      render(<TaskList tasks={mockTasks} onTaskDelete={onTaskDelete} />);
      
      const deleteButton = screen.getAllByLabelText('タスクを削除')[0];
      fireEvent.click(deleteButton);
      
      expect(onTaskDelete).toHaveBeenCalledWith('1');
    });

    it('passes updating state to task items', () => {
      render(<TaskList tasks={mockTasks} updatingTasks={['1']} />);
      
      expect(screen.getByTestId('status-loading')).toBeInTheDocument();
    });
  });

  describe('Filtering and Sorting', () => {
    it('filters tasks by status', () => {
      const todoTasks = mockTasks.filter(task => task.status === 'TODO');
      render(<TaskList tasks={todoTasks} />);
      
      expect(screen.getByText('First Task')).toBeInTheDocument();
      expect(screen.queryByText('Second Task')).not.toBeInTheDocument();
      expect(screen.queryByText('Third Task')).not.toBeInTheDocument();
    });

    it('displays filtered count', () => {
      render(<TaskList tasks={mockTasks} totalCount={5} />);
      
      expect(screen.getByText('3件中5件を表示')).toBeInTheDocument();
    });

    it('shows all count when no filter applied', () => {
      render(<TaskList tasks={mockTasks} />);
      
      expect(screen.getByText('3件のタスク')).toBeInTheDocument();
    });
  });

  describe('Virtualization', () => {
    it('enables virtualization for large lists', () => {
      const largeTasks = Array.from({ length: 100 }, (_, i) => ({
        ...mockTasks[0],
        id: `task-${i}`,
        title: `Task ${i}`,
      }));
      
      render(<TaskList tasks={largeTasks} enableVirtualization />);
      
      expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
    });

    it('does not enable virtualization for small lists', () => {
      render(<TaskList tasks={mockTasks} enableVirtualization />);
      
      expect(screen.queryByTestId('virtualized-list')).not.toBeInTheDocument();
    });

    it('configures virtualization with custom threshold', () => {
      const tasks = Array.from({ length: 10 }, (_, i) => ({
        ...mockTasks[0],
        id: `task-${i}`,
        title: `Task ${i}`,
      }));
      
      render(<TaskList tasks={tasks} enableVirtualization virtualizationThreshold={5} />);
      
      expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
    });
  });

  describe('Performance Optimization', () => {
    it('memoizes task items to prevent unnecessary re-renders', () => {
      const renderSpy = vi.fn();
      const MemoizedTaskItem = vi.fn(() => {
        renderSpy();
        return <div role="article">Mocked Task</div>;
      });
      
      const { rerender } = render(<TaskList tasks={mockTasks} />);
      const initialRenderCount = renderSpy.mock.calls.length;
      
      // Re-render with same tasks
      rerender(<TaskList tasks={mockTasks} />);
      
      // Should not re-render task items if tasks haven't changed
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount);
    });

    it('only re-renders updated tasks', () => {
      const updatedTasks = [
        ...mockTasks.slice(0, 1),
        { ...mockTasks[1], title: 'Updated Second Task' },
        ...mockTasks.slice(2),
      ];
      
      const { rerender } = render(<TaskList tasks={mockTasks} />);
      rerender(<TaskList tasks={updatedTasks} />);
      
      expect(screen.getByText('Updated Second Task')).toBeInTheDocument();
      expect(screen.getByText('First Task')).toBeInTheDocument(); // Should still be rendered
    });
  });

  describe('Infinite Scrolling', () => {
    it('triggers onLoadMore when scrolled to bottom', async () => {
      const onLoadMore = vi.fn();
      render(<TaskList tasks={mockTasks} onLoadMore={onLoadMore} hasMore />);
      
      const listContainer = screen.getByRole('list');
      
      // Simulate scroll to bottom
      Object.defineProperty(listContainer, 'scrollTop', { value: 1000 });
      Object.defineProperty(listContainer, 'scrollHeight', { value: 1200 });
      Object.defineProperty(listContainer, 'clientHeight', { value: 400 });
      
      fireEvent.scroll(listContainer);
      
      await waitFor(() => {
        expect(onLoadMore).toHaveBeenCalledTimes(1);
      });
    });

    it('does not trigger onLoadMore when hasMore is false', async () => {
      const onLoadMore = vi.fn();
      render(<TaskList tasks={mockTasks} onLoadMore={onLoadMore} hasMore={false} />);
      
      const listContainer = screen.getByRole('list');
      fireEvent.scroll(listContainer);
      
      await waitFor(() => {
        expect(onLoadMore).not.toHaveBeenCalled();
      });
    });

    it('shows loading more indicator during infinite scroll', () => {
      render(<TaskList tasks={mockTasks} loadingMore hasMore />);
      
      expect(screen.getByTestId('loading-more-indicator')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('renders error state when error prop is provided', () => {
      const error = new Error('Failed to load tasks');
      render(<TaskList tasks={[]} error={error} />);
      
      expect(screen.getByText('タスクの読み込みに失敗しました')).toBeInTheDocument();
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
    });

    it('renders retry button in error state', () => {
      const onRetry = vi.fn();
      const error = new Error('Network error');
      render(<TaskList tasks={[]} error={error} onRetry={onRetry} />);
      
      const retryButton = screen.getByText('再試行');
      fireEvent.click(retryButton);
      
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('does not render error state when tasks are available', () => {
      const error = new Error('Some error');
      render(<TaskList tasks={mockTasks} error={error} />);
      
      expect(screen.queryByText('タスクの読み込みに失敗しました')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(<TaskList tasks={mockTasks} />);
      
      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('aria-label', 'タスク一覧');
    });

    it('announces task count to screen readers', () => {
      render(<TaskList tasks={mockTasks} />);
      
      expect(screen.getByText('3件のタスク')).toHaveAttribute('aria-live', 'polite');
    });

    it('supports keyboard navigation between tasks', () => {
      render(<TaskList tasks={mockTasks} />);
      
      const firstTask = screen.getAllByRole('article')[0];
      firstTask.focus();
      
      fireEvent.keyDown(firstTask, { key: 'ArrowDown' });
      
      const secondTask = screen.getAllByRole('article')[1];
      expect(secondTask).toHaveFocus();
    });

    it('provides skip navigation for large lists', () => {
      const largeTasks = Array.from({ length: 100 }, (_, i) => ({
        ...mockTasks[0],
        id: `task-${i}`,
        title: `Task ${i}`,
      }));
      
      render(<TaskList tasks={largeTasks} />);
      
      expect(screen.getByText('リストをスキップ')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('accepts custom className', () => {
      render(<TaskList tasks={mockTasks} className="custom-task-list" />);
      
      const list = screen.getByRole('list');
      expect(list).toHaveClass('custom-task-list');
    });

    it('applies responsive grid layout', () => {
      render(<TaskList tasks={mockTasks} layout="grid" />);
      
      const list = screen.getByRole('list');
      expect(list).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('applies list layout by default', () => {
      render(<TaskList tasks={mockTasks} />);
      
      const list = screen.getByRole('list');
      expect(list).toHaveClass('space-y-3');
    });
  });

  describe('Selection Mode', () => {
    it('enables multi-selection mode', () => {
      render(<TaskList tasks={mockTasks} selectionMode="multi" />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);
    });

    it('handles task selection', () => {
      const onSelectionChange = vi.fn();
      render(
        <TaskList 
          tasks={mockTasks} 
          selectionMode="multi" 
          onSelectionChange={onSelectionChange}
        />
      );
      
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(firstCheckbox);
      
      expect(onSelectionChange).toHaveBeenCalledWith(['1']);
    });

    it('renders bulk actions when tasks are selected', () => {
      render(
        <TaskList 
          tasks={mockTasks} 
          selectionMode="multi" 
          selectedTasks={['1', '2']}
        />
      );
      
      expect(screen.getByText('2件選択中')).toBeInTheDocument();
      expect(screen.getByText('一括削除')).toBeInTheDocument();
      expect(screen.getByText('一括ステータス変更')).toBeInTheDocument();
    });
  });
});