/**
 * このファイルは何をするファイルか:
 * マスコットの「状態(idle/eating等)」ごとに、どの画像を使うかを対応付ける表(マップ)です。
 * 将来、状態ごとの専用イラストが用意された時に、このファイルだけを書き換えれば
 * 他のファイルを一切変更せずに差し替えられるようにするためのものです。
 *
 * Maps each mascot state to its image source. Only `moguta_normal.png` exists
 * today — dedicated art per state is still being produced (see plan notes) —
 * so every state falls back to it, differentiated for now via CSS animation
 * classes in `MascotCharacter`. Swap individual entries here as new art
 * arrives; no other file needs to change.
 * (日本語訳: マスコットの各状態と画像ファイルを対応付ける。現時点では
 *  `moguta_normal.png` しか無いため、全ての状態がこの1枚を使い回している。
 *  状態の違いは今のところ`MascotCharacter`側のCSSアニメーションで表現している。
 *  今後専用イラストが届いたら、ここの対応表だけを書き換えれば良い)
 */

import moguraNormal from './moguta_normal.png'
import type { MascotState } from '@renderer/stores/mascotStore'

// マスコットの状態ごとの画像パス一覧
export const MASCOT_IMAGES: Record<MascotState, string> = {
  idle: moguraNormal,
  'drag-over': moguraNormal,
  eating: moguraNormal,
  thinking: moguraNormal,
  success: moguraNormal,
  error: moguraNormal
}
