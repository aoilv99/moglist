# BACKEND_HANDOFF

MoguLis のフロントエンド実装が完了した部分（コア機能）をもとに、バックエンド担当者が実装すべき内容をまとめたドキュメントです。ここに記載した型・エンドポイント・レスポンス形式は、実際のフロントエンドコード（`src/shared/types/api.ts`・`src/renderer/services/api/`・`src/renderer/mocks/`）と一致させています。フロントエンドはこの内容をそのまま `VITE_USE_MOCK_API=false` で実APIに向けて動作します。

---

## 1. アプリの概要

MoguLis は、学生向けデスクトップ常駐型の課題管理アプリです。ユーザーは学校のLMS等の課題画面をスクリーンショットし、デスクトップに常駐する「もぐた」（リス風キャラクター）へドラッグ＆ドロップ、またはクリックメニューからのスクリーンショット機能で読み込ませます。画像はバックエンドへ送信され、OCR・AI解析によって課題名・科目名・提出期限などが抽出されます。フロントエンドは解析結果を提示し、ユーザーが確認・修正のうえ承認すると、バックエンド経由で課題として登録され、可能であれば外部カレンダーにも連携されます。

今回のフロントエンド実装は「コア機能優先」の方針で進めており、`/settings`（設定画面）・`/onboarding`（初回案内）・フルテストスイートは未実装です（詳細はREADMEの「現在未実装の機能」を参照）。

---

## 2. ユーザー操作から保存までの処理フロー

1. ユーザーが常駐リス「もぐた」をクリック → ポップアップメニュー（「スクショ」「タスク確認」）が表示される。
2. 「スクショ」を選択 → 画面の範囲選択キャプチャ（フロントエンドのElectron機能、バックエンド関与なし）→ 画像が取得される。
   - または、課題画面のスクリーンショット画像ファイルを「もぐた」へドラッグ＆ドロップしても同じフローに合流する。
3. フロントエンドが `POST /assignment-analyses` で画像をバックエンドへ送信する。
4. バックエンドがOCR・AI解析を行い、課題名・科目名・提出期限・提出方法・説明・抽出精度・曖昧な項目・重複候補を含む解析結果を返す。
5. フロントエンドが解析結果確認画面（`/review/:analysisId`）を表示し、ユーザーが内容を確認・修正する。
6. ユーザーが「登録する」または「修正して登録」を押すと、フロントエンドが `POST /tasks` で確定内容を送信する。
7. バックエンドは課題を保存し、可能であれば外部カレンダーへの登録も行い、その結果（`calendarSync`）を含めて課題データを返す。
8. フロントエンドは登録完了画面を表示し、その後「課題一覧」（`GET /tasks`）や「課題詳細」（`GET /tasks/:taskId`）で内容を確認できる。

---

## 3. フロントエンドとバックエンドの責務分担

| 領域 | フロントエンド | バックエンド |
|---|---|---|
| 画面キャプチャ・ファイル選択 | ○（Electron機能） | - |
| 画像アップロード | ○（multipart送信） | ○（受信・保存） |
| OCR・AI解析 | - | ○ |
| 曖昧判定・重複検出 | 結果の表示・編集UI | ○（判定ロジック） |
| バリデーション | ○（Zodによる入力チェック） | ○（サーバー側の最終防衛線として必須） |
| 課題の永続化 | - | ○ |
| カレンダー連携 | 連携結果の表示 | ○（連携処理・エラーハンドリング） |
| 認証 | 今回は未実装（13章参照） | 今回は未実装 |

---

## 4〜7. APIエンドポイント一覧・HTTPメソッド・リクエスト/レスポンス形式

ベースURLは `VITE_API_BASE_URL`（例: `http://localhost:3000/api/v1`）。全レスポンスはJSON。画像アップロードのみ `multipart/form-data`。

### 課題画像を解析する

POST /assignment-analyses

### Request

`multipart/form-data`、フィールド名 `image` に画像ファイル1点。

```
Content-Type: multipart/form-data
image: (binary)
```

### Response

`200 OK`

