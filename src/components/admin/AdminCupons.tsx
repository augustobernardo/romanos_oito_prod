import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  ExternalLink,
  Eye,
  Download,
} from "lucide-react";
import { toast } from "sonner";

const extractFilePathFromUrl = (url: string) => {
  if (url.startsWith("http")) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      return pathParts[pathParts.length - 1];
    } catch {
      return url;
    }
  }
  return url;
};

interface Cupom {
  id: string;
  codigo: string;
  max_usos: number;
  usos_atuais: number;
  status: string;
  created_at: string;
  nome_titular: string | null;
  comprovante_url: string | null;
}

const generateCouponCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let raw = "";
  for (let i = 0; i < 8; i++) {
    raw += chars[Math.floor(Math.random() * chars.length)];
  }
  return btoa(raw);
};

const AdminCupons = () => {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

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

  const fetchCupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar cupons");
    } else {
      setCupons(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCupons();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    const codigo = generateCouponCode();
    const { error } = await supabase.from("cupons").insert({ codigo });
    if (error) {
      toast.error("Erro ao criar cupom");
    } else {
      toast.success("Cupom criado com sucesso!");
      fetchCupons();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;
    const { error } = await supabase.from("cupons").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir");
    } else {
      toast.success("Cupom excluído");
      fetchCupons();
    }
  };

  const handleCopy = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    toast.success("Código copiado para a área de transferência!");
  };

  const openEdit = (cupom: Cupom) => {
    setEditCupom(cupom);
    setEditNome(cupom.nome_titular ?? "");
  };

  const handleViewComprovante = async (
    comprovanteUrl: string,
    cupomId: string,
    nome: string,
  ) => {
    try {
      setLoadingComprovante((prev) => ({ ...prev, [cupomId]: true }));
      const filePath = extractFilePathFromUrl(comprovanteUrl);
      if (!filePath) {
        toast.error("Caminho do arquivo inválido");
        return;
      }

      const { data, error } = await supabase.storage
        .from("Comprovantes_OIKOS")
        .createSignedUrl(filePath, 60 * 60);

      if (error) throw error;
      if (data?.signedUrl) {
        setComprovantePreview({ url: data.signedUrl, nome: nome || "Cupom" });
        setPreviewDialogOpen(true);
      } else {
        toast.error("Erro ao gerar link do comprovante");
      }
    } catch (error) {
      console.error("Erro ao acessar comprovante:", error);
      toast.error("Erro ao acessar comprovante");
    } finally {
      setLoadingComprovante((prev) => ({ ...prev, [cupomId]: false }));
    }
  };

  const handleDownloadComprovante = async (
    comprovanteUrl: string,
    cupomId: string,
    nome: string,
  ) => {
    try {
      setLoadingComprovante((prev) => ({ ...prev, [cupomId]: true }));
      const filePath = extractFilePathFromUrl(comprovanteUrl);
      if (!filePath) {
        toast.error("Caminho do arquivo inválido");
        return;
      }

      const { data, error } = await supabase.storage
        .from("Comprovantes_OIKOS")
        .createSignedUrl(filePath, 60 * 60);

      if (error) throw error;
      if (data?.signedUrl) {
        const link = document.createElement("a");
        link.href = data.signedUrl;
        link.download = `comprovante_${nome || "cupom"}_${new Date().toISOString().split("T")[0]}.${filePath.split(".").pop()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download iniciado");
      }
    } catch (error) {
      console.error("Erro ao baixar comprovante:", error);
      toast.error("Erro ao baixar comprovante");
    } finally {
      setLoadingComprovante((prev) => ({ ...prev, [cupomId]: false }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editCupom) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${editCupom.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("Comprovantes_OIKOS")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Erro ao enviar comprovante");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("Comprovantes_OIKOS")
      .getPublicUrl(path);

    const comprovante_url = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from("cupons")
      .update({ comprovante_url })
      .eq("id", editCupom.id);

    if (updateError) {
      toast.error("Erro ao salvar URL do comprovante");
    } else {
      setEditCupom({ ...editCupom, comprovante_url });
      toast.success("Comprovante enviado!");
    }
    setUploading(false);
  };

  const handleSaveEdit = async () => {
    if (!editCupom) return;
    setSaving(true);

    const { error } = await supabase
      .from("cupons")
      .update({ nome_titular: editNome || null })
      .eq("id", editCupom.id);

    if (error) {
      toast.error("Erro ao salvar");
    } else {
      toast.success("Cupom atualizado!");
      setEditCupom(null);
      fetchCupons();
    }
    setSaving(false);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return (
          <Badge variant="default" className="bg-green-600">
            Ativo
          </Badge>
        );
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
            onClick={fetchCupons}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
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

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : cupons.length === 0 ? (
        <p className="text-muted-foreground">Nenhum cupom cadastrado.</p>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center whitespace-nowrap">
                  Código
                </TableHead>
                <TableHead className="text-center whitespace-nowrap">
                  Titular
                </TableHead>
                <TableHead className="text-center whitespace-nowrap">
                  Comprovante
                </TableHead>
                <TableHead className="text-center whitespace-nowrap">
                  Usos
                </TableHead>
                <TableHead className="text-center whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="text-center whitespace-nowrap">
                  Criado em
                </TableHead>
                <TableHead className="w-28 whitespace-nowrap">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-center text-sm">
                    {c.codigo}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {c.nome_titular || (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {c.comprovante_url ? (
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            handleViewComprovante(
                              c.comprovante_url!,
                              c.id,
                              c.nome_titular || "Cupom",
                            )
                          }
                          disabled={loadingComprovante[c.id]}
                          title="Visualizar comprovante"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            handleDownloadComprovante(
                              c.comprovante_url!,
                              c.id,
                              c.nome_titular || "Cupom",
                            )
                          }
                          disabled={loadingComprovante[c.id]}
                          title="Baixar comprovante"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-sm">
                        —
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {c.usos_atuais}/{c.max_usos}
                  </TableCell>
                  <TableCell className="text-center">
                    {statusBadge(c.status)}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {new Date(c.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(c)}
                        title="Editar cupom"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(c.codigo)}
                        title="Copiar código"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(c.id)}
                        title="Excluir cupom"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-normal">
              Comprovante - {comprovantePreview?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex justify-center">
            {comprovantePreview?.url && (
              <img
                src={comprovantePreview.url}
                alt="Comprovante"
                className="max-w-full max-h-[70vh] rounded-lg border"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editCupom}
        onOpenChange={(open) => !open && setEditCupom(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cupom</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Código</Label>
              <Input
                value={editCupom?.codigo ?? ""}
                disabled
                className="font-mono"
              />
            </div>
            <div>
              <Label htmlFor="nome_titular">Nome do Titular</Label>
              <Input
                id="nome_titular"
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                placeholder="Nome de quem realizou o pagamento"
              />
            </div>
            <div>
              <Label>Comprovante de Pagamento</Label>
              {editCupom?.comprovante_url && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm mb-2"
                  onClick={() =>
                    handleViewComprovante(
                      editCupom.comprovante_url!,
                      editCupom.id,
                      editCupom.nome_titular || "Cupom",
                    )
                  }
                >
                  <Eye className="h-3 w-3 mr-1" /> Ver comprovante atual
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Enviando..." : "Enviar comprovante"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCupom(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCupons;
