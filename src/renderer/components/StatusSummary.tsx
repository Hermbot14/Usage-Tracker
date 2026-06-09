import { format } from 'date-fns'
import { useUsageStore } from '@stores/useUsageStore'
import { getUsageColor } from '@lib/utils'

/** Top-of-dashboard overview: account count, most-constrained account, health, refresh-all. */
export function StatusSummary() {
  const { accounts, accountUsage, providers, refreshAccount, refreshingIds } = useUsageStore()
  if (accounts.length === 0) return null

  const oks = accounts
    .map((a) => ({ a, st: accountUsage[a.id] }))
    .filter((x) => x.st?.status === 'ok') as { a: (typeof accounts)[number]; st: { status: 'ok'; usage: import('@/types').ProviderUsage } }[]

  let worst: { name: string; pct: number; window: string } | null = null
  let lastUpdated = 0
  for (const { a, st } of oks) {
    const u = st.usage
    const pct = Math.max(u.sessionPercent, u.weeklyPercent)
    const window = u.sessionPercent >= u.weeklyPercent ? 'session' : 'weekly'
    if (!worst || pct > worst.pct) worst = { name: a.name, pct, window }
    const t = new Date(u.lastUpdated).getTime()
    if (t > lastUpdated) lastUpdated = t
  }

  const healthColor = worst ? getUsageColor(worst.pct) : 'var(--color-semantic-success)'
  const anyRefreshing = refreshingIds.length > 0
  const refreshAll = () => accounts.forEach((a) => refreshAccount(a.id))

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: 'var(--color-surface-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: healthColor, boxShadow: `0 0 8px ${healthColor}` }} />
        </span>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {accounts.length} account{accounts.length === 1 ? '' : 's'} tracked
          </p>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {worst
              ? `Most used: ${worst.name} · ${worst.pct}% ${worst.window}`
              : 'Waiting for usage data…'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {lastUpdated > 0 && (
          <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
            {format(new Date(lastUpdated), 'HH:mm:ss')}
          </span>
        )}
        <button
          onClick={refreshAll}
          disabled={anyRefreshing}
          aria-label="Refresh all accounts"
          title="Refresh all"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-default)',
            backgroundColor: 'transparent',
            color: 'var(--color-text-secondary)',
            fontSize: 12,
            fontWeight: 500,
            cursor: anyRefreshing ? 'default' : 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={anyRefreshing ? { animation: 'spin 1s linear infinite' } : undefined}
          >
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  )
}
