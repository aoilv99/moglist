/**
 * このファイルは何をするファイルか:
 * マスコット(もぐた)ウィンドウの中身全体を組み立てる、一番中心となるコンポーネントです。
 * 「クリックでメニューを開く」「ドラッグでウィンドウを移動する」「スクショを撮る」
 * 「画像をドロップされたら解析へ回す」といった、マスコットのすべての振る舞いを
 * ここで実装しています。
 *
 * このファイルの中でやっていること:
 * - マウスのmousedown/mousemove/mouseupを自前で監視し、「クリック(その場でほぼ動かない)」
 *   と「ドラッグ(ウィンドウ移動)」を区別する
 * - クリックと判定したらメニューの開閉を切り替える
 * - ドラッグと判定したらメインプロセスへ新しい座標を伝えてウィンドウを動かす
 * - メニューの「スクショ」ボタン→範囲選択キャプチャ→メインウィンドウへ画像を渡す
 * - メニューの「タスク確認」ボタン→メインウィンドウを開いて課題一覧へ移動させる
 * - ファイルがドロップされた時のバリデーションと、メインウィンドウへの受け渡し
 * - 状態(idle/eating/thinking/success/error)に応じてキャラクターの見た目を変える
 * - 吹き出し(SpeechBubble)で一言メッセージを一定時間だけ表示する
 */

import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { MASCOT_CHARACTER_SIZE } from '@shared/constants'
import { DropZone } from '@renderer/components/mascot/DropZone'
import { MascotCharacter } from '@renderer/components/mascot/MascotCharacter'
import { MascotMenu } from '@renderer/components/mascot/MascotMenu'
import { SpeechBubble } from '@renderer/components/mascot/SpeechBubble'
import { validateImageFile } from '@renderer/lib/imageValidation'
import { useMascotStore } from '@renderer/stores/mascotStore'

// マウスがこのピクセル数より多く動いたら「ドラッグ」、動かなければ「クリック」とみなす
const CLICK_DRAG_THRESHOLD_PX = 4

// ドラッグ開始時点の、マウス座標とウィンドウ座標を記録しておくための型
interface DragOrigin {
  mouseX: number
  mouseY: number
  winX: number
  winY: number
}

/** 指定した状態(success/error)へ一瞬変化させたあと、自動でidleへ戻すヘルパー関数 */
function flashState(setState: (state: 'success' | 'error') => void, resetToIdle: () => void, kind: 'success' | 'error'): void {
  setState(kind)
  setTimeout(resetToIdle, kind === 'success' ? 900 : 1200)
}

