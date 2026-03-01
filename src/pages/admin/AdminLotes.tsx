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

type Lote = Tables<"lotes">;
type Evento = Tables<"eventos">;

const emptyLote = { nome: "", preco: "", ordem: 1, status: "disponivel" }; //evento_id: "" 

const AdminLotes = () => {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Lote | null>(null);
  const [form, setForm] = useState(emptyLote);

  const fetchData = async () => {
    setLoading(true);
    const [l, e] = await Promise.all([
      supabase.from("lotes").select("*").order("ordem"),
      supabase.from("eventos").select("*"),
    ]);
    setLotes(l.data ?? []);
    setEventos(e.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyLote); setOpen(true); };
  const openEdit = (l: Lote) => {
    setEditing(l);
    setForm({ nome: l.nome, preco: l.preco, ordem: l.ordem, status: l.status ?? "" }); //evento_id: l.evento_id
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.nome || !form.preco) { toast.error("Nome e preço são obrigatórios"); return; }
    const payload = {
      nome: form.nome,
      preco: form.preco,
      ordem: form.ordem,
      status: form.status,
      // evento_id: form.evento_id || null,
    };
    if (editing) {
      const { error } = await supabase.from("lotes").update(payload).eq("id", editing.id);
      if (error) toast.error("Erro ao atualizar"); else toast.success("Lote atualizado");
    } else {
      const { error } = await supabase.from("lotes").insert(payload);
      if (error) toast.error("Erro ao criar"); else toast.success("Lote criado");
    }
    setOpen(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza?")) return;
    const { error } = await supabase.from("lotes").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir"); else { toast.success("Excluído"); fetchData(); }
  };

  const getEventoNome = (id: string | null) => eventos.find((e) => e.id === id)?.nome ?? "—";

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Lotes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Novo Lote</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar Lote" : "Novo Lote"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {/* <div><Label>Evento</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.evento_id} onChange={(e) => setForm({ ...form, evento_id: e.target.value })}>
                  <option value="">Selecione...</option>
                  {eventos.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
              </div> */}
              <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Preço</Label><Input value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} /></div>
                <div><Label>Ordem</Label><Input type="number" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })} /></div>
              </div>
              <div><Label>Status</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="disponivel">Disponível</option><option value="esgotado">Esgotado</option><option value="inativo">Inativo</option>
                </select>
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
                {/* <TableHead className="text-center">Evento</TableHead> */}
                <TableHead className="text-center">Nome</TableHead>
                <TableHead className="text-center">Preço</TableHead>
                <TableHead className="text-center">Ordem</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lotes.map((l) => (
                <TableRow key={l.id}>
                  {/* <TableCell className="text-center">{getEventoNome(l.evento_id)}</TableCell> */}
                  <TableCell className="font-medium text-center">{l.nome}</TableCell>
                  <TableCell className="text-center">{l.preco}</TableCell>
                  <TableCell className="text-center">{l.ordem}</TableCell>
                  <TableCell className="text-center"><Badge variant={l.status === "disponivel" ? "default" : "secondary"}>{l.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default AdminLotes;
