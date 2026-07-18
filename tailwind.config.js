/**
 * このファイルは何をするファイルか:
 * CSSフレームワーク「Tailwind CSS」の設定ファイルです。
 * アプリ独自の配色(テーマカラー)や、マスコットのアニメーションを、
 * `bg-primary` や `animate-mascot-idle` のようなクラス名として使えるように定義します。
 *
 * このファイルの中でやっていること:
 * - `content`: Tailwindがクラス名を探しにいく対象ファイルの範囲を指定する
 * - `colors`: アプリ全体で使う配色(primary/secondary/success/warning/danger等)を定義する
 * - `fontFamily`: 日本語向けのフォント指定
 * - `keyframes` / `animation`: マスコットの状態(idle/eating/thinking/success/error)ごとの
 *   CSSアニメーションを定義する(動きの内容とタイミングをここで指定している)
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      // アプリ全体のテーマカラー(仕様書の推奨カラーに準拠)
      colors: {
        primary: '#8B6F47',
        secondary: '#D9B892',
        surface: '#FFFFFF',
        background: '#FFF9F2',
        success: '#4F9D69',
        warning: '#E3A84B',
        danger: '#D95D5D',
        'text-base': '#2F2A25',
        muted: '#7A7168'
      },
      fontFamily: {
        sans: ['"Hiragino Maru Gothic ProN"', '"Yu Gothic"', 'sans-serif']
      },
      // マスコットの状態ごとのアニメーションの「動きそのもの」を定義する
      keyframes: {
        mascotIdle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' } // ゆっくり上下に動く
        },
        mascotEating: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.93)' } // もぐもぐ動く(伸縮)
        },
        mascotThinking: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' } // 薄く点滅して「考え中」を表現
        },
        mascotSuccess: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '30%': { transform: 'scale(1.15) rotate(-4deg)' },
          '60%': { transform: 'scale(1.1) rotate(4deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' } // 嬉しそうに揺れる
        },
        mascotError: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' } // 左右に小刻みに揺れる(困った表現)
        }
      },
      // 上で定義した動きを、「何秒かけて」「何回繰り返すか」と組み合わせてクラス名にする
      animation: {
        'mascot-idle': 'mascotIdle 2.4s ease-in-out infinite',
        'mascot-eating': 'mascotEating 0.5s ease-in-out infinite',
        'mascot-thinking': 'mascotThinking 1.2s ease-in-out infinite',
        'mascot-success': 'mascotSuccess 0.6s ease-in-out 1',
        'mascot-error': 'mascotError 0.4s ease-in-out 2'
      }
    }
  },
  plugins: []
}
