import React from 'react'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline'
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default: {
      backgroundColor: 'var(--color-background-secondary)',
      color: 'var(--color-text-secondary)'
    },
    primary: {
      backgroundColor: 'var(--color-accent-primary-light)',
      color: 'var(--color-accent-primary)'
    },
    success: {
      backgroundColor: 'var(--color-semantic-success-light)',
      color: 'var(--color-semantic-success)'
    },
    warning: {
      backgroundColor: 'var(--color-semantic-warning-light)',
      color: 'var(--color-semantic-warning)'
    },
    error: {
      backgroundColor: 'var(--color-semantic-error-light)',
      color: 'var(--color-semantic-error)'
    },
    outline: {
      backgroundColor: 'transparent',
      border: '1px solid var(--color-border-default)',
      color: 'var(--color-text-secondary)'
    }
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: '12px',
        fontWeight: '500',
        letterSpacing: '0.02em',
        ...variants[variant]
      }}
    >
      {children}
    </span>
  )
}
