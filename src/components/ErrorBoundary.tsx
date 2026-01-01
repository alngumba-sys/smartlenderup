import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🔴 Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111120',
          color: '#e1e8f0',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '600px',
            padding: '40px',
            backgroundColor: '#1a2942',
            borderRadius: '12px',
            border: '1px solid #2a3f5f'
          }}>
            <h1 style={{ marginBottom: '20px', color: '#ff6b6b' }}>
              ⚠️ Something went wrong
            </h1>
            <p style={{ marginBottom: '10px', color: '#b8c5d6' }}>
              The application encountered an error and needs to reload.
            </p>
            <details style={{ marginTop: '20px' }}>
              <summary style={{ cursor: 'pointer', color: '#8ba3c7', marginBottom: '10px' }}>
                Error Details
              </summary>
              <pre style={{
                backgroundColor: '#0d1b2a',
                padding: '15px',
                borderRadius: '6px',
                overflow: 'auto',
                fontSize: '12px',
                color: '#ff6b6b'
              }}>
                {this.state.error?.toString()}
                {'\n\n'}
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
