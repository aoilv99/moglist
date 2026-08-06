/**
 * このファイルは何をするファイルか:
 * マスコットの頭上に一時的に表示する「吹き出し」の見た目を作るコンポーネントです。
 * 「もぐもぐ…解析するね！」のような一言メッセージを表示するために使われます。
 *
 * このファイルの中でやっていること:
 * - 受け取ったメッセージ文字列を、吹き出し風の丸い枠に表示する
 * - 吹き出しの下側に、三角形のような「しっぽ」部分をCSSの回転四角形で表現する
 */

interface SpeechBubbleProps {
  message: string
}

export function SpeechBubble({ message }: SpeechBubbleProps): JSX.Element {
  return (
    <div className="absolute -top-2 left-1/2 w-max max-w-[160px] -translate-x-1/2 -translate-y-full rounded-2xl bg-surface px-3 py-1.5 text-center text-xs leading-snug text-text-base shadow-lg">
      {message}
      {/* 吹き出しの「しっぽ」。正方形を45度回転させて三角形風に見せている */}
      <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-surface" />
    </div>
  )
}
