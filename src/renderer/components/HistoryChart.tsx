import { useUsageStore } from '@stores/useUsageStore'
import { format } from 'date-fns'
import { Card } from './ui/Card'
import { getGradientClass } from '@lib/utils'
import { useState } from 'react'

type TimeRange = 7 | 15 | 30 | 'total'

function formatUsage(tokens: number): string {
  const millions = tokens / 1_000_000
  if (millions >= 1) {
    return `${millions.toFixed(2)}M`
  }
  const thousands = tokens / 1_000
  return `${thousands.toFixed(0)}K`
}

export function HistoryChart() {
  const { history } = useUsageStore()
  const [selectedRange, setSelectedRange] = useState<TimeRange>(7)

  if (history.length === 0) {
    return (
      <Card>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          margin: '0 0 16px'
        }}>
          Usage History
        </h3>
        <p style={{
          color: 'var(--color-text-tertiary)',
          fontSize: '14px',
          margin: 0
        }}>
          No history data available yet.
        </p>
      </Card>
    )
  }

  // Filter history based on selected range
  const filteredHistory = selectedRange === 'total'
    ? history
    : history.slice(-selectedRange)

  const maxUsage = Math.max(...filteredHistory.map((h) => h.sessionUsage))
  const avgUsage = filteredHistory.reduce((sum, h) => sum + h.sessionUsage, 0) / filteredHistory.length

  const ranges: { value: TimeRange; label: string }[] = [
    { value: 7, label: '7D' },
    { value: 15, label: '15D' },
    { value: 30, label: '30D' },
    { value: 'total', label: 'All' },
  ]

  return (
    <Card>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          margin: 0
        }}>
          Usage History
        </h3>
        {/* Range Selector */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'var(--color-background-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '2px'
        }}>
          {ranges.map((range) => (
            <button
              type="button"
              key={range.label}
              onClick={() => setSelectedRange(range.value)}
              onMouseDown={(e) => e.preventDefault()}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: '500',
                border: 'none',
                outline: 'none',
                borderRadius: 'var(--radius-sm)',
                background: selectedRange === range.value
                  ? 'var(--color-surface-card)'
                  : 'transparent',
                color: selectedRange === range.value
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-tertiary)',
                cursor: 'pointer',
                pointerEvents: 'auto',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          backgroundColor: 'var(--color-background-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            margin: '0 0 4px'
          }}>
            Peak
          </p>
          <p style={{
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            margin: 0
          }}>
            {formatUsage(maxUsage)}
          </p>
        </div>
        <div style={{
          backgroundColor: 'var(--color-background-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            margin: '0 0 4px'
          }}>
            Average
          </p>
          <p style={{
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            margin: 0
          }}>
            {formatUsage(avgUsage)}
          </p>
        </div>
        <div style={{
          backgroundColor: 'var(--color-background-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            margin: '0 0 4px'
          }}>
            Today
          </p>
          <p style={{
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            margin: 0
          }}>
            {formatUsage(filteredHistory[filteredHistory.length - 1]?.sessionUsage || 0)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredHistory.map((entry, index) => {
          const heightPercent = maxUsage > 0 ? (entry.sessionUsage / maxUsage) * 100 : 0
          const gradient = getGradientClass(entry.sessionPercent)

          return (
            <div key={entry.date} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                width: '80px',
                fontSize: '12px',
                color: 'var(--color-text-tertiary)',
                flexShrink: 0
              }}>
                {format(new Date(entry.date), 'MMM d')}
              </span>
              <div style={{
                flex: 1,
                height: '24px',
                backgroundColor: 'var(--color-background-secondary)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div
                  style={{
                    height: '100%',
                    width: `${heightPercent}%`,
                    background: gradient,
                    transition: 'all 0.3s ease',
                    borderRadius: 'var(--radius-md)'
                  }}
                />
              </div>
              <span style={{
                width: '64px',
                textAlign: 'right',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                flexShrink: 0
              }}>
                {formatUsage(entry.sessionUsage)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border-default)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'linear-gradient(90deg, #059669, #10B981)' }} />
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Healthy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'linear-gradient(90deg, #D2D714, #EAB308)' }} />
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Elevated</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'linear-gradient(90deg, #DC2626, #EF4444)' }} />
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Critical</span>
        </div>
      </div>
    </Card>
  )
}
