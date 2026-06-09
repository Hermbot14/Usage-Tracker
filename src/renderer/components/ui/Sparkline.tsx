/**
 * Tiny inline SVG sparkline for a 0–100 series. Renders a smooth-ish polyline
 * with a soft area fill. Shows a flat baseline until enough samples accumulate.
 */
export function Sparkline({
  points,
  color,
  width = 120,
  height = 28,
}: {
  points: number[]
  color: string
  width?: number
  height?: number
}) {
  const pad = 2
  const w = width - pad * 2
  const h = height - pad * 2

  const series = points.length >= 2 ? points : [points[0] ?? 0, points[0] ?? 0]
  const n = series.length
  const max = 100
  const x = (i: number) => pad + (n === 1 ? w : (i / (n - 1)) * w)
  const y = (v: number) => pad + h - (Math.min(max, Math.max(0, v)) / max) * h

  const line = series.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  const area = `${line} L ${x(n - 1).toFixed(1)} ${(pad + h).toFixed(1)} L ${x(0).toFixed(1)} ${(pad + h).toFixed(1)} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-hidden="true">
      <path d={area} fill={color} opacity={0.12} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
