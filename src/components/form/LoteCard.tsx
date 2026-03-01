import { CheckCircle } from "lucide-react";

export type LoteStatus = "disponivel" | "esgotado";

export interface LoteInfo {
  id: number;
  nome: string;
  preco: string;
  status: LoteStatus;
}

interface LoteCardProps {
  lote: LoteInfo;
  isActive: boolean;
  isEnabled: boolean;
  onSelect: () => void;
}

const LoteCard = ({ lote, isActive, isEnabled, onSelect }: LoteCardProps) => {
  const esgotado = lote.status === "esgotado";
  const disabled = !isEnabled || esgotado;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all ${
        isActive
          ? "border-primary bg-primary/10 shadow-md"
          : disabled
            ? "cursor-not-allowed border-muted bg-muted/40 opacity-60"
            : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
      }`}
    >
      {esgotado && (
        <span className="absolute -top-2.5 rounded-full bg-destructive px-3 py-0.5 text-xs font-semibold text-destructive-foreground">
          Esgotado
        </span>
      )}
      <span className="text-sm font-medium text-muted-foreground">{lote.nome}</span>
      <span className="text-xl font-bold text-foreground">{lote.preco}</span>
      {isActive && <CheckCircle className="h-5 w-5 text-primary" />}
    </button>
  );
};

export default LoteCard;
