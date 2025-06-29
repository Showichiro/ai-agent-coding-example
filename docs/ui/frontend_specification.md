# React 19 フロントエンド技術仕様

## 概要

Next.js 15 + React 19を使用したタスク管理アプリケーションのフロントエンド技術仕様。App Routerアーキテクチャとサーバーコンポーネントを活用し、パフォーマンスとUXを最適化。

## 技術スタック

### Core Technologies
- **React 19**: 最新の並行機能とサスペンス機能を活用
- **Next.js 15**: App Router + サーバーコンポーネント
- **TypeScript 5.6+**: 厳密型チェックとコード品質向上
- **Tailwind CSS 4**: ユーティリティファーストスタイリング
- **Prisma**: ORM + データベース管理

### State Management
- **React 19 useState/useReducer**: ローカル状態管理
- **Server Actions**: サーバー状態同期
- **useOptimistic**: 楽観的UI更新
- **React Query (TanStack Query)**: キャッシュとサーバー状態管理

### Testing & Quality
- **Vitest**: 高速テストランナー
- **Testing Library**: コンポーネントテスト
- **ESLint**: コード品質
- **Prettier**: コードフォーマッタ

## アーキテクチャ設計

### ディレクトリ構造
```
app/
├── (dashboard)/           # Route Group
│   ├── layout.tsx        # Dashboard Layout
│   ├── page.tsx          # タスク一覧ページ
│   └── tasks/
│       ├── [id]/
│       │   ├── page.tsx  # タスク詳細
│       │   └── edit/
│       │       └── page.tsx # タスク編集
│       └── new/
│           └── page.tsx  # タスク作成
├── api/                  # API Routes
│   └── tasks/
│       ├── route.ts      # GET, POST /api/tasks
│       └── [id]/
│           └── route.ts  # GET, PUT, DELETE /api/tasks/[id]
├── components/           # 共有コンポーネント
│   ├── ui/              # 基本UIコンポーネント
│   ├── task/            # タスク関連コンポーネント
│   └── layout/          # レイアウトコンポーネント
├── lib/                 # ユーティリティ・設定
├── hooks/               # カスタムフック
├── types/               # TypeScript型定義
└── styles/              # グローバルスタイル
```

### サーバー・クライアントコンポーネント分離

#### サーバーコンポーネント
```typescript
// app/(dashboard)/page.tsx - タスク一覧（サーバー）
export default async function TasksPage({
  searchParams
}: {
  searchParams: { status?: string; sort?: string }
}) {
  const tasks = await getTasks({
    status: searchParams.status,
    sortBy: searchParams.sort
  });

  return (
    <div>
      <TaskFilterBar />
      <TaskList initialTasks={tasks} />
    </div>
  );
}
```

#### クライアントコンポーネント
```typescript
// components/task/TaskList.tsx - インタラクティブリスト
'use client';

interface TaskListProps {
  initialTasks: Task[];
}

export function TaskList({ initialTasks }: TaskListProps) {
  const [optimisticTasks, addOptimisticTask] = useOptimistic(
    initialTasks,
    (state, newTask: Task) => [...state, newTask]
  );

  return (
    <div>
      {optimisticTasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
```

## コンポーネント仕様

### 1. Layout Components

#### AppLayout
```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-sans">
        <ThemeProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>{children}</main>
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### DashboardLayout
```typescript
// app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar className="hidden lg:block" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader className="lg:hidden" />
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 2. Task Components

#### TaskForm (Server Action連携)
```typescript
// components/task/TaskForm.tsx
'use client';

interface TaskFormProps {
  task?: Task;
  mode: 'create' | 'edit';
}

export function TaskForm({ task, mode }: TaskFormProps) {
  const [state, formAction] = useActionState(
    mode === 'create' ? createTaskAction : updateTaskAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          タスクタイトル
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          defaultValue={task?.title}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
        {state?.errors?.title && (
          <p className="text-red-500 text-sm">{state.errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          説明
        </label>
        <textarea
          id="description"
          name="description"
          maxLength={1000}
          defaultValue={task?.description}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium">
          締切日
        </label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          defaultValue={task?.dueDate?.toISOString().split('T')[0]}
          className="mt-1 block w-full rounded-md border-gray-300"
        />
      </div>

      <div className="flex gap-2">
        <SubmitButton />
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? '保存中...' : '保存'}
    </Button>
  );
}
```

#### TaskItem (楽観的更新)
```typescript
// components/task/TaskItem.tsx
'use client';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    task.status,
    (_, newStatus: TaskStatus) => newStatus
  );

  async function updateStatus(newStatus: TaskStatus) {
    setOptimisticStatus(newStatus);
    await updateTaskStatusAction(task.id, newStatus);
  }

  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={cn(
            "font-medium",
            optimisticStatus === 'done' && "line-through text-gray-500"
          )}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-gray-600 text-sm mt-1">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <StatusBadge status={optimisticStatus} />
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        <TaskItemMenu
          task={task}
          onStatusChange={updateStatus}
        />
      </div>
    </div>
  );
}
```

#### TaskList (仮想化対応)
```typescript
// components/task/TaskList.tsx
'use client';

interface TaskListProps {
  initialTasks: Task[];
  filter?: TaskStatus | 'all';
  sortBy?: 'createdAt' | 'dueDate';
}

export function TaskList({ initialTasks, filter, sortBy }: TaskListProps) {
  const {
    data: tasks,
    isLoading,
    error
  } = useQuery({
    queryKey: ['tasks', filter, sortBy],
    queryFn: () => fetchTasks({ filter, sortBy }),
    initialData: initialTasks,
    staleTime: 30000, // 30秒間はフレッシュとみなす
  });

  if (isLoading) return <TaskListSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!tasks.length) return <EmptyState />;

  // 50件以上で仮想スクロール適用
  if (tasks.length > 50) {
    return <VirtualizedTaskList tasks={tasks} />;
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
```

