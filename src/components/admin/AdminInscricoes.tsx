import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InscricoesService } from "@/services/inscricoes.service";
import { CuponsServoService } from "@/services/cuponsServo.service";
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
  AlertCircle,
  RefreshCw,
  RotateCcw,
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
} from "../ui/dialog";
import { Label } from "../ui/label";
import { ConfirmDialog } from "./ConfirmDialog";
import { ReceiptViewer } from "@/components/ReceiptViewer";
import {
  columnLabels,
  createUniqueKey,
  formatNamesStringsInscricao,
  getUniqueRecentInscricoes,
} from "@/lib/utils";
import {
  handleDownloadComprovante,
  handleViewComprovante,
} from "@/lib/storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InscricoesMetricsCards } from "./InscricoesMetricsCards";

type Inscricao = Tables<"inscricoes">;
type InscricaoWithServo = Inscricao & {
  nome_servo_cupom: string | null;
};
type SortKey = "nome" | "created_at" | "metodo_pagamento";
type SortDir = "asc" | "desc";

const formatPhone = (phone: string) =>
  phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");

const sanitizeForExport = (val: string): string => {
  if (
    val.startsWith("=") ||
    val.startsWith("+") ||
    val.startsWith("-") ||
    val.startsWith("@") ||
    val.startsWith("\t") ||
    val.startsWith("\r")
  ) {
    return "'" + val;
  }
  return val;
};

