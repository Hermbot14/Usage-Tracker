import { format } from 'date-fns'
import type { AccountConfig, AccountUsageState, ProviderInfo } from '@/types'
import { formatTimeRemaining, getGradientClass } from '@lib/utils'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'

interface AccountCardProps {
  account: AccountConfig
  state: AccountUsageState | undefined
  provider?: ProviderInfo
  onRemove: (id: string) => void
}

function Bar({ label, percent, reset, windowLabel }: { label: string; percent: number; reset: string; windowLabel: string }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          {label} <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 400 }}>({windowLabel})</span>
        </span>
        <Badge variant={percent >= 91 ? 'error' : percent >= 71 ? 'warning' : 'success'}>{percent}%</Badge>
      </div>
      <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--color-background-secondary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(percent, 100)}%`, background: getGradientClass(percent), transition: 'all 0.5s ease-out', borderRadius: 'var(--radius-full)' }} />
      </div>
      <div style={{ marginTop: '4px', textAlign: 'right' }}>
        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Resets in {formatTimeRemaining(reset)}</span>
      </div>
    </div>
  )
}

export function AccountCard({ account, state, provider, onRemove }: AccountCardProps) {
  const badgeClass = provider?.badgeClass ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'

  return (
    <Card>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <span className={badgeClass} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--radius-full)', border: '1px solid', whiteSpace: 'nowrap' }}>
            {provider?.shortLabel ?? account.provider}
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {account.name}
            </p>
            {state?.status === 'ok' && state.usage.email && (
              <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {state.usage.email}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => onRemove(account.id)}
          aria-label={`Remove ${account.name}`}
          title="Remove account"
          style={{ padding: '6px', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--color-text-tertiary)', flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-semantic-error)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      {/* Body */}
      {!state || state.status === 'loading' ? (
        <div style={{ height: '64px', backgroundColor: 'var(--color-background-secondary)', borderRadius: 'var(--radius-md)' }} />
      ) : state.status === 'error' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', backgroundColor: 'var(--color-semantic-error-light)', borderRadius: 'var(--radius-md)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-semantic-error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span style={{ fontSize: '13px', color: 'var(--color-semantic-error)', wordBreak: 'break-word' }}>{state.error}</span>
        </div>
      ) : (
        <>
          <Bar label="Session" percent={state.usage.sessionPercent} reset={state.usage.sessionResetTime} windowLabel={state.usage.sessionWindowLabel} />
          <Bar label="Weekly" percent={state.usage.weeklyPercent} reset={state.usage.weeklyResetTime} windowLabel={state.usage.weeklyWindowLabel} />
          <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', margin: '4px 0 0', textAlign: 'right' }}>
            Updated {format(new Date(state.usage.lastUpdated), 'HH:mm:ss')}
          </p>
        </>
      )}
    </Card>
  )
}
