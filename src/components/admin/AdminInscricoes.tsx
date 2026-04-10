import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  Search,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  CreditCard,
  QrCode,
  Eye,
  Tag,
} from "lucide-react";
import * as XLSX from "xlsx";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "../ui/button";
import { toast } from "../ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  columnLabels,
  createUniqueKey,
  formatNamesStringsInscricao,
  getUniqueRecentInscricoes,
} from "@/lib/utils";

type Inscricao = Tables<"inscricoes">;
type SortKey = "nome" | "created_at";
type SortDir = "asc" | "desc";

const formatPhone = (phone: string) =>
  phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");

const emptyInscricao = { status: "" };

// Função para extrair o path - VERSÃO SIMPLIFICADA (assume que salvamos apenas o nome)
const extractFilePathFromUrl = (url: string) => {
  // Se for uma URL completa, tenta extrair o nome
  if (url.startsWith("http")) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      return pathParts[pathParts.length - 1];
    } catch {
      return url; // Se não conseguir parsear, retorna a própria string
    }
  }
  // Se já for apenas o nome do arquivo, retorna direto
  return url;
};

// Função para formatar o método de pagamento para exibição
const formatPaymentMethod = (method: string | null) => {
  if (!method) return "—";

  const methods: Record<string, { label: string; icon: JSX.Element }> = {
    credit: {
      label: "Cartão",
      icon: (
        <CreditCard
          className="h-3.5 w-3.5 mr-1"
          style={{ color: "hsl(195,100%,45%)" }}
        />
      ),
    },
    pix: {
      label: "PIX",
      icon: (
        <QrCode
          className="h-3.5 w-3.5 mr-1"
          style={{ color: "hsl(195,100%,45%)" }}
        />
      ),
    },
    cupom: {
      label: "Especial",
      icon: (
        <Tag
          className="h-3.5 w-3.5 mr-1"
          style={{ color: "hsl(195,100%,45%)" }}
        />
      ),
    },
  };

  const payment = methods[method];
  if (!payment) return method;

  return (
    <div className="flex items-center justify-center">
      {payment.icon}
      <span>{payment.label}</span>
    </div>
  );
};

