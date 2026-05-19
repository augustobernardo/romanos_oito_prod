import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import { PentecosteService } from "@/services/admin/pentecoste.service";
import { handleViewComprovante, handleDownloadComprovante, PENTECOSTE_STORAGE_BUCKET } from "@/lib/storage";
import { toast } from "@/components/ui/sonner";
import { calculateAge } from "@/utils/dateUtils";
import { Download, Eye, Loader2 } from "lucide-react";
import { ReceiptViewer } from "@/components/ReceiptViewer";
import { statusLabels, DRAWER_STATUS_OPTIONS } from "./statusTransitions";
import type {
  PentecosteRegistration,
  PentecostePaymentStatus,
} from "@/types/pentecoste";

interface RegistrationDetailsDrawerProps {
  registration: PentecosteRegistration | null;
  open: boolean;
  onClose: () => void;
}

export const RegistrationDetailsDrawer = ({
  registration,
  open,
  onClose,
}: RegistrationDetailsDrawerProps) => {
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState<PentecostePaymentStatus | "">("");
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (registration) {
      setNewStatus("");
      setProofUrl(null);
    }
  }, [registration]);

  const statusMutation = useMutation({
    mutationFn: async (status: PentecostePaymentStatus) => {
      if (!registration) return;
      await PentecosteService.updatePaymentStatus(registration.id, status);
    },
    onSuccess: () => {
      toast.success("Status atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["pentecoste-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["pentecoste-metrics"] });
    },
    onError: (err) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Erro ao atualizar status";
      toast.error(message);
    },
  });

  if (!registration) return null;

  const isUnderage = calculateAge(registration.date_of_birth) < 18;

  const loadProof = async () => {
    if (!registration.payment_proof_url) return;
    if (proofUrl) {
      setPreviewOpen(true);
      return;
    }
    await handleViewComprovante(
      registration.payment_proof_url,
      registration.fullname,
      (loading) => setProofLoading(loading),
      (url) => {
        setProofUrl(url);
        setPreviewOpen(true);
      },
      PENTECOSTE_STORAGE_BUCKET,
    );
  };

  const onDownloadProof = async () => {
    if (!registration.payment_proof_url) return;
    await handleDownloadComprovante(
      registration.payment_proof_url,
      registration.fullname,
      (loading) => setProofLoading(loading),
      PENTECOSTE_STORAGE_BUCKET,
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" side="right">
          <SheetHeader>
            <SheetTitle className="text-xl font-display">
              {registration.fullname}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Personal info */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Dados Pessoais
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Nome</dt>
                  <dd className="font-medium">{registration.fullname}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Data Nasc.</dt>
                  <dd className="font-medium">
                    {new Date(registration.date_of_birth).toLocaleDateString("pt-BR")}{" "}
                    ({calculateAge(registration.date_of_birth)} anos)
                    {isUnderage && (
                      <span className="ml-1 text-yellow-600 text-xs">
                        (menor)
                      </span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">WhatsApp</dt>
                  <dd className="font-medium">
                    {registration.whatsapp_number.replace(
                      /(\d{2})(\d{5})(\d{4})/,
                      "($1) $2-$3"
                    )}
                  </dd>
                </div>
                {registration.instagram_user && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Instagram</dt>
                    <dd className="font-medium">
                      {registration.instagram_user.startsWith("@")
                        ? registration.instagram_user
                        : `@${registration.instagram_user}`}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Paróquia</dt>
                  <dd className="font-medium">
                    {registration.parish_church ?? "—"}
                  </dd>
                </div>
                {isUnderage && registration.contact_person_charge && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Responsável</dt>
                    <dd className="font-medium">
                      {registration.contact_person_charge}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Registration info */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Inscrição
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Turma</dt>
                  <dd className="font-medium">
                    {registration.workshop_group?.replace("turma_", "Turma ") ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Horário Chegada</dt>
                  <dd className="font-medium">
                    {registration.arrival_time
                      ? "Livre"
                      : registration.arrival_time_restriction ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Data Inscrição</dt>
                  <dd className="font-medium">
                    {new Date(registration.created_at).toLocaleString("pt-BR")}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Payment info */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Pagamento
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <dt className="text-muted-foreground">Método</dt>
                  <dd className="font-medium">
                    {registration.payment_method === "pix"
                      ? "PIX"
                      : "Cartão Manual"}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <PaymentStatusBadge status={registration.payment_status} />
                  </dd>
                </div>
              </dl>

              {/* Status update */}
              <div className="mt-3 flex items-center gap-2">
                <Select
                  value={newStatus || undefined}
                  onValueChange={(v) =>
                    setNewStatus(v as PentecostePaymentStatus)
                  }
                >
                  <SelectTrigger className="flex-1 text-xs">
                    <SelectValue placeholder="Alterar status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DRAWER_STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {statusLabels[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  disabled={!newStatus || statusMutation.isPending}
                  onClick={() => {
                    if (newStatus) {
                      statusMutation.mutate(newStatus);
                      setNewStatus("");
                    }
                  }}
                >
                  {statusMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Atualizar"
                  )}
                </Button>
              </div>
            </section>

            {/* Payment proof */}
            {registration.payment_proof_url && (
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Comprovante
                </h3>
                <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadProof}
                      disabled={proofLoading}
                      className="flex-1"
                    >
                    {proofLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Eye className="h-4 w-4 mr-1" />
                    )}
                    Visualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDownloadProof}
                    disabled={proofLoading}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </section>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Proof preview dialog */}
      <Dialog open={previewOpen && !!proofUrl} onOpenChange={(open) => !open && setPreviewOpen(false)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-normal">
              Comprovante - {registration.fullname}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex justify-center">
            {proofUrl && (
              <ReceiptViewer
                url={proofUrl}
                filename={registration.payment_proof_filename}
                className="max-w-full max-h-[70vh] rounded-lg border"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
