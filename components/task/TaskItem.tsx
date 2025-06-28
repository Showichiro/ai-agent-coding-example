'use client';

import * as React from 'react';
import { cn, formatDate, formatRelativeTime, getTaskStatusLabel, getTaskStatusColor, isOverdue } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { Task, TaskStatus } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  isUpdating?: boolean;
  className?: string;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: '未着手' },
  { value: 'IN_PROGRESS', label: '進行中' },
  { value: 'DONE', label: '完了' },
];

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const LoadingSpinner = () => (
  <svg
    data-testid="status-loading"
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export function TaskItem({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  isUpdating = false,
  className,
}: TaskItemProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [optimisticStatus, setOptimisticStatus] = React.useState(task.status);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Reset optimistic status when task changes
  React.useEffect(() => {
    setOptimisticStatus(task.status);
  }, [task.status]);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!onStatusChange) return;

    // Optimistic update
    setOptimisticStatus(newStatus);
    setIsMenuOpen(false);

    try {
      await onStatusChange(task.id, newStatus);
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticStatus(task.status);
    }
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent, status: TaskStatus) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleStatusChange(status);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const options = Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]') || []);
      const currentIndex = options.findIndex(option => option === event.target);
      
      if (event.key === 'ArrowDown') {
        const nextIndex = (currentIndex + 1) % options.length;
        (options[nextIndex] as HTMLElement)?.focus();
      } else {
        const prevIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1;
        (options[prevIndex] as HTMLElement)?.focus();
      }
    }
  };

  const getDueDateColor = () => {
    if (!task.dueDate) return '';
    
    if (isOverdue(task.dueDate)) {
      return 'text-red-600';
    }
    
    const today = new Date();
    const due = new Date(task.dueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      return 'text-yellow-600';
    }
    
    return 'text-gray-600';
  };

  const formatDueDate = () => {
    if (!task.dueDate) return '';
    
    const now = new Date();
    const due = new Date(task.dueDate);
    const diffDays = Math.abs(Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Show relative time for recent dates (within a week)
    if (diffDays <= 7) {
      return formatRelativeTime(task.dueDate);
    }
    
    return formatDate(task.dueDate);
  };

  const currentStatus = optimisticStatus;
  const statusLabel = getTaskStatusLabel(currentStatus);
  const statusColor = getTaskStatusColor(currentStatus);

  return (
    <article
      role="article"
      className={cn(
        'bg-white rounded-lg border p-4 transition-shadow hover:shadow-md',
        'flex flex-col sm:flex-row sm:items-center sm:justify-between',
        'space-y-3 sm:space-y-0 sm:space-x-4',
        className
      )}
    >
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                'font-medium text-gray-900 truncate',
                currentStatus === 'DONE' && 'line-through text-gray-500'
              )}
            >
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 mt-2">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {isUpdating ? (
                  <LoadingSpinner />
                ) : (
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      statusColor
                    )}
                  >
                    {statusLabel}
                  </span>
                )}
              </div>
              
              {/* Due Date */}
              {task.dueDate && (
                <div className={cn('flex items-center gap-1 text-xs', getDueDateColor())}>
                  <CalendarIcon />
                  <span>{formatDueDate()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Status Change Menu */}
        {onStatusChange && (
          <div className="relative" ref={menuRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="タスクのステータスを変更"
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-1"
            >
              <span className="sr-only">ステータス変更:</span>
              {statusLabel}
              <ChevronDownIcon />
            </Button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      role="menuitem"
                      className={cn(
                        'block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
                        currentStatus === option.value && 'bg-gray-100'
                      )}
                      onClick={() => handleStatusChange(option.value)}
                      onKeyDown={(e) => handleMenuKeyDown(e, option.value)}
                      tabIndex={-1}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Button */}
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task.id)}
            aria-label="タスクを編集"
            className="p-2"
          >
            <EditIcon />
          </Button>
        )}

        {/* Delete Button */}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            aria-label="タスクを削除"
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <DeleteIcon />
          </Button>
        )}
      </div>
    </article>
  );
}