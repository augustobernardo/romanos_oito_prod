import { useState, useCallback } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { detectFileType } from "@/lib/fileType";
import { cn } from "@/lib/utils";

interface ReceiptViewerProps {
  url: string;
  filename?: string | null;
  alt?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function ReceiptViewer({
  url,
  filename = null,
  alt = "Comprovante de pagamento",
  className,
  onClick,
}: ReceiptViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fileType = detectFileType(filename ?? null, url);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  if (!url) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3 p-8 text-muted-foreground", className)}>
        <AlertTriangle className="h-8 w-8" />
        <p className="text-sm">Nenhum comprovante disponível.</p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg z-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-muted-foreground">
          <AlertTriangle className="h-8 w-8" />
          <p className="text-sm text-center">
            Não foi possível visualizar este comprovante.
          </p>
          <p className="text-xs text-muted-foreground">
            O arquivo pode estar indisponível ou em formato não suportado.
          </p>
        </div>
      )}

      {!error && (
        <>
          {fileType === "image" && (
            <img
              src={url}
              alt={alt}
              className={cn("max-h-[90vh] max-w-full rounded-lg object-contain", loading && "invisible", className)}
              onLoad={handleLoad}
              onError={handleError}
              onClick={onClick}
            />
          )}

          {fileType === "pdf" && (
            <iframe
              src={url}
              title={alt}
              className={cn("w-full rounded-lg border-0", loading && "invisible", className)}
              style={{ height: "min(90vh, 700px)" }}
              onLoad={handleLoad}
              onError={handleError}
              onClick={onClick}
            />
          )}

          {fileType === "unknown" && (
            <>
              <img
                src={url}
                alt={alt}
                className={cn("max-h-[90vh] max-w-full rounded-lg object-contain", loading && "invisible", className)}
                onLoad={handleLoad}
                onError={() => setError(false)}
                onClick={onClick}
                style={{ display: error ? "none" : undefined }}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
