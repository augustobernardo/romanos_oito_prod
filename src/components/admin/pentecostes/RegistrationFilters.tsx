import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";
import type { RegisterFilters } from "@/types/pentecoste";

interface RegistrationFiltersProps {
  filters: RegisterFilters;
  onFilterChange: (filters: Partial<RegisterFilters>) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: "pending", label: "Pendente" },
  { value: "awaiting_confirmation", label: "Aguardando" },
  { value: "confirmed", label: "Confirmado" },
  { value: "paid", label: "Pago" },
  { value: "rejected", label: "Rejeitado" },
  { value: "manual_card_payment", label: "Cartão Manual" },
];

const methodOptions = [
  { value: "pix", label: "PIX" },
  { value: "card_manual", label: "Cartão Manual" },
];

const workshopOptions = [
  { value: "turma_01", label: "Turma 01" },
  { value: "turma_02", label: "Turma 02" },
  { value: "turma_03", label: "Turma 03" },
  { value: "turma_04", label: "Turma 04" },
];

const underageOptions = [
  { value: "yes", label: "Menores de 18" },
  { value: "no", label: "Maiores de 18" },
];

export const RegistrationFilters = ({
  filters,
  onFilterChange,
  onReset,
}: RegistrationFiltersProps) => (
  <div className="flex flex-wrap items-end gap-2">
    <div className="relative min-w-[200px] max-w-[280px] flex-1">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar nome, WhatsApp..."
        className="pl-9"
        value={filters.search}
        onChange={(e) => onFilterChange({ search: e.target.value })}
      />
    </div>

    <Select
      value={filters.status || undefined}
      onValueChange={(v) => onFilterChange({ status: v as RegisterFilters["status"] })}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <Select
      value={filters.method || undefined}
      onValueChange={(v) => onFilterChange({ method: v as RegisterFilters["method"] })}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Método" />
      </SelectTrigger>
      <SelectContent>
        {methodOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <Select
      value={filters.workshop || undefined}
      onValueChange={(v) => onFilterChange({ workshop: v as RegisterFilters["workshop"] })}
    >
      <SelectTrigger className="w-[130px]">
        <SelectValue placeholder="Turma" />
      </SelectTrigger>
      <SelectContent>
        {workshopOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <Select
      value={filters.underage || undefined}
      onValueChange={(v) => onFilterChange({ underage: v as RegisterFilters["underage"] })}
    >
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Idade" />
      </SelectTrigger>
      <SelectContent>
        {underageOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <Button
      variant="ghost"
      size="icon"
      onClick={onReset}
      className="shrink-0"
      title="Limpar filtros"
    >
      <RotateCcw className="h-4 w-4" />
    </Button>
  </div>
);
