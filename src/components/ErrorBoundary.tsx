import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to external service in production
    if (import.meta.env.PROD) {
      // TODO: Add error reporting service (Sentry, LogRocket, etc.)
      console.error('Production error:', { error, errorInfo });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full p-8 rounded-lg shadow-soft bg-card animate-fade-in">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-destructive">
                  Something went wrong
                </h1>
                <p className="text-muted-foreground">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  onClick={this.handleReload}
                  className="flex items-center gap-2"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                
                <Button
                  onClick={this.handleReset}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  Try Again
                </Button>
                
                <Button asChild variant="outline" className="flex items-center gap-2">
                  <Link to="/">
                    <Home className="h-4 w-4" />
                    Go Home
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 