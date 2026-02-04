import React, { useEffect, useRef } from 'react'
import { useUsageStore } from '@stores/useUsageStore'
import { formatTime, getUsageColor, getGradientClass } from '@lib/utils'
import { ProgressCircle } from '@components/ui/ProgressCircle'

export interface UsageOverlayProps {
  onExpand?: () => void
}

/**
 * UsageOverlay - Compact 200x200px overlay component
 *
 * Displays:
 * - Header with abbreviated time and expand button
 * - Progress circle (small size)
 * - Optional percentage badge
 * - Optional mini progress bar
 * - Critical alert when usage >= 80%
 *
 * Hover behavior:
 * - When overlay mode is enabled with clickThrough, the window is click-through by default
 * - Hovering over the overlay container makes it interactive (disables click-through)
 * - Leaving the overlay restores click-through behavior
 */
export function UsageOverlay({ onExpand }: UsageOverlayProps) {
  const { currentUsage, settings } = useUsageStore()
  const overlayRef = useRef<HTMLDivElement>(null)

  // Get session percentage for display
  const sessionPercent = currentUsage?.sessionPercent ?? 0
  const color = getUsageColor(sessionPercent)

  // Format current time for header
  const currentTime = formatTime(new Date())

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
      {/* Header with time and expand button */}
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

      {/* Progress circle center */}
      <div className="overlay-progress">
        <ProgressCircle size="sm" value={sessionPercent} color={color} />
      </div>

      {/* Percentage badge (optional based on settings) */}
      {settings.overlayMode.showPercentage && (
        <div className="overlay-percent">{sessionPercent}%</div>
      )}

      {/* Mini progress bar (optional based on settings) */}
      {settings.overlayMode.showProgressBar && (
        <div className="overlay-bar">
          <div
            className="overlay-bar-fill"
            style={{
              width: `${sessionPercent}%`,
              background: getGradientClass(sessionPercent),
            }}
          />
        </div>
      )}

      {/* Critical alert */}
      {showCriticalAlert && (
        <div className="overlay-alert">⚠ {sessionPercent}% used</div>
      )}
    </div>
  )
}
