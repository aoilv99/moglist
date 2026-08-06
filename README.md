# MoguLis

課題登録の手間を極限まで減らす、学生向けデスクトップ常駐型課題管理アプリです。

学校のLMS・Teams・Classroom等の課題画面をスクリーンショットし、デスクトップに常駐するリス風キャラクター「もぐた」へ渡すと、OCR・AI解析によって課題名・科目名・提出期限などが自動抽出されます。内容を確認・修正して登録すると、課題一覧や外部カレンダーに反映されます。

このリポジトリは **フロントエンド（Electron + React）のみ**を実装しています。バックエンドAPIの仕様は [`BACKEND_HANDOFF.md`](./BACKEND_HANDOFF.md) を参照してください。

---

## 必要環境

- Node.js 20 以上（開発時は 22.x で確認）
- npm 10 以上
- Windows / macOS（Electron対応OS）

## セットアップ

```bash
npm install
cp .env.example .env
```

## 開発起動（Electron含む）

```bash
npm run dev
```

`electron-vite dev` により、レンダラーのHMR付きVite開発サーバーとElectronアプリが同時に起動します。デスクトップ右下付近に「もぐた」の透過ウィンドウが表示されます。

## Electron起動のみ確認したい場合

`npm run dev` がElectron起動を兼ねています。ビルド後のバイナリを起動して確認したい場合は下記の「ビルド」を参照してください。

## テスト

```bash
npm run test        # 一度だけ実行
npm run test:watch  # watchモード
```

現時点では純粋関数（日付計算・バリデーション・フォーム変換ロジック）に対するユニットテストのみです。UIコンポーネントの結合テストや、モックAPIの網羅的なテストは未実装です（「現在未実装の機能」参照）。

## 型チェック

```bash
npm run typecheck
```

## ビルド

```bash
npm run build
```

`electron-vite build` により `out/` 以下に main/preload/renderer をビルドします。**electron-builder等によるインストーラー生成（配布用パッケージング）は今回未設定です**。`npm run preview` で `out/` の内容をElectronで起動して確認できます。

## 環境変数

`.env`（`.env.example` を参照）:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_USE_MOCK_API=true
```

- `VITE_USE_MOCK_API=true` の場合、実際のHTTP通信を行わず `src/renderer/mocks/` のモックレスポンスを返します（デフォルト）。
- `VITE_API_BASE_URL` は実APIのベースURLです。

## モックAPIの使い方

`VITE_USE_MOCK_API=true` の状態で `npm run dev` すると、以下の8ケースを持つモック解析エンジンが動作します（`src/renderer/mocks/data/analyses.ts`）。

1. 正常に課題を検出
2. 日付が曖昧
3. 複数の締切候補がある
4. 課題名が検出できない
5. 重複課題候補がある
6. OCR失敗
7. カレンダー連携だけ失敗
8. API全体が失敗

どのケースを返すかは `src/renderer/stores/mockSettingsStore.ts`（Zustand）の `mockAnalysisCase` で切り替わります。現状は画面上の切り替えUIは未実装のため、開発中に確認したい場合はブラウザ/Electron DevToolsのコンソールから直接ストアを呼び出すか、コード上のデフォルト値（`success`）を一時的に書き換えて確認してください（今後の拡張候補）。

課題一覧はメモリ上の簡易データストア（`src/renderer/mocks/data/taskStore.ts`）で管理され、アプリ起動中の作成・更新・削除がその場で反映されます（再起動でリセットされます）。

## 実APIへの切り替え方法

1. バックエンドAPIを起動する（仕様は [`BACKEND_HANDOFF.md`](./BACKEND_HANDOFF.md)）。
2. `.env` を以下のように変更する。

   ```env
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   VITE_USE_MOCK_API=false
   ```

3. `npm run dev` を再起動する。
4. ダッシュボード右上の接続状態バッジが「APIに接続中」になることを確認する。

**差し替え箇所はこれだけです。** `src/renderer/services/api/` 配下（`client.ts` / `assignmentAnalysisApi.ts` / `taskApi.ts` / `healthApi.ts`）が `VITE_USE_MOCK_API` を見てモック/実APIを自動的に切り替えるため、画面側のコードは一切変更不要です。

## バックエンド接続方法

上記「実APIへの切り替え方法」を参照。必要なAPI仕様（型・エンドポイント・エラー形式）はすべて [`BACKEND_HANDOFF.md`](./BACKEND_HANDOFF.md) にまとめています。

## ディレクトリ構成

```text
mogulis/
├─ electron/
│  ├─ main/         # ウィンドウ管理・トレイ・IPC・スクリーンショット
│  └─ preload/       # contextBridgeでrendererへ公開するAPI
├─ src/
│  ├─ renderer/
│  │  ├─ index.html / mascot.html / overlay.html   # 3つのウィンドウのエントリ
│  │  ├─ app/         # メインウィンドウのReactルート・ルーティング
│  │  ├─ mascotApp/    # 常駐リスウィンドウのReactルート
│  │  ├─ overlayApp/   # スクショ範囲選択オーバーレイのReactルート
│  │  ├─ pages/        # 画面コンポーネント
│  │  ├─ components/   # app / mascot / task / analysis / feedback
│  │  ├─ features/     # 画面をまたぐドメインロジック（解析結果→フォーム変換等）
│  │  ├─ hooks/        # TanStack Query hooks
│  │  ├─ stores/       # Zustand stores
│  │  ├─ services/api/ # APIサービス層（モック/実APIの切り替え箇所）
│  │  ├─ mocks/         # モックAPIハンドラ・データ
│  │  ├─ schemas/       # Zodスキーマ
│  │  ├─ lib/           # 日付計算・バリデーション等の純粋関数
│  │  └─ assets/mascot/ # マスコット画像素材
│  └─ shared/
│     ├─ types/{api.ts, electron.ts}  # フロント/バック共有API型・Electron IPC型
│     └─ constants/
├─ resources/          # メインプロセスから直接参照する静的アセット（トレイアイコン等）
├─ BACKEND_HANDOFF.md
├─ README.md
├─ .env.example
└─ package.json
```

## 現在未実装の機能

- `/settings` 設定画面（Zustandの `appSettingsStore` に最小限の項目のみ用意）
- `/onboarding` 初回案内画面
- モックケース切り替えUI（現状はストアのデフォルト値を直接編集する必要あり）
- Vitest/Testing Libraryによる網羅的なテスト（現状は純粋関数の単体テストのみ）
- グローバルショートカット
- electron-builder等によるインストーラー生成・自動更新

いずれも既存のアーキテクチャ（サービス層・型定義・状態管理）を拡張する形で追加できるよう設計しています。

## `BACKEND_HANDOFF.md` の役割

バックエンド担当者が本リポジトリのUIやモック実装を読まなくても、必要なAPIエンドポイント・型・エラー形式・日時ルール等を把握して実装を始められるようにまとめた仕様書です。フロントエンドの型・APIサービス層・モックレスポンスと内容を一致させています。実装中に型やAPI仕様を変更した場合は、必ず `BACKEND_HANDOFF.md` も更新してください。
