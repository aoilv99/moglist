/**
 * このファイルは何をするファイルか:
 * 課題登録・編集フォーム(解析結果確認画面・課題詳細の編集画面)で共通して使う、
 * Zodによる入力バリデーションのスキーマ(検証ルール)を定義するファイルです。
 *
 * このファイルの中でやっていること:
 * - `taskFormSchema`: 課題名(必須・1〜100文字)、科目名(0〜50文字)、締切日・時刻(必須)、
 *   提出方法(0〜200文字)、説明(0〜2000文字)のバリデーションルールを定義する
 * - `TaskFormValues`: 上記スキーマから自動的に導き出される、フォームの値の型
 * - `emptyTaskFormValues`: フォームを空の状態から始める時に使う初期値
 *   (締切時刻はデフォルトで23:59にしておく)
 */

import { z } from 'zod'

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '課題名を入力してください')
    .max(100, '課題名は100文字以内で入力してください'),
  subject: z
    .string()
    .trim()
    .max(50, '科目名は50文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  deadlineDate: z.string().min(1, '締切日を入力してください'),
  deadlineTime: z.string().min(1, '締切時刻を入力してください'),
  submissionMethod: z
    .string()
    .trim()
    .max(200, '提出方法は200文字以内で入力してください')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .trim()
    .max(2000, '説明は2000文字以内で入力してください')
    .optional()
    .or(z.literal(''))
})

// スキーマの定義から、TypeScriptの型を自動的に生成する(二重管理を避けるため)
export type TaskFormValues = z.infer<typeof taskFormSchema>

// フォームを空の状態で表示する時の初期値
export const emptyTaskFormValues: TaskFormValues = {
  title: '',
  subject: '',
  deadlineDate: '',
  deadlineTime: '23:59',
  submissionMethod: '',
  description: ''
}
