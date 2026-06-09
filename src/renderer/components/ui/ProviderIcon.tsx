import type { ProviderId } from '@/types'

/**
 * Provider mark — a brand-colored monogram chip. These are stylized marks (not
 * official logos) to stay clear of trademark issues; swap in real SVGs later if
 * desired by editing MARKS below.
 */
const MARKS: Record<string, { from: string; to: string; glyph: string }> = {
  anthropic: { from: '#E08A5B', to: '#C45D3A', glyph: 'C' },
  zai: { from: '#3B93FF', to: '#1E63D6', glyph: 'Z' },
  zhipu: { from: '#A06BFF', to: '#7C3AED', glyph: '智' },
  openai: { from: '#19C39C', to: '#0E8C6E', glyph: 'O' },
  deepseek: { from: '#5B7CFF', to: '#3A52E0', glyph: 'D' },
  kimi: { from: '#8B95A7', to: '#5B6577', glyph: 'K' },
  qwen: { from: '#C77DFF', to: '#9333EA', glyph: 'Q' },
  minimax: { from: '#FB7185', to: '#E11D48', glyph: 'M' },
  opencode: { from: '#FBBF24', to: '#D97706', glyph: '◇' },
  unknown: { from: '#9AA3AF', to: '#6B7280', glyph: '?' },
}

export function ProviderIcon({ provider, size = 36 }: { provider: ProviderId; size?: number }) {
  const m = MARKS[provider] ?? MARKS.unknown
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: Math.round(size * 0.28),
        background: `linear-gradient(135deg, ${m.from} 0%, ${m.to} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: Math.round(size * 0.46),
        lineHeight: 1,
        boxShadow: '0 1px 2px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.25)',
        userSelect: 'none',
      }}
    >
      {m.glyph}
    </div>
  )
}
