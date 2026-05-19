import { Badge } from "@/components/ui/badge";
import type { PentecostePaymentStatus } from "@/types/pentecoste";

const statusConfig: Record<
  PentecostePaymentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  pending: {
    label: "Pendente",
    variant: "outline",
    className: "border-yellow-500 text-yellow-700 bg-yellow-50",
  },
  awaiting_confirmation: {
    label: "Aguardando",
    variant: "outline",
    className: "border-blue-500 text-blue-700 bg-blue-50",
  },
  confirmed: {
    label: "Confirmado",
    variant: "default",
    className: "bg-emerald-600 hover:bg-emerald-600 text-white",
  },
  paid: {
    label: "Pago",
    variant: "outline",
    className: "border-green-500 text-green-700 bg-green-50",
  },
  rejected: {
    label: "Rejeitado",
    variant: "destructive",
    className: "",
  },
  cancelled: {
    label: "Cancelado",
    variant: "destructive",
    className: "",
  },
  manual_card_payment: {
    label: "Cartão Manual",
    variant: "secondary",
    className: "",
  },
};

interface PaymentStatusBadgeProps {
  status: PentecostePaymentStatus;
}

export const PaymentStatusBadge = ({ status }: PaymentStatusBadgeProps) => {
  const config = statusConfig[status] ?? {
    label: status,
    variant: "outline" as const,
    className: "",
  };

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};
