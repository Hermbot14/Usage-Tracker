import React from 'react'

export interface ProgressCircleProps {
  value: number
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export function ProgressCircle({
  value,
  size = 'md',
  color = 'var(--color-accent-primary)'
}: ProgressCircleProps) {
  const sizes = {
    sm: { width: 40, stroke: 4, fontSize: '10px' },
    md: { width: 56, stroke: 5, fontSize: '12px' },
    lg: { width: 80, stroke: 6, fontSize: '16px' }
  }

  const { width, stroke, fontSize } = sizes[size]
  const radius = (width - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${value}%`}
    >
      <svg width={width} height={width} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border-default)"
          strokeWidth={stroke}
        />
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'all 0.5s ease' }}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          fontWeight: '600',
          fontSize
        }}
        aria-hidden="true"
      >
        {value}%
      </span>
    </div>
  )
}
