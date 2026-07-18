/**
 * このファイルは何をするファイルか:
 * モックAPIが使う、メモリ上だけに存在する簡易的な「課題データベース」です。
 * 本物のデータベースやファイルは使わず、アプリを起動している間だけ
 * 配列(tasks)にデータを保持します。アプリを再起動するとリセットされます。
 *
 * このファイルの中でやっていること:
 * - 初期データ(mocks/data/tasks.tsのINITIAL_MOCK_TASKS)をコピーして、
 *   書き換え可能な内部状態(tasks配列)として持つ
 * - `listTasks` / `findTask`: 一覧取得・ID指定での検索
 * - `insertTask`: 新しい課題を配列の先頭に追加する
 * - `updateTaskById`: 指定したIDの課題を部分的に更新し、更新日時も更新する
 * - `removeTask`: 指定したIDの課題を削除する
 * - `nextTaskId`: 新規課題に振る、連番のID文字列を生成する
 */

import type { Task } from '@shared/types/api'
import { INITIAL_MOCK_TASKS } from './tasks'

/** Tiny in-memory "database" backing the mock task API for the lifetime of the app session. */
// (日本語訳: モック課題APIを支える、アプリのセッション中だけ存在する超小型のインメモリDB)
// 元データを直接書き換えないよう、スプレッド構文で複製してから使う
let tasks: Task[] = INITIAL_MOCK_TASKS.map((task) => ({ ...task }))
// 新規作成時のID採番に使うカウンター(初期データの件数から始める)
let idCounter = tasks.length

/** 全課題を返す */
export function listTasks(): Task[] {
  return tasks
}

/** 指定したIDの課題を1件探す(見つからなければundefined) */
export function findTask(id: string): Task | undefined {
  return tasks.find((task) => task.id === id)
}

/** 新しい課題を配列の先頭に追加する(一覧で「新着順」に並べた時に見つけやすくするため) */
export function insertTask(task: Task): Task {
  tasks = [task, ...tasks]
  return task
}

/** 指定したIDの課題を部分的に更新する。見つからなければundefinedを返す */
export function updateTaskById(id: string, patch: Partial<Task>): Task | undefined {
  let updated: Task | undefined
  tasks = tasks.map((task) => {
    if (task.id !== id) return task
    // 渡された差分(patch)で上書きしつつ、idは変えず、updatedAtは現在時刻にする
    updated = { ...task, ...patch, id: task.id, updatedAt: new Date().toISOString() }
    return updated
  })
  return updated
}

/** 指定したIDの課題を削除する。実際に削除できたかどうかを真偽値で返す */
export function removeTask(id: string): boolean {
  const before = tasks.length
  tasks = tasks.filter((task) => task.id !== id)
  return tasks.length < before
}

/** 新規課題用の一意なIDを発行する */
export function nextTaskId(): string {
  idCounter += 1
  return `mock-task-${idCounter}`
}