const emptyInscricao = { status: "" };

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
    card_manual: {
      label: "Cartão SAC",
      icon: (
        <CreditCard
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
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Inscricao | null>(null);
  const [form, setForm] = useState(emptyInscricao);
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
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");

  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: ["inscricoes"] });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["oikos-metrics"],
    queryFn: InscricoesService.getOikosMetrics,
    staleTime: 30_000,
  });

  const inscricaoMutation = useMutation({
    mutationFn: async ({
      action,
      payload,
    }: {
      action: string;
      payload: unknown;
    }) => {
      if (action === "updateStatus") {
        const { id, status } = payload as { id: string; status: string };
        return await InscricoesService.updateStatus(id, status);
      }
      if (action === "delete") {
        return await InscricoesService.deleteByIds(payload as string[]);
      }
    },
    onSuccess: (_, { action }) => {
      if (action === "updateStatus")
        toast.success("Status atualizado com sucesso");
      refetch();
    },
    onError: (_, { action }) => {
      if (action === "updateStatus") toast.error("Erro ao atualizar status");
      else if (action === "delete") toast.error("Erro ao excluir inscrição");
    },
  });

  const {
    data: rawInscricoes = [],
    isLoading,
    isError,
    refetch: refetchInscricoes,
  } = useQuery({
    queryKey: ["inscricoes"],
    queryFn: async () => {
      const [inscricoesResult, cuponsServoResult] = await Promise.all([
        InscricoesService.findAll(),
        CuponsServoService.findAll(),
      ]);

      if (inscricoesResult.error) throw inscricoesResult.error;
      if (cuponsServoResult.error) throw cuponsServoResult.error;

      const nomesServoPorCupom = new Map(
        (cuponsServoResult.data ?? []).map((cupom) => [
          cupom.codigo,
          cupom.nome_servo,
        ]),
      );

      return (inscricoesResult.data ?? []).map((inscricao) => ({
        ...inscricao,
        nome_servo_cupom: inscricao.codigo_servo
          ? (nomesServoPorCupom.get(inscricao.codigo_servo) ?? null)
          : null,
      }));
    },
  });

  const allInscricoes = rawInscricoes;

  const uniqueInscricoes = useMemo(
    () => getUniqueRecentInscricoes(rawInscricoes as Inscricao[]),
    [rawInscricoes],
  );

  const inscricoes = useMemo(
    () =>
      formatNamesStringsInscricao(uniqueInscricoes as InscricaoWithServo[]),
    [uniqueInscricoes],
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      if (key === "nome") setSortDir("asc");
      else if (key === "metodo_pagamento") setSortDir("asc");
      else setSortDir("desc");
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
    let filtered = inscricoes.filter(
      (i) =>
        i.nome.toLowerCase().includes(search.toLowerCase()) ||
        i.telefone.includes(search) ||
        i.comunidade.toLowerCase().includes(search.toLowerCase()),
    );

    if (filterStatus) {
      filtered = filtered.filter((i) => i.status === filterStatus);
    }

    if (filterMethod) {
      filtered = filtered.filter((i) => i.metodo_pagamento === filterMethod);
    }

    return [...filtered].sort((a, b) => {
      if (sortKey === "nome") {
        const cmp = a.nome.localeCompare(b.nome, "pt-BR");
        return sortDir === "asc" ? cmp : -cmp;
      }
      if (sortKey === "metodo_pagamento") {
        const aMethod = a.metodo_pagamento ?? "";
        const bMethod = b.metodo_pagamento ?? "";
        const cmp = aMethod.localeCompare(bMethod, "pt-BR");
        return sortDir === "asc" ? cmp : -cmp;
      }
      const cmp =
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [inscricoes, search, filterStatus, filterMethod, sortKey, sortDir]);

  const statusColor = (s: string) => {
    if (s === "confirmado") return "default";
    if (s === "processando") return "secondary";
    if (s === "pending") return "secondary";
    return "destructive";
  };

  const exportToExcel = () => {
    const rows = sorted.map((i) => {
      const row: Record<string, string> = {};
      for (const key of Object.keys(columnLabels)) {
        let val = String((i[key as keyof Inscricao] as string | null) ?? "");
        if (key === "created_at") {
          val = new Date(val).toLocaleDateString("pt-BR");
        }
        if (key === "telefone") {
          val = formatPhone(val);
        }
        if (key == "data_nascimento") {
          val = val ? new Date(val).toLocaleDateString("pt-BR") : "";
        }
        row[columnLabels[key]] = sanitizeForExport(val);
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

  const openEdit = (inscricao: Inscricao) => {
    setEditing(inscricao);
    setForm({ status: inscricao.status });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.status) {
      toast.error("Status é obrigatório");
      return;
    }

    if (editing) {
      inscricaoMutation.mutate({
        action: "updateStatus",
        payload: { id: editing.id, status: form.status },
      });
    }

    setOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;

    setDeleteDialogOpen(false);

    const inscricaoToDelete = allInscricoes.find((i) => i.id === selectedId);

    if (inscricaoToDelete) {
      const key = createUniqueKey(inscricaoToDelete);
      const duplicates = allInscricoes.filter(
        (i) => createUniqueKey(i) === key,
      );

      if (duplicates.length > 1) {
        setDuplicatesInfo({
          count: duplicates.length,
          ids: duplicates.map((d) => d.id),
        });
        setDuplicateDialogOpen(true);
        return;
      }
    }

    await executeDelete([selectedId]);
  };

  const handleDeleteSingle = async () => {
    setDuplicateDialogOpen(false);

    if (selectedId) {
      await executeDelete([selectedId]);
    }
  };

  const handleDeleteAllDuplicates = async () => {
    setDuplicateDialogOpen(false);

    if (duplicatesInfo) {
      await executeDelete(duplicatesInfo.ids);
    }
  };

  const executeDelete = (ids: string[]) => {
    setSelectedId(null);
    setDuplicatesInfo(null);
    inscricaoMutation.mutate({ action: "delete", payload: ids });
  };

  const onViewComprovante = async (
    comprovanteUrl: string,
    inscricaoId: string,
    nome: string,
  ) => {
    await handleViewComprovante(
      comprovanteUrl,
      nome,
      (loading) =>
        setLoadingComprovantes((prev) => ({ ...prev, [inscricaoId]: loading })),
      (url, nome) => {
        setComprovantePreview({ url, nome });
        setPreviewDialogOpen(true);
      },
    );
  };

  const onDownloadComprovante = async (
    comprovanteUrl: string,
    inscricaoId: string,
    nome: string,
  ) => {
    await handleDownloadComprovante(comprovanteUrl, nome, (loading) =>
      setLoadingComprovantes((prev) => ({ ...prev, [inscricaoId]: loading })),
    );
  };

  return (
    <AdminLayout>
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-normal">
              Comprovante - {comprovantePreview?.nome}
            </DialogTitle>
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
        description="Tem certeza que deseja excluir esta inscrição?"
        onConfirm={handleConfirmDelete}
      />

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
                <option value="pending">Pendente</option>
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

      <div className="mb-6 space-y-4">
        <h1 className="font-display text-2xl font-normal uppercase text-foreground">
          Inscrições
        </h1>

        <InscricoesMetricsCards metrics={metrics ?? null} isLoading={metricsLoading} />

        <div className="flex flex-wrap items-end gap-2">
          <div className="relative min-w-[200px] max-w-[280px] flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome, telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={filterStatus || undefined} onValueChange={(v) => setFilterStatus(v === " " ? "" : v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">Todos</SelectItem>
              <SelectItem value="processando">Processando</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterMethod || undefined} onValueChange={(v) => setFilterMethod(v === " " ? "" : v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">Todos</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="card_manual">Cartão SAC</SelectItem>
              <SelectItem value="cupom">Especial</SelectItem>
            </SelectContent>
          </Select>

          {(filterStatus || filterMethod) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setFilterStatus(""); setFilterMethod(""); }}
              className="shrink-0"
              title="Limpar filtros"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 whitespace-nowrap ml-auto"
            onClick={exportToExcel}
          >
            <Download className="h-4 w-4" /> Exportar
          </Button>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {sorted.length} inscrição(ões) encontrada(s)
      </p>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : isError ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-red-200 bg-red-50 p-8">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm font-medium text-red-700">
            Erro ao carregar inscrições
          </p>
          <p className="text-xs text-red-600">
            Verifique se o Supabase está acessível.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchInscricoes()}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Tentar novamente
          </Button>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto max-h-[70vh] overflow-y-auto">
          <Table className="min-w-[1400px] table-fixed">
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
                <TableHead className="w-[185px] whitespace-nowrap">
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
                <TableHead className="w-[170px] whitespace-nowrap">
                  Cupom Servo Amigo
                </TableHead>
                <TableHead className="w-[190px] whitespace-nowrap">
                  Nome do Servo
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
                    title={i.idade ?? "—"}
                  >
                    {i.idade ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      {formatPaymentMethod(i.metodo_pagamento)}
                    </div>
                  </TableCell>
                  <TableCell
                    className="truncate max-w-[170px]"
                    title={i.codigo_servo ?? "—"}
                  >
                    {i.codigo_servo ?? "—"}
                  </TableCell>
                  <TableCell
                    className="truncate max-w-[190px]"
                    title={i.nome_servo_cupom ?? "—"}
                  >
                    {i.nome_servo_cupom ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={statusColor(i.status)}>{i.status}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {i.comprovante_url ? (
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            onViewComprovante(i.comprovante_url!, i.id, i.nome)
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
                            onDownloadComprovante(
                              i.comprovante_url!,
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
