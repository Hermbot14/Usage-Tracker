import { useState } from 'react'
import { useUsageStore } from '@stores/useUsageStore'
import type { ProviderId } from '@/types'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border-default)',
  backgroundColor: 'var(--color-surface-elevated)',
  color: 'var(--color-text-primary)',
  fontSize: '14px',
  boxSizing: 'border-box',
}

export function AccountsManager() {
  const { accounts, providers, localAccounts, addAccount, removeAccount } = useUsageStore()

  const [providerId, setProviderId] = useState<ProviderId | ''>('')
  const [name, setName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')

  const selected = providers.find((p) => p.id === providerId)
  const localDetected = (id: string) => localAccounts.find((l) => l.provider === id)

  const resetForm = () => {
    setProviderId('')
    setName('')
    setApiKey('')
    setBaseUrl('')
  }

  const handleProviderChange = (id: ProviderId | '') => {
    setProviderId(id)
    const p = providers.find((x) => x.id === id)
    setName(p?.label ?? '')
    setBaseUrl(p?.baseUrl ?? '')
    setApiKey('')
  }

  const canAdd = (() => {
    if (!selected) return false
    if (!selected.implemented) return false
    if (selected.auth === 'oauthLocal') return !!localDetected(selected.id)
    return apiKey.trim().length > 0
  })()

  const handleAdd = async () => {
    if (!selected || !canAdd) return
    const id = `${selected.id}-${Date.now().toString(36)}`
    await addAccount({
      id,
      name: name.trim() || selected.label,
      provider: selected.id,
      apiKey: selected.auth === 'oauthLocal' ? undefined : apiKey.trim(),
      baseUrl: baseUrl.trim() || undefined,
    })
    resetForm()
  }

  return (
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>
        Accounts
      </h3>

      {/* Existing accounts */}
      {accounts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {accounts.map((a) => {
            const p = providers.find((x) => x.id === a.provider)
            return (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-background-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <span className={p?.badgeClass} style={{ fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: 'var(--radius-full)', border: '1px solid' }}>
                    {p?.shortLabel ?? a.provider}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</span>
                </div>
                <button
                  onClick={() => removeAccount(a.id)}
                  aria-label={`Remove ${a.name}`}
                  style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: 'transparent', color: 'var(--color-text-tertiary)', cursor: 'pointer', fontSize: '12px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-semantic-error)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-tertiary)')}
                >
                  Remove
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add account form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border-default)' }}>
        <div>
          <label htmlFor="provider" style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
            Provider
          </label>
          <select id="provider" value={providerId} onChange={(e) => handleProviderChange(e.target.value as ProviderId | '')} style={inputStyle}>
            <option value="">Select a provider…</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id} disabled={!p.implemented}>
                {p.label}
                {!p.implemented ? ' (coming soon)' : ''}
              </option>
            ))}
          </select>
          {selected?.notes && (
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', display: 'block', marginTop: '4px' }}>{selected.notes}</span>
          )}
        </div>

        {selected && selected.implemented && (
          <>
            <div>
              <label htmlFor="acct-name" style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Display name</label>
              <input id="acct-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={selected.label} style={inputStyle} />
            </div>

            {selected.auth === 'oauthLocal' ? (
              <div style={{ fontSize: '13px', padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-background-secondary)', color: localDetected(selected.id) ? 'var(--color-semantic-success)' : 'var(--color-text-tertiary)' }}>
                {localDetected(selected.id)
                  ? `✓ Detected a local ${selected.label} login${localDetected(selected.id)?.email ? ` (${localDetected(selected.id)?.email})` : ''} — no API key needed.`
                  : `No local ${selected.label} login found. Sign in with the ${selected.label} CLI, then reopen settings.`}
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="acct-key" style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>API key</label>
                  <input id="acct-key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter API key" style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="acct-url" style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Base URL</label>
                  <input id="acct-url" type="text" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} style={inputStyle} />
                </div>
              </>
            )}

            <button
              onClick={handleAdd}
              disabled={!canAdd}
              style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: canAdd ? 'var(--color-accent-primary)' : 'var(--color-background-secondary)', color: canAdd ? 'var(--color-text-inverse)' : 'var(--color-text-tertiary)', fontSize: '14px', fontWeight: 500, cursor: canAdd ? 'pointer' : 'not-allowed' }}
            >
              Add account
            </button>
          </>
        )}
      </div>
    </div>
  )
}