```ts
interface AssignmentAnalysis {
  id: string
  status: 'completed' | 'failed' | 'processing'
  sourceImageUrl: string // アップロードされた画像の参照URL（保存後のURL）
  createdAt: string // ISO 8601
  result: AssignmentAnalysisResult | null // status !== 'completed' の場合は null
  error: ApiErrorInfo | null // status === 'failed' の場合のみ値が入る
}

interface AssignmentAnalysisResult {
  title: string | null
  subject: string | null
  deadline: string | null // ISO 8601、最も確からしい締切
  deadlineCandidates: { deadline: string; confidence: 'high' | 'medium' | 'low' }[]
  submissionMethod: string | null
  description: string | null
  overallConfidence: 'high' | 'medium' | 'low'
  fieldConfidence: {
    title: 'high' | 'medium' | 'low'
    subject: 'high' | 'medium' | 'low'
    deadline: 'high' | 'medium' | 'low'
    submissionMethod: 'high' | 'medium' | 'low'
    description: 'high' | 'medium' | 'low'
  }
  ambiguousFields: {
    field: 'title' | 'subject' | 'deadline' | 'submissionMethod' | 'description'
    reason: string
    candidates?: string[]
  }[]
  duplicateCandidates: {
    taskId: string
    title: string
    subject: string | null
    deadline: string | null
    similarity: number // 0.0〜1.0
  }[]
}
```

`status: 'failed'` の場合、`result` は `null`、`error` に失敗理由（12章参照、主に `OCR_FAILED` / `AI_ANALYSIS_FAILED`）を入れて返す。フロントエンドはこのレスポンスをそのまま解析失敗画面として表示する（HTTPステータス自体は `200` のままでよい。ネットワーク層のエラーとは区別している）。

### Error

`4xx`/`5xx` の場合は16章の共通エラー形式。想定コード: `UNSUPPORTED_FILE_TYPE`, `FILE_TOO_LARGE`, `VALIDATION_ERROR`, `SERVER_UNAVAILABLE`。

---

### 解析をやり直す

POST /assignment-analyses/:analysisId/retry

### Request

パスパラメータのみ（ボディなし）。元画像はサーバー側で保持している前提。

### Response

`200 OK`、`AssignmentAnalysis`（上と同じ形式、同じ `id` を返す）。

### Error

`404 Not Found`（`analysisId` が存在しない）、その他は共通エラー形式。

---

### 課題を登録する

POST /tasks

### Request

```ts
interface CreateTaskInput {
  title: string // 必須, 1〜100文字
  subject?: string // 0〜50文字
  deadline: string // 必須, ISO 8601
  submissionMethod?: string // 0〜200文字
  description?: string // 0〜2000文字
  sourceImageUrl?: string // 解析元画像のURL（analysisIdがある場合はそこから引き継ぐ）
  analysisId?: string // どの解析結果から登録したか（トレーサビリティ用）
}
```

### Response

`201 Created`

```ts
interface Task {
  id: string
  title: string
  subject: string | null
  deadline: string // ISO 8601
  submissionMethod: string | null
  description: string | null
  status: 'incomplete' | 'completed'
  sourceImageUrl: string | null
  analysisId: string | null
  confidence: 'high' | 'medium' | 'low' | null // 手動登録時は null
  calendarSync: CalendarSyncResult | null
  createdAt: string
  updatedAt: string
}

interface CalendarSyncResult {
  status: 'not_synced' | 'synced' | 'failed'
  provider?: string
  eventUrl?: string | null
  syncedAt?: string | null
  error?: ApiErrorInfo | null
}
```

**重要**: カレンダー連携（`calendarSync`）が失敗しても、課題自体の登録は成功（`201`）として扱うこと。`calendarSync.status = 'failed'` とその `error` で失敗を表現する（10章・15章参照）。

### Error

`422 Unprocessable Entity`（`VALIDATION_ERROR`）、`500`（`TASK_CREATE_FAILED` / `SERVER_UNAVAILABLE`）。

---

### 課題一覧を取得する

GET /tasks

### Request

クエリパラメータ（すべて任意）:

