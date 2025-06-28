# Server Actions仕様

## 概要

TODOアプリのバックエンド処理を担うNext.js 15 Server Actionsの詳細設計。React Server Components と組み合わせて、型安全でパフォーマンスの高いデータ操作を実現する。

## アーキテクチャ方針

### 基本原則
- `'use server'`指示子を使用したServer Actions
- Zodによる入力検証
- Prisma ORMによるデータベース操作
- `revalidatePath()`による適切なキャッシュ無効化
- エラーハンドリングとユーザーフレンドリーなレスポンス

### ファイル構成
```
app/
├── actions/
│   ├── task-actions.ts      # タスク関連の全アクション
│   └── types.ts             # 共通型定義
└── lib/
    ├── prisma.ts            # Prismaクライアント
    ├── validations.ts       # Zodスキーマ
    └── utils.ts             # ユーティリティ関数
```

## Server Actions一覧

### 1. createTask - タスク作成アクション

```typescript
'use server'

export async function createTask(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  // 実装詳細は後述
}
```

**機能**: F001 タスク作成機能  
**入力**: FormData (title, description?, dueDate?)  
**出力**: ActionState (success/error + data/message)  
**副作用**: データベース挿入, `/` パス再検証

### 2. updateTask - タスク更新アクション

```typescript
'use server'

export async function updateTask(
  taskId: string,
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  // 実装詳細は後述
}
```

**機能**: F002 タスク編集機能  
**入力**: taskId + FormData (title?, description?, dueDate?)  
**出力**: ActionState  
**副作用**: データベース更新, `/` パス再検証

### 3. deleteTask - タスク削除アクション

```typescript
'use server'

export async function deleteTask(taskId: string): Promise<ActionState> {
  // 実装詳細は後述
}
```

**機能**: F003 タスク削除機能  
**入力**: taskId  
**出力**: ActionState  
**副作用**: データベース削除, `/` パス再検証

### 4. updateTaskStatus - ステータス変更アクション

```typescript
'use server'

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<ActionState> {
  // 実装詳細は後述
}
```

**機能**: F004 ステータス変更機能  
**入力**: taskId + status  
**出力**: ActionState  
**副作用**: データベース更新, `/` パス再検証

### 5. getTasks - タスク一覧取得アクション

```typescript
'use server'

export async function getTasks(
  options: GetTasksOptions = {}
): Promise<GetTasksResult> {
  // 実装詳細は後述
}
```

**機能**: F005 タスク一覧取得機能 + F006 フィルタリング機能  
**入力**: GetTasksOptions (sort_by?, sort_order?, status_filter?)  
**出力**: GetTasksResult (tasks[], count)  
**副作用**: なし（読み取り専用）

## 型定義

### 共通型（types.ts）

```typescript
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type ActionState = {
  success: boolean;
  message: string;
  data?: any;
  errors?: Record<string, string[]>;
};

export type GetTasksOptions = {
  sortBy?: 'created_at' | 'due_date';
  sortOrder?: 'asc' | 'desc';
  statusFilter?: TaskStatus | 'all';
  limit?: number;
  offset?: number;
};

export type GetTasksResult = {
  tasks: Task[];
  count: number;
  hasMore: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
```

### バリデーションスキーマ（validations.ts）

```typescript
import { z } from 'zod';

export const CreateTaskSchema = z.object({
  title: z.string().min(1, '必須入力').max(200, '200文字以内'),
  description: z.string().max(1000, '1000文字以内').optional(),
  dueDate: z.string().datetime('有効な日時').optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export const TaskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);

export const GetTasksSchema = z.object({
  sortBy: z.enum(['created_at', 'due_date']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  statusFilter: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'all']).default('all'),
  limit: z.number().min(1).max(100).default(100),
  offset: z.number().min(0).default(0),
});
```

## 詳細実装仕様

### 1. createTask 実装

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { CreateTaskSchema } from '@/lib/validations';
import type { ActionState } from './types';

