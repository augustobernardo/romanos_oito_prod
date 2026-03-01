import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Evento = Tables<"eventos">;

const emptyEvento = {
  nome: "",
  descricao: "",
  local: "",
  data_inicio: "",
  data_fim: "",
  status: "ativo",
  tem_lote: true,
};

const formatDateEvento = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day); // month é 0-indexed no JavaScript
  return dateObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const AdminEventos = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Evento | null>(null);
  const [form, setForm] = useState(emptyEvento);

  const fetchEventos = async () => {
    setLoading(true);
    const { data } = await supabase.from("eventos").select("*").order("created_at", { ascending: false });
    setEventos(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchEventos(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyEvento); setOpen(true); };
  const openEdit = (e: Evento) => {
    setEditing(e);
    setForm({
      nome: e.nome,
      descricao: e.descricao ?? "",
      local: e.local ?? "",
      data_inicio: e.data_inicio ?? "",
      data_fim: e.data_fim ?? "",
      status: e.status,
      tem_lote: e.tem_lote,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.nome) { toast.error("Nome é obrigatório"); return; }
    if (editing) {
      const { error } = await supabase.from("eventos").update({
        nome: form.nome,
        descricao: form.descricao || null,
        local: form.local || null,
        data_inicio: form.data_inicio || null,
        data_fim: form.data_fim || null,
        status: form.status,
        tem_lote: form.tem_lote,
      }).eq("id", editing.id);
      if (error) toast.error("Erro ao atualizar"); else toast.success("Evento atualizado");
    } else {
      const { error } = await supabase.from("eventos").insert({
        nome: form.nome,
        descricao: form.descricao || null,
        local: form.local || null,
        data_inicio: form.data_inicio || null,
        data_fim: form.data_fim || null,
        status: form.status,
        tem_lote: form.tem_lote,
      });
      if (error) toast.error("Erro ao criar"); else toast.success("Evento criado");
    }
    setOpen(false);
    fetchEventos();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    const { error } = await supabase.from("eventos").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir"); else { toast.success("Excluído"); fetchEventos(); }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Eventos</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Novo Evento</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Evento" : "Novo Evento"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
              <div><Label>Descrição</Label><Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
              <div><Label>Local</Label><Input value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Data Início</Label><Input type="date" value={form.data_inicio} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} /></div>
                <div><Label>Data Fim</Label><Input type="date" value={form.data_fim} onChange={(e) => setForm({ ...form, data_fim: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Status</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="ativo">Ativo</option><option value="inativo">Inativo</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.tem_lote} onChange={(e) => setForm({ ...form, tem_lote: e.target.checked })} />
                    Tem Lote
                  </label>
                </div>
              </div>
              <Button className="w-full" onClick={handleSave}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Nome</TableHead>
                <TableHead className="text-center">Local</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Datas</TableHead>
                <TableHead className="w-24 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventos.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium text-center">{e.nome}</TableCell>
                  <TableCell className="text-center">{e.local}</TableCell>
                  <TableCell className="text-center"><Badge variant={e.status === "ativo" ? "default" : "secondary"}>{e.status}</Badge></TableCell>
                  <TableCell className="text-sm text-center">{formatDateEvento(e.data_inicio)} — {formatDateEvento(e.data_fim)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default AdminEventos;
