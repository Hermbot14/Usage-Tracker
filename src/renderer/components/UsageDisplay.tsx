import { useUsageStore } from '@stores/useUsageStore'
import { formatTimeRemaining, getUsageColor, getGradientClass, formatNumber } from '@lib/utils'
import { format } from 'date-fns'
import { ProgressCircle } from './ui/ProgressCircle'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'

export function UsageDisplay() {
  const { currentUsage, isLoading, error, settings } = useUsageStore()

  if (error) {
    return (
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-semantic-error-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-semantic-error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{
              color: 'var(--color-semantic-error)',
              fontSize: '16px',
              fontWeight: '600',
              margin: 0,
              marginBottom: '4px'
            }}>
              Connection Error
            </h3>
            <p style={{
              color: 'var(--color-semantic-error)',
              fontSize: '14px',
              margin: 0,
              wordBreak: 'break-word'
            }}>
              {error}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (!currentUsage && isLoading) {
    return (
      <Card>
        <div style={{ height: '24px', backgroundColor: 'var(--color-background-secondary)', borderRadius: 'var(--radius-md)', width: '33%', marginBottom: '24px' }}></div>
        <div style={{ height: '96px', backgroundColor: 'var(--color-background-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ height: '64px', backgroundColor: 'var(--color-background-secondary)', borderRadius: 'var(--radius-md)' }}></div>
          <div style={{ height: '64px', backgroundColor: 'var(--color-background-secondary)', borderRadius: 'var(--radius-md)' }}></div>
          <div style={{ height: '64px', backgroundColor: 'var(--color-background-secondary)', borderRadius: 'var(--radius-md)' }}></div>
        </div>
      </Card>
    )
  }

  if (!currentUsage) {
    return (
      <div style={{
        backgroundColor: 'var(--color-background-secondary)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        textAlign: 'center'
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
          <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: '14px',
          margin: 0
        }}>
          Configure your API key in settings to view usage data
        </p>
      </div>
    )
  }

  const sessionStatusColor = getUsageColor(currentUsage.sessionPercent)
  const weeklyStatusColor = getUsageColor(currentUsage.weeklyPercent)
  const sessionGradient = getGradientClass(currentUsage.sessionPercent)
  const weeklyGradient = getGradientClass(currentUsage.weeklyPercent)

  return (
    <Card>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          margin: 0
        }}>
          Token Usage
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isLoading && (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid var(--color-accent-primary)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
          <span style={{
            fontSize: '12px',
            color: 'var(--color-text-tertiary)'
          }}>
            Updated {format(new Date(currentUsage.lastUpdated), 'HH:mm:ss')}
          </span>
        </div>
      </div>

      {/* Progress Circles Row */}
      <div style={{ display: 'flex', gap: '32px', justifyContent: 'space-around', marginBottom: '24px', padding: '16px 0', backgroundColor: 'var(--color-background-neutral)', borderRadius: 'var(--radius-lg)' }}>
        {/* Session Usage */}
        <div style={{ textAlign: 'center' }}>
          <ProgressCircle
            value={Math.round(currentUsage.sessionPercent)}
            size="lg"
            color={sessionStatusColor}
          />
          <p style={{
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            margin: '8px 0 4px',
            fontWeight: '500'
          }}>
            Session (5h)
          </p>
          <p style={{
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            margin: 0
          }}>
            {formatNumber(currentUsage.sessionUsage)} / {formatNumber(currentUsage.sessionLimit)}
          </p>
        </div>

        {/* Weekly Usage */}
        <div style={{ textAlign: 'center' }}>
          <ProgressCircle
            value={Math.round(currentUsage.weeklyPercent)}
            size="lg"
            color={weeklyStatusColor}
          />
          <p style={{
            fontSize: '12px',
            color: 'var(--color-text-secondary)',
            margin: '8px 0 4px',
            fontWeight: '500'
          }}>
            Monthly Tools
          </p>
          <p style={{
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            margin: 0
          }}>
            {currentUsage.weeklyUsage} / {currentUsage.weeklyLimit} calls
          </p>
        </div>
      </div>

      {/* Session Usage Progress Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--color-text-secondary)'
          }}>
            Session Usage (5 Hours)
          </span>
          <Badge variant={currentUsage.sessionPercent >= 91 ? 'error' : currentUsage.sessionPercent >= 71 ? 'warning' : 'success'}>
            {currentUsage.sessionPercent}%
          </Badge>
        </div>
        <div style={{
          width: '100%',
          height: '12px',
          backgroundColor: 'var(--color-background-secondary)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(currentUsage.sessionPercent, 100)}%`,
              background: sessionGradient,
              transition: 'all 0.5s ease-out',
              borderRadius: 'var(--radius-full)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
            {formatNumber(currentUsage.sessionUsage)} / {formatNumber(currentUsage.sessionLimit)} tokens
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
            Resets in: {formatTimeRemaining(currentUsage.sessionResetTime)}
          </span>
        </div>
      </div>

      {/* Weekly Usage Progress Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--color-text-secondary)'
          }}>
            Monthly Tools Usage
          </span>
          <Badge variant={currentUsage.weeklyPercent >= 91 ? 'error' : currentUsage.weeklyPercent >= 71 ? 'warning' : 'success'}>
            {currentUsage.weeklyPercent}%
          </Badge>
        </div>
        <div style={{
          width: '100%',
          height: '12px',
          backgroundColor: 'var(--color-background-secondary)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(currentUsage.weeklyPercent, 100)}%`,
              background: weeklyGradient,
              transition: 'all 0.5s ease-out',
              borderRadius: 'var(--radius-full)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
            {currentUsage.weeklyUsage} / {currentUsage.weeklyLimit} calls
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
            Resets: {format(new Date(currentUsage.weeklyResetTime), 'MMM d')}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{
          backgroundColor: 'var(--color-background-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            margin: '0 0 4px'
          }}>
            Session Remaining
          </p>
          <p style={{
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            margin: 0
          }}>
            {formatNumber(currentUsage.sessionLimit - currentUsage.sessionUsage)}
          </p>
        </div>
        <div style={{
          backgroundColor: 'var(--color-background-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            margin: '0 0 4px'
          }}>
            Session Used
          </p>
          <p style={{
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            margin: 0
          }}>
            {formatNumber(currentUsage.sessionUsage)}
          </p>
        </div>
        <div style={{
          backgroundColor: 'var(--color-background-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
            margin: '0 0 4px'
          }}>
            Tools Remaining
          </p>
          <p style={{
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            margin: 0
          }}>
            {currentUsage.weeklyLimit - currentUsage.weeklyUsage}
          </p>
        </div>
      </div>

      {/* Critical Warning */}
      {currentUsage.sessionPercent >= 80 && settings.notificationsEnabled && (
        <div style={{
          marginTop: '16px',
          backgroundColor: 'var(--color-semantic-error-light)',
          border: '1px solid var(--color-semantic-error)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-semantic-error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-semantic-error)',
            margin: 0
          }}>
            <strong>High Usage Alert:</strong> You've used {currentUsage.sessionPercent}% of your token quota.
          </p>
        </div>
      )}
    </Card>
  )
}