const AdminInscricoes = () => {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Inscricao | null>(null);
  const [form, setForm] = useState(emptyInscricao);
  const [allInscricoes, setAllInscricoes] = useState<Inscricao[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [loadingComprovantes, setLoadingComprovantes] = useState<
    Record<string, boolean>
  >({});
  const [comprovantePreview, setComprovantePreview] = useState<{
    url: string;
    nome: string;
  } | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [duplicatesInfo, setDuplicatesInfo] = useState<{
    count: number;
    ids: string[];
  } | null>(null);

  const fetchInscricoes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("inscricoes")
      .select("*")
      .order("created_at", { ascending: false });

    setAllInscricoes(data ?? []);

    // Aplica o filtro de registros únicos (apenas o mais recente por nome+telefone)
    const uniqueInscricoes = getUniqueRecentInscricoes(data ?? []);

    const formattedInscricoes = formatNamesStringsInscricao(uniqueInscricoes);

    setInscricoes(formattedInscricoes);
    setLoading(false);
  };

  useEffect(() => {
    fetchInscricoes();
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // Define direção padrão para cada coluna
      if (key === "nome") setSortDir("asc");
      else if (key === "metodo_pagamento") setSortDir("asc");
      else setSortDir("desc"); // created_at padrão descendente
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col)
      return <ArrowUpDown className="ml-1 inline h-3.5 w-3.5 opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 inline h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="ml-1 inline h-3.5 w-3.5" />
    );
  };

  const sorted = useMemo(() => {
    const filtered = inscricoes.filter(
      (i) =>
        i.nome.toLowerCase().includes(search.toLowerCase()) ||
        i.telefone.includes(search) ||
        i.comunidade.toLowerCase().includes(search.toLowerCase()),
    );

    return [...filtered].sort((a, b) => {
      if (sortKey === "nome") {
        const cmp = a.nome.localeCompare(b.nome, "pt-BR");
        return sortDir === "asc" ? cmp : -cmp;
      }
      const cmp =
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [inscricoes, search, sortKey, sortDir]);

  const statusColor = (s: string) => {
    if (s === "confirmado") return "default";
    if (s === "processando") return "secondary";
    return "destructive";
  };

  const exportToExcel = () => {
    const rows = sorted.map((i) => {
      const row: Record<string, string> = {};
      for (const key of Object.keys(columnLabels)) {
        let val = (i as any)[key] ?? "";
        if (key === "created_at") {
          val = new Date(val).toLocaleDateString("pt-BR");
        }

        if (key === "telefone") {
          val = formatPhone(val);
        }

        if (key == "data_nascimento") {
          val = val ? new Date(val).toLocaleDateString("pt-BR") : "";
        }
        row[columnLabels[key]] = val;
      }
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inscrições");
    XLSX.writeFile(
      wb,
      `inscricoes_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  // Função para abrir o modal de edição
  const openEdit = (inscricao: Inscricao) => {
    setEditing(inscricao);
    setForm({ status: inscricao.status });
    setOpen(true);
  };

  // Função para salvar (apenas atualização)
  const handleSave = async () => {
    if (!form.status) {
      toast.error("Status é obrigatório");
      return;
    }

    if (editing) {
      // Atualizar registro existente
      const { error } = await supabase
        .from("inscricoes")
        .update({ status: form.status })
        .eq("id", editing.id);

      if (error) {
        toast.error("Erro ao atualizar status");
      } else {
        toast.success("Status atualizado com sucesso");
      }
    }

    setOpen(false);
    fetchInscricoes();
  };

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    // Fecha o modal imediatamente
    setDeleteDialogOpen(false);

    // Antes de excluir, verifica se existem registros duplicados
    const inscricaoToDelete = allInscricoes.find((i) => i.id === selectedId);

    if (inscricaoToDelete) {
      const key = createUniqueKey(inscricaoToDelete);
      const duplicates = allInscricoes.filter(
        (i) => createUniqueKey(i) === key,
      );

      if (duplicates.length > 1) {
        // Se houver duplicatas, abre o modal de duplicatas
        setDuplicatesInfo({
          count: duplicates.length,
          ids: duplicates.map((d) => d.id),
        });
        setDuplicateDialogOpen(true);
        return;
      }
    }

    // Se não houver duplicatas, executa a exclusão
    await executeDelete([selectedId]);
  };

  const handleDeleteSingle = async () => {
    // Fecha o modal de duplicatas imediatamente
    setDuplicateDialogOpen(false);

    if (selectedId) {
      await executeDelete([selectedId]);
    }
  };

  const handleDeleteAllDuplicates = async () => {
    // Fecha o modal de duplicatas imediatamente
    setDuplicateDialogOpen(false);

    if (duplicatesInfo) {
      await executeDelete(duplicatesInfo.ids);
    }
  };

  const executeDelete = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from("inscricoes")
        .delete()
        .in("id", ids);

      if (error) {
        console.error("Erro ao excluir:", error);
        toast.error(
          "Erro ao excluir " + (ids.length > 1 ? "registros" : "inscrição"),
        );
        return;
      }

      // Limpa os estados
      setSelectedId(null);
      setDuplicatesInfo(null);

      // Atualiza a lista
      await fetchInscricoes();

      // Mostra mensagem de sucesso
      toast.success(
        ids.length > 1
          ? `${ids.length} inscrições excluídas com sucesso`
          : "Inscrição excluída com sucesso",
      );
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast.error("Erro inesperado ao excluir");
    }
  };

  // Função para visualizar comprovante
  // Função para visualizar comprovante - VERSÃO COM MAIS LOGS
  const handleViewComprovante = async (
    comprovanteUrl: string,
    inscricaoId: string,
    nome: string,
  ) => {
    try {
      setLoadingComprovantes((prev) => ({ ...prev, [inscricaoId]: true }));

      const filePath = extractFilePathFromUrl(comprovanteUrl);

      if (!filePath) {
        toast.error("Caminho do arquivo inválido");
        return;
      }

      // Gerar URL assinada válida por 60 minutos
      const { data, error } = await supabase.storage
        .from("Comprovantes_OIKOS")
        .createSignedUrl(filePath, 60 * 60);

      if (error) throw error;

      if (data?.signedUrl) {
        setComprovantePreview({ url: data.signedUrl, nome });
        setPreviewDialogOpen(true);
      } else {
        toast.error("Erro ao gerar link do comprovante");
      }
    } catch (error) {
      console.error("Erro ao acessar comprovante:", error);
      toast.error("Erro ao acessar comprovante");
    } finally {
      setLoadingComprovantes((prev) => ({ ...prev, [inscricaoId]: false }));
    }
  };

  // Função para baixar comprovante
  const handleDownloadComprovante = async (
    comprovanteUrl: string,
    inscricaoId: string,
    nome: string,
  ) => {
    try {
      setLoadingComprovantes((prev) => ({ ...prev, [inscricaoId]: true }));

      const filePath = extractFilePathFromUrl(comprovanteUrl);
      if (!filePath) {
        toast.error("Caminho do arquivo inválido");
        return;
      }

      // Gerar URL assinada válida por 60 minutos
      const { data, error } = await supabase.storage
        .from("Comprovantes_OIKOS")
        .createSignedUrl(filePath, 60 * 60); // 60 minutos

      if (error) throw error;

      if (data?.signedUrl) {
        // Criar um link temporário para download
        const link = document.createElement("a");
        link.href = data.signedUrl;
        link.download = `comprovante_${nome}_${new Date().toISOString().split("T")[0]}.${filePath.split(".").pop()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Download iniciado");
      } else {
        toast.error("Erro ao gerar link do comprovante");
      }
    } catch (error) {
      console.error("Erro ao baixar comprovante:", error);
      toast.error("Erro ao baixar comprovante");
    } finally {
      setLoadingComprovantes((prev) => ({ ...prev, [inscricaoId]: false }));
    }
  };

  return (
    <AdminLayout>
      {/* Dialog de preview do comprovante */}
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

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-normal text-xl">
              Confirmar exclusão
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Tem certeza que deseja excluir esta inscrição?
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Esta ação não pode ser desfeita.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para múltiplas inscrições */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-normal text-xl">
              Múltiplas inscrições encontradas
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Foram encontradas{" "}
              <span className="font-semibold text-foreground">
                {duplicatesInfo?.count}
              </span>{" "}
              inscrições para esta pessoa.
            </p>
            <p className="text-muted-foreground mt-2">
              O que você deseja fazer?
            </p>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => {
                setDuplicateDialogOpen(false);
                setSelectedId(null);
                setDuplicatesInfo(null);
              }}
              className="sm:flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteSingle}
              className="sm:flex-1"
            >
              Excluir apenas esta
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllDuplicates}
              className="sm:flex-1"
            >
              Excluir todas ({duplicatesInfo?.count})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-normal uppercase text-foreground">
          Inscrições
        </h1>
        {/* Dialog Update Status */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-normal">
                Editar Status da Inscrição
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Status do Pagamento</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="processando">Processando</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <Button className="w-full" onClick={handleSave}>
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <div className="relative w-full max-w-xs">
          <div className="flex items-center gap-2">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar por nome, telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 whitespace-nowrap"
              onClick={exportToExcel}
            >
              <Download className="h-4 w-4" /> Exportar
            </Button>
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {sorted.length} inscrição(ões) encontrada(s)
      </p>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="rounded-md border overflow-x-auto max-h-[70vh] overflow-y-auto">
          <Table className="min-w-[1100px] table-fixed">
            <TableHeader className="sticky top-0 z-10 bg-background">
              <TableRow>
                <TableHead
                  className="w-[250px] whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => toggleSort("nome")}
                >
                  Nome <SortIcon col="nome" />
                </TableHead>
                <TableHead className="w-[150px] whitespace-nowrap">
                  Telefone
                </TableHead>
                <TableHead className="w-[150px] whitespace-nowrap">
                  Instagram
                </TableHead>
                <TableHead className="w-[200px] whitespace-nowrap">
                  Comunidade
                </TableHead>
                <TableHead className="w-[180px] whitespace-nowrap">
                  Cidade/Estado
                </TableHead>
                <TableHead className="w-[80px] text-center whitespace-nowrap">
                  Camisa
                </TableHead>
                <TableHead className="w-[80px] text-center whitespace-nowrap">
                  Idade
                </TableHead>
                <TableHead
                  className="w-[130px] text-center whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => toggleSort("metodo_pagamento")}
                >
                  Método <SortIcon col="metodo_pagamento" />
                </TableHead>
                <TableHead className="w-[130px] text-center whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="w-[200px] text-center whitespace-nowrap">
                  Comprovante
                </TableHead>
                <TableHead
                  className="w-[130px] text-center whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => toggleSort("created_at")}
                >
                  Data <SortIcon col="created_at" />
                </TableHead>
                <TableHead className="w-[100px] text-center whitespace-nowrap">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((i) => (
                <TableRow key={i.id}>
                  <TableCell
                    className="font-medium truncate max-w-[180px]"
                    title={i.nome}
                  >
                    {i.nome}
                  </TableCell>
                  <TableCell
                    className="truncate max-w-[120px]"
                    title={formatPhone(i.telefone)}
                  >
                    {formatPhone(i.telefone)}
                  </TableCell>
                  <TableCell
                    className="truncate max-w-[120px]"
                    title={i.instagram}
                  >
                    {i.instagram.toLowerCase().includes("não tenho") ||
                    i.instagram.toLowerCase().includes("nao tenho")
                      ? i.instagram
                      : i.instagram.startsWith("@")
                        ? i.instagram
                        : `@${i.instagram}`}
                  </TableCell>
                  <TableCell
                    className="truncate max-w-[140px]"
                    title={i.comunidade}
                  >
                    {i.comunidade}
                  </TableCell>
                  <TableCell
                    className="truncate max-w-[130px]"
                    title={i.cidade_estado}
                  >
                    {i.cidade_estado}
                  </TableCell>
                  <TableCell className="text-center">
                    {i.tamanho_camisa}
                  </TableCell>
                  <TableCell
                    className="text-center truncate max-w-[70px]"
                    title={(i as any).idade ?? "—"}
                  >
                    {(i as any).idade ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      {formatPaymentMethod((i as any).metodo_pagamento)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusColor(i.status)}>{i.status}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {(i as any).comprovante_url ? (
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleViewComprovante(
                              (i as any).comprovante_url,
                              i.id,
                              i.nome,
                            )
                          }
                          disabled={loadingComprovantes[i.id]}
                          title="Visualizar comprovante"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDownloadComprovante(
                              (i as any).comprovante_url,
                              i.id,
                              i.nome,
                            )
                          }
                          disabled={loadingComprovantes[i.id]}
                          title="Baixar comprovante"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-xs">
                    {new Date(i.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(i.created_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(i)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(i.id)}
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
    </AdminLayout>
  );
};

export default AdminInscricoes;
