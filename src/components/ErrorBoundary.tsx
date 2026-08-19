import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unexpected error", error, info);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="flex h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
          <div>
            <p className="label text-accent">Something went wrong</p>
            <h1 className="mt-1 text-lg font-semibold tracking-tight">
              The game hit an unexpected error
            </h1>
            <p className="mt-2 max-w-sm text-sm text-muted">
              {this.state.error.message}
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-black transition hover:opacity-90"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
