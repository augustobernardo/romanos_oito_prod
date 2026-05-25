import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

const Fallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error | null;
  resetErrorBoundary: () => void;
}) => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
    <div className="max-w-md space-y-4 text-center">
      <h1 className="font-display text-3xl font-bold text-foreground">
        Algo deu errado
      </h1>
      <p className="text-muted-foreground">
        Ocorreu um erro inesperado. Tente recarregar a página.
      </p>
      {import.meta.env.DEV && error && (
        <pre className="overflow-auto rounded border bg-muted p-4 text-xs text-muted-foreground text-left">
          {error.message}
        </pre>
      )}
      <button
        onClick={resetErrorBoundary}
        className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Tentar novamente
      </button>
    </div>
  </div>
);

export const ErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ReactErrorBoundary
    FallbackComponent={Fallback}
    onReset={() => window.location.reload()}
  >
    {children}
  </ReactErrorBoundary>
);
