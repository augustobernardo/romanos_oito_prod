import { CheckCircle, Clock, XCircle } from "lucide-react";

export type LoteStatus = "disponivel" | "esgotado" | "embreve" | "indisponivel";

export interface LoteInfo {
  id: number;
  id_payment_link: string;
  nome: string;
  preco: string;
  status: LoteStatus;
  is_especial: boolean;
}

interface LoteCardProps {
  lote: LoteInfo;
  isActive: boolean;
  isEnabled: boolean;
  onSelect: () => void;
  isLoading?: boolean;
}

const LoteCard = ({
  lote,
  isActive,
  isEnabled,
  onSelect,
  isLoading = false,
}: LoteCardProps) => {
  if (lote.status === "indisponivel") return null;

  const esgotado = lote.status === "esgotado";
  const emBreve = lote.status === "embreve";
  const disabled = !isEnabled || esgotado || emBreve || isLoading;

  // Skeleton loading Card
  if (isLoading) {
    return (
      <div
        className="relative flex flex-col items-center gap-2 rounded-xl border-2 p-5"
        style={{
          borderColor: "hsl(195 40% 82%)",
          backgroundColor: "#f8f8f8",
        }}
      >
        <div className="h-4 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse bg-[length:200%_100%]" />
        <div className="h-6 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse bg-[length:200%_100%] mt-1" />
        <div className="h-5 w-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse bg-[length:200%_100%] mt-2" />
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all ${
        isActive
          ? "shadow-md"
          : disabled
            ? "cursor-not-allowed"
            : "hover:shadow-sm"
      }`}
      style={{
        borderColor: isActive
          ? "hsl(195 100% 45%)"
          : esgotado
            ? "hsl(0 60% 80%)"
            : "hsl(195 40% 82%)",
        backgroundColor: isActive
          ? "#faf7ef"
          : esgotado
            ? "#fdf2f2"
            : disabled
              ? "#f0f0f0"
              : "hsl(0 0% 100%)",
        opacity: disabled ? 0.65 : 1,
      }}
    >
      {/* Badge Esgotado */}
      {esgotado && (
        <span
          className="absolute -top-2.5 rounded-full px-3 py-0.5 text-xs font-semibold text-white"
          style={{ backgroundColor: "#e53e3e" }}
        >
          Esgotado
        </span>
      )}

      {/* Badge Em breve */}
      {emBreve && (
        <span
          className="absolute -top-2.5 rounded-full px-3 py-0.5 text-xs font-semibold text-white"
          style={{ backgroundColor: "#dd6b20" }}
        >
          Em breve
        </span>
      )}

      <span
        className="text-sm font-medium"
        style={{ color: esgotado ? "hsl(0 40% 55%)" : "hsl(195 15% 50%)" }}
      >
        {lote.nome}
      </span>

      <span
        className={`text-xl font-bold ${esgotado ? "line-through" : ""}`}
        style={{ color: esgotado ? "hsl(0 30% 60%)" : "hsl(200 30% 25%)" }}
      >
        {lote.preco}
      </span>

      {isActive && (
        <CheckCircle
          className="h-5 w-5"
          style={{ color: "hsl(195 100% 45%)" }}
        />
      )}
      {esgotado && !isActive && (
        <XCircle className="h-5 w-5" style={{ color: "hsl(0 60% 55%)" }} />
      )}
      {emBreve && !isActive && (
        <Clock className="h-5 w-5" style={{ color: "#dd6b20" }} />
      )}
    </button>
  );
};

export default LoteCard;
