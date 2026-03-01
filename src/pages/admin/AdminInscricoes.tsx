import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Inscricao = Tables<"inscricoes">;

const formatPhone = (phone: string) => {
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

const AdminInscricoes = () => {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from("inscricoes").select("*").order("created_at", { ascending: false });
      setInscricoes(data ?? []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = inscricoes.filter(
    (i) =>
      i.nome.toLowerCase().includes(search.toLowerCase()) ||
      i.telefone.includes(search) ||
      i.comunidade.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) => {
    if (s === "confirmado") return "default";
    if (s === "processando") return "secondary";
    return "destructive";
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Inscrições</h1>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por nome, telefone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">{filtered.length} inscrição(ões) encontrada(s)</p>

      {loading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Nome</TableHead>
                <TableHead className="text-center">Telefone</TableHead>
                <TableHead className="text-center">Comunidade</TableHead>
                <TableHead className="text-center">Cidade/Estado</TableHead>
                <TableHead className="text-center">Camisa</TableHead>
                <TableHead className="text-center">Idade</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Data da Inscrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.nome}</TableCell>
                  <TableCell className="text-center">{formatPhone(i.telefone)}</TableCell>
                  <TableCell className="text-center">{i.comunidade}</TableCell>
                  <TableCell className="text-center">{i.cidade_estado}</TableCell>
                  <TableCell className="text-center">{i.tamanho_camisa}</TableCell>
                  <TableCell className="text-center">{(i as any).idade ?? "—"}</TableCell>
                  <TableCell className="text-center"><Badge variant={statusColor(i.status)}>{i.status}</Badge></TableCell>
                  <TableCell className="text-sm text-center">{new Date(i.created_at).toLocaleDateString("pt-BR")}</TableCell>
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