export async function createTask(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    // FormData → オブジェクト変換
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      dueDate: formData.get('dueDate') as string || undefined,
    };

    // バリデーション
    const validatedData = CreateTaskSchema.parse(rawData);

    // 最大件数チェック
    const taskCount = await prisma.task.count();
    if (taskCount >= 100) {
      return {
        success: false,
        message: 'タスクは最大100件まで作成できます',
      };
    }

    // データベース挿入
    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        status: 'TODO',
      },
    });

    // キャッシュ再検証
    revalidatePath('/');

    return {
      success: true,
      message: 'タスクを作成しました',
      data: task,
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'バリデーションエラー',
        errors: error.flatten().fieldErrors,
      };
    }

    console.error('Task creation error:', error);
    return {
      success: false,
      message: 'タスクの作成に失敗しました',
    };
  }
}
```

### 2. updateTask 実装

```typescript
'use server';

export async function updateTask(
  taskId: string,
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  try {
    // IDバリデーション
    if (!taskId || typeof taskId !== 'string') {
      return {
        success: false,
        message: '無効なタスクIDです',
      };
    }

    // 存在確認
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return {
        success: false,
        message: 'タスクが見つかりません',
      };
    }

    // FormData処理
    const rawData = {
      title: formData.get('title') as string || undefined,
      description: formData.get('description') as string || undefined,
      dueDate: formData.get('dueDate') as string || undefined,
    };

    // 空文字列をundefinedに変換
    Object.keys(rawData).forEach(key => {
      if (rawData[key] === '') {
        rawData[key] = undefined;
      }
    });

    // バリデーション
    const validatedData = UpdateTaskSchema.parse(rawData);

    // 更新データ準備
    const updateData: any = {};
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.dueDate !== undefined) {
      updateData.dueDate = validatedData.dueDate ? new Date(validatedData.dueDate) : null;
    }

    // データベース更新
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    revalidatePath('/');

    return {
      success: true,
      message: 'タスクを更新しました',
      data: updatedTask,
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'バリデーションエラー',
        errors: error.flatten().fieldErrors,
      };
    }

    console.error('Task update error:', error);
    return {
      success: false,
      message: 'タスクの更新に失敗しました',
    };
  }
}
```

### 3. deleteTask 実装

```typescript
'use server';

export async function deleteTask(taskId: string): Promise<ActionState> {
  try {
    // IDバリデーション
    if (!taskId || typeof taskId !== 'string') {
      return {
        success: false,
        message: '無効なタスクIDです',
      };
    }

    // 存在確認と削除
    const deletedTask = await prisma.task.delete({
      where: { id: taskId },
    });

    revalidatePath('/');

    return {
      success: true,
      message: 'タスクを削除しました',
      data: deletedTask,
    };

  } catch (error) {
    if (error.code === 'P2025') { // Prisma "Record not found"
      return {
        success: false,
        message: 'タスクが見つかりません',
      };
    }

    console.error('Task deletion error:', error);
    return {
      success: false,
      message: 'タスクの削除に失敗しました',
    };
  }
}
```

### 4. updateTaskStatus 実装

```typescript
'use server';

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<ActionState> {
  try {
    // バリデーション
    if (!taskId || typeof taskId !== 'string') {
      return {
        success: false,
        message: '無効なタスクIDです',
      };
    }

    const validatedStatus = TaskStatusSchema.parse(status);

    // 更新
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: validatedStatus },
    });

    revalidatePath('/');

    return {
      success: true,
      message: 'ステータスを更新しました',
      data: updatedTask,
    };

  } catch (error) {
    if (error.code === 'P2025') {
      return {
        success: false,
        message: 'タスクが見つかりません',
      };
    }

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: '無効なステータスです',
      };
    }

    console.error('Task status update error:', error);
    return {
      success: false,
      message: 'ステータスの更新に失敗しました',
    };
  }
}
```

### 5. getTasks 実装

```typescript
'use server';

