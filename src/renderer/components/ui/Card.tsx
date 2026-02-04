import React from 'react'

export interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}

export function Card({
  children,
  className,
  padding = true
}: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--color-surface-card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-md)',
        padding: padding ? '24px' : undefined,
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
      }}
    >
      {children}
    </div>
  )
}
