import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production this would report to an error tracking service.
    console.error('Unhandled UI error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-surface-muted px-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-danger-100 text-danger-500">
            <AlertTriangle className="size-7" />
          </div>
          <div className="space-y-1">
            <h1 className="font-display text-xl font-semibold text-ink-900">An error occurred</h1>
            <p className="max-w-md text-sm text-ink-500">
              An error interrupted this page. Try reloading — if it keeps happening, contact your
              administrator.
            </p>
          </div>
          <Button onClick={this.handleReset}>Reload page</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
