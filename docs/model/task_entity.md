# タスクエンティティ設計

## 概要

TODOアプリの中核となるTaskエンティティのデータモデル設計。Prisma ORMを使用してSQLiteデータベースに保存される。

## Prismaスキーマ設計

### Task モデル

```prisma
model Task {
  id          String    @id @default(cuid())
  title       String    @db.VarChar(200)
  description String?   @db.VarChar(1000)
  status      TaskStatus @default(TODO)
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("tasks")
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE

  @@map("task_status")
}
```

## フィールド仕様

### 主キー
- **id**: `String`
  - CUID形式の一意識別子
  - Prismaのデフォルト関数で自動生成
  - 外部からの推測が困難なランダム文字列

### 必須フィールド
- **title**: `String`
  - タスクのタイトル
  - 最大200文字制限
  - 必須項目（NULL不可）
  - バリデーション: 1-200文字

### 任意フィールド
- **description**: `String?`
  - タスクの詳細説明
  - 最大1000文字制限
  - 任意項目（NULL可）
  - バリデーション: 最大1000文字

- **dueDate**: `DateTime?`
  - タスクの締切日時
  - ISO 8601形式
  - 任意項目（NULL可）
  - タイムゾーン: UTC

### ステータス管理
- **status**: `TaskStatus`
  - デフォルト値: `TODO`
  - 列挙型: `TODO` | `IN_PROGRESS` | `DONE`
  - ワークフロー制約なし（任意の状態変更可能）

### 監査フィールド
- **createdAt**: `DateTime`
  - 作成日時
  - 自動設定（@default(now())）
  - 更新不可

- **updatedAt**: `DateTime`
  - 更新日時
  - 自動更新（@updatedAt）
  - 任意のフィールド変更で更新

## データベース制約

### インデックス戦略
```prisma
// パフォーマンス最適化のためのインデックス
@@index([status])           // ステータスフィルタリング用
@@index([createdAt])        // 作成日ソート用
@@index([dueDate])          // 締切日ソート用
@@index([status, createdAt]) // 複合インデックス
```

### ビジネスルール制約
- 1ユーザーあたり最大100件（アプリケーションレベルで制御）
- タイトルは空文字列不可
- 削除は物理削除（論理削除なし）

## データ型マッピング

| Prismaフィールド | SQLite型 | 制約 |
|----------------|----------|------|
| id | TEXT | PRIMARY KEY |
| title | VARCHAR(200) | NOT NULL |
| description | VARCHAR(1000) | NULL |
| status | TEXT | NOT NULL, CHECK |
| dueDate | DATETIME | NULL |
| createdAt | DATETIME | NOT NULL, DEFAULT |
| updatedAt | DATETIME | NOT NULL |

## バリデーション仕様

### 入力検証（Zodスキーマ）
```typescript
const TaskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.string().datetime().optional(),
});

const TaskUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  dueDate: z.string().datetime().optional(),
});

const TaskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
```

## セキュリティ考慮事項

### データ保護
- 個人情報なし（認証実装時に拡張予定）
- SQLインジェクション対策（Prisma ORM使用）
- 入力値サニタイゼーション（Zod検証）

### アクセス制御
- 現段階では認証なし
- 将来的にユーザー別アクセス制御実装予定

## パフォーマンス設計

### クエリ最適化
- 主要なフィルタリング・ソートパターンにインデックス
- ページネーション対応（limit/offset）
- 最大取得件数制限（100件）

### スケーラビリティ
- 水平スケーリング考慮済み（UUID使用）
- 読み取り専用レプリカ対応可能
- キャッシュ戦略（Next.js revalidation）

## マイグレーション戦略

### 初期セットアップ
```bash
npx prisma migrate dev --name init_task_model
npx prisma generate
```

### バージョン管理
- スキーマ変更は必ずマイグレーションファイル生成
- 本番環境デプロイ前にマイグレーション検証
- ロールバック手順の文書化

## テスト考慮事項

### ユニットテスト
- フィールドバリデーション
- デフォルト値設定
- 制約違反エラー

### 統合テスト
- Prismaクライアント操作
- 複合クエリ性能
- トランザクション整合性

## 技術的負債・制限事項

### 現在の制限
- ユーザー認証未実装
- 論理削除未対応
- 添付ファイル未対応
- タスク階層構造未対応

### 将来的な拡張ポイント
- Userモデル追加
- TaskCategoryモデル追加
- TaskCommentモデル追加
- 添付ファイル対応