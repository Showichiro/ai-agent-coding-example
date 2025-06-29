import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) {
    return 'たった今';
  } else if (minutes < 60) {
    return `${minutes}分前`;
  } else if (hours < 24) {
    return `${hours}時間前`;
  } else if (days < 7) {
    return `${days}日前`;
  } else {
    return formatDate(d);
  }
}

export function formatDateForInput(date: Date | string | null): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format for datetime-local input
}

// Task utilities
export function getTaskStatusLabel(status: string): string {
  switch (status) {
    case 'TODO':
      return '未着手';
    case 'IN_PROGRESS':
      return '進行中';
    case 'DONE':
      return '完了';
    default:
      return status;
  }
}

export function getTaskStatusColor(status: string): string {
  switch (status) {
    case 'TODO':
      return 'bg-gray-100 text-gray-800';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800';
    case 'DONE':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function isOverdue(dueDate: Date | string | null): boolean {
  if (!dueDate) return false;
  
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  return due < new Date();
}

// Form helpers
export function getFormErrors(errors: Record<string, string[]> | undefined, field: string): string[] {
  return errors?.[field] || [];
}

export function hasFormError(errors: Record<string, string[]> | undefined, field: string): boolean {
  return getFormErrors(errors, field).length > 0;
}