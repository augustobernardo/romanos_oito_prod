import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  Upload,
  FileText,
  AlertTriangle,
  QrCode,
  Image,
  Trash2,
  Loader2,
} from "lucide-react";
import { PIX_KEY_PENTECOSTES, PIX_RECEIVER_PENTECOSTES_NAME } from "@/utils/pix";
import { copyToClipboard } from "@/utils/copyToClipboard";
import qrCodePentecostes from "@/assets/pentecoste/QR_CODE_PIX_PENTECOSTES.jpg";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface Step3PaymentProps {
  paymentProofFile: File | null;
  paymentProofName: string;
  paymentProofSize: number;
  onFileUpload: (file: File) => { error: string | null };
  onRemoveFile: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const Step3Payment = ({
  paymentProofFile,
  paymentProofName,
  paymentProofSize,
  onFileUpload,
  onRemoveFile,
}: Step3PaymentProps) => {
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied" | "copy_failed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (paymentProofFile && paymentProofFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(paymentProofFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [paymentProofFile]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopyPixKey = useCallback(async () => {
    setCopyState("copying");
    const success = await copyToClipboard(PIX_KEY_PENTECOSTES);
    setCopyState(success ? "copied" : "copy_failed");
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopyState("idle"), 2500);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Formato não permitido. Use PNG, JPG ou PDF.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("Arquivo excede 5MB.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const result = onFileUpload(file);
      if (result.error) {
        setError(result.error);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [onFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      setError(null);

      if (paymentProofFile) {
        setError("Envie apenas um arquivo.");
        return;
      }

      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Formato não permitido. Use PNG, JPG ou PDF.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("Arquivo excede 5MB.");
        return;
      }

      const result = onFileUpload(file);
      if (result.error) {
        setError(result.error);
      }
    },
    [onFileUpload, paymentProofFile],
  );

  const handleRemove = useCallback(() => {
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onRemoveFile();
  }, [onRemoveFile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl font-black uppercase text-pentecoste-navy">
          Pagamento da inscrição
        </h2>
        <p className="mt-2 font-mono text-xs uppercase tracking-wider text-pentecoste-navy/70">
          Para concluir sua inscrição, realize o pagamento via PIX e anexe o
          comprovante abaixo.
        </p>
      </div>

      <div className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-pentecoste-navy/70">
          QR Code
        </p>
        <div className="flex items-center justify-center bg-pentecoste-paper p-0">
          <img
            src={qrCodePentecostes}
            alt="QR Code PIX Pentecostes"
            className="w-full max-w-[300px] aspect-square object-contain"
          />
        </div>
      </div>

      <div className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-pentecoste-navy/70">
          Chave PIX
        </p>
        <button
          type="button"
          onClick={handleCopyPixKey}
          disabled={copyState === "copying" || copyState === "copied"}
          className="group flex w-full items-center justify-between border-2 border-pentecoste-navy bg-transparent p-4 transition-colors duration-200 hover:border-pentecoste-red hover:bg-pentecoste-red/5 disabled:opacity-70"
        >
          <span className="font-mono text-sm uppercase tracking-[0.15em] text-pentecoste-navy">
            {copyState === "copying" ? (
              <span className="flex items-center gap-2 text-pentecoste-red">
                <Loader2 className="h-4 w-4 animate-spin" />
                Copiando...
              </span>
            ) : copyState === "copied" ? (
              <span className="flex items-center gap-2 text-pentecoste-red">
                <Check className="h-4 w-4" />
                Chave PIX copiada!
              </span>
            ) : copyState === "copy_failed" ? (
              <span className="flex items-center gap-2 text-pentecoste-red">
                <AlertTriangle className="h-4 w-4" />
                Falha ao copiar
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Copiar chave PIX
              </span>
            )}
          </span>
          <span className="text-xs tracking-wider text-pentecoste-navy/50">
            {copyState === "idle"
              ? "Clique para copiar"
              : copyState === "copy_failed"
                ? "Tente novamente"
                : ""}
          </span>
        </button>
      </div>

      <div className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-pentecoste-navy/70">
          Recebedor
        </p>
        <div className="border-2 border-pentecoste-navy bg-pentecoste-paper p-4">
          <span className="font-mono text-sm uppercase tracking-[0.1em] text-pentecoste-navy">
            {PIX_RECEIVER_PENTECOSTES_NAME}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-pentecoste-navy/70">
          Comprovante de pagamento{" "}
          <span className="text-pentecoste-red">*</span>
        </p>

        {paymentProofFile ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            {previewUrl ? (
              <div className="overflow-hidden border-2 border-pentecoste-navy bg-pentecoste-paper">
                <img
                  src={previewUrl}
                  alt="Comprovante de pagamento"
                  className="w-full max-h-64 object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center border-2 border-dashed border-pentecoste-navy/30 bg-pentecoste-paper p-8">
                <div className="flex flex-col items-center gap-2 text-pentecoste-navy/50">
                  <FileText className="h-10 w-10" />
                  <span className="font-mono text-xs uppercase tracking-[0.2em]">
                    PDF
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between gap-3 border-2 border-pentecoste-red bg-pentecoste-red/5 p-4">
              <div className="flex items-center gap-3 min-w-0">
                {previewUrl ? (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-pentecoste-navy bg-pentecoste-paper">
                    <Image className="h-5 w-5 text-pentecoste-navy" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-pentecoste-navy bg-pentecoste-paper">
                    <FileText className="h-5 w-5 text-pentecoste-navy" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm text-pentecoste-navy">
                    {paymentProofName}
                  </p>
                  <p className="font-mono text-xs text-pentecoste-navy/60">
                    {formatFileSize(paymentProofSize)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="flex shrink-0 items-center gap-1 p-1 text-pentecoste-navy/60 hover:text-pentecoste-red transition-colors"
                aria-label="Remover comprovante"
                title="Remover e escolher outro arquivo"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed p-8 text-center transition-all duration-200 ${
              dragOver
                ? "border-pentecoste-red bg-pentecoste-red/10"
                : "border-pentecoste-navy/30 bg-transparent hover:border-pentecoste-red hover:bg-pentecoste-red/5"
            }`}
          >
            <Upload className="mx-auto mb-3 h-8 w-8 text-pentecoste-navy/50" />
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-pentecoste-navy">
              Clique ou arraste o comprovante
            </p>
            <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-wider text-pentecoste-navy/40">
              PNG, JPG ou PDF (max. 5MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 border-2 border-pentecoste-red bg-pentecoste-red/10 p-3"
        >
          <AlertTriangle className="h-4 w-4 text-pentecoste-red" />
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-pentecoste-red">
            {error}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Step3Payment;