```ts
interface TaskListQuery {
  filter?: 'all' | 'incomplete' | 'completed' | 'overdue' | 'today' | 'thisWeek'
  sort?: 'deadlineAsc' | 'createdAtDesc' | 'subject'
  search?: string // title/subject/description を対象に部分一致検索
  page?: number // 1始まり
  pageSize?: number
}
```

`overdue` は「`status === 'incomplete'` かつ `deadline` が現在時刻より過去」、`today`/`thisWeek` は `deadline` の日付判定（タイムゾーンは11章参照）。

### Response

`200 OK`

```ts
interface TaskListResponse {
  tasks: Task[]
  total: number
  page: number
  pageSize: number
}
```

### Error

共通エラー形式のみ（クエリが不正な場合は `VALIDATION_ERROR`）。

---

### 課題詳細を取得する

GET /tasks/:taskId

### Request

パスパラメータのみ。

### Response

`200 OK`、`Task`（上記と同形式）。

### Error

`404 Not Found`（`NOT_FOUND`）。

---

### 課題を更新する

PATCH /tasks/:taskId

### Request

```ts
type UpdateTaskInput = Partial<CreateTaskInput>
```

送信されたフィールドのみ更新する部分更新。

### Response

`200 OK`、更新後の `Task`。

### Error

`404 Not Found`、`422 Unprocessable Entity`（`VALIDATION_ERROR`）。

---

### 課題を削除する

DELETE /tasks/:taskId

### Request

パスパラメータのみ。

### Response

`204 No Content`。

### Error

`404 Not Found`。

---

### 課題の完了状態を切り替える

PATCH /tasks/:taskId/status

### Request

```ts
{ "status": "incomplete" | "completed" }
```

### Response

`200 OK`、更新後の `Task`。

### Error

`404 Not Found`、`422 Unprocessable Entity`。

---

### ヘルスチェック

GET /health

### Request

なし。

### Response

`200 OK`

```ts
interface ApiHealth {
  status: 'ok' | 'degraded' | 'down'
  version: string
  mode: 'mock' | 'live'
  checkedAt: string // ISO 8601
}
```

フロントエンドはダッシュボードとトップバーでこれをポーリング表示する（60秒間隔）。

### Error

到達不能時はフロントエンド側でネットワークエラーとして扱う。

---

## 8. TypeScript型定義

上記すべての型は `src/shared/types/api.ts` に実装済みです。バックエンド実装時はこのファイルを正としてください（型を複製する場合は内容を一致させてください）。

---

## 9. 画像アップロード仕様

- フィールド名: `image`
- Content-Type: `multipart/form-data`
- フロントエンド側でも事前バリデーション済みだが、**サーバー側でも必ず再検証すること**（クライアント側チェックはバイパス可能なため）。

## 10. 対応画像形式と最大容量

- 対応形式: `image/png`, `image/jpeg`, `image/webp`（拡張子: `.png` `.jpg` `.jpeg` `.webp`）
- 最大サイズ: 10MB
- 超過・非対応形式の場合は `400`、コード `UNSUPPORTED_FILE_TYPE` / `FILE_TOO_LARGE` を返すこと。

## 11. 日時とタイムゾーンのルール

- すべての日時は **ISO 8601（タイムゾーンオフセット付き、例: `2026-07-25T18:00:00+09:00`、またはUTCの `Z` 付き）** で送受信する。フロントエンドは受け取った文字列を `Date` にそのままパースして扱うため、オフセットなしの文字列（ローカル時刻扱いになり環境依存になる）は避けること。
- 締切に時刻情報が無い（OCRが時刻を検出できなかった）場合、フロントエンドは「時刻がちょうど `00:00`」を「時刻未検出」の合図として扱い、UI上は `23:59` をデフォルト表示する。バックエンド側でも同じ規約（時刻不明時は `00:00` を入れる）に合わせるか、`ambiguousFields` に `deadline` の曖昧理由を含めて明示してください。
- 「今日」「今週」の判定はサーバーのタイムゾーンではなく、**リクエストされた時点のクライアントのローカル日付**を基準にする想定です（フロントエンド側のフィルタ実装は月曜始まりの週区切り）。サーバー側でも同じフィルタを実装する場合は週の起点をご確認ください。

