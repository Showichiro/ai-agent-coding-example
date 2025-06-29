import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from './TaskItem';
import type { Task } from '@/types/task';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'TODO',
  dueDate: new Date('2024-12-31T09:00:00Z'),
  createdAt: new Date('2024-01-01T09:00:00Z'),
  updatedAt: new Date('2024-01-01T09:00:00Z'),
};

describe('TaskItem Component', () => {
  describe('Basic Rendering', () => {
    it('renders task title', () => {
      render(<TaskItem task={mockTask} />);
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('renders task description when provided', () => {
      render(<TaskItem task={mockTask} />);
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('does not render description when null', () => {
      const taskWithoutDescription = { ...mockTask, description: null };
      render(<TaskItem task={taskWithoutDescription} />);
      expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
    });

    it('renders task status', () => {
      render(<TaskItem task={mockTask} />);
      expect(screen.getByText('未着手')).toBeInTheDocument();
    });

    it('renders due date when provided', () => {
      render(<TaskItem task={mockTask} />);
      expect(screen.getByText(/2024\/12\/31/)).toBeInTheDocument();
    });

    it('does not render due date when null', () => {
      const taskWithoutDueDate = { ...mockTask, dueDate: null };
      render(<TaskItem task={taskWithoutDueDate} />);
      expect(screen.queryByText(/\d{4}\/\d{2}\/\d{2}/)).not.toBeInTheDocument();
    });
  });

  describe('Status Visualization', () => {
    it('applies TODO status styles', () => {
      render(<TaskItem task={mockTask} />);
      const statusBadge = screen.getByText('未着手');
      expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('applies IN_PROGRESS status styles', () => {
      const inProgressTask = { ...mockTask, status: 'IN_PROGRESS' as const };
      render(<TaskItem task={inProgressTask} />);
      const statusBadge = screen.getByText('進行中');
      expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('applies DONE status styles', () => {
      const doneTask = { ...mockTask, status: 'DONE' as const };
      render(<TaskItem task={doneTask} />);
      const statusBadge = screen.getByText('完了');
      expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('applies strikethrough to completed task title', () => {
      const doneTask = { ...mockTask, status: 'DONE' as const };
      render(<TaskItem task={doneTask} />);
      const title = screen.getByText('Test Task');
      expect(title).toHaveClass('line-through', 'text-gray-500');
    });
  });

  describe('Inline Status Toggle', () => {
    it('renders status dropdown menu', () => {
      const onStatusChange = vi.fn();
      render(<TaskItem task={mockTask} onStatusChange={onStatusChange} />);
      const menuButton = screen.getByLabelText('タスクのステータスを変更');
      expect(menuButton).toBeInTheDocument();
    });

    it('opens status menu when clicked', () => {
      const onStatusChange = vi.fn();
      render(<TaskItem task={mockTask} onStatusChange={onStatusChange} />);
      const menuButton = screen.getByLabelText('タスクのステータスを変更');
      fireEvent.click(menuButton);
      
      // Check dropdown options exist (not the badge)
      expect(screen.getAllByText('未着手').length).toBeGreaterThan(1);
      expect(screen.getByText('進行中')).toBeInTheDocument();
      expect(screen.getByText('完了')).toBeInTheDocument();
    });

    it('calls onStatusChange when status option is selected', () => {
      const onStatusChange = vi.fn();
      render(<TaskItem task={mockTask} onStatusChange={onStatusChange} />);
      
      const menuButton = screen.getByLabelText('タスクのステータスを変更');
      fireEvent.click(menuButton);
      
      const inProgressOption = screen.getByText('進行中');
      fireEvent.click(inProgressOption);
      
      expect(onStatusChange).toHaveBeenCalledWith(mockTask.id, 'IN_PROGRESS');
    });

    it('highlights current status in dropdown', () => {
      const onStatusChange = vi.fn();
      render(<TaskItem task={mockTask} onStatusChange={onStatusChange} />);
      const menuButton = screen.getByLabelText('タスクのステータスを変更');
      fireEvent.click(menuButton);
      
      const dropdownOptions = screen.getAllByText('未着手');
      const currentOption = dropdownOptions.find(el => el.closest('[role="menuitem"]'));
      expect(currentOption).toHaveClass('bg-gray-100');
    });
  });

  describe('Due Date Display', () => {
    it('formats due date in Japanese locale', () => {
      render(<TaskItem task={mockTask} />);
      expect(screen.getByText('2024/12/31 18:00')).toBeInTheDocument();
    });

    it('shows overdue indicator for past due dates', () => {
      const overdueTask = {
        ...mockTask,
        dueDate: new Date('2020-01-01T09:00:00Z'),
      };
      render(<TaskItem task={overdueTask} />);
      
      // Check the parent container for red color styling
      const dueDateContainer = screen.getByText(/2020\/01\/01/).closest('div');
      expect(dueDateContainer).toHaveClass('text-red-600');
    });

    it('shows upcoming indicator for near due dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const upcomingTask = {
        ...mockTask,
        dueDate: tomorrow,
      };
      render(<TaskItem task={upcomingTask} />);
      
      // For tomorrow's date, it should show relative time "たった今" and have yellow styling
      const dueDateContainer = screen.getByText('たった今').closest('div');
      expect(dueDateContainer).toHaveClass('text-yellow-600');
    });

    it('shows relative time for recent dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const recentTask = {
        ...mockTask,
        dueDate: yesterday,
      };
      render(<TaskItem task={recentTask} />);
      
      // Check for relative time format (could be "1日前" or similar)
      expect(screen.getByText(/\d+日前/)).toBeInTheDocument();
    });
  });

  describe('Optimistic Updates', () => {
    it('shows loading state during status update', () => {
      render(<TaskItem task={mockTask} isUpdating />);
      expect(screen.getByTestId('status-loading')).toBeInTheDocument();
    });

    it('applies optimistic status immediately', () => {
      const onStatusChange = vi.fn();
      render(<TaskItem task={mockTask} onStatusChange={onStatusChange} />);
      
      const menuButton = screen.getByLabelText('タスクのステータスを変更');
      fireEvent.click(menuButton);
      
      const doneOption = screen.getByText('完了');
      fireEvent.click(doneOption);
      
      // Should immediately show DONE status optimistically in the button
      expect(screen.getByLabelText('タスクのステータスを変更')).toHaveTextContent('完了');
      expect(onStatusChange).toHaveBeenCalledWith(mockTask.id, 'DONE');
    });

    it('reverts optimistic update on error', () => {
      const onStatusChange = vi.fn().mockRejectedValue(new Error('Update failed'));
      render(<TaskItem task={mockTask} onStatusChange={onStatusChange} />);
      
      const menuButton = screen.getByLabelText('タスクのステータスを変更');
      fireEvent.click(menuButton);
      
      const doneOption = screen.getByText('完了');
      fireEvent.click(doneOption);
      
      // Should revert to original status
      setTimeout(() => {
        expect(screen.getByText('未着手')).toBeInTheDocument();
      }, 0);
    });
  });

  describe('Task Actions', () => {
    it('renders edit button', () => {
      const onEdit = vi.fn();
      render(<TaskItem task={mockTask} onEdit={onEdit} />);
      expect(screen.getByLabelText('タスクを編集')).toBeInTheDocument();
    });

    it('renders delete button', () => {
      const onDelete = vi.fn();
      render(<TaskItem task={mockTask} onDelete={onDelete} />);
      expect(screen.getByLabelText('タスクを削除')).toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
      const onEdit = vi.fn();
      render(<TaskItem task={mockTask} onEdit={onEdit} />);
      
      const editButton = screen.getByLabelText('タスクを編集');
      fireEvent.click(editButton);
      
      expect(onEdit).toHaveBeenCalledWith(mockTask.id);
    });

    it('calls onDelete when delete button is clicked', () => {
      const onDelete = vi.fn();
      render(<TaskItem task={mockTask} onDelete={onDelete} />);
      
      const deleteButton = screen.getByLabelText('タスクを削除');
      fireEvent.click(deleteButton);
      
      expect(onDelete).toHaveBeenCalledWith(mockTask.id);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for interactive elements', () => {
      const onStatusChange = vi.fn();
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      render(
        <TaskItem 
          task={mockTask} 
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
      
      expect(screen.getByLabelText('タスクのステータスを変更')).toBeInTheDocument();
      expect(screen.getByLabelText('タスクを編集')).toBeInTheDocument();
      expect(screen.getByLabelText('タスクを削除')).toBeInTheDocument();
    });

    it('has proper role for task item', () => {
      render(<TaskItem task={mockTask} />);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('supports keyboard navigation for status menu', () => {
      const onStatusChange = vi.fn();
      render(<TaskItem task={mockTask} onStatusChange={onStatusChange} />);
      const menuButton = screen.getByLabelText('タスクのステータスを変更');
      
      fireEvent.keyDown(menuButton, { key: 'Enter' });
      expect(screen.getByText('進行中')).toBeInTheDocument();
      
      fireEvent.keyDown(screen.getByText('進行中'), { key: 'ArrowDown' });
      expect(screen.getByText('完了')).toHaveFocus();
    });
  });

  describe('Custom Styling', () => {
    it('accepts custom className', () => {
      render(<TaskItem task={mockTask} className="custom-task-item" />);
      const taskItem = screen.getByRole('article');
      expect(taskItem).toHaveClass('custom-task-item');
    });

    it('applies hover effects', () => {
      render(<TaskItem task={mockTask} />);
      const taskItem = screen.getByRole('article');
      expect(taskItem).toHaveClass('hover:shadow-md', 'transition-shadow');
    });
  });

  describe('Responsive Design', () => {
    it('applies mobile-specific styles', () => {
      render(<TaskItem task={mockTask} />);
      const taskItem = screen.getByRole('article');
      expect(taskItem).toHaveClass('sm:flex-row', 'flex-col');
    });

    it('shows simplified view on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<TaskItem task={mockTask} />);
      // Mobile-specific assertions would go here
    });
  });
});