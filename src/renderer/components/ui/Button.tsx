import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  pill?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  pill = false,
  className = '',
  style = {},
  ...props
}: ButtonProps) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    transition: 'all 0.2s',
    cursor: 'pointer',
    border: 'none',
    outline: 'none'
  }

  const variants = {
    primary: {
      backgroundColor: 'var(--color-accent-primary)',
      color: 'var(--color-text-inverse)'
    },
    secondary: {
      backgroundColor: 'transparent',
      border: '1px solid var(--color-border-default)',
      color: 'var(--color-text-primary)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-secondary)'
    },
    success: {
      backgroundColor: 'var(--color-semantic-success)',
      color: 'white'
    },
    danger: {
      backgroundColor: 'var(--color-semantic-error)',
      color: 'white'
    }
  }

  const sizes = {
    sm: { height: '32px', padding: '0 12px', fontSize: '12px' },
    md: { height: '40px', padding: '0 16px', fontSize: '14px' },
    lg: { height: '48px', padding: '0 24px', fontSize: '16px' }
  }

  const radius = pill ? { borderRadius: 'var(--radius-full)' } : { borderRadius: 'var(--radius-md)' }

  const combinedStyle = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
    ...radius,
    ...style
  }

  // Add hover effects via inline styles (simplified for this implementation)
  const mouseOverStyle = variant === 'primary' || variant === 'success' || variant === 'danger'
    ? { opacity: '0.9' }
    : variant === 'secondary' || variant === 'ghost'
    ? { backgroundColor: 'var(--color-background-secondary)' }
    : {}

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    Object.assign(e.currentTarget.style, mouseOverStyle)
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    Object.assign(e.currentTarget.style, combinedStyle)
  }

  return (
    <button
      className={className}
      style={combinedStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  )
}
