'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { CreateTaskSchema, UpdateTaskSchema, GetTasksSchema } from '@/lib/validations';
import type { ActionState, GetTasksOptions, GetTasksResult } from '@/types/task';

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
        description: validatedData.description || null,
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
    const orderBy = sortBy === 'due_date' 
      ? { dueDate: sortOrder }
      : { createdAt: sortOrder };

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

    // FormData → オブジェクト変換
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      dueDate: formData.get('dueDate') as string,
    };

    // 空文字列や不在値の処理
    const processedData = {
      title: rawData.title === '' || !rawData.title ? undefined : rawData.title,
      description: rawData.description === '' ? null : rawData.description || undefined,
      dueDate: rawData.dueDate === '' ? null : rawData.dueDate || undefined,
    };

    // バリデーション（UpdateTaskSchemaは部分的なのでundefinedフィールドは無視される）
    const validatedData = UpdateTaskSchema.parse(processedData);

    // 更新データ準備（undefinedフィールドは除外）
    const updateData: {
      title?: string;
      description?: string | null;
      dueDate?: Date | null;
    } = {};
    
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (processedData.description !== undefined) updateData.description = processedData.description;
    if (processedData.dueDate !== undefined) {
      updateData.dueDate = processedData.dueDate ? new Date(processedData.dueDate) : null;
    }

    // データベース更新
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    // キャッシュ再検証
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

    if (error.code === 'P2025') { // Prisma "Record not found"
      return {
        success: false,
        message: 'タスクが見つかりません',
      };
    }

    console.error('Task update error:', error);
    return {
      success: false,
      message: 'タスクの更新に失敗しました',
    };
  }
}