## 12. OCR・AI解析結果に必要な項目

`AssignmentAnalysisResult` の全フィールド（7章参照）に加え、各フィールドの `fieldConfidence`（高・中・低）を必ず含めてください。フロントエンドは精度が低い項目をハイライト表示します。

## 13. 曖昧な日付や複数候補の返し方

`ambiguousFields` に `field: 'deadline'` のエントリを追加し、`reason` に理由（例:「来週」としか書かれていない等）、`candidates` に候補のISO日時文字列配列を入れてください。`deadlineCandidates` にも同じ候補を confidence 付きで入れることで、フロントエンドの候補選択チップに反映されます。

## 14. 重複課題候補の返し方

`duplicateCandidates` に、既存の類似課題を `similarity`（0.0〜1.0）とともに列挙してください。フロントエンドは類似度をパーセント表示し、警告として提示しますが、登録の可否はブロックしません（ユーザー判断に委ねる）。

## 15. カレンダー連携結果の返し方

`Task.calendarSync` に以下を入れてください。

```ts
{
  status: 'not_synced' | 'synced' | 'failed',
  provider?: string,       // 例: "Google Calendar"
  eventUrl?: string | null,
  syncedAt?: string | null,
  error?: ApiErrorInfo | null // status === 'failed' の場合
}
```

繰り返しになりますが、**カレンダー連携の失敗は課題登録全体の失敗として扱わないでください**（`POST /tasks` は `201` を返し、`calendarSync.status = 'failed'` のみで表現する）。

## 16. エラーレスポンスの共通形式

```ts
interface ApiErrorResponse {
  error: {
    code: ApiErrorCode
    message: string // ユーザー向け日本語メッセージ（フロントエンドがそのまま表示できるもの）
    details?: Record<string, unknown>
  }
}
```

## 17. 必要なエラーコード

`src/shared/types/api.ts` の `ApiErrorCode` と一致させてください。

```ts
type ApiErrorCode =
  | 'NETWORK_ERROR'        // フロントエンド側で通信不能時に付与（サーバーが返す想定はなし）
  | 'SERVER_UNAVAILABLE'   // 5xx全般
  | 'UNSUPPORTED_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'OCR_FAILED'
  | 'DEADLINE_NOT_DETECTED'
  | 'AI_ANALYSIS_FAILED'
  | 'TASK_CREATE_FAILED'
  | 'CALENDAR_SYNC_FAILED'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'         // 19章の認証実装時に使用
  | 'UNKNOWN_ERROR'
```

## 18. HTTPステータスコード

| ステータス | 用途 |
|---|---|
| 200 | 取得・更新・解析成功 |
| 201 | 課題作成成功 |
| 204 | 課題削除成功 |
| 400 | 不正なリクエスト（ファイル形式・サイズ等） |
| 401 | 未認証（19章、今回は未使用） |
| 404 | 対象が存在しない |
| 422 | バリデーションエラー |
| 500 | サーバー内部エラー |

## 19. 認証を追加する場合の想定

現時点で認証は未実装です。将来追加する場合は、フロントエンドの `src/renderer/services/api/client.ts`（axiosインスタンス）に認証ヘッダーを注入する箇所を1つ追加するだけで済むように設計しています。`401` を受け取った場合は `UNAUTHORIZED` エラーコードとして扱う想定を型に含めています。トークンの保存先（Electronの `safeStorage` 等）は今後要検討です。

## 20. CORSで考慮する内容

開発時、Electronのrendererは `http://localhost:5173`（Viteデフォルト）相当のオリジンから `VITE_API_BASE_URL`（例: `http://localhost:3000`）へリクエストします。開発用サーバーでは該当オリジンからのCORSを許可してください。将来的にはElectron内から直接叩くため、本番ビルドでは `file://` オリジンからのリクエストになる点にもご注意ください（`Access-Control-Allow-Origin: *` または動的許可を推奨）。

## 21. モックAPIと実APIの対応表