### 3. UI Components

#### Button (Variant対応)
```typescript
// components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // ベーススタイル
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        
        // バリアント
        {
          'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'default',
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'border border-gray-300 bg-transparent hover:bg-gray-50': variant === 'outline',
          'hover:bg-gray-100': variant === 'ghost',
        },
        
        // サイズ
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },
        
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

## Server Actions

### Task CRUD Actions
```typescript
// lib/actions/task-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const TaskSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内で入力してください'),
  description: z.string().max(1000, '説明は1000文字以内で入力してください').optional(),
  dueDate: z.string().optional(),
});

export async function createTaskAction(
  prevState: any,
  formData: FormData
) {
  const validatedFields = TaskSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    dueDate: formData.get('dueDate'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { title, description, dueDate } = validatedFields.data;
    
    await prisma.task.create({
      data: {
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'todo',
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return {
      message: 'タスクの作成に失敗しました',
    };
  }
}

export async function updateTaskStatusAction(
  taskId: string,
  status: TaskStatus
) {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    revalidatePath('/');
  } catch (error) {
    throw new Error('ステータスの更新に失敗しました');
  }
}

export async function deleteTaskAction(taskId: string) {
  try {
    await prisma.task.delete({
      where: { id: taskId },
    });

    revalidatePath('/');
  } catch (error) {
    throw new Error('タスクの削除に失敗しました');
  }
}
```

## カスタムフック

### useTaskFilters
```typescript
// hooks/useTaskFilters.ts
export function useTaskFilters() {
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const updateFilter = useCallback((newFilters: Partial<TaskFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    filters,
    updateFilter,
  };
}
```

### useTaskMutations
```typescript
// hooks/useTaskMutations.ts
export function useTaskMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('タスクを作成しました');
    },
    onError: () => {
      toast.error('タスクの作成に失敗しました');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('タスクを更新しました');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('タスクを削除しました');
    },
  });

  return {
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,
    isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
```

## 型定義

### Task Types
```typescript
// types/task.ts
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface TaskFilters {
  status: TaskStatus | 'all';
  sortBy: 'createdAt' | 'dueDate';
  sortOrder: 'asc' | 'desc';
}

export interface TaskFormData {
  title: string;
  description?: string;
  dueDate?: string;
}
```

## パフォーマンス最適化

### バンドル最適化
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@headlessui/react', 'lucide-react'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
```

### React Query設定
```typescript
// lib/react-query.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1分
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### 仮想スクロール (react-window)
```typescript
// components/task/VirtualizedTaskList.tsx
import { FixedSizeList as List } from 'react-window';

interface VirtualizedTaskListProps {
  tasks: Task[];
}

export function VirtualizedTaskList({ tasks }: VirtualizedTaskListProps) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <TaskItem task={tasks[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={tasks.length}
      itemSize={120}
      className="scrollbar-thin"
    >
      {Row}
    </List>
  );
}
```

## エラーハンドリング

### Error Boundaries
```typescript
// components/ErrorBoundary.tsx
'use client';

export class ErrorBoundary extends React.Component {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold text-gray-900">
            エラーが発生しました
          </h2>
          <p className="text-gray-600 mt-2">
            ページを再読み込みしてください
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            再読み込み
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### グローバルエラーページ
```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          何かが間違っています
        </h2>
        <p className="text-gray-600 mt-2">
          予期しないエラーが発生しました
        </p>
        <Button onClick={reset} className="mt-4">
          もう一度試す
        </Button>
      </div>
    </div>
  );
}
```

## テスト戦略

### コンポーネントテスト
```typescript
// __tests__/components/TaskItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from '@/components/task/TaskItem';

const mockTask = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
  status: 'todo' as const,
  dueDate: new Date('2024-12-31'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('TaskItem', () => {
  it('タスクタイトルが表示される', () => {
    render(<TaskItem task={mockTask} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('完了状態のタスクに取り消し線が表示される', () => {
    const doneTask = { ...mockTask, status: 'done' as const };
    render(<TaskItem task={doneTask} />);
    expect(screen.getByText('Test Task')).toHaveClass('line-through');
  });

  it('ステータス変更ボタンが機能する', async () => {
    const onStatusChange = jest.fn();
    render(<TaskItem task={mockTask} onStatusChange={onStatusChange} />);
    
    fireEvent.click(screen.getByRole('button', { name: /完了にする/ }));
    expect(onStatusChange).toHaveBeenCalledWith('done');
  });
});
```

### E2Eテスト (Playwright)
```typescript
// e2e/task-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('タスク管理', () => {
  test('新しいタスクを作成できる', async ({ page }) => {
    await page.goto('/');
    
    await page.click('[data-testid="create-task-button"]');
    await page.fill('[name="title"]', 'E2Eテストタスク');
    await page.fill('[name="description"]', 'テスト用の説明');
    await page.click('[type="submit"]');
    
    await expect(page.locator('text=E2Eテストタスク')).toBeVisible();
  });

  test('タスクのステータスを変更できる', async ({ page }) => {
    await page.goto('/');
    
    await page.click('[data-testid="task-menu-1"]');
    await page.click('text=進行中にする');
    
    await expect(page.locator('[data-status="in_progress"]')).toBeVisible();
  });
});
```

## デプロイ設定

### Vercel設定
```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

### 環境変数
```bash
# .env.example
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## セキュリティ考慮

### CSP設定
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
    ].join('; '),
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 入力サニタイゼーション
```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: [],
  });
}
```