import React, { useEffect, useRef, useState } from 'react'
import { useUsageStore } from '@stores/useUsageStore'
import { formatTime, getUsageColor, getGradientClass, formatTimeRemaining } from '@lib/utils'
import { ProgressCircle } from '@components/ui/ProgressCircle'

export interface UsageOverlayProps {
  onExpand?: () => void
}

/**
 * UsageOverlay - Compact 200x200px overlay component
 *
 * Displays:
 * - Draggable header with abbreviated time and expand button
 * - Large usage percentage (always visible)
 * - Time until next reset (KEY DATA - always visible)
 * - Progress circle (small size)
 * - Mini progress bar
 * - Critical alert when usage >= 80%
 *
 * Hover behavior:
 * - When overlay mode is enabled with clickThrough, the window is click-through by default
 * - Hovering over the overlay container makes it interactive (disables click-through)
 * - Leaving the overlay restores click-through behavior
 *
 * Draggable:
 * - The header area is draggable via -webkit-app-region: drag
 * - The expand button is excluded from drag via -webkit-app-region: no-drag
 */
export function UsageOverlay({ onExpand }: UsageOverlayProps) {
  const { currentUsage, settings } = useUsageStore()
  const overlayRef = useRef<HTMLDivElement>(null)
  const [currentTime, setCurrentTime] = useState(formatTime(new Date()))

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime(new Date()))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Get session percentage for display
  const sessionPercent = currentUsage?.sessionPercent ?? 0
  const color = getUsageColor(sessionPercent)

  // Calculate time until reset (KEY DATA!)
  const timeUntilReset = currentUsage?.sessionResetTime
    ? formatTimeRemaining(currentUsage.sessionResetTime)
    : '--'

  // Determine if critical alert should be shown
  const showCriticalAlert = sessionPercent >= 80

  // Setup hover-to-interact behavior for click-through mode
  useEffect(() => {
    // Only enable hover behavior when click-through is enabled
    if (!settings.overlayMode.clickThrough) {
      return
    }

    const container = overlayRef.current
    if (!container) {
      return
    }

    // Enable interaction on hover (disable click-through)
    const handleMouseEnter = () => {
      if (window.api?.setClickThrough) {
        window.api.setClickThrough(false)
      }
    }

    // Disable interaction on leave (enable click-through)
    const handleMouseLeave = () => {
      if (window.api?.setClickThrough) {
        window.api.setClickThrough(true)
      }
    }

    // Add event listeners to the container
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    // Cleanup function
    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [settings.overlayMode.clickThrough])

  return (
    <div ref={overlayRef} className="usage-overlay">
      {/* Draggable header with time and expand button */}
      <div className="overlay-header">
        <span className="overlay-time">{currentTime}</span>
        <button
          type="button"
          onClick={onExpand}
          aria-label="Expand to full view"
          className="interactive"
        >
          ⛶
        </button>
      </div>

      {/* KEY DATA: Usage Percentage - Large and always visible */}
      <div className="overlay-percent">{sessionPercent}%</div>

      {/* KEY DATA: Time until next reset - Always visible! */}
      <div className="overlay-reset-time">
        <span className="overlay-reset-label">Reset in:</span>
        <span className="overlay-reset-value">{timeUntilReset}</span>
      </div>

      {/* Progress circle center */}
      <div className="overlay-progress">
        <ProgressCircle size="sm" value={sessionPercent} color={color} />
      </div>

      {/* Mini progress bar (always shown in overlay) */}
      <div className="overlay-bar">
        <div
          className="overlay-bar-fill"
          style={{
            width: `${sessionPercent}%`,
            background: getGradientClass(sessionPercent),
          }}
        />
      </div>

      {/* Critical alert */}
      {showCriticalAlert && (
        <div className="overlay-alert">⚠ {sessionPercent}% used</div>
      )}
    </div>
  )
}