| フロントエンド関数 | HTTPメソッド/パス | モック実装ファイル |
|---|---|---|
| `analyzeAssignmentImage` | `POST /assignment-analyses` | `src/renderer/mocks/handlers/assignmentAnalysisHandlers.ts` |
| `retryAnalysis` | `POST /assignment-analyses/:id/retry` | 同上 |
| `createTask` | `POST /tasks` | `src/renderer/mocks/handlers/taskHandlers.ts` |
| `getTasks` | `GET /tasks` | 同上 |
| `getTask` | `GET /tasks/:taskId` | 同上 |
| `updateTask` | `PATCH /tasks/:taskId` | 同上 |
| `deleteTask` | `DELETE /tasks/:taskId` | 同上 |
| `updateTaskStatus` | `PATCH /tasks/:taskId/status` | 同上 |
| `getHealth` | `GET /health` | `src/renderer/mocks/handlers/healthHandlers.ts` |

`src/renderer/mocks/data/analyses.ts` に、12章相当の8ケース分のモック解析結果を実装済みです（`success` / `ambiguous_date` / `multiple_deadline_candidates` / `title_not_detected` / `duplicate_candidates` / `ocr_failed` / `calendar_sync_failed` / `api_failure`）。バックエンドの解析ロジックのテストケース設計の参考にしてください。

## 22. 接続確認チェックリスト

実APIへ切り替える際（README参照）:

- [ ] `.env` の `VITE_USE_MOCK_API` を `false` にする
- [ ] `VITE_API_BASE_URL` を実際のAPIサーバーのURLに設定する
- [ ] `GET /health` が `200` で `{ status: 'ok', mode: 'live', ... }` を返すことを確認する（ダッシュボード/トップバーの接続状態表示で確認可能）
- [ ] `POST /assignment-analyses` に実画像を送り、`AssignmentAnalysisResult` の全フィールドが型どおり返ることを確認する
- [ ] `POST /tasks` で課題登録後、`GET /tasks` に反映されることを確認する
- [ ] カレンダー連携を意図的に失敗させ、`calendarSync.status === 'failed'` でも `201` が返ることを確認する
- [ ] 各種エラーケース（非対応ファイル、10MB超、404など）で `ApiErrorResponse` 形式が返ることを確認する

## 23. 未確定事項

- **解析結果の再取得API（`GET /assignment-analyses/:id`）が未定義**: 元の要件定義（9章のAPIクライアント一覧）には解析結果を再取得するAPIが含まれていません。そのためフロントエンドは解析結果をクライアント状態（Zustand、`src/renderer/stores/analysisStore.ts`）にのみ保持しており、ウィンドウ再読み込みなどで消失します。ページリロード後も解析結果確認画面を復元したい場合は `GET /assignment-analyses/:id` の追加をご検討ください。
- **「今週」フィルタの週起点**: フロントエンドは月曜始まりで実装しています。バックエンド側でも同フィルタを実装する場合は起点を揃える必要があります。
- **重複判定・曖昧判定のアルゴリズム**: 類似度算出やOCR曖昧判定の具体的なロジックはバックエンド側の設計に委ねています。
- **ページネーションの利用有無**: `TaskListQuery.page`/`pageSize` を型として用意していますが、現在のフロントエンドUIはページング操作（次へ/前へ等）を実装していません（一覧は1ページ分をまとめて表示）。将来的にページネーションUIを追加する可能性があります。
- **認証方式**: 19章の通り未確定です。
- **画像の保存場所・URL形式**: `sourceImageUrl` がバックエンドの永続ストレージURLになるのか、署名付きURLになるのか等は未確定です。フロントエンドは文字列URLとしてそのまま `<img src>` に渡す実装のため、直接ブラウザから参照可能なURLを想定しています。

## 24. バックエンド担当者へ最初に確認すべき項目

1. `VITE_API_BASE_URL` の実際の値（開発環境・本番環境）
2. OCR・AI解析のレスポンス時間の目安（フロントエンドはローディング表示のみでタイムアウトは未設定）
3. 上記「23. 未確定事項」の解析結果再取得APIを追加するかどうか
4. 画像ストレージのURL形式（署名付きURLの有効期限など）
5. カレンダー連携先（Google Calendar等）の認証方式・スコープ
6. CORS設定の対象オリジン（開発時のVite dev server / 本番の `file://`）
