import { useState, useCallback, useRef, useEffect } from "react";
import { CheckCircle, Copy, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PIX_KEY as ENV_PIX_KEY } from "@/utils/pix";
import { copyToClipboard } from "@/utils/copyToClipboard";

type CopyState = "idle" | "copying" | "copied" | "copy_failed";

interface PixCopyButtonProps {
  pixKey?: string;
  className?: string;
}

export const PixCopyButton = ({ pixKey = ENV_PIX_KEY, className }: PixCopyButtonProps) => {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (!pixKey) {
      console.warn(
        "[PixCopyButton] pixKey is empty — clipboard copy aborted. Check VITE_PIX_KEY env var."
      );
      return;
    }

    setCopyState("copying");

    const success = await copyToClipboard(pixKey);
    setCopyState(success ? "copied" : "copy_failed");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopyState("idle"), 2500);
  }, [pixKey]);

  const isDisabled = copyState === "copying" || copyState === "copied";

  const ariaLabel =
    copyState === "copied"
      ? "Chave PIX copiada com sucesso"
      : copyState === "copy_failed"
        ? "Falha ao copiar chave PIX"
        : "Copiar chave PIX";

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        onClick={handleCopy}
        disabled={isDisabled}
        variant="outline"
        size="lg"
        className={className}
        aria-label={ariaLabel}
      >
        {copyState === "idle" && (
          <>
            <Copy className="h-4 w-4 mr-2" />
            Copiar Chave PIX
          </>
        )}
        {copyState === "copying" && (
          <>
            <Copy className="h-4 w-4 mr-2 animate-pulse" />
            Copiando...
          </>
        )}
        {copyState === "copied" && (
          <>
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Chave PIX copiada!
          </>
        )}
        {copyState === "copy_failed" && (
          <>
            <XCircle className="h-4 w-4 mr-2 text-red-500" />
            Falha ao copiar. Tente novamente.
          </>
        )}
      </Button>
      {copyState === "copied" && (
        <span className="text-xs text-green-600 font-medium" aria-live="polite">
          Chave PIX copiada com sucesso
        </span>
      )}
      {copyState === "copy_failed" && (
        <span className="text-xs text-red-500 font-medium" aria-live="polite">
          Falha ao copiar. Tente novamente.
        </span>
      )}
    </div>
  );
};