export function MascotApp(): JSX.Element {
  // マスコットの状態(idle等)とメニュー開閉状態はZustandストアで管理する
  const { state, menuOpen, setState, setMenuOpen, toggleMenu } = useMascotStore()
  // 吹き出しに表示するメッセージ(nullなら非表示)
  const [bubble, setBubble] = useState<string | null>(null)
  // ドラッグ開始位置(ドラッグ中でなければnull)
  const dragOrigin = useRef<DragOrigin | null>(null)
  // 現在ドラッグ中かどうかのフラグ
  const isWindowDragging = useRef(false)
  // Cached locally (and kept in sync on every move) so mousedown can attach
  // its mousemove/mouseup listeners synchronously — awaiting an IPC round
  // trip first risks missing a fast click's mouseup entirely.
  // (日本語訳: マウスダウン時に非同期でウィンドウ位置を取得すると、IPCの往復に
  //  かかる時間の間にmouseupが先に発生してしまい、リスナーが間に合わず
  //  クリックを取りこぼす可能性がある。それを避けるため、ウィンドウの現在位置を
  //  ローカルにキャッシュしておき、移動のたびに最新化しておく)
  const lastKnownPosition = useRef({ x: 0, y: 0 })

  const resetToIdle = useCallback(() => setState('idle'), [setState])

  // マウント時に一度、メインプロセスから現在のウィンドウ位置を取得してキャッシュしておく
  useEffect(() => {
    window.mogulis.getMascotPosition().then((position) => {
      lastKnownPosition.current = position
    })
  }, [])

  // 吹き出しにメッセージを表示し、一定時間後に自動で消す
  const showBubble = useCallback((message: string, durationMs = 2200) => {
    setBubble(message)
    setTimeout(() => setBubble((current) => (current === message ? null : current)), durationMs)
  }, [])

  // Closing the menu on window blur approximates "click outside to close" —
  // the mascot window is tiny and borderless, so clicks outside it never
  // reach this renderer directly.
  // (日本語訳: ウィンドウが「blur(フォーカスを失う)」した時にメニューを閉じることで、
  //  「メニューの外側をクリックしたら閉じる」という挙動を疑似的に実現している。
  //  マスコットウィンドウは小さく枠が無いため、ウィンドウの外側をクリックした場合、
  //  そのクリックイベント自体はこのレンダラーには届かないための工夫)
  useEffect(() => {
    const handleBlur = (): void => setMenuOpen(false)
    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [setMenuOpen])

  // マウスが動いた時の処理。ドラッグ開始からの移動量を見て、
  // 「クリックの範囲を超えて動いた」ならドラッグとみなし、ウィンドウを追従して動かす
  const handleWindowMouseMove = useCallback((event: MouseEvent) => {
    if (!dragOrigin.current) return
    const dx = event.screenX - dragOrigin.current.mouseX
    const dy = event.screenY - dragOrigin.current.mouseY
    if (Math.abs(dx) > CLICK_DRAG_THRESHOLD_PX || Math.abs(dy) > CLICK_DRAG_THRESHOLD_PX) {
      isWindowDragging.current = true
    }
    if (isWindowDragging.current) {
      const nextPosition = { x: dragOrigin.current.winX + dx, y: dragOrigin.current.winY + dy }
      // 次回のドラッグ開始に備えて、最新位置をキャッシュしておく
      lastKnownPosition.current = nextPosition
      void window.mogulis.moveMascotWindow(nextPosition)
    }
  }, [])

  // マウスボタンを離した時の処理。ドラッグしていなければ「クリックされた」と判断し、
  // メニューの開閉を切り替える。ドラッグしていた場合はメニューは開閉しない。
  const handleWindowMouseUp = useCallback(() => {
    window.removeEventListener('mousemove', handleWindowMouseMove)
    window.removeEventListener('mouseup', handleWindowMouseUp)
    const wasDragging = isWindowDragging.current
    dragOrigin.current = null
    isWindowDragging.current = false
    if (!wasDragging) {
      toggleMenu()
    }
  }, [handleWindowMouseMove, toggleMenu])

  // キャラクターの上でマウスボタンを押した時の処理。
  // ドラッグ開始位置を記録し、以降のmousemove/mouseupをwindow全体で監視し始める。
  const handleCharacterMouseDown = useCallback(
    (event: ReactMouseEvent) => {
      if (event.button !== 0) return // 左クリック以外は無視する
      dragOrigin.current = {
        mouseX: event.screenX,
        mouseY: event.screenY,
        winX: lastKnownPosition.current.x,
        winY: lastKnownPosition.current.y
      }
      isWindowDragging.current = false
      window.addEventListener('mousemove', handleWindowMouseMove)
      window.addEventListener('mouseup', handleWindowMouseUp)
    },
    [handleWindowMouseMove, handleWindowMouseUp]
  )

  // 画像がドラッグされて「キャラクターの上に重なっている状態」かどうかで見た目を切り替える。
  // ただし解析処理中(thinking/eating)の場合は状態を上書きしないようにする。
  const handleDragStateChange = useCallback(
    (isDragging: boolean) => {
      if (state === 'thinking' || state === 'eating') return
      setState(isDragging ? 'drag-over' : 'idle')
    },
    [setState, state]
  )

  // 画像ファイルがドロップされた時の処理
  const handleDropFile = useCallback(
    async (file: File) => {
      setMenuOpen(false)
      // ファイル形式・サイズをチェックし、問題があればエラー表示して終了する
      const validation = validateImageFile(file)
      if (!validation.ok) {
        showBubble(validation.message ?? '対応していないファイルだよ');
        flashState(setState, resetToIdle, 'error')
        return
      }

      // 「もぐもぐ食べている」状態の見た目にする
      setState('eating')
      try {
        // ファイルをバイト列に変換し、IPC経由でメインプロセスへ送る
        // (メインプロセス側で一時ファイルとして保存し、メインウィンドウへ引き渡される)
        const buffer = await file.arrayBuffer()
        await window.mogulis.openMainWindowWithImageData({
          name: file.name,
          type: file.type,
          data: buffer
        })
        showBubble('もぐもぐ…解析するね！')
        flashState(setState, resetToIdle, 'success')
      } catch {
        showBubble('うまく渡せなかった…もう一度試してね')
        flashState(setState, resetToIdle, 'error')
      }
    },
    [resetToIdle, setState, setMenuOpen, showBubble]
  )

  // メニューの「スクショ」ボタンを押した時の処理
  const handleScreenshot = useCallback(async () => {
    setMenuOpen(false)
    // 「考え中」の見た目にする(範囲選択オーバーレイが開く準備の間)
    setState('thinking')
    try {
      // 画面の範囲選択スクリーンショットを実行する。キャンセルされたらnullが返る。
      const result = await window.mogulis.captureScreenRegion()
      if (!result) {
        setState('idle')
        return
      }
      // 撮影できた画像をメインウィンドウへ渡す
      await window.mogulis.openMainWindowWithCapturedImage(result)
      showBubble('スクショ撮れた！解析するね')
      flashState(setState, resetToIdle, 'success')
    } catch {
      showBubble('スクショに失敗しちゃった…')
      flashState(setState, resetToIdle, 'error')
    }
  }, [resetToIdle, setState, setMenuOpen, showBubble])

  // メニューの「タスク確認」ボタンを押した時の処理。メインウィンドウを開いて課題一覧へ移動する
  const handleCheckTasks = useCallback(async () => {
    setMenuOpen(false)
    await window.mogulis.openMainWindowAtRoute('/tasks')
  }, [setMenuOpen])

  return (
    <div className="relative h-full w-full">
      {/*
        Fixed-size anchor pinned to the bottom-right of the (taller) mascot
        window. The popup menu and speech bubble are positioned relative to
        THIS box (not the full window), so "appear above the character"
        lands within the window's extra headroom instead of being clipped
        by the window's own top edge.
        (日本語訳: マスコットウィンドウ(縦長)の右下に固定された、キャラクター本体サイズの
         枠。ポップアップメニューと吹き出しは「ウィンドウ全体」ではなく「この枠」を
         基準に配置される。これにより、「キャラクターの上に表示する」際に
         ウィンドウの上端で見切れず、確保しておいた余白の中に収まる)
      */}
      <div
        className="absolute bottom-2 right-2"
        style={{ width: MASCOT_CHARACTER_SIZE.width, height: MASCOT_CHARACTER_SIZE.height }}
      >
        <div className="relative h-full w-full">
          {bubble && <SpeechBubble message={bubble} />}
          {menuOpen && <MascotMenu onScreenshot={handleScreenshot} onCheckTasks={handleCheckTasks} />}
          <DropZone onDragStateChange={handleDragStateChange} onDropFile={handleDropFile}>
            <MascotCharacter state={state} onMouseDown={handleCharacterMouseDown} />
          </DropZone>
        </div>
      </div>
    </div>
  )
}
