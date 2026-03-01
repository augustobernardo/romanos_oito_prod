import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PhoneInputField, FormSection } from "./FormHelpers";
import type { FormData } from "./types";

interface Props {
  form: UseFormReturn<FormData>;
}

const PaisResponsaveisSection = ({ form }: Props) => (
  <FormSection title="Dados dos Pais / Responsáveis">
    <div className="grid gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="nomeMae"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome da Mãe: *</FormLabel>
            <FormControl>
              <Input placeholder="Nome completo da mãe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <PhoneInputField
        form={form}
        name="numeroMae"
        label='Contato da Mãe: * (Se não souber, digite "Não sei")'
      />
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="nomePai"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Pai: *</FormLabel>
            <FormControl>
              <Input placeholder="Nome completo do pai" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <PhoneInputField
        form={form}
        name="numeroPai"
        label='Contato do Pai: * (Se não souber, digite "Não sei")'
      />
    </div>

    <PhoneInputField
      form={form}
      name="numeroResponsavelProximo"
      label="Contato do responsável mais próximo (avó, avô, tio, tia...):"
    />
  </FormSection>
);

export default PaisResponsaveisSection;
