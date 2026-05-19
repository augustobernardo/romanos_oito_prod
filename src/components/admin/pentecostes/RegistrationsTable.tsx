import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { Eye, Trash2, Loader2 } from "lucide-react";
import type { PentecosteRegistration } from "@/types/pentecoste";
import { calculateAge } from "@/utils/dateUtils";

interface RegistrationsTableProps {
  registrations: PentecosteRegistration[];
  onSelect: (reg: PentecosteRegistration) => void;
  onDelete: (reg: PentecosteRegistration) => void;
  deletingIds: Set<string>;
}

const formatPhone = (phone: string) =>
  phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");

const formatMethod = (method: string) => {
  if (method === "pix") return "PIX";
  if (method === "card_manual") return "Cartão Manual";
  return method;
};

export const RegistrationsTable = ({
  registrations,
  onSelect,
  onDelete,
  deletingIds,
}: RegistrationsTableProps) => (
  <>
    {/* Desktop table */}
    <div className="hidden md:block rounded-md border overflow-x-auto max-h-[60vh] overflow-y-auto">
      <Table className="min-w-[1000px]">
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            <TableHead className="w-[220px]">Nome</TableHead>
            <TableHead className="w-[150px]">WhatsApp</TableHead>
            <TableHead className="w-[80px] text-center">Idade</TableHead>
            <TableHead className="w-[180px]">Paróquia</TableHead>
            <TableHead className="w-[100px] text-center">Turma</TableHead>
            <TableHead className="w-[100px] text-center">Método</TableHead>
            <TableHead className="w-[120px] text-center">Status</TableHead>
            <TableHead className="w-[120px] text-center">Data</TableHead>
            <TableHead className="w-[70px] text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((r) => {
            const isDeleting = deletingIds.has(r.id);

            return (
              <TableRow key={r.id}>
                <TableCell className="font-medium truncate" title={r.fullname}>
                  {r.fullname}
                </TableCell>
                <TableCell>{formatPhone(r.whatsapp_number)}</TableCell>
                <TableCell className="text-center">
                  {calculateAge(r.date_of_birth)}
                </TableCell>
                <TableCell className="truncate" title={r.parish_church ?? ""}>
                  {r.parish_church ?? "—"}
                </TableCell>
                <TableCell className="text-center">
                  {r.workshop_group?.replace("turma_", "T") ?? "—"}
                </TableCell>
                <TableCell className="text-center">
                  {formatMethod(r.payment_method)}
                </TableCell>
                <TableCell className="text-center">
                  <PaymentStatusBadge status={r.payment_status} />
                </TableCell>
                <TableCell className="text-center text-xs">
                  {new Date(r.created_at).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onSelect(r)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(r)}
                      disabled={isDeleting}
                      title="Remover inscrição"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>

    {/* Mobile card list */}
    <div className="space-y-3 md:hidden">
      {registrations.map((r) => {
        const isDeleting = deletingIds.has(r.id);

        return (
          <div
            key={r.id}
            className="rounded-lg border bg-card p-4 space-y-2"
          >
            <div
              className="flex items-center justify-between"
              onClick={() => onSelect(r)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelect(r)}
            >
              <span className="font-semibold text-sm truncate max-w-[180px]">
                {r.fullname}
              </span>
              <PaymentStatusBadge status={r.payment_status} />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatPhone(r.whatsapp_number)}</span>
              <span>{calculateAge(r.date_of_birth)} anos</span>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="truncate max-w-[140px]">
                {r.parish_church ?? "—"}
              </span>
              <span>
                {r.workshop_group?.replace("turma_", "T") ?? "—"} ·{" "}
                {formatMethod(r.payment_method)}
              </span>
            </div>

            <div className="text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleDateString("pt-BR")}
            </div>

            <div className="flex items-center justify-end gap-1 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelect(r)}
                className="h-8 px-2"
              >
                <Eye className="h-4 w-4 mr-1" />
                <span className="text-xs">Ver</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(r)}
                disabled={isDeleting}
                className="h-8 px-2"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive" />
                )}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  </>
);
