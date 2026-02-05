import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Renderer crash caught by ErrorBoundary:', error)
    console.error('Component stack:', errorInfo.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: 'var(--color-background-primary)',
          color: 'var(--color-text-primary)',
          padding: '32px',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '16px' }}>Something went wrong</h2>
          <p style={{ marginBottom: '24px', color: 'var(--color-text-secondary)' }}>
            The application encountered an error and had to recover.
          </p>
          {this.state.error && (
            <details style={{
              marginBottom: '24px',
              textAlign: 'left',
              backgroundColor: 'var(--color-background-secondary)',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '12px',
              maxWidth: '500px'
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                Error details
              </summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-text-on-accent)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Reload Application
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
