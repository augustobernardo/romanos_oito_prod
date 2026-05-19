import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CuponsService } from "@/services/cupons.service";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Copy,
  RefreshCw,
  Pencil,
  Upload,
  Eye,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { handleDownloadComprovante, handleViewComprovante, uploadComprovante } from "@/lib/storage";
import { getNextCouponCode, type Cupom } from "@/services/cupons.service";
import { ConfirmDialog } from "./ConfirmDialog";
import { ReceiptViewer } from "@/components/ReceiptViewer";

const AdminCupons = () => {
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Edit dialog state
  const [editCupom, setEditCupom] = useState<Cupom | null>(null);
  const [editNome, setEditNome] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [comprovantePreview, setComprovantePreview] = useState<{
    url: string;
    nome: string;
  } | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [loadingComprovante, setLoadingComprovante] = useState<
    Record<string, boolean>
  >({});

  const { data: cupons = [], isLoading } = useQuery({
    queryKey: ["cupons"],
    queryFn: async () => {
      const { data, error } = await CuponsService.findAll();
      if (error) throw error;
      return data ?? [];
    },
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey: ["cupons"] });

  const cupomMutation = useMutation({
    mutationFn: async ({ action, payload }: { action: string; payload: unknown }) => {
      if (action === "insert") return await CuponsService.insert(payload as { codigo: string });
      if (action === "delete") return await CuponsService.deleteById(payload as string);
      if (action === "update") {
        const { id, ...data } = payload as { id: string; nome_titular?: string | null; comprovante_url?: string | null };
        return await CuponsService.update(id, data);
      }
    },
    onSuccess: (_, { action }) => {
      if (action === "insert") toast.success("Cupom criado com sucesso!");
      else if (action === "delete") toast.success("Cupom excluído");
      else if (action === "update") toast.success("Cupom atualizado!");
      else toast.success("Comprovante enviado!");
      refetch();
    },
    onError: (_, { action }) => {
      if (action === "insert") toast.error("Erro ao criar cupom");
      else if (action === "delete") toast.error("Erro ao excluir");
      else if (action === "update") toast.error("Erro ao salvar");
      else toast.error("Erro ao enviar comprovante");
    },
  });

  const handleCreate = async () => {
    setCreating(true);
    const codigo = await getNextCouponCode();
    cupomMutation.mutate({ action: "insert", payload: { codigo } }, {
      onSettled: () => setCreating(false),
    });
  };

  const handleDeleteClick = (id: string) => { setDeleteId(id); setDeleteDialogOpen(true); };
  const handleConfirmDelete = () => {
    if (!deleteId) return;
    setDeleteDialogOpen(false);
    cupomMutation.mutate({ action: "delete", payload: deleteId });
  };

  const handleCopy = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    toast.success("Código copiado para a área de transferência!");
  };

  const openEdit = (cupom: Cupom) => {
    setEditCupom(cupom);
    setEditNome(cupom.nome_titular ?? "");
  };

  const onViewComprovante = async (
    comprovanteUrl: string,
    cupomId: string,
    nome: string,
  ) => {
    await handleViewComprovante(comprovanteUrl, nome || "Cupom", (loading) => setLoadingComprovante((prev) => ({ ...prev, [cupomId]: loading })), (url, nome) => {
      setComprovantePreview({ url, nome });
      setPreviewDialogOpen(true);
    });
  };

  const onDownloadComprovante = async (
    comprovanteUrl: string,
    cupomId: string,
    nome: string,
  ) => {
    await handleDownloadComprovante(comprovanteUrl, nome || "cupom", (loading) => setLoadingComprovante((prev) => ({ ...prev, [cupomId]: loading })));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editCupom) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${editCupom.id}.${ext}`;

    try {
      const comprovante_url = await uploadComprovante(file, path);
      cupomMutation.mutate({
        action: "upload",
        payload: { id: editCupom.id, comprovante_url },
      });
    } catch {
      toast.error("Erro ao enviar comprovante");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editCupom) return;
    setSaving(true);
    cupomMutation.mutate(
      { action: "update", payload: { id: editCupom.id, nome_titular: editNome || null } },
      { onSettled: () => { setEditCupom(null); setSaving(false); } },
    );
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge variant="default" className="bg-green-600">Ativo</Badge>;
      case "utilizado":
        return <Badge variant="secondary">Utilizado</Badge>;
      case "inativo":
        return <Badge variant="outline">Inativo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Cupons — Lote Especial
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refetch}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            <Plus className="mr-2 h-4 w-4" />
            {creating ? "Gerando..." : "Gerar Cupom"}
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Cada cupom permite <strong>3 inscrições</strong>. Copie o código
        criptografado e envie ao comprador via WhatsApp.
      </p>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : cupons.length === 0 ? (
        <p className="text-muted-foreground">Nenhum cupom cadastrado.</p>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center whitespace-nowrap">Código</TableHead>
                <TableHead className="text-center whitespace-nowrap">Titular</TableHead>
                <TableHead className="text-center whitespace-nowrap">Comprovante</TableHead>
                <TableHead className="text-center whitespace-nowrap">Usos</TableHead>
                <TableHead className="text-center whitespace-nowrap">Status</TableHead>
                <TableHead className="text-center whitespace-nowrap">Criado em</TableHead>
                <TableHead className="w-28 whitespace-nowrap">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-center text-sm">{c.codigo}</TableCell>
                  <TableCell className="text-center text-sm">
                    {c.nome_titular || <span className="text-muted-foreground italic">—</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    {c.comprovante_url ? (
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onViewComprovante(c.comprovante_url!, c.id, c.nome_titular || "Cupom")} disabled={loadingComprovante[c.id]} title="Visualizar comprovante">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDownloadComprovante(c.comprovante_url!, c.id, c.nome_titular || "Cupom")} disabled={loadingComprovante[c.id]} title="Baixar comprovante">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{c.usos_atuais}/{c.max_usos}</TableCell>
                  <TableCell className="text-center">{statusBadge(c.status)}</TableCell>
                  <TableCell className="text-center text-sm">{new Date(c.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)} title="Editar cupom"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(c.codigo)} title="Copiar código"><Copy className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(c.id)} title="Excluir cupom"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Comprovante Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-normal">Comprovante - {comprovantePreview?.nome}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex justify-center">
            {comprovantePreview?.url && (
              <ReceiptViewer
                url={comprovantePreview.url}
                alt={`Comprovante - ${comprovantePreview.nome}`}
                className="max-w-full max-h-[70vh] rounded-lg border"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        description="Tem certeza que deseja excluir este cupom?"
        onConfirm={handleConfirmDelete}
      />

      {/* Edit Dialog */}
      <Dialog open={!!editCupom} onOpenChange={(open) => !open && setEditCupom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cupom</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Código</Label>
              <Input value={editCupom?.codigo ?? ""} disabled className="font-mono" />
            </div>
            <div>
              <Label htmlFor="nome_titular">Nome do Titular</Label>
              <Input id="nome_titular" value={editNome} onChange={(e) => setEditNome(e.target.value)} placeholder="Nome de quem realizou o pagamento" />
            </div>
            <div>
              <Label>Comprovante de Pagamento</Label>
              {editCupom?.comprovante_url && (
                <Button variant="link" className="p-0 h-auto text-sm mb-2" onClick={() => onViewComprovante(editCupom.comprovante_url!, editCupom.id, editCupom.nome_titular || "Cupom")}>
                  <Eye className="h-3 w-3 mr-1" /> Ver comprovante atual
                </Button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Enviando..." : "Enviar comprovante"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCupom(null)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCupons;