export async function getTasks(
  options: GetTasksOptions = {}
): Promise<GetTasksResult> {
  try {
    // デフォルト値とバリデーション
    const validatedOptions = GetTasksSchema.parse(options);
    const { sortBy, sortOrder, statusFilter, limit, offset } = validatedOptions;

    // WHERE条件構築
    const where = statusFilter === 'all' ? {} : { status: statusFilter };

    // ソート条件構築
    const orderBy = {
      [sortBy === 'due_date' ? 'dueDate' : 'createdAt']: sortOrder,
    };

    // 並行クエリ実行
    const [tasks, totalCount] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      count: totalCount,
      hasMore: offset + tasks.length < totalCount,
    };

  } catch (error) {
    console.error('Get tasks error:', error);
    throw new Error('タスクの取得に失敗しました');
  }
}
```

## エラーハンドリング戦略

### エラー分類と対応

| エラータイプ | HTTPステータス | ユーザーメッセージ | ログレベル |
|------------|-------------|-----------------|---------|
| バリデーションエラー | 400 | 具体的な検証エラー | INFO |
| リソース未存在 | 404 | 「見つかりません」 | WARN |
| ビジネスルール違反 | 422 | 業務的なエラー | WARN |
| システムエラー | 500 | 「一時的なエラー」 | ERROR |

### ログ出力仕様

```typescript
// 構造化ログ
console.error('Server Action Error', {
  action: 'createTask',
  error: error.message,
  userId: 'anonymous', // 認証実装後に追加
  timestamp: new Date().toISOString(),
  requestId: crypto.randomUUID(),
});
```

## セキュリティ考慮事項

### 入力検証
- 全ての入力にZodバリデーション適用
- SQLインジェクション対策（Prisma ORM）
- XSS対策（Next.jsの自動エスケープ）

### レート制限
```typescript
// 将来的な実装案
const rateLimiter = new Map();

function checkRateLimit(action: string): boolean {
  // IPベースの簡易レート制限
  // 本格運用時はRedisやMemcached使用
  return true;
}
```

### データ漏洩防止
- 内部エラーの詳細をクライアントに露出しない
- ログに機密情報を含めない
- 適切なHTTPレスポンスコード使用

## パフォーマンス最適化

### データベースクエリ最適化
- 必要なフィールドのみ取得（select指定）
- インデックス効果的活用
- N+1クエリ回避

### キャッシュ戦略
```typescript
// Next.js App Router キャッシュ
import { unstable_cache } from 'next/cache';

const getCachedTasks = unstable_cache(
  async (options) => await getTasks(options),
  ['tasks'],
  {
    revalidate: 60, // 60秒キャッシュ
    tags: ['tasks'],
  }
);
```

### 並行処理
- 読み取り専用操作の並行実行
- Promise.allを活用した効率的なデータ取得

## テスト戦略

### ユニットテスト（Vitest）

```typescript
// __tests__/actions/task-actions.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createTask } from '@/app/actions/task-actions';

describe('createTask', () => {
  it('should create task successfully', async () => {
    const formData = new FormData();
    formData.append('title', 'テストタスク');

    const result = await createTask(null, formData);

    expect(result.success).toBe(true);
    expect(result.message).toBe('タスクを作成しました');
  });

  it('should fail with empty title', async () => {
    const formData = new FormData();
    formData.append('title', '');

    const result = await createTask(null, formData);

    expect(result.success).toBe(false);
    expect(result.errors?.title).toContain('必須入力');
  });
});
```

### 統合テスト

```typescript
// __tests__/integration/task-flow.test.ts
describe('Task Management Integration', () => {
  it('should complete full CRUD cycle', async () => {
    // 作成 → 更新 → ステータス変更 → 削除の一連フロー
  });
});
```

## モニタリング・観測性

### メトリクス収集
- アクション実行時間
- エラー発生率
- データベースクエリ性能

### ヘルスチェック
```typescript
// /app/api/health/route.ts
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: 'healthy' });
  } catch (error) {
    return Response.json({ status: 'unhealthy' }, { status: 503 });
  }
}
```

## 運用考慮事項

### データベースメンテナンス
- 定期的なインデックス最適化
- 統計情報更新
- バックアップ戦略

### スケーリング戦略
- 読み取り専用レプリカ活用
- コネクションプール調整
- CDN活用（静的アセット）

### デプロイメント
- ゼロダウンタイムデプロイ
- データベースマイグレーション戦略
- ロールバック手順